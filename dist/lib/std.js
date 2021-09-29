"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.adapter = exports.shortLogLevels = exports.logColors = void 0;
var chalk_1 = __importDefault(require("chalk"));
var process_1 = require("process");
exports.logColors = [
    [chalk_1["default"].white, chalk_1["default"].black.bgWhite],
    [chalk_1["default"].blue, chalk_1["default"].bgBlue],
    [chalk_1["default"].yellow, chalk_1["default"].bgYellow],
    [chalk_1["default"].red, chalk_1["default"].bgRed]
];
exports.shortLogLevels = ['DBG', 'INF', 'WRN', 'ERR'];
var format = function (d, level, msg, data) {
    var _a = exports.logColors[level], nameColor = _a[0], levelColor = _a[1];
    var parts = [
        chalk_1["default"].gray(timestamp(d)),
        levelColor(" " + exports.shortLogLevels[level] + " ")
    ];
    if (typeof (data === null || data === void 0 ? void 0 : data.loggerName) === 'string') {
        parts.push(nameColor("[" + data.loggerName + "]"));
    }
    parts.push(chalk_1["default"].white(msg));
    if (data !== undefined) {
        var loggerName = data.loggerName, logData = __rest(data, ["loggerName"]);
        if (Object.keys(logData).length)
            parts.push(chalk_1["default"].bgGrey(JSON.stringify(logData)));
    }
    return parts.join(' ') + "\n";
};
var timestamp = function (d) {
    var h = d.getHours().toString().padStart(2, '0');
    var m = d.getMinutes().toString().padStart(2, '0');
    var s = d.getSeconds().toString().padStart(2, '0');
    var ms = d.getMilliseconds().toString().padStart(3, '0');
    return h + ":" + m + ":" + s + "." + ms;
};
var writer = function (output) { return ({
    debug: function (msg, data) { return output.write(format(new Date(), 0, msg, data)); },
    error: function (msg, data) { return output.write(format(new Date(), 3, msg, data)); },
    info: function (msg, data) { return output.write(format(new Date(), 1, msg, data)); },
    warn: function (msg, data) { return output.write(format(new Date(), 2, msg, data)); }
}); };
var adapter = function (useStderr) {
    if (useStderr === void 0) { useStderr = false; }
    var out = writer(process_1.stdout);
    var errOut = useStderr ? writer(process_1.stderr) : out;
    return {
        debug: function (msg, data) { return out.debug(msg, data); },
        error: function (msg, data) { return errOut.error(msg, data); },
        info: function (msg, data) { return out.info(msg, data); },
        warn: function (msg, data) { return out.warn(msg, data); }
    };
};
exports.adapter = adapter;
exports["default"] = exports.adapter;
