(function() {
  var DefaultStore, LocalStore, MemoryStore, Store, count, guid, isExpired, isNumber, noop, root, time, __version__, _base,
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
      if (root.KacheConfig) {
        if (root.KacheConfig.Timeouts && root.KacheConfig.Timeouts[this.namespace]) {
          timeout = root.KacheConfig.Timeouts[this.namespace];
        } else if (root.KacheConfig.defaultTimeout) {
          timeout = root.KacheConfig.defaultTimeout;
        } else {
          timeout = 0;
        }
      }
      if (this.timeout == null) this.timeout = timeout;
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
      if (this._[k] && this._[k].v) return this._[k].v;
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
          v: value,
          e: expires || 0,
          t: timeout
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
    var _kache;

    __extends(MemoryStore, _super);

    if (root._kache == null) {
      root._kache = _kache = {
        store: {},
        enabled: root.KacheConfig.enabled
      };
    }

    MemoryStore.kache = root._kache;

    MemoryStore.clearExpireds = function() {
      var hasDeleted, item, key, ns, obj, value, _ref;
      _ref = this.store;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        value = _ref[key];
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
      root._kache.enabled = false;
      return this;
    };

    MemoryStore.dumpall = function() {
      console.log(this.store);
      return this;
    };

    MemoryStore.enable = function() {
      root._kache.enabled = true;
      return this;
    };

    MemoryStore.isEnabled = function() {
      return !!((root._kache && root._kache.enabled) || (root.KacheConfig && root.KacheConfig.enabled) || false);
    };

    MemoryStore.validStore = function() {
      return true;
    };

    MemoryStore.prototype.store = root._kache.store;

    function MemoryStore(namespace, timeout, atts) {
      var _base2, _name, _ref;
      this.namespace = namespace;
      this.timeout = timeout;
      this.atts = atts;
      this._ = (_ref = (_base2 = this.store)[_name = this.namespace]) != null ? _ref : _base2[_name] = {};
      MemoryStore.__super__.constructor.call(this, this.namespace, this.timeout, this.atts);
    }

    MemoryStore.prototype.enabled = function() {
      return !!MemoryStore.isEnabled();
    };

    return MemoryStore;

  })(Store);

  LocalStore = (function(_super) {
    var _enabled_key;

    __extends(LocalStore, _super);

    _enabled_key = '_kache_enabled';

    LocalStore.clearStore = function() {
      var enabled;
      if (localStorage[_enabled_key] !== void 0) enabled = this.isEnabled();
      localStorage.clear();
      if (enabled !== void 0) localStorage[_enabled_key] = enabled;
      return this;
    };

    LocalStore.clearExpireds = function() {
      var hasDeleted, item, k, key, value, _ref, _ref2;
      _ref = this.store;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        value = _ref[key];
        _ref2 = JSON.parse(value);
        for (k in _ref2) {
          item = _ref2[k];
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
      localStorage[_enabled_key] = 'true';
      return this;
    };

    LocalStore.disable = function() {
      localStorage[_enabled_key] = 'false';
      return this;
    };

    LocalStore.dumpall = function() {
      console.log(this.store);
      return this;
    };

    LocalStore.isEnabled = function() {
      return !!((localStorage[_enabled_key] && localStorage[_enabled_key] === 'true') || (root.KacheConfig && root.KacheConfig.enabled) || false);
    };

    LocalStore.validStore = function() {
      try {
        return !!localStorage;
      } catch (error) {
        return false;
      }
    };

    LocalStore.prototype.store = localStorage;

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

  root.Kache = function(namespace, timeout, atts) {
    return new DefaultStore(namespace, timeout, atts);
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
