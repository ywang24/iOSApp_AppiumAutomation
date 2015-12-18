# Quint Appium iOS App Automation

#### sample test demo:
<IMG src="http://g.recordit.co/M1o5FbP8YT.gif" width="300" height="500">

## Setup

* Install [Node.js >= v0.12.2 and npm](http://nodejs.org/)
* Install node package dependencies:
```bash
$ npm install
```

## Run tests

Note: For the first time running the tests:

* You may want to check your appium setup by running:

```bash
node ./node_modules/appium/bin/appium-doctor.js
```
* And you will see popup "Instruments wants permission to analyze other processes." You need to allow access.
  You need to do this every time you install a new version of Xcode.

#### start Appium server:

```bash
node ./node_modules/appium/bin/appium.js
```

#### execute tests:

```bash
# Run tests by groups (e.g. run smoke tests):
./node_modules/.bin/mocha ./test/memo/script/ -g @smoke

# Run test by test case name:
./node_modules/.bin/mocha test/walmart/script/ -g 'C0001'

# Run all the tests:
./node_modules/.bin/mocha test/walmart/script/
```
## Magellan Integration
https://github.com/TestArmada/magellan

## About the tests

<IMG src="https://gecgithub01.walmart.com/github-enterprise-assets/0000/3052/0000/8508/600ca166-71ba-11e5-90c7-1286082e6d2a.png" width="800" height="500">

#### file structure, e.g:

```bash
.
└── iOSApp-Automation
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
        └── memo
            ├── fixture
            │   └── testData.json
            ├── module
            │   └── memoModule.js
            └── script
                └── memo.js

```

* default.json (/config) is the setup for Local appium server, Testing app and Desired capabilities that will be sent to Appium server.
  Settings in this file could be set as runtime variables.
* Test scripts (test cases) could group by test flow similarity.
* For every test script, there is a matching module file (test/memo/module/) for locators and libraries reused.
* Libraries that are shared for all the module files are in common.js (/common).
* In common.js, there is an AppiumDriver constructor, it has bindModule method to bind libraries from module files.
* When create new test script, you want to create a new object of the AppiumDriver, and bind the module file(s) that will be needed for the tests. e.g.

```javascript
    before(function() {
        appiumDriver = new AppiumDriver(Config.localServer);
        appiumDriver.bindModule(SigninModule);
    });
```
