'use strict';

var Testdata = require('../../../config/testData'),
    MemoModule = require('../module/memoModule'),
    AppiumDriver = require('appium-plus').AppiumDriver,
    testEnvironment = require('../../../common/test_environment');

describe('Memo tests', function() {

    var appiumDriver = null;

    var cap = testEnvironment.capabilities;

    before(function() {
        appiumDriver = new AppiumDriver(testEnvironment.testServer);
        appiumDriver.bindModule(MemoModule);
        // the following logging is for debugging when needed
        // require('../../../config/logging').configure(appiumDriver);
    });

    beforeEach(function() {
        return appiumDriver.init(cap);
    });

    afterEach(function() {
        return appiumDriver.quit();
    });

    it('Create a new memo [C0001] @memo', function() {
        return appiumDriver
            .addMemo(Testdata.sampleMemo.memo1)
            .getNthMemoSummary(1, function(el) {
                el.should.equal(Testdata.sampleMemo.memo1.memoSummary)
            });
    });

    it('Create two memo, then delete the first one [C0002] @memo @smoke', function() {
        return appiumDriver
            .addMemo(Testdata.sampleMemo.memo1)
            .addMemo(Testdata.sampleMemo.memo2)
            .getNthMemoSummary(1, function(el) {
                el.should.equal(Testdata.sampleMemo.memo1.memoSummary)
            })
            .getNthMemoSummary(2, function(el) {
                el.should.equal(Testdata.sampleMemo.memo2.memoSummary)
            })
            .selectNthMemo(1)
            .deleteCurrentMemo()
            //verify after delete the 1st memo, the 2nd memo is now the 1st one in the list
            .getNthMemoSummary(1, function(el) {
                el.should.equal(Testdata.sampleMemo.memo2.memoSummary)
            })
    });

});
