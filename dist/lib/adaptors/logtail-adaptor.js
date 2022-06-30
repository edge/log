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
    function LogtailAdaptor(logtailSourceToken, enableNameInjection) {
        if (enableNameInjection === void 0) { enableNameInjection = true; }
        this.logtail = new node_1.Logtail(logtailSourceToken);
        this.enableNameInjection = enableNameInjection;
    }
    LogtailAdaptor.prototype.trace = function (log, message, context) {
        this.logtail.debug(this.format(message, log.name), this.injectNameIntoContext(log, context));
    };
    LogtailAdaptor.prototype.debug = function (log, message, context) {
        this.logtail.debug(this.format(message, log.name), this.injectNameIntoContext(log, context));
    };
    LogtailAdaptor.prototype.info = function (log, message, context) {
        this.logtail.info(this.format(message, log.name), this.injectNameIntoContext(log, context));
    };
    LogtailAdaptor.prototype.warn = function (log, message, context) {
        this.logtail.warn(this.format(message, log.name), this.injectNameIntoContext(log, context));
    };
    LogtailAdaptor.prototype.error = function (log, message, context) {
        this.logtail.error(this.format(message, log.name), this.injectNameIntoContext(log, context));
    };
    LogtailAdaptor.prototype.injectNameIntoContext = function (log, context) {
        return this.enableNameInjection
            ? __assign({ name: log.name }, context)
            : context;
    };
    LogtailAdaptor.prototype.format = function (message, name) {
        return name ? "[".concat(name, "] ").concat(message) : message;
    };
    return LogtailAdaptor;
}());
exports.LogtailAdaptor = LogtailAdaptor;
