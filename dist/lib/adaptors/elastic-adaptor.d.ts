import { Adaptor, Log } from '..';
export declare type Config = {
    apiKey?: string;
    bulkCycle?: number | false;
    cert?: string | false;
    dataStream: string;
    host: string;
    password?: string;
    username?: string;
};
export declare type Options = {
    network?: string;
    serviceId?: string;
    serviceType?: string;
};
export declare class ElasticAdaptor implements Adaptor {
    private config;
    private i;
    private options;
    private queue;
    constructor(config: Config, options?: Options);
    debug(log: Log, message: string, context?: Record<string, unknown>): void;
    info(log: Log, message: string, context?: Record<string, unknown>): void;
    warn(log: Log, message: string, context?: Record<string, unknown>): void;
    error(log: Log, message: string, context?: Record<string, unknown>): void;
    private log;
    private postQueue;
    private send;
    startCycle(): void;
    stopCycle(): void;
}
