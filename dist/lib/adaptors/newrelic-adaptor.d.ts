import { Adaptor, Log, ServiceInfo } from '..';
export declare type Config = {
    apiKey?: string;
    bulkCycle?: number | false;
    gzip?: boolean;
    timeout?: number;
    url?: string;
};
export declare class NewRelicAdaptor implements Adaptor {
    private config;
    private interval;
    private serviceInfo;
    private queue;
    constructor(config: Config, serviceInfo?: ServiceInfo);
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
