import { Adaptor, Log } from '..';
export declare class LogtailAdaptor implements Adaptor {
    private logtail;
    private enableNameInjection;
    constructor(logtailSourceToken: string, enableNameInjection?: boolean);
    debug(log: Log, message: string, context?: Record<string, unknown>): void;
    info(log: Log, message: string, context?: Record<string, unknown>): void;
    warn(log: Log, message: string, context?: Record<string, unknown>): void;
    error(log: Log, message: string, context?: Record<string, unknown>): void;
    private injectNameIntoContext;
    private format;
}
