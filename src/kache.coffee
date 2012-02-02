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
  @storage: -> root._kachestore ?=
    _kachestore =
      store: {},
      enabled: root.KacheConfig.enabled

  @kache: @storage['_kachestore'] ?= {}
  @enabled: @kache['enabled'] ?= root.KacheConfig.enabled

  @clearExpireds: ->
    for own key, value of @store
      obj = @store[key]
      for ns, item of obj
        if isExpired item
          hasDeleted = true
          delete item
      if hasDeleted
        @store[key] = obj
        if count(@store[key]) == 0
          delete @store[key]
    @

  @clearStore: ->
    @store = {}
    @

  @error: (e)->
    console.log e

  @disable: ->
    @enabled = false
    @

  @dumpall: ->
    console.log @store
    @

  @enable: ->
    @enabled = true
    @

  @validStore: ->
    true

  store: @kache['store'] ?= {}

  constructor: (@namespace, @timeout, @atts) ->
    @timeout ?= root.KacheConfig.Timeouts[@namespace] or root.KacheConfig.defaultTimeout
    @load atts if atts
    @_ = @store[@namespace] ?= {}

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

  enabled: ->
    !!MemoryStore.enabled

  get: (k) ->
    return unless !!@enabled()
    @clearExpired k
    if @_[k] and @_[k].value
      @_[k].value

  load: (atts) ->
    for key, value of atts
      @[key] = value

  remove: (k) ->
    delete @_[k]
    @

  set: (key, value, timeout) ->
    @clearExpireds()
    timeout ?= @timeout
    if isNumber(timeout) and timeout != 0
      expires = time() + timeout
    try
      @_[key] =
        value: value,
        e: expires or 0
    catch error
      console.log error
    @

  toString: ->
    "#{@namespace} : #{@timeout}"
    @

class LocalStore
  @storage: localStorage

  @kache: @storage['_kache'] ?= {}
  @enabled: @kache['enabled'] ?= root.KacheConfig.enabled

  @clearStore: ->
    @store = {}
    @

  @clearExpireds: ->
    for own key, value of @store
      for k, item of JSON.parse value
        if isExpired item
          hasDeleted = true
          delete item
        if hasDeleted
          if count(value) == 0
            delete value
            return
        value ?= {}
        @store[key] = JSON.stringify value
    return

  @enable: ->
    @enabled = true
    @

  @disable: ->
    @enabled = false
    @

  @dumpall: ->
    console.log @store
    @

  @validStore: ->
    try
      !!localStorage
    catch error
      false

  store: @kache['store'] ?= {}

  constructor: (@namespace, @timeout) ->
    if !LocalStore.validStore()
      throw 'LocalStorage is not a valid cache store'
    @timeout ?= root.KacheConfig.Timeouts[@namespace] or root.KacheConfig.defaultTimeout
    @_ = JSON.parse @store[@namespace] or '{}'

  clear: ->
    @_ = {}
    writeThrough()
    @

  clearExpired: (k) ->
    if isExpired @_[k]
      @remove k
      @writeThrough
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

  enabled: ->
    !!LocalStore.enabled

  get: (k) ->
    return unless !!@enabled()
    @clearExpired k
    if @_[k] and @_[k].value
      @_[k].value

  load: (atts) ->
    for key, value of atts
      @[key] = value

  remove: (k) ->
    delete @_[k]
    @writeThrough
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
      @writeThrough or @remove k
    catch e
      if e == 'QUOTA_EXCEEDED_ERR'
        console.log 'QUOTA_EXCEEDED_ERR'
        @clearExpireds()
      return
    @

  toString: ->
    "#{@namespace} : #{@timeout}"
    @

  writeThrough: ->
    @store[@namespace] = JSON.stringify @_
    @

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
