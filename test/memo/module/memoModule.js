var testdata = require('../fixture/testData');
var util = require("util");

module.exports = {
    locators: {
        acc_id: {
            //Accessibility_id locators
            add_button: 'Add',
            done_button: 'Done',
            memo_list_nav_bar: 'Memo List',
            delete_button: 'Delete',
        },
        xpath: {
            //xpath locators
            memo_summary: "//UIATextField[@name = 'itemTitle']",
            memo_details: "//UIATextField[@name = 'itemNotes']",
            nth_memo: "//UIATableView[1]/UIATableCell[%d]",
        },
    },

    addMemo: function(driver, loc, memeo) {
        return driver
            .clickEl(loc.acc_id.add_button)
            .typeEl(memeo.memoSummary, loc.xpath.memo_summary, 'xpath')
            .typeEl(memeo.details, loc.xpath.memo_details, 'xpath')
            .clickEl(loc.acc_id.done_button);
    },

    getNthMemoSummary: function(driver, loc, n, assertion) {
        return driver
            .waitTillAvailable(loc.acc_id.memo_list_nav_bar)
            .getElAttribute('name', util.format(loc.xpath.nth_memo, n), 'xpath')
            .then(assertion);
    },

    selectNthMemo: function(driver, loc, n) {
        return driver
            .clickEl(util.format(loc.xpath.nth_memo, n), 'xpath');
    },

    deleteCurrentMemo: function(driver, loc) {
        return driver
            .clickEl(loc.acc_id.delete_button)
            .sleep(500);
    },
};