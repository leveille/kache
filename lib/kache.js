(function() {
  var Defaults, LocalStore, MemoryStore, guid, root,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  Defaults = {
    enabled: false,
    timeout: 0
  };

  MemoryStore = (function() {
    var _base, _ref;

    MemoryStore.prototype.__name__ = 'MemoryStore';

    MemoryStore.prototype.store = (_ref = window._kache) != null ? _ref : window._kache = {};

    if ((_base = MemoryStore.prototype.store)['enabled'] == null) {
      _base['enabled'] = Defaults.enabled;
    }

    MemoryStore.prototype.e_ = MemoryStore.prototype.store['enabled'];

    function MemoryStore(namespace, timeout) {
      var _base2, _name;
      this.namespace = namespace;
      this.timeout = timeout != null ? timeout : Defaults.timeout;
      if ((_base2 = MemoryStore.prototype.store)[_name = this.namespace] == null) {
        _base2[_name] = {};
      }
      this._ = MemoryStore.prototype.store[this.namespace];
    }

    MemoryStore.prototype.clear = function() {
      this._ = {};
    };

    MemoryStore.prototype.clearExpired = function(k) {
      if (this._[k] && this._[k].e && this._[k].e < MemoryStore.time()) {
        this.remove(k);
      }
      return false;
    };

    MemoryStore.prototype.clearExpireds = function() {
      var item, key, _ref2;
      _ref2 = this._;
      for (key in _ref2) {
        item = _ref2[key];
        if (item && item.e && item.e < MemoryStore.time()) {
          delete item;
          delete this._[key];
        }
      }
    };

    MemoryStore.prototype.count = function() {
      this.clearExpireds();
      return MemoryStore.count(this._);
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
      if (MemoryStore.isNumber(timeout) && timeout !== 0) {
        expires = MemoryStore.time() + timeout;
      }
      try {
        MemoryStore.prototype.store[this.namespace][key] = {
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
      var hasDeleted, item, key, ns, obj, value, _ref2;
      _ref2 = MemoryStore.prototype.store;
      for (key in _ref2) {
        if (!__hasProp.call(_ref2, key)) continue;
        value = _ref2[key];
        obj = MemoryStore.prototype.store[key];
        for (ns in obj) {
          item = obj[ns];
          if (item && item.e && item.e < MemoryStore.time()) {
            hasDeleted = true;
            delete item;
          }
        }
        if (hasDeleted) {
          MemoryStore.prototype.store[key] = obj;
          if (MemoryStore.count(MemoryStore.prototype.store[key]) === 0) {
            delete MemoryStore.prototype.store[key];
          }
        }
      }
    };

    MemoryStore.count = function(obj) {
      var count, key, value;
      count = 0;
      for (key in obj) {
        if (!__hasProp.call(obj, key)) continue;
        value = obj[key];
        count++;
      }
      return count;
    };

    MemoryStore.error = function(e) {
      console.log(e);
    };

    MemoryStore.isNumber = function(n) {
      return typeof n === 'number' && isFinite(n);
    };

    MemoryStore.validStore = function() {
      return true;
    };

    MemoryStore.time = function() {
      return +new Date();
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

  LocalStore = (function(_super) {
    var _base;

    __extends(LocalStore, _super);

    LocalStore.prototype.__name__ = 'LocalStore';

    LocalStore.prototype.store = localStorage;

    if ((_base = LocalStore.prototype.store)['enabled'] == null) {
      _base['enabled'] = Defaults.enabled;
    }

    LocalStore.prototype.e_ = LocalStore.prototype.store['enabled'];

    function LocalStore(namespace, timeout) {
      this.namespace = namespace;
      this.timeout = timeout;
      if (!LocalStore.validStore()) {
        throw 'LocalStorage is not a valid cache store';
      }
      LocalStore.__super__.constructor.call(this, this.namespace, this.timeout);
    }

    LocalStore.clearExpireds = function() {
      var hasDeleted, item, key, ns, obj, value, _ref;
      _ref = LocalStore.prototype.store;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        value = _ref[key];
        obj = JSON.parse(LocalStore.prototype.store[key]);
        for (ns in obj) {
          item = obj[ns];
          if (item && item.e && item.e < LocalStore.time()) {
            hasDeleted = true;
            delete item;
          }
        }
        if (hasDeleted) {
          LocalStore.prototype.store[key] = JSON.stringify(obj);
          if (LocalStore.count(LocalStore.prototype.store[key]) === 0) {
            delete LocalStore.prototype.store[key];
          }
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

  })(MemoryStore);

  root.Kache = (function() {

    Kache.prototype.store = LocalStore;

    function Kache(namespace, timeout) {
      this.namespace = namespace;
      this.timeout = timeout != null ? timeout : 0;
      this.instance = Kache.prototype.store(this.namespace, this.timeout);
    }

    Kache.prototype.clear = function() {
      this.instance.clear();
    };

    Kache.prototype.clearExpireds = function() {
      this.instance.clearExpireds();
    };

    Kache.prototype.count = function() {
      return this.instance.count();
    };

    Kache.prototype.get = function(key) {
      return this.instance.get(key);
    };

    Kache.prototype.remove = function() {
      this.instance.remove();
    };

    Kache.prototype.set = function(key, value, timeout) {
      this.instance.set(key, value, timeout);
    };

    Kache.clear = function() {
      Kache.prototype.store.clear();
    };

    Kache.clearExpireds = function() {
      Kache.prototype.store.clearExpireds();
    };

    Kache.disable = function() {
      return Kache.prototype.store.prototype.e_ = false;
    };

    Kache.dumpAll = function() {
      console.log(Kache.prototype.store.prototype.store);
    };

    Kache.enable = function() {
      console.log(Kache.prototype.store);
      return Kache.prototype.store.prototype.e_ = true;
    };

    Kache.enabled = function() {
      return !!Kache.prototype.store.prototype.e_;
    };

    return Kache;

  })();

  guid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r, v;
      r = Math.random() * 16 | 0;
      v = c === 'x' ? r : r & 3 | 8;
      return v.toString(16);
    }).toUpperCase();
  };

  root.Kache.Store = Kache.prototype.store.prototype.__name__;

  root.Kache.Memory = MemoryStore;

  root.Kache.Local = LocalStore;

  root.Kache.version = '0.0.1';

  root.Kache.guid = guid;

}).call(this);
