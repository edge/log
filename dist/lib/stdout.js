"use strict";
exports.__esModule = true;
exports.adapter = void 0;
var process_1 = require("process");
var writer = function (output) {
    return {
        debug: function (data) { return output.write(data); },
        info: function (data) { return output.write(data); },
        warn: function (data) { return output.write(data); },
        error: function (data) { return output.write(data); }
    };
};
var adapter = function (useStderr) {
    var out = writer(process_1.stdout);
    var errOut = useStderr ? writer(process_1.stderr) : out;
    return {
        debug: function (data) { return out.debug(data); },
        info: function (data) { return out.info(data); },
        warn: function (data) { return out.warn(data); },
        error: function (data) { return errOut.error(data); }
    };
};
exports.adapter = adapter;
exports["default"] = exports.adapter;
