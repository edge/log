"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.LogtailAdaptor = void 0;
var node_1 = require("@logtail/node");
var LogtailAdaptor = (function () {
    function LogtailAdaptor(logtailSourceToken) {
        this.logtail = new node_1.Logtail(logtailSourceToken);
    }
    LogtailAdaptor.prototype.debug = function (log, message, context) {
        this.logtail.debug(this.format(message, log.name), this.addNameToContext(log, context));
    };
    LogtailAdaptor.prototype.info = function (log, message, context) {
        this.logtail.info(this.format(message, log.name), this.addNameToContext(log, context));
    };
    LogtailAdaptor.prototype.warn = function (log, message, context) {
        this.logtail.warn(this.format(message, log.name), this.addNameToContext(log, context));
    };
    LogtailAdaptor.prototype.error = function (log, message, context) {
        this.logtail.error(this.format(message, log.name), this.addNameToContext(log, context));
    };
    LogtailAdaptor.prototype.addNameToContext = function (log, context) {
        return __assign({ name: log.name }, context);
    };
    LogtailAdaptor.prototype.format = function (message, name) {
        return name ? "[" + name + "] " + message : message;
    };
    return LogtailAdaptor;
}());
exports.LogtailAdaptor = LogtailAdaptor;
