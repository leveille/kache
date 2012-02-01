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

time =->
  +new Date()

count =(obj) ->
  _count = 0
  for own key, value of obj
    _count++
  _count

Defaults =
  enabled: false
  timeout: 0

class MemoryStore
  __name__: 'MemoryStore'

  store: window._kache ?= {}
  e_: MemoryStore::store['enabled'] ?= Defaults.enabled

  constructor: (@namespace, @timeout=Defaults.timeout) ->
    @_ = MemoryStore::store[@namespace] ?= {}

  clear: ->
    @_ = {}
    return

  clearExpired: (k) ->
    if @_[k] and @_[k].e and @_[k].e < time()
      @remove(k)
    false

  clearExpireds: ->
    for key, item of @_
      if item and item.e and item.e < time()
        @clearExpired key
    return

  count: ->
    @clearExpireds()
    count(@_)

  dump: ->
    console.log(@_)
    return

  get: (k) ->
    return unless !!MemoryStore.enabled()
    @clearExpired(k)
    if @_[k] and @_[k].value
      @_[k].value

  remove: (k) ->
    delete @_[k]
    return

  set: (key, value, timeout) ->
    MemoryStore.clearExpireds()
    timeout ?= @timeout
    if isNumber(timeout) and timeout != 0
      expires = time() + timeout
    try
      @_[key] = {
        value: value,
        e: expires or 0
      }
    catch error
      MemoryStore.error(error)
    return

  @clear: ->
    MemoryStore::store = {}
    return

  @clearExpireds: ->
    for own key, value of MemoryStore::store
      obj = MemoryStore::store[key]
      for ns, item of obj
        if item and item.e and item.e < time()
          hasDeleted = true
          delete item
      if hasDeleted
        MemoryStore::store[key] = obj
        if count(MemoryStore::store[key]) == 0
          delete MemoryStore::store[key]
    return

  @error: (e) ->
    console.log(e)
    return

  @validStore: ->
    true

  @toString: ->
    if @namespace and @timeout
      "#{MemoryStore.__name__} #{@namespace} : #{@timeout}"
    else
      MemoryStore.__name__

  @dumpAll: ->
    console.log(MemoryStore::store)
    return

  @disable: ->
    MemoryStore::e_ = false

  @enable: ->
    MemoryStore::e_ = true

  @enabled: ->
    !!MemoryStore::e_

  @__name__: MemoryStore::__name__

class LocalStore
  __name__: 'LocalStore'

  store: localStorage
  e_: LocalStore::store['enabled'] ?= Defaults.enabled

  constructor: (@namespace, @timeout) ->
    if !LocalStore.validStore()
      throw 'LocalStorage is not a valid cache store'
    @_ = JSON.parse(LocalStore::store[@namespace] or '{}')

  clearExpired: (k) ->
    if @_[k] and @_[k].e and @_[k].e < time()
      @remove(k)
    false

  clearExpireds: ->
    for key, item of @_
      @clearExpired key
    return

  count: ->
    @clearExpireds()
    count(@_)

  get: (k) ->
    return unless !!LocalStore.enabled()
    @clearExpired(k)
    if @_[k] and @_[k].value
      @_[k].value

  remove: (k) ->
    delete @_[k]
    return

  set: (key, value, timeout) ->
    LocalStore.clearExpireds()
    timeout ?= @timeout
    if isNumber(timeout) and timeout != 0
      expires = time() + timeout
    try
      @_[key] = {
        value: value,
        e: expires or 0
      }
    catch error
      LocalStore.error(error)
    return

  @clearExpireds: ->
    for own key, value of LocalStore::store
      obj = JSON.parse(@_[key])
      for ns, item of obj
        if item and item.e and item.e < time()
          hasDeleted = true
          delete item
      if hasDeleted
        LocalStore::store[key] = JSON.stringify(obj)
        if count(@_[key]) == 0
          delete @_[key]
    return

  @clear: ->
    LocalStore::store.clear()
    return

  @error: (e) ->
    if e == QUOTA_EXCEEDED_ERR
      console.log('QUOTA_EXCEEDED_ERR')
      @clearExpireds()
    return

  @validStore: ->
    try
      !!localStorage || !!globalStorage
    catch error
      false

  @toString: ->
    if @namespace and @timeout
      "#{LocalStore.__name__} #{@namespace} : #{@timeout}"
    else
      LocalStore.__name__

  @dumpAll: ->
    console.log(LocalStore::store)
    return

  @disable: ->
    LocalStore::e_ = false

  @enable: ->
    LocalStore::e_ = true

  @enabled: ->
    !!LocalStore::e_

  @__name__: LocalStore::__name__

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

root.Kache.Guid         = guid
root.Kache.Local        = LocalStore
root.Kache.Memory       = MemoryStore
root.Kache.__version__  = __version__


