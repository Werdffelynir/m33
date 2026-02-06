import {Dateme} from "./utils/Dateme.js";


export class GameClock {
    constructor({date = new Date()}) {
        this.startDate = date;
        this.startTime = date.getTime();

        this.dayDuration = 1440; // 24 72 144 1440 14400
        this.microsecondDay = 86_400_000;
        this.multiplier = this.microsecondDay / this.dayDuration;

        this.elapsed = 0;
        this.paused = false;
        this.pauseTimestamp = null;
    }

    update(delta) {
        if (this.paused) return;

        // delta = Math.min(delta, 0.03333);
        this.elapsed += delta * this.multiplier;
    }

    getTimestamp() {
        return this.startTime + this.elapsed;
    }

    getDate() {
        return new Date(this.getTimestamp());
    }

    getDateString(locale = 'en-GB', options = {}) {
        return this.getDate().toLocaleString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            ...options,
        });
    }

    getElapsedDays() {
        return Math.floor(this.elapsed / this.microsecondDay);
    }

    timeStardate() {
        //const year = `${this.getDate().getFullYear()}`.slice(2);
        const days = this.getElapsedDays();
        const fraction = (this.elapsed % this.microsecondDay) / this.microsecondDay;
        return `SD ${days}.${Math.floor(fraction * 10)}`;
    }

    timeGalacticDate() {
        const gameDate = this.getDate();
        const y = gameDate.getUTCFullYear();
        const d = this.getElapsedDays();
        const h = gameDate.getUTCHours();
        const m = gameDate.getUTCMinutes();
        return `G-${y.toString().padStart(3, '0')}.${d}.${h.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}`;
    }

    timeTimecode() {
        let tdate = this.elapsed / 1_000_000
        tdate = '' + Math.floor((this.getDate().getFullYear()) + tdate);
        let tdateArr = [];
        let i = tdate.length;

        while (i > 0) {
            const start = Math.max(0, i - 2);
            tdateArr.unshift(tdate.slice(start, i));
            i -= 2;
        }
        return `T+${tdateArr.join('.')}s`;
    }

    pause() {
        if (!this.paused) {
            this.paused = true;
            this.pauseTimestamp = Date.now();
        }
    }

    resume() {
        if (this.paused) {
            const pausedDuration = Date.now() - this.pauseTimestamp;
            this.realStart += pausedDuration; // щоб час вирівнявся
            this.paused = false;
            this.pauseTimestamp = null;
        }
    }

    reset(startTimestamp = Date.now()) {
        this.realStart = Date.now();
        this.startTime = startTimestamp;
        this.elapsed = 0;
        this.paused = false;
        this.pauseTimestamp = null;
    }
}
