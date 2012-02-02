root = exports ? this

__version__ = '0.0.1'

guid =->
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace /[xy]/g, (c) ->
    r = Math.random() * 16 | 0
    v = if c is 'x' then r else r & 3 | 8
    v.toString 16
  .toUpperCase()

isNumber =(n) ->
  typeof n == 'number' && isFinite(n)

isExpired =(item) ->
  item and item.e and item.e < time()

time =->
  +new Date()

count =(obj) ->
  _count = 0
  for own key, value of obj
    _count++
  _count

root.KacheConfig          ?=
  enabled: false,
  defaultTimeout: 0

root.KacheConfig.Timeouts ?= {}

class MemoryStore
  _storage = root._kachestore ?=
    _kachestore =
      store: {},
      enabled: root.KacheConfig.enabled

  _kache = _storage['_kachestore'] ?= {}
  _store = _kache['store'] ?= {}
  _enabled = _kache['enabled'] ?= root.KacheConfig.enabled

  _clearExpireds =->
    for own key, value of _store
      obj = _store[key]
      for ns, item of obj
        if isExpired item
          hasDeleted = true
          delete item
      if hasDeleted
        _store[key] = obj
        if count(_store[key]) == 0
          delete _store[key]
    return

  _clearStore =->
    _store = {}

  _error =(e)->
    console.log e

  constructor: (@namespace, @timeout) ->
    @timeout ?= root.KacheConfig.Timeouts[@namespace] or root.KacheConfig.defaultTimeout
    @_ = _store[@namespace] ?= {}

  clear: ->
    @_ = {}
    @

  clearExpired: (k) ->
    if isExpired @_[k]
      @remove k
    @

  clearExpireds: ->
    for key, item of @_
      if isExpired item
        @clearExpired key
    @

  count: ->
    @clearExpireds()
    count(@_)

  dump: ->
    console.log @_
    @

  error: (e) ->
    _error(e)
    return

  get: (k) ->
    return unless !!_enabled
    @clearExpired k
    if @_[k] and @_[k].value
      @_[k].value

  remove: (k) ->
    delete @_[k]
    @

  set: (key, value, timeout) ->
    _clearExpireds()
    timeout ?= @timeout
    if isNumber(timeout) and timeout != 0
      expires = time() + timeout
    try
      @_[key] =
        value: value,
        e: expires or 0
    catch error
      @error(error)
    @

  toString: ->
    "#{@namespace} : #{@timeout}"
    @

  @clearStore: ->
    _clearStore()
    return

  @clearExpireds: ->
    _clearExpireds()
    return

  @disable: ->
    _enabled = false

  @enable: ->
    _enabled = true

  @enabled: ->
    !!_enabled

  @validStore: ->
    true

class LocalStore
  _storage = localStorage

  _kache = _storage['_kache'] ?= {}
  _store = _kache['store'] ?= {}
  _enabled = _kache['enabled'] ?= root.KacheConfig.enabled

  _clearStore =->
    _store = {}

  _clearExpireds =->
    for own key, value of _store
      for k, item of JSON.parse value
        if isExpired item
          hasDeleted = true
          delete item
        if hasDeleted
          if count(value) == 0
            delete value
            return
        value ?= {}
        _store[key] = JSON.stringify value
    return

  _error =(e)->
    if e == QUOTA_EXCEEDED_ERR
      console.log 'QUOTA_EXCEEDED_ERR'
      _clearExpireds()
    return

  _writeThrough =(inst) ->
    _store[inst.namespace] = JSON.stringify inst._

  constructor: (@namespace, @timeout) ->
    if !LocalStore.validStore()
      throw 'LocalStorage is not a valid cache store'
    @timeout ?= root.KacheConfig.Timeouts[@namespace] or root.KacheConfig.defaultTimeout
    @_ = JSON.parse _store[@namespace] or '{}'

  clearExpired: (k) ->
    if isExpired @_[k]
      @remove(k)
    _writeThrough(@)
    @

  clearExpireds: ->
    for key, item of @_
      @clearExpired key
    _writeThrough(@)
    @

  count: ->
    @clearExpireds()
    count(@_)

  get: (k) ->
    return unless !!_enabled
    @clearExpired k
    if @_[k] and @_[k].value
      @_[k].value

  remove: (k) ->
    delete @_[k]
    _writeThrough(@)
    @

  set: (k, value, timeout) ->
    @clearExpireds()
    timeout ?= @timeout
    if isNumber(timeout) and timeout != 0
      expires = time() + timeout
    try
      @_[k] =
        value: value,
        e: expires or 0
      _writeThrough @ or @remove k
    catch error
      _error error
    @

  toString: ->
    "#{@namespace} : #{@timeout}"
    @

  @clearStore: ->
    _clearStore()
    return

  @clearExpireds: ->
    _clearExpireds()
    return

  @disable: ->
    _enabled = false

  @enable: ->
    _enabled = true

  @enabled: ->
    !!_enabled

  @validStore: ->
    try
      !!localStorage || !!globalStorage
    catch error
      false

class _Kache

  store: LocalStore

  constructor: (@namespace, @timeout=0) ->
    @instance = _Kache::store(@namespace, @timeout)

  clear: ->
    @instance.clear()
    return

  clearExpireds: ->
    @instance.clearExpireds()
    return

  count: ->
    @instance.count()

  get: (key) ->
    @instance.get(key)

  remove: ->
    @instance.remove()
    return

  set: (key, value, timeout) ->
    @instance.set(key, value, timeout)
    return

  @clear: ->
    _Kache::store.clear()
    return

  @clearExpireds: ->
    _Kache::store.clearExpireds()
    return

  @disable: ->
    _Kache::store::e_ = false

  @dumpAll: ->
    console.log(_Kache::store::store)
    return

  @enable: ->
    console.log(_Kache::store)
    Kache::store::e_ = true

  @enabled: ->
    !!_Kache::store::e_

root.Kache = (namespace, timeout) ->
  new _Kache(namespace, timeout)

root.Kache.Guid             = guid
root.Kache.Local            = LocalStore
root.Kache.Memory           = MemoryStore
root.Kache.__version__      = __version__
