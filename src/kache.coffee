###
Kache - a cross-browser LocalStorage API
Copyright: Jason Leveille 2012
https://github.com/leveille/kache
License: MIT
###
root = exports ? this

__version__ = '0.0.1'

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
    if root.KacheConfig
      if root.KacheConfig.Timeouts and root.KacheConfig.Timeouts[@namespace]
        timeout = root.KacheConfig.Timeouts[@namespace]
      else if root.KacheConfig.defaultTimeout
        timeout = root.KacheConfig.defaultTimeout
      else
        timeout = 0
    @timeout ?= timeout
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
    if @_[k] and @_[k].v
      @_[k].v

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
        v: value,
        e: expires or 0,
        t: timeout
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
  root._kache ?=
    _kache =
      store: {},
      enabled: root.KacheConfig.enabled
  @kache: root._kache

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
    root._kache.enabled = false
    @

  @dumpall: ->
    console.log @store
    @

  @enable: ->
    root._kache.enabled = true
    @

  @isEnabled: ->
    !!((root._kache and root._kache.enabled) \
        or (root.KacheConfig and root.KacheConfig.enabled) \
        or false)

  @validStore: ->
    true

  store: root._kache.store

  constructor: (@namespace, @timeout, @atts) ->
    @_ = @store[@namespace] ?= {}
    super @namespace, @timeout, @atts

  enabled: ->
    !!MemoryStore.isEnabled()

class LocalStore extends Store
  _enabled_key = '_kache_enabled'

  @clearStore: ->
    if localStorage[_enabled_key] != undefined
      enabled = @isEnabled()
    localStorage.clear()
    if enabled != undefined
      localStorage[_enabled_key] = enabled
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
    localStorage[_enabled_key] = 'true'
    @

  @disable: ->
    localStorage[_enabled_key] = 'false'
    @

  @dumpall: ->
    console.log @store
    @

  @isEnabled: ->
    !!((localStorage[_enabled_key] and localStorage[_enabled_key] == 'true') \
        or (root.KacheConfig and root.KacheConfig.enabled) \
        or false)

  @validStore: ->
    try
      !!localStorage
    catch error
      false

  store: localStorage

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

root.Kache = (namespace, timeout, atts) ->
  new DefaultStore(namespace, timeout, atts)

root.Kache.Local            = LocalStore
root.Kache.Memory           = MemoryStore

root.Kache.clearStore       = DefaultStore.clearStore
root.Kache.clearExpireds    = DefaultStore.clearExpireds
root.Kache.disable          = DefaultStore.disable
root.Kache.enable           = DefaultStore.enable
root.Kache.isEnabled        = DefaultStore.isEnabled
root.Kache.__version__      = __version__

