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
    var _base2, _base3, _base4, _ref, _ref2, _ref3;

    MemoryStore.storage = function() {
      var _kachestore, _ref;
      return (_ref = root._kachestore) != null ? _ref : root._kachestore = _kachestore = {
        store: {},
        enabled: root.KacheConfig.enabled
      };
    };

    MemoryStore.kache = (_ref = (_base2 = MemoryStore.storage)['_kachestore']) != null ? _ref : _base2['_kachestore'] = {};

    MemoryStore.enabled = (_ref2 = (_base3 = MemoryStore.kache)['enabled']) != null ? _ref2 : _base3['enabled'] = root.KacheConfig.enabled;

    MemoryStore.clearExpireds = function() {
      var hasDeleted, item, key, ns, obj, value, _ref3;
      _ref3 = this.store;
      for (key in _ref3) {
        if (!__hasProp.call(_ref3, key)) continue;
        value = _ref3[key];
        obj = this.store[key];
        for (ns in obj) {
          item = obj[ns];
          if (isExpired(item)) {
            hasDeleted = true;
            delete item;
          }
        }
        if (hasDeleted) {
          this.store[key] = obj;
          if (count(this.store[key]) === 0) delete this.store[key];
        }
      }
      return this;
    };

    MemoryStore.clearStore = function() {
      this.store = {};
      return this;
    };

    MemoryStore.error = function(e) {
      return console.log(e);
    };

    MemoryStore.disable = function() {
      this.enabled = false;
      return this;
    };

    MemoryStore.dumpall = function() {
      console.log(this.store);
      return this;
    };

    MemoryStore.enable = function() {
      this.enabled = true;
      return this;
    };

    MemoryStore.validStore = function() {
      return true;
    };

    MemoryStore.prototype.store = (_ref3 = (_base4 = MemoryStore.kache)['store']) != null ? _ref3 : _base4['store'] = {};

    function MemoryStore(namespace, timeout, atts) {
      var _base5, _name, _ref4;
      this.namespace = namespace;
      this.timeout = timeout;
      this.atts = atts;
      if (this.timeout == null) {
        this.timeout = root.KacheConfig.Timeouts[this.namespace] || root.KacheConfig.defaultTimeout;
      }
      if (atts) this.load(atts);
      this._ = (_ref4 = (_base5 = this.store)[_name = this.namespace]) != null ? _ref4 : _base5[_name] = {};
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
      var item, key, _ref4;
      _ref4 = this._;
      for (key in _ref4) {
        item = _ref4[key];
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

    MemoryStore.prototype.enabled = function() {
      return !!MemoryStore.enabled;
    };

    MemoryStore.prototype.get = function(k) {
      if (!this.enabled()) return;
      this.clearExpired(k);
      if (this._[k] && this._[k].value) return this._[k].value;
    };

    MemoryStore.prototype.load = function(atts) {
      var key, value, _results;
      _results = [];
      for (key in atts) {
        value = atts[key];
        _results.push(this[key] = value);
      }
      return _results;
    };

    MemoryStore.prototype.remove = function(k) {
      delete this._[k];
      return this;
    };

    MemoryStore.prototype.set = function(key, value, timeout) {
      var expires;
      this.clearExpireds();
      if (timeout == null) timeout = this.timeout;
      if (isNumber(timeout) && timeout !== 0) expires = time() + timeout;
      try {
        this._[key] = {
          value: value,
          e: expires || 0
        };
      } catch (error) {
        console.log(error);
      }
      return this;
    };

    MemoryStore.prototype.toString = function() {
      "" + this.namespace + " : " + this.timeout;
      return this;
    };

    return MemoryStore;

  })();

  LocalStore = (function() {
    var _base2, _base3, _base4, _ref, _ref2, _ref3;

    LocalStore.storage = localStorage;

    LocalStore.kache = (_ref = (_base2 = LocalStore.storage)['_kache']) != null ? _ref : _base2['_kache'] = {};

    LocalStore.enabled = (_ref2 = (_base3 = LocalStore.kache)['enabled']) != null ? _ref2 : _base3['enabled'] = root.KacheConfig.enabled;

    LocalStore.clearStore = function() {
      this.store = {};
      return this;
    };

    LocalStore.clearExpireds = function() {
      var hasDeleted, item, k, key, value, _ref3, _ref4;
      _ref3 = this.store;
      for (key in _ref3) {
        if (!__hasProp.call(_ref3, key)) continue;
        value = _ref3[key];
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
          this.store[key] = JSON.stringify(value);
        }
      }
    };

    LocalStore.enable = function() {
      this.enabled = true;
      return this;
    };

    LocalStore.disable = function() {
      this.enabled = false;
      return this;
    };

    LocalStore.dumpall = function() {
      console.log(this.store);
      return this;
    };

    LocalStore.validStore = function() {
      try {
        return !!localStorage;
      } catch (error) {
        return false;
      }
    };

    LocalStore.prototype.store = (_ref3 = (_base4 = LocalStore.kache)['store']) != null ? _ref3 : _base4['store'] = {};

    function LocalStore(namespace, timeout) {
      this.namespace = namespace;
      this.timeout = timeout;
      if (!LocalStore.validStore()) {
        throw 'LocalStorage is not a valid cache store';
      }
      if (this.timeout == null) {
        this.timeout = root.KacheConfig.Timeouts[this.namespace] || root.KacheConfig.defaultTimeout;
      }
      this._ = JSON.parse(this.store[this.namespace] || '{}');
    }

    LocalStore.prototype.clear = function() {
      this._ = {};
      writeThrough();
      return this;
    };

    LocalStore.prototype.clearExpired = function(k) {
      if (isExpired(this._[k])) {
        this.remove(k);
        this.writeThrough;
      }
      return this;
    };

    LocalStore.prototype.clearExpireds = function() {
      var item, key, _ref4;
      _ref4 = this._;
      for (key in _ref4) {
        item = _ref4[key];
        if (isExpired(item)) this.clearExpired(key);
      }
      return this;
    };

    LocalStore.prototype.count = function() {
      this.clearExpireds();
      return count(this._);
    };

    LocalStore.prototype.dump = function() {
      console.log(this._);
      return this;
    };

    LocalStore.prototype.enabled = function() {
      return !!LocalStore.enabled;
    };

    LocalStore.prototype.get = function(k) {
      if (!this.enabled()) return;
      this.clearExpired(k);
      if (this._[k] && this._[k].value) return this._[k].value;
    };

    LocalStore.prototype.load = function(atts) {
      var key, value, _results;
      _results = [];
      for (key in atts) {
        value = atts[key];
        _results.push(this[key] = value);
      }
      return _results;
    };

    LocalStore.prototype.remove = function(k) {
      delete this._[k];
      this.writeThrough;
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
        this.writeThrough || this.remove(k);
      } catch (e) {
        if (e === 'QUOTA_EXCEEDED_ERR') {
          console.log('QUOTA_EXCEEDED_ERR');
          this.clearExpireds();
        }
        return;
      }
      return this;
    };

    LocalStore.prototype.toString = function() {
      "" + this.namespace + " : " + this.timeout;
      return this;
    };

    LocalStore.prototype.writeThrough = function() {
      this.store[this.namespace] = JSON.stringify(this._);
      return this;
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
