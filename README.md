Kache - a Local Storage Utility
-------------------------------

Kache leverages HTML5 localStorage when available and falls back to an in-browser object store when it isn't.

Example

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

Set accepts an optional 3rd parameter indicating the expiration time for a cache object

    var cache = Kache('users');

    // wait 3 seconds...
    setTimeout(function() {
      alert(cache.get('User'));
    }, 3000);

    // 6 seconds later...
    setTimeout(function() {
      alert(cache.get('User') === undefined ? 'Expired' : 'Still Alive')
    }, 6000);

The Kache contstructor also accepts a timeout, which sets a default timeout for any cache instances created within that cache namespace

    var cache = Kache('users', 5000); // all cache instances will default to a 5 second expiration

    // wait 3 seconds...
    setTimeout(function() {
      alert(cache.get('User'));
    }, 3000);

    // 6 seconds later...
    setTimeout(function() {
      alert(cache.get('User') === undefined ? 'Expired' : 'Still Alive')
    }, 6000);

A default expiration can be overridden by the optional 3rd argument in a set call.

    var cache = Kache('users', 5000); // all cache instances will default to a 5 second expiration
    var user = cache.get('User') || cache.set('User', 'Jason Leveille', 3000); // time to live set for 3 seconds

    // 4 seconds later...
    setTimeout(function() {
      alert(cache.get('User') === undefined ? 'Expired' : 'Still Alive')
    }, 4000);

Conributing
-------------------------------
Changes should be made to src/kache.coffee and built.  In order you build you to install coffee-script.

    $ cake build

Running tests
-------------------------------

    $ open test/public/index.html
