"use strict";
require('colors');

exports.configure = function(driver) {
    // See whats going on
    driver.on('status', function(info) {
        console.log(info.cyan);
    });
    driver.on('command', function(meth, path, data) {
        console.log(' > ' + meth.yellow, path.grey, data || '');
    });
    driver.on('http', function(meth, path, data) {
        console.log(' > ' + meth.magenta, path, (data || '').grey);
    });
};

// "use strict";
// var fs = require('fs');
// var writeStream = fs.createWriteStream('/Users/ywang24/workspace/test-ios-walmart/test/walmart/reports/test.log', { flags : 'a' });

// exports.configure = function (driver) {
//   // See whats going on
//   driver.on('status', function (info) {
//     writeStream.write(info.cyan, 'utf8');
//   });
//   driver.on('command', function (meth, path, data) {
//     writeStream.write(data || '', 'utf8');
//   });
//   driver.on('http', function (meth, path, data) {
//     writeStream.write(data || '', 'utf8');
//   });
// };