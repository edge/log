import { Adaptor, Log } from '..';
export declare class StdioAdaptor implements Adaptor {
    private out;
    private errOut;
    constructor(useStderr?: boolean);
    debug(log: Log, message: string, context?: Record<string, unknown>): void;
    info(log: Log, message: string, context?: Record<string, unknown>): void;
    warn(log: Log, message: string, context?: Record<string, unknown>): void;
    error(log: Log, message: string, context?: Record<string, unknown>): void;
    private isError;
    private humanTimestamp;
    private writeToLog;
}
