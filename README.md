Kache - a Local Storage Utility
===============================

Inspired by kizzy (https://github.com/ded/Kizzy), Kache leverages HTML5 localStorage when available and falls back to an in-browser object store when it isn't.

Usage
-----

    var cache = Kache('users');
    var user = cache.get('User');
    if (user) {
        alert(user);
    } else {
        cache.set('User', 'Jason Leveille');
    }

Calling 'set' will return the cache value.

    var cache = Kache('users');
    var user = cache.get('User') || cache.set('User', 'Jason Leveille');

Kache Configuration
-------------------

Kache will look for the existance of a KacheConfig global during setup.  Here you can define an enabled status as well as a default cache object timeout:

    window.KacheConfig = {
        enabled: false,
        defaultTimeout: 0
    };

Kache will also look for the existance of a Timeouts object.  In the event that you want to sync/stagger cache timeouts for multiple cache layers (grid/web server/etc), you can define your default namespaced cache timeouts:

    window.KacheConfig.Timeouts = {
        'first_namespace': 3000,  // 3 second default timeout for any cache object in the 'first_namespace' namespace
        'second_namespace': 4000  // 4 second default timeout
    };

Enabling/Disabling Kache
------------------------

You can control whether or not Kache is enabled via the 'enabled' option in KacheConfig.  You can override this setting by explicitly enabling or disabling Kache:

    Kache.enable();
    alert(Kache.isEnabled()); // true

    Kache.disable();
    alert(Kache.isEnabled()); // false

Of note, if localStorage is supported, and the Kache store in use is localStorage, enabling kache via `Kache.enable()` will set a localStorage variable indicating the enabled/disabled status.  This variable will allow you to retain the status between page requests (which should ease testing).

    Kache.enable();
    alert(localStorage._kache_enabled); // This variable is subject to change.
                                        // I'm showing it here for illustration purposes.

This variable *WILL OVERRIDE* the enabled value set in KacheConfig.

Timeouts
--------

There are 4 ways you can define timeouts for cache objects.

*By defining a global defaultTimeout (see KacheConfiguration variable):*

    window.KacheConfig.defaultTimeout = 3000; // Sets default object timeout of 3 seconds

    var cache = Kache('users');
    cache.set('User', 'Jason Leveille');

    // wait 3.5 seconds...
    setTimeout(function() {
        alert(cache.get('User')); // Should have timed out
    }, 3500);

*By defining a Kache namespace timeout via the Timeouts config:*

    window.KacheConfig.Timeouts = {
        'users': 3000
    };

    var cache = Kache('users');
    cache.set('User', 'Jason Leveille');

    // wait 3.5 seconds...
    setTimeout(function() {
        alert(cache.get('User')); // Should have timed out
    }, 3500);

*The Kache constructor also accepts a timeout, which sets a default timeout for any cache instances created within that cache namespace:*

    var cache = Kache('users', 5000); // all cache instances will default to a 5 second expiration
    cache.set('User', 'Jason Leveille');

    // wait 3 seconds...
    setTimeout(function() {
      alert(cache.get('User'));
    }, 3000);

    // 6 seconds later...
    setTimeout(function() {
      alert(cache.get('User') === undefined ? 'Expired' : 'Still Alive')
    }, 6000);

*set accepts an optional 3rd parameter indicating the expiration time for a cache object:*

    var cache = Kache('users');
    cache.set('User', 'Jason Leveille', 5000);

    // wait 3 seconds...
    setTimeout(function() {
      alert(cache.get('User'));
    }, 3000);

    // 6 seconds later...
    setTimeout(function() {
      alert(cache.get('User') === undefined ? 'Expired' : 'Still Alive')
    }, 6000);

### Timeout Override order

Cache timeouts are listed here, in the order of preference:

1. set
2. Kache Constructor
3. KacheConfig.Timeouts
4. defaultTimeout

For example, the following cache bucket will have an expiration time of 4 seconds:

    window.KacheConfig.defaultTimeout = 1000;
    window.KacheConfig.Timeouts = {
        'users': 2000  // Overrides defaultTimeout
    };

    var cache = Kache('users', 3000); // Overrides KacheConfig.Timeouts.users
    cache.set('User', 'Jason Leveille', 4000); // Overrides Kache constructor

    // wait 3.5 seconds...
    setTimeout(function() {
        alert(cache.get('User')); // Should display Jason Leveille
    }, 3500);

    // wait 4.5 seconds...
    setTimeout(function() {
        alert(cache.get('User')); // Should have expired
    }, 4500);

Contributing
------------
Changes should be made to src/kache.coffee and built.  In order you build you to install coffee-script.

    $ cake build

Running tests
-------------------------------

    $ open test/public/index.html
