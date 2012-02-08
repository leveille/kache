describe('Kache Build', function() {
    var version;
    describe("When kache is built", function() {
        beforeEach(function () {
            version = Kache.__version__;
        });

        it("should have a valid version", function() {
            expect(version).toMatch(/[0-9]\.[0-9]\.[0-9]/);
        });
    });
});

describe('Kache', function() {
    var cache;
    var enabled = Kache.isEnabled();
    describe("When kache is enabled/disabled", function() {
        beforeEach(function () {
            Kache.clearStore().enable();
            cache = Kache('test');
            cache.set('foo', 'bar');
        });

        it("should be enabled", function() {
            expect(Kache.isEnabled()).toEqual(true);
        });

        it("should return value when enabled", function() {
            expect(cache.get('foo')).toBe('bar');
        });

        it("should be disabled", function() {
            Kache.disable();
            expect(Kache.isEnabled()).toEqual(false);
        });

        it("should return  null when disabled", function() {
            Kache.disable();
            expect(cache.get('foo')).toEqual(null);
        });

        it("should retain enabled value when store is cleared", function() {
            var enabled = Kache.isEnabled();
            Kache.clearStore();
            expect(enabled).toEqual(Kache.isEnabled());
        });
    });

    describe("When js cache items are set", function() {
        var set1, set2;
        beforeEach(function () {
            Kache.clearStore().enable();
            cache = Kache('test');
            set1 = cache.set('foo', 'bar', 100);
            set2 = cache.set('bar', 'baz', 200);
        });

        it("should have an enabled value after clear", function() {
            expect(Kache.isEnabled()).toEqual(true);
        });

        it("should return a value when set", function() {
            expect(set1).toEqual('bar');
            expect(set2).toEqual('baz');
        });

        it("should have correct cache values", function() {
            expect(cache.get('foo')).toEqual('bar');
            expect(cache.get('bar')).toEqual('baz');
        });

        it("shouldn't have expired anything", function() {
            waits(75);
            runs(function () {
                expect(cache.get('foo')).toEqual(set1);
                expect(cache.get('bar')).toEqual(set2);
            });
        });

        it("should have expired an entry", function() {
            waits(110);
            runs(function () {
                expect(cache.get('foo')).toBeUndefined();
                expect(cache.get('bar')).toEqual(set2);
            });
        });

        it("should not have deleted the entire cache object", function() {
            waits(110);
            runs(function () {
                cache.clearExpireds();
                expect(cache._).toBeDefined();
                expect(cache.count()).toEqual(1);
            });
        });

        it("should have deleted all entries in the cache object", function() {
            waits(210);
            runs(function () {
                cache.clearExpireds();
                expect(cache.count()).toEqual(0);
            });
        });
    });

    describe("When expireds cleanup is called", function() {
        var cacheKey, cacheKey2, cacheKey3, cache2, cache3;
        beforeEach(function() {
            Kache.clearStore().enable();

            cacheKey = 'aaaa';
            cache = Kache(cacheKey, 250);
            cache.set('a', 'b', 500);
            cache.set('b', 'c');
            cache.set('c', 'd', 750);

            cacheKey2 = 'bbbb';
            cache2 = Kache(cacheKey2, 200);
            cache2.set('a', 'b');

            cacheKey3 = 'cccc';
            cache3 = Kache(cacheKey3);
            cache3.set('a', 'b');
        });

        it("should cleanup expired cache entries", function() {
            waits(300);
            runs(function () {
                Kache.clearExpireds();
                expect(cache.count()).toEqual(2);
                expect(cache.get('a')).toEqual('b');
                expect(cache.get('b')).toEqual(undefined);
                expect(cache.get('c')).toEqual('d');
                expect(cache.count()).toEqual(2);
                expect(cache2.count()).toEqual(0);
                expect(cache3.get('a')).toEqual('b');
                expect(cache3._['a'].e).toEqual(0);
            });
        });
    });
});

if(Kache.Memory !== undefined) {
    describe('Kache.Memory', function() {
        var cache;

        describe("When kache is enabled/disabled", function() {
            beforeEach(function () {
                Kache.Memory.clearStore().enable();
                cache = new Kache.Memory('test');
                cache.set('foo', 'bar', 10);
            });

            it("should be enabled", function() {
                expect(Kache.Memory.isEnabled()).toEqual(true);
                expect(window._kache.enabled).toEqual(true);
            });

            it("should be disabled", function() {
                Kache.Memory.disable();
                expect(Kache.Memory.isEnabled()).toEqual(false);
                expect(window._kache.enabled).toEqual(false);
            });

            it("should not return a value when disabled", function() {
                Kache.Memory.disable();
                expect(cache.get('foo')).toEqual(null);
            });
        });

        describe("When js cache items are set", function() {
            var bar, baz;
            beforeEach(function () {
                Kache.Memory.clearStore().enable();
                cache = new Kache.Memory('test');
                bar = cache.set('foo', 'bar', 100);
                baz = cache.set('bar', 'baz', 200);
            });

            it("should have an enabled value after clear", function() {
                expect(Kache.Memory.isEnabled()).toEqual(true);
            });

            it("should return a value when set", function() {
                expect(bar).toEqual('bar');
                expect(baz).toEqual('baz');
            });

            it("should have correct cache values", function() {
                expect(cache.get('foo')).toEqual(bar);
                expect(cache.get('bar')).toEqual(baz);
            });

            it("shouldn't have expired anything", function() {
                waits(75);
                runs(function () {
                    expect(cache.get('foo')).toEqual(bar);
                    expect(cache.get('bar')).toEqual(baz);
                });
            });

            it("should have expired an entry", function() {
                waits(175);
                runs(function () {
                    expect(cache.get('foo')).toBeUndefined();
                    expect(cache.get('bar')).toEqual(baz);
                });
            });

            it("should not have deleted the entire cache object", function() {
                waits(110);
                runs(function () {
                    cache.clearExpireds();
                    expect(cache._).toBeDefined();
                    expect(cache.count()).toEqual(1);
                });
            });

            it("should have deleted all entries in the cache object", function() {
                waits(210);
                runs(function () {
                    cache.clearExpireds();
                    expect(cache.count()).toEqual(0);
                });
            });
        });

        describe("When expireds cleanup is called", function() {
            var cacheKey, cacheKey2, cacheKey3, cache2, cache3;
            beforeEach(function() {
                Kache.Memory.clearStore()
                Kache.Memory.enable();

                cacheKey = 'aaaa';
                cache = new Kache.Memory(cacheKey, 250);
                cache.set('a', 'b', 500);
                cache.set('b', 'c');
                cache.set('c', 'd', 750);

                cacheKey2 = 'bbbb';
                cache2 = new Kache.Memory(cacheKey2, 200);
                cache2.set('a', 'b');

                cacheKey3 = 'cccc';
                cache3 = new Kache.Memory(cacheKey3);
                cache3.set('a', 'b');
            });

            it("should cleanup expired cache entries", function() {
                waits(300);
                runs(function () {
                    Kache.Memory.clearExpireds();
                    expect(cache.count()).toEqual(2);
                    expect(cache.get('a')).toEqual('b');
                    expect(cache.get('b')).toEqual(undefined);
                    expect(cache.get('c')).toEqual('d');
                    expect(cache.count()).toEqual(2);
                    expect(cache2.count()).toEqual(0);
                    expect(cache3.get('a')).toEqual('b');
                    expect(cache3._['a'].e).toEqual(0);
                });
            });
        });
    });
}

if(Kache.Local !== undefined && !!localStorage) {
    describe('Kache.Local', function() {
        var cache;

        describe("When kache is enabled/disabled", function() {
            beforeEach(function () {
                Kache.Local.clearStore().enable();
                cache = new Kache.Local('test');
                cache.set('foo', 'bar', 10);
            });

            it("should be enabled", function() {
                expect(Kache.Local.isEnabled()).toEqual(true);
                expect(!!localStorage._kache_enabled).toEqual(true);
            });

            it("should be disabled", function() {
                Kache.Local.disable();
                expect(Kache.Local.isEnabled()).toEqual(false);
                expect(!localStorage._kache_enabled).toEqual(false);
            });

            it("should not return a value when disabled", function() {
                Kache.Local.disable();
                expect(cache.get('foo')).toEqual(null);
            });
        });

        describe("When js cache items are set", function() {
            var bar, baz;
            beforeEach(function () {
                Kache.Local.clearStore().enable();
                cache = new Kache.Local('test');
                bar = cache.set('foo', 'bar', 100);
                baz = cache.set('bar', 'baz', 200);
            });

            it("should have an enabled value after clear", function() {
                expect(Kache.Local.isEnabled()).toEqual(true);
            });

            it("should return a value when set", function() {
                expect(bar).toEqual('bar');
                expect(baz).toEqual('baz');
            });

            it("shouldn't have expired anything", function() {
                waits(75);
                runs(function () {
                    expect(cache.get('foo')).toEqual(bar);
                    expect(cache.get('bar')).toEqual(baz);
                    expect(localStorage.length).toEqual(2);
                });
            });

            it("should have expired an entry", function() {
                waits(110);
                runs(function () {
                    expect(cache.get('foo')).toBeUndefined();
                    expect(cache.get('bar')).toEqual(baz);
                });
            });

            it("should not have deleted the entire cache object", function() {
                waits(110);
                runs(function () {
                    cache.clearExpireds();
                    expect(cache._).toBeDefined();
                    expect(cache.count()).toEqual(1);
                });
            });

            it("should have deleted all entries in the cache object", function() {
                waits(210);
                runs(function () {
                    cache.clearExpireds();
                    expect(cache.count()).toEqual(0);
                });
            });
        });

        describe("When expireds cleanup is called", function() {
            var cacheKey, cacheKey2, cacheKey3, cache2, cache3;
            beforeEach(function() {
                Kache.Local.clearStore().enable();

                cacheKey = 'aaaa';
                cache = new Kache.Local(cacheKey, 250);
                cache.set('a', 'b', 500);
                cache.set('b', 'c');
                cache.set('c', 'd', 750);

                cacheKey2 = 'bbbb';
                cache2 = new Kache.Local(cacheKey2, 200);
                cache2.set('a', 'b');

                cacheKey3 = 'cccc';
                cache3 = new Kache.Local(cacheKey3);
                cache3.set('a', 'b');
            });

            it("should cleanup expired cache entries", function() {
                waits(300);
                runs(function () {
                    Kache.Local.clearExpireds();
                    expect(cache.count()).toEqual(2);
                    expect(cache.get('a')).toEqual('b');
                    expect(cache.get('b')).toEqual(undefined);
                    expect(cache.get('c')).toEqual('d');
                    expect(cache.count()).toEqual(2);
                    expect(cache2.count()).toEqual(0);
                    expect(cache3.get('a')).toEqual('b');
                    expect(cache3._['a'].e).toEqual(0);
                });
            });
        });
    });
}

if(window.KacheConfig !== undefined) {
    _KacheConfig = window.KacheConfig;
    if(window.KacheConfig.Timeouts !== undefined) {
        _Timeouts = window.KacheConfig.Timeouts;
    }
}
describe('Kache Config', function() {
    var cache;
    describe("When kache is disabled from config", function() {
        beforeEach(function () {
            delete window._kache.enabled;
            delete localStorage._kache_enabled;
            window.KacheConfig.enabled = false;
            Kache.clearStore();
            cache = Kache('test');
            cache.set('foo', 'bar');
        });

        afterEach(function(){
            if(_KacheConfig !== undefined) {
                window.KacheConfig = _KacheConfig;
            }
        });

        it("should be disabled", function() {
            expect(Kache.isEnabled()).toEqual(false);
        });
    });

    describe("When kache is enabled from config", function() {
        beforeEach(function () {
            delete window._kache.enabled;
            delete localStorage._kache_enabled;
            window.KacheConfig.enabled = true;
            Kache.clearStore();
            cache = Kache('test');
            cache.set('foo', 'bar');
        });

        afterEach(function(){
            if(_KacheConfig !== undefined) {
                window.KacheConfig = _KacheConfig;
            }
        });

        it("should be disabled", function() {
            expect(Kache.isEnabled()).toEqual(true);
        });
    });

    describe("When default timeout is defined in config", function() {
        beforeEach(function () {
            window.KacheConfig.defaultTimeout = 100;
            Kache.clearStore();
        });

        afterEach(function(){
            if(_KacheConfig !== undefined) {
                window.KacheConfig = _KacheConfig;
            }
        });

        it("should obtain timeout from config", function() {
            cache = Kache('test');
            cache.set('foo', 'bar');
            expect(cache._['foo'].t).toEqual(100);
        });

        it("should obtain timeout from constructor", function() {
            cache = Kache('test', 200);
            cache.set('foo', 'bar');
            expect(cache._['foo'].t).toEqual(200);
        });

        it("should obtain timeout from set call", function() {
            cache = Kache('test');
            cache.set('foo', 'bar', 300);
            expect(cache._['foo'].t).toEqual(300);
        });
    });

    describe("When timeouts are defined", function() {
        var cache2, cache3;
        beforeEach(function () {
            window.KacheConfig.Timeouts = {
                'foobar1': 100,
                'foobar2': 200,
                'foobar3': 300
            };
            Kache.clearStore();
        });

        afterEach(function(){
            if(_Timeouts !== undefined) {
                window.KacheConfig.Timeouts = _Timeouts;
            }
        });

        it("should obtain timeout from config", function() {
            cache = Kache('foobar1');
            cache2 = Kache('foobar2');
            cache3 = Kache('foobar3');

            cache.set('1111', '1111');
            expect(cache._['1111'].t).toEqual(100);
            expect(cache.get('1111')).toEqual('1111');

            setTimeout(function() {
                expect(cache.get('1111')).toEqual(undefined);
            }, 150);

            cache2.set('2222', '2222');
            expect(cache2._['2222'].t).toEqual(200);
            expect(cache2.get('2222')).toEqual('2222');

            setTimeout(function() {
                expect(cache2.get('2222')).toEqual(undefined);
            }, 250);

            cache3.set('3333', '3333');
            expect(cache3._['3333'].t).toEqual(300);
            expect(cache3.get('3333')).toEqual('3333');

            setTimeout(function() {
                expect(cache3.get('3333')).toEqual(undefined);
            }, 350);
        });

        it("should obtain timeout from constructor", function() {
            cache = Kache('foobar1', 200);
            cache.set('foo', 'bar');
            expect(cache._['foo'].t).toEqual(200);
        });

        it("should obtain timeout from set", function() {
            cache = Kache('foobar1', 300);
            cache.set('foo', 'bar');
            expect(cache._['foo'].t).toEqual(300);
        });
    });
});