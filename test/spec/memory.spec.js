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
            var cacheGuid, cacheGuid2, cacheGuid3, cache2, cache3;
            beforeEach(function() {
                Kache.Memory.clearStore()
                Kache.Memory.enable();

                cacheGuid = Kache.Guid();
                cache = new Kache.Memory(cacheGuid, 250);
                cache.set('a', 'b', 500);
                cache.set('b', 'c');
                cache.set('c', 'd', 750);

                cacheGuid2 = Kache.Guid();
                cache2 = new Kache.Memory(cacheGuid2, 200);
                cache2.set('a', 'b');

                cacheGuid3 = Kache.Guid();
                cache3 = new Kache.Memory(cacheGuid3);
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