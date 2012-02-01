xdescribe('Kache Memory', function() {
    var cache;

    describe("When kache is enabled/disabled", function() {
        beforeEach(function () {
            Kache.enable();
        });

        it("should be enabled", function() {
            expect(Kache.enabled()).toEqual(true);
        });

        it("should be disabled", function() {
            Kache.disable();
            expect(Kache.enabled()).toEqual(false);
        });
    });

    xdescribe("When js cache is set to 100ms", function() {
        beforeEach(function () {
            cache = Kache('test')
            cache.clear();
            cache.set('hello', 'world', 100);
            Kache.enable();
        });

        it("should not have expired at 50 ms", function() {
            waitsFor(function () {}, "Timeout", 50);
            runs(function () {
                expect(cache.get('hello')).toEqual('world');
            });
        });

        it("should have expired at 150 ms", function() {
            waitsFor(function () {}, "Timeout", 150);
            runs(function () {
                cache.clearExpireds();
                expect(cache._['hello']).toEqual(undefined);
            });
        });
    });

    xdescribe("When js cache is set to 100ms via options", function() {
        beforeEach(function () {
            cache = kizzy('test', 100);
            cache.clear();
            cache.set('hello', 'world');
            kizzy.enable();
        });

        it("should not have expired at 50 ms", function() {
            waits(50);
            runs(function () {
                expect(cache.get('hello')).toEqual('world');
            });
        });

        it("should have expired at 150 ms", function() {
            waits(150);
            runs(function () {
                cache.clearExpireds();
                expect(cache._['hello']).toEqual(undefined);
            });
        });

    });

    xdescribe("When options set timeout to 100ms AND expiry is set to 50ms in 'optional' third argument", function() {
        beforeEach(function () {
            cache = kizzy('test', 100);
            cache.clear();
            cache.set('hello', 'world', 50);
            kizzy.enable();
        });

        it("should have expired at 50 ms", function() {
            waits(75);
            runs(function () {
                cache.clearExpireds();
                expect(cache._['hello']).toEqual(undefined);
            });
        });
    });


});

