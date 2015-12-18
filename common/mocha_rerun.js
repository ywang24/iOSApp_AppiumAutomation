// Mocha rerun hack
//
// Usage: node mocha_rerun.js <mocha JSON report file name> <mocha XML report file name> <rerun times> <test path>
//
// - mocha JSON report file name: first run Mocha JSON report file name (mocha_report.json by default)
// - mocha XML report file name: first run Mocha xml report file name (mocha_report.xml by default)
// - rerun times: how many times to rerun (3 by default)
// - test path: where to find the tests (test/memo/script/ by default)
//
// Read Mocha JSON test report file (test/memo/reports/mocha_report.json by default),
// Extract failed test case ids,
// Rerun the failed tests and create new JSON report,
// Read the new JSON report, extract passed test case,
// Update original xml report file (test/memo/reports/mocha_report.xml by default)
// Update original json report file (test/memo/reports/mocha_report_final.json by default)

var Fs = require('fs');
var Path = require('path');
var libxmljs = require('libxmljs');
var Exec = require('child_process').exec;

// Get failed cases IDs from Mocha Json report file
var getFailedTestIds = function (jsonFileName) {
  console.log('--- Extract failed tests ---');
  // get Mocha json report file
  var json_file_name = jsonFileName || 'mocha_report.json';
  var report_json = require(Path.join(__dirname, '..', 'test', 'memo', 'reports', json_file_name));
  console.log('Extract from ' + json_file_name);

  var failed_case_ids = [];
  var tc_id;
  report_json.failures.forEach(function(tc) {
    if (tc.title.indexOf("\"after each\" hook") == -1) {
    tc_id = tc.title.match(/\[C\d+\]/gm)[0].replace(/\]/, '').replace(/\[/, '');
    console.log('Found ' + tc_id + ' failed');
    failed_case_ids.push(tc_id);
    }
  });

  return failed_case_ids;
};

// Update xml report file
var updateXmlReport = function(xmlFileName, jsonFileName){
  console.log('--- Update XML report ---');
  // get Mocha xml report file
  var xml_name = xmlFileName || 'mocha_report.xml';
  var xml_path = Path.join(__dirname, '..', 'test', 'memo', 'reports', xml_name);
  var xml = Fs.readFileSync(xml_path, 'utf8');
  var xmlDoc = libxmljs.parseXmlString(xml);

  // // remove '"after each" hook' error
  // var tcs = xmlDoc.find('//testcase');
  // tcs.forEach(function(tc){
  //   if(tc.attr('name').value() == '"after each" hook') {
  //     console.log('Found "after each" error, need to remove it from report.');
  //     tc.remove();
  //   }
  // });

  // get Mocha json report file
  var json_name = jsonFileName || 'mocha_report.json';
  var json_path = Path.join(__dirname, '..', 'test', 'memo', 'reports', json_name);
  var json = require(json_path);

  // get all passed cases form json report file
  // these are the tests passed in rerun
  var rerun_pass_case_ids = [];
  var tc_id;
  json.passes.forEach(function(tc) {
    tc_id = tc.title.match(/\[C\d+\]/gm)[0].replace(/\]/, '').replace(/\[/, '');
    console.log('Found ' + tc_id + ' passed in rerun');
    rerun_pass_case_ids.push(tc_id);
  });

  if (rerun_pass_case_ids.length === 0) {
    console.log('No passed tests in rerun: ' + jsonFileName);
  } else {
    // find test cases which are passed in rerun and update xml report file
    var testsuite = xmlDoc.get('//testsuite');
    var failures = parseInt(testsuite.attr('failures').value(), 10);
    var errors = parseInt(testsuite.attr('errors').value(), 10);
    console.log('XML report failures: ' + failures.toString());
    console.log('XML report errors: ' + errors.toString());

    var testcases = xmlDoc.find('//testcase');
    rerun_pass_case_ids.forEach(function(id) {
      var matchingId = new RegExp(id,'g');
      testcases.forEach(function(tc) {
        if(tc.attr('name').value().match(matchingId) !== null) {
          console.log('Found test in XML report: ' + tc.attr('name').value());
          if (tc.child(0)) {
            if (tc.child(0).name() == 'failure') {
              console.log('- Updating ' + id + ' to passed');
              tc.child(0).remove();
              testsuite.attr('failures').value((failures - 1).toString());
              testsuite.attr('errors').value((errors - 1).toString());
              failures = parseInt(testsuite.attr('failures').value(), 10);
              errors = parseInt(testsuite.attr('errors').value(), 10);
              console.log('- XML report failures after update: ' + failures.toString());
              console.log('- XML report errors after update: ' + errors.toString());
            }
          } else {
            console.log('- ' + id + ' is already passed');
          }
        }
      });
    });

    xml = xmlDoc.toString();
    Fs.writeFileSync(xml_path, xml);
  }

  // remove '"after each" hook' error
  var tcs = xmlDoc.find('//testcase');
  tcs.forEach(function(tc){
    if(tc.attr('name').value() == '"after each" hook') {
      console.log('Found "after each" error, need to remove it from report.');
      tc.remove();
    }
  });
};

// Update json report file
var updateJsonReport = function(oldJsonFileName, jsonFileName){
  console.log('--- Update JSON report ---');
  // get previous Mocha json report file
  var json_name = oldJsonFileName || 'mocha_report_final.json';
  var json_path = Path.join(__dirname, '..', 'test', 'memo', 'reports', json_name);
  var oldJson = require(json_path);

  // get new Mocha json report file
  json_name = jsonFileName || 'mocha_report.json';
  json_path = Path.join(__dirname, '..', 'test', 'memo', 'reports', json_name);
  var json = require(json_path);

  // get all passed cases form new json report file
  // these are the tests passed in rerun
  var rerun_pass_case_ids = [];
  var tc_id;
  json.passes.forEach(function(tc) {
    tc_id = tc.title.match(/\[C\d+\]/gm)[0].replace(/\]/, '').replace(/\[/, '');
    console.log('Found ' + tc_id + ' passed in rerun');
    rerun_pass_case_ids.push(tc_id);
  });

  // find test cases which are passed in rerun and update json report file
  if (rerun_pass_case_ids.length === 0) {
    console.log('No passed tests in rerun: ' + jsonFileName);
  } else {
    json.passes.forEach(function(passed_tc) {
      // update tests section
      oldJson.tests.forEach(function(t) {
        if (t.title == passed_tc.title) {
          t.err = {}
        }
      });

      // update passes section
      var alreadyPassed = false;
      oldJson.passes.forEach(function(t) {
        if (t.title == passed_tc.title) {
          console.log('- ' + t.title + ' is already passed');
          alreadyPassed = true;
        }
      });
      if (alreadyPassed == false) {
        oldJson.passes.push(passed_tc);
      }

      // update failures section
      oldJson.failures.forEach(function(t) {
        if (t.title == passed_tc.title) {
          console.log('- Updating ' + passed_tc.title + ' to passed');
          oldJson.stats.passes = oldJson.stats.passes + 1;
          oldJson.stats.failures = oldJson.stats.failures - 1;
          var index = oldJson.failures.indexOf(t);
          if (index > -1) {
            oldJson.failures.splice(index, 1);
          }
        }
      });
    });

    json_path = Path.join(__dirname, '..', 'test', 'memo', 'reports', 'mocha_report_final.json');
    Fs.writeFileSync(json_path, JSON.stringify(oldJson, null, 2))
  }
};

// main function for rerun starts
var json_name = process.argv[2] || 'mocha_report.json';
var xml_name = process.argv[3] || 'mocha_report.xml';
var rerun_times = process.argv[4] || 3;
var run_path = process.argv[5] || 'test/memo/scripts/';
var rerun_failed = false;

// copy original JSON report over
var first_json_report = Path.join(__dirname, '..', 'test', 'memo', 'reports', json_name);
var final_json_report = Path.join(__dirname, '..', 'test', 'memo', 'reports', 'mocha_report_final.json');
Fs.writeFileSync(final_json_report, Fs.readFileSync(first_json_report));

var reRunMain = function (loop) {
  if (loop < rerun_times) {
    console.log('\n==== Rerun #' + loop.toString() + ' ====');
    var failedTestsArray = getFailedTestIds(json_name);
    if (failedTestsArray.length !== 0) {
      var failedTests = failedTestsArray.join('|');
      var rerun_mocha_report_file_name = 'mocha_report_rerun-' + loop.toString() + '.json';
      var rerun_mocha_report_file = Path.join(__dirname, '..', 'test', 'memo', 'reports', rerun_mocha_report_file_name);
      rerun_mocha_report_file = rerun_mocha_report_file.replace(/ /g, '\\ ');

      console.log('--- Rerun failed tests ---');
      var reRunCmd = './node_modules/.bin/mocha --no-colors -R json ' + run_path + ' -g ' +
        '\'' + failedTests + '\' > ' + rerun_mocha_report_file;
      console.log('Reurun cmd: ' + reRunCmd);

      Exec(reRunCmd, function (error, stdout, stderr) {
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        if (error !== null) {
          rerun_failed = true;
          console.log('Rerun failed: ' + error);
        } else {
          rerun_failed = false;
          console.log('Rerun passed');
        }
        updateXmlReport(xml_name, rerun_mocha_report_file_name);
        updateJsonReport('mocha_report_final.json', rerun_mocha_report_file_name);
        json_name = rerun_mocha_report_file_name;
        reRunMain(loop+1);
      });
    } else {
      console.log('No failures are found');
      reRunMain(loop+1);
    }
  } else {
    if (rerun_failed) {
      console.log('\nStill have failed tests after rerun...');
      // process.exit(0);
    } else {
      console.log('\nFailed tests are all passed in rerun...');
      // process.exit(0);
    }
  }
}

reRunMain(0);