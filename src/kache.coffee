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

noop =->

time =->
  +new Date()

count =(obj) ->
  _count = 0
  for own key, value of obj
    _count++
  _count

root.KacheConfig ?=
  enabled: false,
  defaultTimeout: 0

root.KacheConfig.Timeouts ?= {}

class Store
  constructor: (@namespace, @timeout, @atts) ->
    if not @_
      throw 'Invalid Cache Instance'
    @timeout ?= root.KacheConfig.Timeouts[@namespace] or root.KacheConfig.defaultTimeout
    @load atts if atts

  clear: ->
    @_ = {}
    @writeThrough()
    @

  clearExpired: (k) ->
    if isExpired @_[k]
      @remove k
    @

  clearExpireds: ->
    for key, item of @_
      @clearExpired key
    @

  count: ->
    @clearExpireds()
    count(@_)

  dump: ->
    console.log @_
    @

  enabled: ->
    throw "NotImplemented exception"

  error: (e)->
    console.log e

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
    @writeThrough()
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
      @writeThrough()
    catch e
      @error(e)
      value = null
    value

  toString: ->
    "#{@namespace} : #{@timeout}"
    @

  writeThrough: ->
    noop()
    @

class MemoryStore extends Store
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

  @disable: ->
    LocalStore.enabled = false
    @

  @dumpall: ->
    console.log @store
    @

  @enable: ->
    LocalStore.enabled = true
    @

  @isEnabled: ->
    !!LocalStore.enabled

  @validStore: ->
    true

  store: @kache['store'] ?= {}

  constructor: (@namespace, @timeout, @atts) ->
    @_ = @store[@namespace] ?= {}
    super @namespace, @timeout, @atts

  enabled: ->
    !!MemoryStore.isEnabled()

class LocalStore extends Store
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
    @

  @enable: ->
    LocalStore.enabled = true
    @

  @disable: ->
    LocalStore.enabled = false
    @

  @dumpall: ->
    console.log @store
    @

  @isEnabled: ->
    !!LocalStore.enabled

  @validStore: ->
    try
      !!localStorage
    catch error
      false

  store: @kache['store'] ?= {}

  constructor: (@namespace, @timeout, @atts) ->
    if !LocalStore.validStore()
      throw 'LocalStorage is not a valid cache store'
    @_ = JSON.parse @store[@namespace] or '{}'
    super @namespace, @timeout, @atts

  enabled: ->
    !!LocalStore.isEnabled()

  error: (e)->
    if e == 'QUOTA_EXCEEDED_ERR'
      console.log 'QUOTA_EXCEEDED_ERR'
      @clearExpireds()
    else
      super e
    return

  writeThrough: ->
    @store[@namespace] = JSON.stringify @_
    @


DefaultStore =
  if LocalStore.validStore()
    LocalStore
  else
    MemoryStore

class _Kache
  constructor: (@namespace, @timeout, @atts) ->
    @instance = new DefaultStore(@namespace, @timeout, @atts)
    @_ = @instance._

  clear: ->
    @instance.clear()
    @

  clearExpireds: ->
    @instance.clearExpireds()
    @

  count: ->
    @instance.count()

  get: (key) ->
    @instance.get key

  remove: ->
    @instance.remove()
    @

  set: (key, value, timeout) ->
    @instance.set(key, value, timeout)

root.Kache = (namespace, timeout, atts) ->
  new _Kache(namespace, timeout, atts)

root.Kache.Guid             = guid
root.Kache.Local            = LocalStore
root.Kache.Memory           = MemoryStore

root.Kache.clearStore       = DefaultStore.clearStore
root.Kache.clearExpireds    = DefaultStore.clearExpireds
root.Kache.disable          = DefaultStore.disable
root.Kache.enable           = DefaultStore.enable
root.Kache.isEnabled        = DefaultStore.isEnabled
root.Kache.__version__      = __version__

