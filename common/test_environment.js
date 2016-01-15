var Config = require('config');
var argv = require('yargs').argv;

var isMagellanWorker = argv.worker ? true : false;

var cap;
var testServer;

if (isMagellanWorker) {
  // When running in Magellan:
  //
  // Require desiredCapabilities to be passed in.
  // Require appiumAppLocation to be passed in 
  cap = Config.desiredCapabilities;
  if (!cap) {
    console.error("Error: Magellan desiredCapabilities missing.");
    process.exit(1);
  }

  cap.app = Config.appiumAppLocation;
  if (!cap.app) {
    console.error("Error: Magellan appiumAppLocation missing.");
    process.exit(1);
  }

  if (Config.sauceSettings && Config.sauceSettings.testServer) {
    testServer = Config.sauceSettings.testServer;
  } else {
    console.error("Error: Magellan sauceSettings.testServer missing.");
  }

  cap.sendKeyStrategy = "setValue";
  cap.waitForAppScript = "true";

  console.log("Magellan injected desiredCapabilities: ");
  console.log(JSON.stringify(cap, null, 2));
} else {
  // When not running in Magellan:
  //
  // Default to iOS 8.4 from default.json
  // Default to "iosWalmartApp" as the location
  cap = Config.capabilities.ios84;
  cap.app = Config.memoApp;
  testServer = Config.testServer;
}

module.exports = {
  capabilities: cap,
  testServer: testServer
};
