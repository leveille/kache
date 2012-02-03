(function() {
  var DefaultStore, LocalStore, MemoryStore, Store, count, guid, isExpired, isNumber, noop, root, time, _Kache, __version__, _base,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

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

  noop = function() {};

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

  Store = (function() {

    function Store(namespace, timeout, atts) {
      this.namespace = namespace;
      this.timeout = timeout;
      this.atts = atts;
      if (!this._) throw 'Invalid Cache Instance';
      if (this.timeout == null) {
        this.timeout = root.KacheConfig.Timeouts[this.namespace] || root.KacheConfig.defaultTimeout;
      }
      if (atts) this.load(atts);
    }

    Store.prototype.clear = function() {
      this._ = {};
      this.writeThrough();
      return this;
    };

    Store.prototype.clearExpired = function(k) {
      if (isExpired(this._[k])) this.remove(k);
      return this;
    };

    Store.prototype.clearExpireds = function() {
      var item, key, _ref;
      _ref = this._;
      for (key in _ref) {
        item = _ref[key];
        this.clearExpired(key);
      }
      return this;
    };

    Store.prototype.count = function() {
      this.clearExpireds();
      return count(this._);
    };

    Store.prototype.dump = function() {
      console.log(this._);
      return this;
    };

    Store.prototype.enabled = function() {
      throw "NotImplemented exception";
    };

    Store.prototype.error = function(e) {
      return console.log(e);
    };

    Store.prototype.get = function(k) {
      if (!this.enabled()) return;
      this.clearExpired(k);
      if (this._[k] && this._[k].value) return this._[k].value;
    };

    Store.prototype.load = function(atts) {
      var key, value, _results;
      _results = [];
      for (key in atts) {
        value = atts[key];
        _results.push(this[key] = value);
      }
      return _results;
    };

    Store.prototype.remove = function(k) {
      delete this._[k];
      this.writeThrough();
      return this;
    };

    Store.prototype.set = function(key, value, timeout) {
      var expires;
      this.clearExpireds();
      if (timeout == null) timeout = this.timeout;
      if (isNumber(timeout) && timeout !== 0) expires = time() + timeout;
      try {
        this._[key] = {
          value: value,
          e: expires || 0
        };
        this.writeThrough();
      } catch (e) {
        this.error(e);
        value = null;
      }
      return value;
    };

    Store.prototype.toString = function() {
      "" + this.namespace + " : " + this.timeout;
      return this;
    };

    Store.prototype.writeThrough = function() {
      noop();
      return this;
    };

    return Store;

  })();

  MemoryStore = (function(_super) {
    var _base2, _base3, _base4, _ref, _ref2, _ref3;

    __extends(MemoryStore, _super);

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

    MemoryStore.disable = function() {
      LocalStore.enabled = false;
      return this;
    };

    MemoryStore.dumpall = function() {
      console.log(this.store);
      return this;
    };

    MemoryStore.enable = function() {
      LocalStore.enabled = true;
      return this;
    };

    MemoryStore.isEnabled = function() {
      return !!LocalStore.enabled;
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
      this._ = (_ref4 = (_base5 = this.store)[_name = this.namespace]) != null ? _ref4 : _base5[_name] = {};
      MemoryStore.__super__.constructor.call(this, this.namespace, this.timeout, this.atts);
    }

    MemoryStore.prototype.enabled = function() {
      return !!MemoryStore.isEnabled();
    };

    return MemoryStore;

  })(Store);

  LocalStore = (function(_super) {
    var _base2, _base3, _base4, _ref, _ref2, _ref3;

    __extends(LocalStore, _super);

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
      return this;
    };

    LocalStore.enable = function() {
      LocalStore.enabled = true;
      return this;
    };

    LocalStore.disable = function() {
      LocalStore.enabled = false;
      return this;
    };

    LocalStore.dumpall = function() {
      console.log(this.store);
      return this;
    };

    LocalStore.isEnabled = function() {
      return !!LocalStore.enabled;
    };

    LocalStore.validStore = function() {
      try {
        return !!localStorage;
      } catch (error) {
        return false;
      }
    };

    LocalStore.prototype.store = (_ref3 = (_base4 = LocalStore.kache)['store']) != null ? _ref3 : _base4['store'] = {};

    function LocalStore(namespace, timeout, atts) {
      this.namespace = namespace;
      this.timeout = timeout;
      this.atts = atts;
      if (!LocalStore.validStore()) {
        throw 'LocalStorage is not a valid cache store';
      }
      this._ = JSON.parse(this.store[this.namespace] || '{}');
      LocalStore.__super__.constructor.call(this, this.namespace, this.timeout, this.atts);
    }

    LocalStore.prototype.enabled = function() {
      return !!LocalStore.isEnabled();
    };

    LocalStore.prototype.error = function(e) {
      if (e === 'QUOTA_EXCEEDED_ERR') {
        console.log('QUOTA_EXCEEDED_ERR');
        this.clearExpireds();
      } else {
        LocalStore.__super__.error.call(this, e);
      }
    };

    LocalStore.prototype.writeThrough = function() {
      this.store[this.namespace] = JSON.stringify(this._);
      return this;
    };

    return LocalStore;

  })(Store);

  DefaultStore = LocalStore.validStore() ? LocalStore : MemoryStore;

  _Kache = (function() {

    function _Kache(namespace, timeout, atts) {
      this.namespace = namespace;
      this.timeout = timeout;
      this.atts = atts;
      this.instance = new DefaultStore(this.namespace, this.timeout, this.atts);
      this._ = this.instance._;
    }

    _Kache.prototype.clear = function() {
      this.instance.clear();
      return this;
    };

    _Kache.prototype.clearExpireds = function() {
      this.instance.clearExpireds();
      return this;
    };

    _Kache.prototype.count = function() {
      return this.instance.count();
    };

    _Kache.prototype.get = function(key) {
      return this.instance.get(key);
    };

    _Kache.prototype.remove = function() {
      this.instance.remove();
      return this;
    };

    _Kache.prototype.set = function(key, value, timeout) {
      return this.instance.set(key, value, timeout);
    };

    return _Kache;

  })();

  root.Kache = function(namespace, timeout, atts) {
    return new _Kache(namespace, timeout, atts);
  };

  root.Kache.Guid = guid;

  root.Kache.Local = LocalStore;

  root.Kache.Memory = MemoryStore;

  root.Kache.clearStore = DefaultStore.clearStore;

  root.Kache.clearExpireds = DefaultStore.clearExpireds;

  root.Kache.disable = DefaultStore.disable;

  root.Kache.enable = DefaultStore.enable;

  root.Kache.isEnabled = DefaultStore.isEnabled;

  root.Kache.__version__ = __version__;

}).call(this);
