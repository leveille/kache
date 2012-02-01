describe('Kache.Memory', function() {
    var cache;

    describe("When kache is enabled/disabled", function() {
        beforeEach(function () {
            Kache.Memory.clear();
            Kache.Memory.enable();
            cache = new Kache.Memory('test');
            cache.set('foo', 'bar', 10);
        });

        afterEach(function () {
            Kache.Memory.clear();
            Kache.Memory.disable();
        });

        it("should be the correct object", function() {
            expect(Kache.Memory.__name__).toEqual('MemoryStore');
        });

        it("should be enabled", function() {
            expect(Kache.Memory.enabled()).toEqual(true);
        });

        it("should be disabled", function() {
            Kache.Memory.disable()
            expect(Kache.Memory.enabled()).toEqual(false);
            expect(cache.get('foo')).toEqual(null);
        });
    });

    describe("When js cache items are set", function() {
        beforeEach(function () {
            Kache.Memory.clear();
            Kache.Memory.enable();
            cache = new Kache.Memory('test');
            cache.set('foo', 'bar', 100);
            cache.set('bar', 'baz', 200);
        });

        it("should have an enabled value after clear", function() {
            expect(Kache.Memory.enabled()).toEqual(true);
        });

        it("should have correct cache values", function() {
            expect(cache.get('foo')).toEqual('bar');
            expect(cache.get('bar')).toEqual('baz');
        });

        it("shouldn't have expired anything", function() {
            waits(75);
            runs(function () {
                expect(cache.get('foo')).toEqual('bar');
                expect(cache.get('bar')).toEqual('baz');
            });
        });

        it("should have expired an entry", function() {
            waits(100);
            runs(function () {
                expect(cache.get('foo')).toBeUndefined();
                expect(cache.get('bar')).toEqual('baz');
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
            Kache.Memory.clear();
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

