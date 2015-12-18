# iOS App Automation Tests

## Setup

* Install [Node.js >= v0.12.2 and npm](http://nodejs.org/)
* Install node package dependencies:
```bash
$ npm install
```

* Please update the app path in config/default.json to the compiled .app location, or pass it in as runtime variable when execute the tests
* The current iOS dev development is under Xcode 6.4 (will be Xcode 7 in the end of 2015). And to get Xcode 6.4, you need to have OS X v10.10+ (Yosemite)
* Please make a test app build without logging (this was not necessary before iOS 8.2, but we are in iOS 8.4 now)  
  ==> In SDLog.m, comment out line: NSLogv( format, args );
* Or make a build using APPIUM = 1 preprocessor, e.g.
```bash  
/usr/bin/xcodebuild -sdk iphonesimulator8.2 ONLY_ACTIVE_ARCH=NO -destination "name=iPhone 5s,OS=8.2" -scheme walmart -configuration Debug -derivedDataPath "~/Desktop/build/derivedData" GCC_PREPROCESSOR_DEFINITIONS='$GCC_PREPROCESSOR_DEFINITIONS APPIUM=1' clean build OBJROOT="~/Desktop/build" SYMROOT="~/Desktop/build"
```

## Run tests

#### start Appium server:

```bash
node ./node_modules/appium/bin/appium.js
```

Note: For the first time running the tests:

* You may want to check your appium setup by running:

```bash
node ./node_modules/appium/bin/appium-doctor.js
```
* And you will see popup "Instruments wants permission to analyze other processes." You need to allow access.
  You need to do this every time you install a new version of Xcode.
* To get sample testing app: afp://172.28.210.179/walmartjenkins/git/Automation/TestingApp/

#### run tests:

```bash
# Run tests by file (e.g. signin.js):
./node_modules/.bin/mocha ./test/walmart/script/signin.js

# Run tests by groups (e.g. run smoke tests):
./node_modules/.bin/mocha ./test/walmart/script/ -g @smoke

# Run a particular test by part of the test case name (e.g. test has 'Guest' in the name):
./node_modules/.bin/mocha test/walmart/script/ -g 'Guest'

# Run all the tests:
./node_modules/.bin/mocha test/walmart/script/

# Pass in app path as runtime variable:
NODE_CONFIG='{"iosWalmartApp":"/path/to/compilted/app/Walmart.app"}' ./node_modules/.bin/mocha test/walmart/script/

# Override platformVersion in runtime variable:
NODE_CONFIG='{"capabilities":{"ios71":{"platformVersion":"8.1"}}}' ./node_modules/.bin/mocha test/walmart/script/search.js

# Sample command of run tests on Sauce Labs:
NODE_CONFIG='{"iosWalmartApp":"sauce-storage:walmart_app.zip", "testServer":"http://wml_fe_core:554b1459-49c4-4c10-94de-bcd6fe5a90c8@ondemand.saucelabs.com:80/wd/hub"}' ./node_modules/.bin/mocha test/walmart/script/
```

#### generate XML version report:

This is used for Jenkins project report
```bash
./node_modules/.bin/mocha test/walmart/script/  --reporter xunit  2>&1 | tee test/walmart/reports/mocha_report.xml
```


## About the tests

#### file structure, e.g:

```bash
.
└── test-ios-walmart
    ├── README.md
    ├── common
    │   ├── common.js
    │   └── mocha_rerun.js
    ├── config
    │   ├── default.json
    │   └── logging.js
    ├── package.json
    └──── test
        ├── mocha.opts
        └── walmart
            ├── fixture
            │   └── testData.json
            ├── module
            │   └── signinModule.js
            └── script
                └── signin.js

```

* default.json (/config) is the setup for Local appium server, Testing app and Desired capabilities that will be sent to Appium server.
  Settings in this file could be set as runtime variables.
* Test scripts (test cases) are grouped by test flow similarity (test/walmart/script/).
* For every test script, there is a matching module file (test/walmart/module/) for locators and libraries reused.
* Libraries that are shared for all the module files are in common.js (/common).
* In common.js, there is an AppiumDriver constructor, it has bindModule method to bind libraries from module files.
* When create new test script, you want to create a new object of the AppiumDriver, and bind the module file(s) that will be needed for the tests. e.g.

```javascript
    before(function() {
        appiumDriver = new AppiumDriver(Config.localServer);
        appiumDriver.bindModule(SigninModule);
    });
```

#### how to make your test running on sauce labs

* Zip your testing app, e.g.

```bash
zip -r walmart_app.zip Walmart.app
```

* Upload it to Sauce Labs temporary storage, e.g. 

```bash
curl -u wml_fe_core:554b1459-49c4-4c10-94de-bcd6fe5a90c8 -X POST "http://saucelabs.com/rest/v1/storage/wml_fe_core/walmart_app.zip?overwrite=true" -H "Content-Type: application/octet-stream" --data-binary @walmart_app.zip
```

* Update your test script to use souceServer, sourceApp and source related capabilities in default.json file

