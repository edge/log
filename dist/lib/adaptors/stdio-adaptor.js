"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.StdioAdaptor = void 0;
var chalk_1 = __importDefault(require("chalk"));
var __1 = require("..");
var process_1 = require("process");
var logLevelColors = [
    { foreground: chalk_1["default"].magenta, background: chalk_1["default"].black.bgMagenta },
    { foreground: chalk_1["default"].white, background: chalk_1["default"].black.bgWhite },
    { foreground: chalk_1["default"].blue, background: chalk_1["default"].black.bgBlue },
    { foreground: chalk_1["default"].yellow, background: chalk_1["default"].black.bgYellow },
    { foreground: chalk_1["default"].red, background: chalk_1["default"].black.bgRed }
];
var logLevelAbbrs = [
    'TRC', 'DBG', 'INF', 'WRN', 'ERR'
];
var StdioAdaptor = (function () {
    function StdioAdaptor(useStderr) {
        if (useStderr === void 0) { useStderr = false; }
        this.out = process_1.stdout;
        this.errOut = useStderr ? process_1.stderr : process_1.stdout;
    }
    StdioAdaptor.prototype.trace = function (log, message, context) {
        this.writeToLog(__1.LogLevel.Trace, message, log.name, context);
    };
    StdioAdaptor.prototype.debug = function (log, message, context) {
        this.writeToLog(__1.LogLevel.Debug, message, log.name, context);
    };
    StdioAdaptor.prototype.info = function (log, message, context) {
        this.writeToLog(__1.LogLevel.Info, message, log.name, context);
    };
    StdioAdaptor.prototype.warn = function (log, message, context) {
        this.writeToLog(__1.LogLevel.Warn, message, log.name, context);
    };
    StdioAdaptor.prototype.error = function (log, message, context) {
        this.writeToLog(__1.LogLevel.Error, message, log.name, context);
    };
    StdioAdaptor.prototype.isError = function (context) {
        return context !== undefined
            && context.message !== undefined
            && context.name !== undefined
            && context.stack !== undefined;
    };
    StdioAdaptor.prototype.humanTimestamp = function (d) {
        var h = d.getHours().toString().padStart(2, '0');
        var m = d.getMinutes().toString().padStart(2, '0');
        var s = d.getSeconds().toString().padStart(2, '0');
        var ms = d.getMilliseconds().toString().padStart(3, '0');
        return "".concat(h, ":").concat(m, ":").concat(s, ".").concat(ms);
    };
    StdioAdaptor.prototype.writeToLog = function (level, message, name, context) {
        var timestamp = chalk_1["default"].gray(this.humanTimestamp(new Date()));
        var colors = logLevelColors[level];
        var levelText = colors.background(" ".concat(logLevelAbbrs[level], " "));
        var nameText = name ? colors.foreground("[".concat(name, "]")) : '';
        var messageText = chalk_1["default"].white(message);
        var contextText = '';
        if (this.isError(context))
            contextText = '\n' + chalk_1["default"].gray(context.stack);
        else
            contextText = context ? chalk_1["default"].gray(JSON.stringify(context)) : '';
        var outputText = [timestamp, levelText, nameText, messageText, contextText].filter(function (s) { return s; }).join(' ') + '\n';
        if (level === __1.LogLevel.Error)
            this.errOut.write(outputText);
        else
            this.out.write(outputText);
    };
    return StdioAdaptor;
}());
exports.StdioAdaptor = StdioAdaptor;
