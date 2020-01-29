import { LogManager, autoinject } from 'aurelia-framework';

import { CacheOptions } from './cache-options';
import Dexie from "dexie";

@autoinject()
export class CacheContext extends Dexie {
    affiliations!: Dexie.Table<AffiliationEntry, string>;
    tags!: Dexie.Table<TagEntry, string>;
    expirations!: Dexie.Table<ExpirationEntry, string>;
    private validatingPromise: Promise<void>;
    private logger = LogManager.getLogger("cache-control");

    constructor(options: CacheOptions) {
        super(options.controlCacheName);

        this.version(1).stores({
            affiliations: "url, principalId",
            tags: "key, url, tag",
            expirations: "url, nextExpiration"
        });

        this.validatingPromise = this.runValidation();
    }

    ensureValid() {
        return this.validatingPromise;
    }

    private async runValidation() {
        this.logger.debug("Starting context validation");

        if (!this.isOpen()) {
            this.logger.debug("Context is not open, opening...");

            try {
                await this.open();

                this.logger.debug("Context was opened");
            }
            catch (error) {
                this.logger.error("Failed to open context", error);
                throw error;
            }
        }

        let deleteContext = false;
        try {
            for (const table of this.tables) {
                this.logger.debug(`Validating table '${table.name}'`);
                await table.limit(1).toArray();
            }
        }
        catch (error) {
            this.logger.warn("Failed to run simple table query", error);

            deleteContext = true;
        }

        if (deleteContext) {
            this.logger.warn("Deleting context");

            try {
                await this.delete();
            }
            catch (error) {
                this.logger.error("Failed to delete context", error);
                throw error;
            }
        }

        if (!this.isOpen()) {
            this.logger.debug("Context is not open after possible delete, opening...");

            try {
                await this.open();
            }
            catch (error) {
                this.logger.error("Failed to open context", error);
                throw error;
            }
        }

        this.logger.info("Context was successfully validated");
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