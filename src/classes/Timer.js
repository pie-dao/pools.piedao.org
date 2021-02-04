import { writable } from 'svelte/store';

export const quoteRefreshSeconds = writable(0);

export class Timeout {

    constructor(timeout, cb) {
        this.timeout = timeout;
        this.time = 0;
        this.interval = null;
        this.cb = cb;
    }

    getTime() {
        return this.time;
    }

    start() {
        this.stop();

        this.time = this.timeout / 1000;
        quoteRefreshSeconds.set(this.time);
        this.interval = setInterval(function() {
            this.time = this.time - 1
            quoteRefreshSeconds.set(this.time);
            if (this.time === 0) {
                this.cb();
                this.time = this.timeout / 1000;
                quoteRefreshSeconds.set(this.time);
            }
          }.bind(this), 1000);
    }

    isActive() {
        return this.timeout !== null;
    }

    stop() {
        if(this.isActive()) {
            window.clearTimeout(this.interval);
            this.interval = null;
            this.time = 0;
            quoteRefreshSeconds.set(this.time);
        }
    };
}