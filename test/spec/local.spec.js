if(Kache.Local.validStore()) {
    describe('Kache Local Storage', function() {
        var cache;
        describe("When kache is enabled/disabled", function() {
            afterEach(function () {
                Kache.Local.disable();
            });

            it("should be enabled", function() {
                Kache.Local.enable();
                expect(Kache.Local.enabled()).toEqual(true);
            });

            it("should be disabled", function() {
                console.log(Kache.Local);
                Kache.Local.disable()
                console.log(Kache.Local);
                expect(Kache.Local.enabled()).toEqual(false);
            });
        });
    });
}