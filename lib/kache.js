(function() {
  var Defaults, LocalStore, MemoryStore, count, guid, isNumber, root, time, _Kache, __version__,
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

  Defaults = {
    enabled: false,
    timeout: 0
  };

  MemoryStore = (function() {
    var _base, _ref, _ref2;

    MemoryStore.prototype.__name__ = 'MemoryStore';

    MemoryStore.prototype.store = (_ref = window._kache) != null ? _ref : window._kache = {};

    MemoryStore.prototype.e_ = (_ref2 = (_base = MemoryStore.prototype.store)['enabled']) != null ? _ref2 : _base['enabled'] = Defaults.enabled;

    function MemoryStore(namespace, timeout) {
      var _base2, _name, _ref3;
      this.namespace = namespace;
      this.timeout = timeout != null ? timeout : Defaults.timeout;
      this._ = (_ref3 = (_base2 = MemoryStore.prototype.store)[_name = this.namespace]) != null ? _ref3 : _base2[_name] = {};
    }

    MemoryStore.prototype.clear = function() {
      this._ = {};
    };

    MemoryStore.prototype.clearExpired = function(k) {
      if (this._[k] && this._[k].e && this._[k].e < time()) this.remove(k);
      return false;
    };

    MemoryStore.prototype.clearExpireds = function() {
      var item, key, _ref3;
      _ref3 = this._;
      for (key in _ref3) {
        item = _ref3[key];
        if (item && item.e && item.e < time()) this.clearExpired(key);
      }
    };

    MemoryStore.prototype.count = function() {
      this.clearExpireds();
      return count(this._);
    };

    MemoryStore.prototype.dump = function() {
      console.log(this._);
    };

    MemoryStore.prototype.get = function(k) {
      if (!MemoryStore.enabled()) return;
      this.clearExpired(k);
      if (this._[k] && this._[k].value) return this._[k].value;
    };

    MemoryStore.prototype.remove = function(k) {
      delete this._[k];
    };

    MemoryStore.prototype.set = function(key, value, timeout) {
      var expires;
      MemoryStore.clearExpireds();
      if (timeout == null) timeout = this.timeout;
      if (isNumber(timeout) && timeout !== 0) expires = time() + timeout;
      try {
        this._[key] = {
          value: value,
          e: expires || 0
        };
      } catch (error) {
        MemoryStore.error(error);
      }
    };

    MemoryStore.clear = function() {
      MemoryStore.prototype.store = {};
    };

    MemoryStore.clearExpireds = function() {
      var hasDeleted, item, key, ns, obj, value, _ref3;
      _ref3 = MemoryStore.prototype.store;
      for (key in _ref3) {
        if (!__hasProp.call(_ref3, key)) continue;
        value = _ref3[key];
        obj = MemoryStore.prototype.store[key];
        for (ns in obj) {
          item = obj[ns];
          if (item && item.e && item.e < time()) {
            hasDeleted = true;
            delete item;
          }
        }
        if (hasDeleted) {
          MemoryStore.prototype.store[key] = obj;
          if (count(MemoryStore.prototype.store[key]) === 0) {
            delete MemoryStore.prototype.store[key];
          }
        }
      }
    };

    MemoryStore.error = function(e) {
      console.log(e);
    };

    MemoryStore.validStore = function() {
      return true;
    };

    MemoryStore.toString = function() {
      if (this.namespace && this.timeout) {
        return "" + MemoryStore.__name__ + " " + this.namespace + " : " + this.timeout;
      } else {
        return MemoryStore.__name__;
      }
    };

    MemoryStore.dumpAll = function() {
      console.log(MemoryStore.prototype.store);
    };

    MemoryStore.disable = function() {
      return MemoryStore.prototype.e_ = false;
    };

    MemoryStore.enable = function() {
      return MemoryStore.prototype.e_ = true;
    };

    MemoryStore.enabled = function() {
      return !!MemoryStore.prototype.e_;
    };

    MemoryStore.__name__ = MemoryStore.prototype.__name__;

    return MemoryStore;

  })();

  LocalStore = (function() {
    var _base, _ref;

    LocalStore.prototype.__name__ = 'LocalStore';

    LocalStore.prototype.store = localStorage;

    LocalStore.prototype.e_ = (_ref = (_base = LocalStore.prototype.store)['enabled']) != null ? _ref : _base['enabled'] = Defaults.enabled;

    function LocalStore(namespace, timeout) {
      this.namespace = namespace;
      this.timeout = timeout;
      if (!LocalStore.validStore()) {
        throw 'LocalStorage is not a valid cache store';
      }
      this._ = JSON.parse(LocalStore.prototype.store[this.namespace] || '{}');
    }

    LocalStore.prototype.clearExpired = function(k) {
      if (this._[k] && this._[k].e && this._[k].e < time()) this.remove(k);
      return false;
    };

    LocalStore.prototype.clearExpireds = function() {
      var item, key, _ref2;
      _ref2 = this._;
      for (key in _ref2) {
        item = _ref2[key];
        this.clearExpired(key);
      }
    };

    LocalStore.prototype.count = function() {
      this.clearExpireds();
      return count(this._);
    };

    LocalStore.prototype.get = function(k) {
      if (!LocalStore.enabled()) return;
      this.clearExpired(k);
      if (this._[k] && this._[k].value) return this._[k].value;
    };

    LocalStore.prototype.remove = function(k) {
      delete this._[k];
    };

    LocalStore.prototype.set = function(key, value, timeout) {
      var expires;
      LocalStore.clearExpireds();
      if (timeout == null) timeout = this.timeout;
      if (isNumber(timeout) && timeout !== 0) expires = time() + timeout;
      try {
        this._[key] = {
          value: value,
          e: expires || 0
        };
      } catch (error) {
        LocalStore.error(error);
      }
    };

    LocalStore.clearExpireds = function() {
      var hasDeleted, item, key, ns, obj, value, _ref2;
      _ref2 = LocalStore.prototype.store;
      for (key in _ref2) {
        if (!__hasProp.call(_ref2, key)) continue;
        value = _ref2[key];
        obj = JSON.parse(this._[key]);
        for (ns in obj) {
          item = obj[ns];
          if (item && item.e && item.e < time()) {
            hasDeleted = true;
            delete item;
          }
        }
        if (hasDeleted) {
          LocalStore.prototype.store[key] = JSON.stringify(obj);
          if (count(this._[key]) === 0) delete this._[key];
        }
      }
    };

    LocalStore.clear = function() {
      LocalStore.prototype.store.clear();
    };

    LocalStore.error = function(e) {
      if (e === QUOTA_EXCEEDED_ERR) {
        console.log('QUOTA_EXCEEDED_ERR');
        this.clearExpireds();
      }
    };

    LocalStore.validStore = function() {
      try {
        return !!localStorage || !!globalStorage;
      } catch (error) {
        return false;
      }
    };

    LocalStore.toString = function() {
      if (this.namespace && this.timeout) {
        return "" + LocalStore.__name__ + " " + this.namespace + " : " + this.timeout;
      } else {
        return LocalStore.__name__;
      }
    };

    LocalStore.dumpAll = function() {
      console.log(LocalStore.prototype.store);
    };

    LocalStore.disable = function() {
      return LocalStore.prototype.e_ = false;
    };

    LocalStore.enable = function() {
      return LocalStore.prototype.e_ = true;
    };

    LocalStore.enabled = function() {
      return !!LocalStore.prototype.e_;
    };

    LocalStore.__name__ = LocalStore.prototype.__name__;

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
