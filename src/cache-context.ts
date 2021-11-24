import { LogManager, autoinject } from 'aurelia-framework';

import { CacheOptions } from './cache-options';
import { Dexie } from "dexie";

@autoinject()
export class CacheContext extends Dexie {
    affiliations!: Dexie.Table<AffiliationEntry, string>;
    tags!: Dexie.Table<TagEntry, string>;
    expirations!: Dexie.Table<ExpirationEntry, string>;
    private dbTimeout: number;
    private validatingPromise?: Promise<void>;
    private logger = LogManager.getLogger("cache-control");

    constructor(options: CacheOptions) {
        super(options.controlCacheName);

        this.version(1).stores({
            affiliations: "url, principalId",
            tags: "key, url, tag",
            expirations: "url, nextExpiration"
        });

        this.dbTimeout = options.dbTimeout;
    }

    ensureValid() {
        if (!this.validatingPromise) {
            this.validatingPromise = this.runValidation();
        }
        return this.validatingPromise;
    }

    private async runValidation() {
        this.logger.debug("Starting context validation");

        if (!this.isOpen()) {
            this.logger.debug("Context is not open, opening...");

            const [cancelPromise, cancelTimer] = this.createCancelTimeout();

            try {
                await Promise.race([this.open(), cancelPromise]);
                this.logger.debug("Context was opened");
            }
            catch (error) {
                this.logger.error("Failed to open context", error);
                throw error;
            }
            finally {
                clearTimeout(cancelTimer);
            }
        }

        let deleteContext = false;
        try {
            for (const table of this.tables) {
                this.logger.debug(`Validating table '${table.name}'`);
                await table.limit(1).toArray();
            }
            this.logger.debug("Tables were validated");
        }
        catch (error) {
            this.logger.warn("Failed to run simple table query", error);

            deleteContext = true;
        }

        if (deleteContext) {
            this.logger.warn("Deleting context");

            const [cancelPromise, cancelTimer] = this.createCancelTimeout();

            try {
                await Promise.race([this.delete(), cancelPromise]);
                this.logger.debug("Context was deleted");
            }
            catch (error) {
                this.logger.error("Failed to delete context", error);
                throw error;
            }
            finally {
                clearTimeout(cancelTimer);
            }
        }

        if (!this.isOpen()) {
            this.logger.debug("Context is not open after possible delete, opening...");

            const [cancelPromise, cancelTimer] = this.createCancelTimeout();

            try {
                await Promise.race([this.open(), cancelPromise]);
                this.logger.debug("Context was reopened");
            }
            catch (error) {
                this.logger.error("Failed to open context", error);
                throw error;
            }
            finally {
                clearTimeout(cancelTimer);
            }
        }

        this.logger.info("Context was successfully validated");
    }

    private createCancelTimeout(): [Promise<void>, number] {
        let cancelOpen: (reason: Error) => void;
        const cancelPromise = new Promise<void>((_, reject) => cancelOpen = reject);
        const timer = window.setTimeout(() => cancelOpen(new Error("Timeout while accessing database")), this.dbTimeout);
    
        return [cancelPromise, timer];
    }
}

export interface AffiliationEntry {
    url: string;
    principalId: string;
}

export interface TagEntry {
    key: string;
    url: string;
    tag: string;
}

export interface ExpirationEntry {
    url: string;
    created: Date;
    nextExpiration: Date;

    absoluteExpiration?: Date;
    slidingExpiration?: string;
}