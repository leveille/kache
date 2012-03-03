/*
Kache - a cross-browser LocalStorage API
https://github.com/leveille/kache
Version: 0.0.8
*/

(function() {
  var DefaultKacheConfig, DefaultStore, LocalStore, Log, MemoryStore, Module, Store, count, isExpired, isNumber, moduleKeywords, noop, root, time, _base, _base2, _base3, _base4,
    __hasProp = Object.prototype.hasOwnProperty,
    __slice = Array.prototype.slice,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

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

  DefaultKacheConfig = {
    enabled: false,
    defaultTimeout: 0,
    namespacePrefix: '',
    Timeouts: {}
  };

  if (root.KacheConfig) {
    if ((_base = root.KacheConfig).enabled == null) {
      _base.enabled = DefaultKacheConfig.enabled;
    }
    if ((_base2 = root.KacheConfig).defaultTimeout == null) {
      _base2.defaultTimeout = DefaultKacheConfig.defaultTimeout;
    }
    if ((_base3 = root.KacheConfig).namespacePrefix == null) {
      _base3.namespacePrefix = DefaultKacheConfig.namespacePrefix;
    }
    if ((_base4 = root.KacheConfig).Timeouts == null) {
      _base4.Timeouts = DefaultKacheConfig.Timeouts;
    }
  } else {
    root.KacheConfig = DefaultKacheConfig;
  }

  Log = {
    trace: true,
    logPrefix: "(Kache)",
    log: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!this.trace) return;
      if (typeof console === "undefined") return;
      if (this.logPrefix) args.unshift(this.logPrefix);
      console.log.apply(console, args);
      return this;
    }
  };

  moduleKeywords = ["included", "extended"];

  Module = (function() {

    function Module() {}

    Module.include = function(obj) {
      var included, key, value;
      if (!obj) throw "include(obj) requires obj";
      for (key in obj) {
        value = obj[key];
        if (__indexOf.call(moduleKeywords, key) < 0) this.prototype[key] = value;
      }
      included = obj.included;
      if (included) included.apply(this);
      return this;
    };

    Module.extend = function(obj) {
      var extended, key, value;
      if (!obj) throw "extend(obj) requires obj";
      for (key in obj) {
        value = obj[key];
        if (__indexOf.call(moduleKeywords, key) < 0) this[key] = value;
      }
      extended = obj.extended;
      if (extended) extended.apply(this);
      return this;
    };

    Module.proxy = function(func) {
      var _this = this;
      return function() {
        return func.apply(_this, arguments);
      };
    };

    Module.prototype.proxy = function(func) {
      var _this = this;
      return function() {
        return func.apply(_this, arguments);
      };
    };

    return Module;

  })();

  Store = (function(_super) {

    __extends(Store, _super);

    Store.include(Log);

    function Store() {
      var timeout;
      if (this.attrs) this.load(this.attrs);
      if (this.logPrefix) this.logPrefix = this.logPrefix;
      if (root.KacheConfig.namespacePrefix && this.disablePrefix !== true) {
        this.namespace = root.KacheConfig.namespacePrefix + '#' + this.namespace;
      }
      if (!this.load) throw 'Cannot load cache store';
      this._ = this.load();
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
      this.log(this._);
      return this;
    };

    Store.prototype.enabled = function() {
      throw "NotImplemented exception";
    };

    Store.prototype.error = function(e) {
      return this.log(e);
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
      return "" + this.namespace + " : " + this.timeout;
    };

    Store.prototype.writeThrough = function() {
      noop();
      return this;
    };

    return Store;

  })(Module);

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

    MemoryStore.enable = function() {
      root._kache.enabled = true;
      return this;
    };

    MemoryStore.isEnabled = function() {
      if (root._kache && root._kache.enabled === false) return false;
      return !!((root._kache && root._kache.enabled) || (root.KacheConfig && root.KacheConfig.enabled) || false);
    };

    MemoryStore.validStore = function() {
      return true;
    };

    MemoryStore.prototype.store = root._kache.store;

    function MemoryStore(namespace, attrs) {
      this.namespace = namespace;
      this.attrs = attrs != null ? attrs : {};
      this.attrs['load'] = this.proxy(function() {
        var _base5, _name, _ref;
        return (_ref = (_base5 = this.store)[_name = this.namespace]) != null ? _ref : _base5[_name] = {};
      });
      this.attrs['logPrefix'] = 'MemoryStore';
      this.attrs['type'] = 'MemoryStore';
      MemoryStore.__super__.constructor.apply(this, arguments);
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

    LocalStore.isEnabled = function() {
      if (localStorage[_enabled_key] && localStorage[_enabled_key] === 'false') {
        return false;
      }
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

    function LocalStore(namespace, attrs) {
      this.namespace = namespace;
      this.attrs = attrs != null ? attrs : {};
      if (!LocalStore.validStore()) {
        throw 'LocalStorage is not a valid cache store';
      }
      this.attrs['load'] = this.proxy(function() {
        return JSON.parse(this.store[this.namespace] || '{}');
      });
      this.attrs['logPrefix'] = 'LocalStore';
      this.attrs['type'] = 'LocalStore';
      LocalStore.__super__.constructor.apply(this, arguments);
    }

    LocalStore.prototype.enabled = function() {
      return !!LocalStore.isEnabled();
    };

    LocalStore.prototype.error = function(e) {
      if (e === 'QUOTA_EXCEEDED_ERR') {
        this.log('QUOTA_EXCEEDED_ERR');
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

  root.Kache = function(namespace, attrs) {
    var _Store;
    if (attrs && 'store' in attrs) {
      switch (attrs['store'].toLowerCase()) {
        case 'local':
          if (LocalStore.validStore()) {
            _Store = LocalStore;
          } else {
            throw 'localStore is not supported';
          }
          break;
        case 'memory':
          _Store = MemoryStore;
          break;
        default:
          throw 'Invalid Store Type.  Valid options include: {store: "local|memory"}';
      }
    } else {
      _Store = DefaultStore;
    }
    return new _Store(namespace, attrs);
  };

  root.Kache.Local = LocalStore;

  root.Kache.Memory = MemoryStore;

  root.Kache.clearStore = DefaultStore.clearStore;

  root.Kache.clearExpireds = DefaultStore.clearExpireds;

  root.Kache.disable = DefaultStore.disable;

  root.Kache.enable = DefaultStore.enable;

  root.Kache.isEnabled = DefaultStore.isEnabled;

  root.Kache.__version__ = '0.0.8';

}).call(this);
