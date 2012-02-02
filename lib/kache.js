(function() {
  var LocalStore, MemoryStore, count, guid, isExpired, isNumber, root, time, _Kache, __version__, _base,
    __hasProp = Object.prototype.hasOwnProperty;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  __version__ = '0.0.1';

  guid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r, v;
      r = Math.random() * 16 | 0;
      v = c === 'x' ? r : r & 3 | 8;
      return v.toString(16);
    }).toUpperCase();
  };

  isNumber = function(n) {
    return typeof n === 'number' && isFinite(n);
  };

  isExpired = function(item) {
    return item && item.e && item.e < time();
  };

  time = function() {
    return +new Date();
  };

  count = function(obj) {
    var key, value, _count;
    _count = 0;
    for (key in obj) {
      if (!__hasProp.call(obj, key)) continue;
      value = obj[key];
      _count++;
    }
    return _count;
  };

  if (root.KacheConfig == null) {
    root.KacheConfig = {
      enabled: false,
      defaultTimeout: 0
    };
  }

  if ((_base = root.KacheConfig).Timeouts == null) _base.Timeouts = {};

  MemoryStore = (function() {
    var _clearExpireds, _clearStore, _enabled, _error, _kache, _kachestore, _ref, _ref2, _ref3, _ref4, _storage, _store;

    _storage = (_ref = root._kachestore) != null ? _ref : root._kachestore = _kachestore = {
      store: {},
      enabled: root.KacheConfig.enabled
    };

    _kache = (_ref2 = _storage['_kachestore']) != null ? _ref2 : _storage['_kachestore'] = {};

    _store = (_ref3 = _kache['store']) != null ? _ref3 : _kache['store'] = {};

    _enabled = (_ref4 = _kache['enabled']) != null ? _ref4 : _kache['enabled'] = root.KacheConfig.enabled;

    _clearExpireds = function() {
      var hasDeleted, item, key, ns, obj, value;
      for (key in _store) {
        if (!__hasProp.call(_store, key)) continue;
        value = _store[key];
        obj = _store[key];
        for (ns in obj) {
          item = obj[ns];
          if (isExpired(item)) {
            hasDeleted = true;
            delete item;
          }
        }
        if (hasDeleted) {
          _store[key] = obj;
          if (count(_store[key]) === 0) delete _store[key];
        }
      }
    };

    _clearStore = function() {
      return _store = {};
    };

    _error = function(e) {
      return console.log(e);
    };

    function MemoryStore(namespace, timeout) {
      var _name, _ref5;
      this.namespace = namespace;
      this.timeout = timeout;
      if (this.timeout == null) {
        this.timeout = root.KacheConfig.Timeouts[this.namespace] || root.KacheConfig.defaultTimeout;
      }
      this._ = (_ref5 = _store[_name = this.namespace]) != null ? _ref5 : _store[_name] = {};
    }

    MemoryStore.prototype.clear = function() {
      this._ = {};
      return this;
    };

    MemoryStore.prototype.clearExpired = function(k) {
      if (isExpired(this._[k])) this.remove(k);
      return this;
    };

    MemoryStore.prototype.clearExpireds = function() {
      var item, key, _ref5;
      _ref5 = this._;
      for (key in _ref5) {
        item = _ref5[key];
        if (isExpired(item)) this.clearExpired(key);
      }
      return this;
    };

    MemoryStore.prototype.count = function() {
      this.clearExpireds();
      return count(this._);
    };

    MemoryStore.prototype.dump = function() {
      console.log(this._);
      return this;
    };

    MemoryStore.prototype.error = function(e) {
      _error(e);
    };

    MemoryStore.prototype.get = function(k) {
      if (!_enabled) return;
      this.clearExpired(k);
      if (this._[k] && this._[k].value) return this._[k].value;
    };

    MemoryStore.prototype.remove = function(k) {
      delete this._[k];
      return this;
    };

    MemoryStore.prototype.set = function(key, value, timeout) {
      var expires;
      _clearExpireds();
      if (timeout == null) timeout = this.timeout;
      if (isNumber(timeout) && timeout !== 0) expires = time() + timeout;
      try {
        this._[key] = {
          value: value,
          e: expires || 0
        };
      } catch (error) {
        this.error(error);
      }
      return this;
    };

    MemoryStore.prototype.toString = function() {
      "" + this.namespace + " : " + this.timeout;
      return this;
    };

    MemoryStore.clearStore = function() {
      _clearStore();
    };

    MemoryStore.clearExpireds = function() {
      _clearExpireds();
    };

    MemoryStore.disable = function() {
      return _enabled = false;
    };

    MemoryStore.enable = function() {
      return _enabled = true;
    };

    MemoryStore.enabled = function() {
      return !!_enabled;
    };

    MemoryStore.validStore = function() {
      return true;
    };

    return MemoryStore;

  })();

  LocalStore = (function() {
    var _clearExpireds, _clearStore, _enabled, _error, _kache, _ref, _ref2, _ref3, _storage, _store, _writeThrough;

    _storage = localStorage;

    _kache = (_ref = _storage['_kache']) != null ? _ref : _storage['_kache'] = {};

    _store = (_ref2 = _kache['store']) != null ? _ref2 : _kache['store'] = {};

    _enabled = (_ref3 = _kache['enabled']) != null ? _ref3 : _kache['enabled'] = root.KacheConfig.enabled;

    _clearStore = function() {
      return _store = {};
    };

    _clearExpireds = function() {
      var hasDeleted, item, k, key, value, _ref4;
      for (key in _store) {
        if (!__hasProp.call(_store, key)) continue;
        value = _store[key];
        _ref4 = JSON.parse(value);
        for (k in _ref4) {
          item = _ref4[k];
          if (isExpired(item)) {
            hasDeleted = true;
            delete item;
          }
          if (hasDeleted) {
            if (count(value) === 0) {
              delete value;
              return;
            }
          }
          if (value == null) value = {};
          _store[key] = JSON.stringify(value);
        }
      }
    };

    _error = function(e) {
      if (e === QUOTA_EXCEEDED_ERR) {
        console.log('QUOTA_EXCEEDED_ERR');
        _clearExpireds();
      }
    };

    _writeThrough = function(inst) {
      return _store[inst.namespace] = JSON.stringify(inst._);
    };

    function LocalStore(namespace, timeout) {
      this.namespace = namespace;
      this.timeout = timeout;
      if (!LocalStore.validStore()) {
        throw 'LocalStorage is not a valid cache store';
      }
      if (this.timeout == null) {
        this.timeout = root.KacheConfig.Timeouts[this.namespace] || root.KacheConfig.defaultTimeout;
      }
      this._ = JSON.parse(_store[this.namespace] || '{}');
    }

    LocalStore.prototype.clearExpired = function(k) {
      if (isExpired(this._[k])) this.remove(k);
      _writeThrough(this);
      return this;
    };

    LocalStore.prototype.clearExpireds = function() {
      var item, key, _ref4;
      _ref4 = this._;
      for (key in _ref4) {
        item = _ref4[key];
        this.clearExpired(key);
      }
      _writeThrough(this);
      return this;
    };

    LocalStore.prototype.count = function() {
      this.clearExpireds();
      return count(this._);
    };

    LocalStore.prototype.get = function(k) {
      if (!_enabled) return;
      this.clearExpired(k);
      if (this._[k] && this._[k].value) return this._[k].value;
    };

    LocalStore.prototype.remove = function(k) {
      delete this._[k];
      _writeThrough(this);
      return this;
    };

    LocalStore.prototype.set = function(k, value, timeout) {
      var expires;
      this.clearExpireds();
      if (timeout == null) timeout = this.timeout;
      if (isNumber(timeout) && timeout !== 0) expires = time() + timeout;
      try {
        this._[k] = {
          value: value,
          e: expires || 0
        };
        _writeThrough(this || this.remove(k));
      } catch (error) {
        _error(error);
      }
      return this;
    };

    LocalStore.prototype.toString = function() {
      "" + this.namespace + " : " + this.timeout;
      return this;
    };

    LocalStore.clearStore = function() {
      _clearStore();
    };

    LocalStore.clearExpireds = function() {
      _clearExpireds();
    };

    LocalStore.disable = function() {
      return _enabled = false;
    };

    LocalStore.enable = function() {
      return _enabled = true;
    };

    LocalStore.enabled = function() {
      return !!_enabled;
    };

    LocalStore.validStore = function() {
      try {
        return !!localStorage || !!globalStorage;
      } catch (error) {
        return false;
      }
    };

    return LocalStore;

  })();

  _Kache = (function() {

    _Kache.prototype.store = LocalStore;

    function _Kache(namespace, timeout) {
      this.namespace = namespace;
      this.timeout = timeout != null ? timeout : 0;
      this.instance = _Kache.prototype.store(this.namespace, this.timeout);
    }

    _Kache.prototype.clear = function() {
      this.instance.clear();
    };

    _Kache.prototype.clearExpireds = function() {
      this.instance.clearExpireds();
    };

    _Kache.prototype.count = function() {
      return this.instance.count();
    };

    _Kache.prototype.get = function(key) {
      return this.instance.get(key);
    };

    _Kache.prototype.remove = function() {
      this.instance.remove();
    };

    _Kache.prototype.set = function(key, value, timeout) {
      this.instance.set(key, value, timeout);
    };

    _Kache.clear = function() {
      _Kache.prototype.store.clear();
    };

    _Kache.clearExpireds = function() {
      _Kache.prototype.store.clearExpireds();
    };

    _Kache.disable = function() {
      return _Kache.prototype.store.prototype.e_ = false;
    };

    _Kache.dumpAll = function() {
      console.log(_Kache.prototype.store.prototype.store);
    };

    _Kache.enable = function() {
      console.log(_Kache.prototype.store);
      return Kache.prototype.store.prototype.e_ = true;
    };

    _Kache.enabled = function() {
      return !!_Kache.prototype.store.prototype.e_;
    };

    return _Kache;

  })();

  root.Kache = function(namespace, timeout) {
    return new _Kache(namespace, timeout);
  };

  root.Kache.Guid = guid;

  root.Kache.Local = LocalStore;

  root.Kache.Memory = MemoryStore;

  root.Kache.__version__ = __version__;

}).call(this);
