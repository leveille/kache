root = exports ? this

Defaults =
  enabled: false
  timeout: 0

class MemoryStore
  __name__: 'MemoryStore'

  store: window._kache ?= {}
  MemoryStore::store['enabled'] ?= Defaults.enabled
  e_: MemoryStore::store['enabled']

  constructor: (@namespace, @timeout=Defaults.timeout) ->
    MemoryStore::store[@namespace] ?= {}
    @_ = MemoryStore::store[@namespace]

  clear: ->
    @_ = {}
    return

  clearExpired: (k) ->
    if @_[k] and @_[k].e and @_[k].e < MemoryStore.time()
      @remove(k)
    false

  clearExpireds: ->
    for key, item of @_
      if item and item.e and item.e < MemoryStore.time()
        delete item
        delete @_[key]
    return

  count: ->
    @clearExpireds()
    MemoryStore.count(@_)

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
    if MemoryStore.isNumber(timeout) and timeout != 0
      expires = MemoryStore.time() + timeout
    try
      MemoryStore::store[@namespace][key] = {
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
        if item and item.e and item.e < MemoryStore.time()
          hasDeleted = true
          delete item
      if hasDeleted
        MemoryStore::store[key] = obj
        if MemoryStore.count(MemoryStore::store[key]) == 0
          delete MemoryStore::store[key]
    return

  @count: (obj) ->
    count = 0
    for own key, value of obj
      count++
    count

  @error: (e) ->
    console.log(e)
    return

  @isNumber: (n) ->
    typeof n == 'number' && isFinite(n)

  @validStore: ->
    true

  @time: ->
    +new Date()

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

class LocalStore extends MemoryStore
  __name__: 'LocalStore'

  store: localStorage
  LocalStore::store['enabled'] ?= Defaults.enabled
  e_: LocalStore::store['enabled']

  constructor: (@namespace, @timeout) ->
    if !LocalStore.validStore()
      throw 'LocalStorage is not a valid cache store'
    super(@namespace, @timeout)

  @clearExpireds: ->
    for own key, value of LocalStore::store
      obj = JSON.parse(LocalStore::store[key])
      for ns, item of obj
        if item and item.e and item.e < LocalStore.time()
          hasDeleted = true
          delete item
      if hasDeleted
        LocalStore::store[key] = JSON.stringify(obj)
        if LocalStore.count(LocalStore::store[key]) == 0
          delete LocalStore::store[key]
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

  @disable: ->
    LocalStore::e_ = false

  @enable: ->
    LocalStore::e_ = true

  @enabled: ->
    !!LocalStore::e_

  @__name__: LocalStore::__name__

class root.Kache

  store: LocalStore

  constructor: (@namespace, @timeout=0) ->
    @instance = Kache::store(@namespace, @timeout)

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
    Kache::store.clear()
    return

  @clearExpireds: ->
    Kache::store.clearExpireds()
    return

  @disable: ->
    Kache::store::e_ = false

  @dumpAll: ->
    console.log(Kache::store::store)
    return

  @enable: ->
    console.log(Kache::store)
    Kache::store::e_ = true

  @enabled: ->
    !!Kache::store::e_

guid = ->
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace /[xy]/g, (c) ->
    r = Math.random() * 16 | 0
    v = if c is 'x' then r else r & 3 | 8
    v.toString 16
  .toUpperCase()

root.Kache.Store     = Kache::store::__name__
root.Kache.Memory    = MemoryStore
root.Kache.Local     = LocalStore
root.Kache.version   = '0.0.1'
root.Kache.guid      = guid

