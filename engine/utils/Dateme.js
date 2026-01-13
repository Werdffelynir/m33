/**
 * ```
 * dt = new Dateme(date)
 *
 * formatDMY
 * formatYMD
 * clone
 * addYears
 * addDays
 * addHours
 * addMinutes
 * addSeconds
 * subDays
 * subHours
 * subMinutes
 * subSeconds
 * toTimestamp
 * toISOString
 * toLocaleString
 * toDate
 * isToday
 * isYesterday
 * isSameDay
 * diffInDays
 * diffInHours
 * diffInMinutes
 *
 * // Static
 * now()
 * from()
 * timestamp()
 * msToHMS()
 * getDateString()
 *
 * Dateme.now().formatYMD()
 * Dateme.formatDate('yy‑m‑d-hh-ii-ss', Date)
 *
 * const now = Dateme.now();
 * const in5Days = now.clone().addDays(5);
 * console.log(in5Days.toISOString());
 *
 * const diff = now.diffInDays(in5Days); // 5
 *
 * const date = Dateme.from('2020-02-29');
 * date.addYears(1);
 *
 * console.log(date.formatDMY());       // "31.07.2025"
 * console.log(date.formatYMD());       // "2025-07-31"
 * console.log(date.formatDMY('/'));    // "31/07/2025"
 * console.log(date.formatYMD('.'));    // "2025.07.31"
 *
 * ```
 */
export class Dateme {
    constructor(date = new Date()) {
        this.date = date instanceof Date ? new Date(date) : new Date(date);
    }

    format(fmt) {
        return Dateme.formatDate(fmt, this.date)
    }

    formatDMY(separator = '.') {
        const d = this.date.getDate().toString().padStart(2, '0');
        const m = (this.date.getMonth() + 1).toString().padStart(2, '0');
        const y = this.date.getFullYear();
        return `${d}${separator}${m}${separator}${y}`;
    }

    formatYMD(separator = '-') {
        const d = this.date.getDate().toString().padStart(2, '0');
        const m = (this.date.getMonth() + 1).toString().padStart(2, '0');
        const y = this.date.getFullYear();
        return `${y}${separator}${m}${separator}${d}`;
    }

    clone() {
        return new Dateme(this.date);
    }

    addYears(years) {
        this.date.setFullYear(this.date.getFullYear() + years);
        return this;
    }

    addDays(days) {
        this.date.setDate(this.date.getDate() + days);
        return this;
    }

    addHours(hours) {
        this.date.setHours(this.date.getHours() + hours);
        return this;
    }

    addMinutes(minutes) {
        this.date.setMinutes(this.date.getMinutes() + minutes);
        return this;
    }

    addSeconds(seconds) {
        this.date.setSeconds(this.date.getSeconds() + seconds);
        return this;
    }

    subDays(days) {
        return this.addDays(-days);
    }

    subHours(hours) {
        return this.addHours(-hours);
    }

    subMinutes(minutes) {
        return this.addMinutes(-minutes);
    }

    subSeconds(seconds) {
        return this.addSeconds(-seconds);
    }

    toTimestamp() {
        return this.date.getTime();
    }

    toISOString() {
        return this.date.toISOString();
    }

    toLocaleString(locale = 'default') {
        return this.date.toLocaleString(locale);
    }

    toDate() {
        return new Date(this.date);
    }

    isToday() {
        const now = new Date();
        return (
            this.date.getFullYear() === now.getFullYear() &&
            this.date.getMonth() === now.getMonth() &&
            this.date.getDate() === now.getDate()
        );
    }

    isYesterday() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return (
            this.date.getFullYear() === yesterday.getFullYear() &&
            this.date.getMonth() === yesterday.getMonth() &&
            this.date.getDate() === yesterday.getDate()
        );
    }

    isSameDay(otherDate) {
        const d = new Date(otherDate);
        return (
            this.date.getFullYear() === d.getFullYear() &&
            this.date.getMonth() === d.getMonth() &&
            this.date.getDate() === d.getDate()
        );
    }

    diffInDays(otherDate) {
        const diffMs = Math.abs(this.date - new Date(otherDate));
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    diffInHours(otherDate) {
        const diffMs = Math.abs(this.date - new Date(otherDate));
        return Math.floor(diffMs / (1000 * 60 * 60));
    }

    diffInMinutes(otherDate) {
        const diffMs = Math.abs(this.date - new Date(otherDate));
        return Math.floor(diffMs / (1000 * 60));
    }

    static now() {
        return new Dateme();
    }

    static from(date) {
        return new Dateme(date);
    }

    static timestamp() {
        return Date.now();
    }

    static msToHMS(ms = Date.now()) {
        return new Date(ms).toISOString().slice(11, 19);
    }

    static getDateString(date = new Date, locale = 'en-GB', options = {}) {
        return date.toLocaleString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            ...options,
        });
    }

    /**
     *
     * Formats a Date object according to a template.
     * Supports tokens:
     *      yy → 2-digit year ex: 24
     *      yyyy → 4-digit year ex: 2024
     *      mm → month 01-12 ex: 09
     *      m → month 1-12
     *      dd → day 01-31 ex: 04
     *      d → day 1-31
     *      hh → hour 00-23 ex: 07
     *      h → hour 0-23
     *      ii → minutes 00-59 ex: 05
     *      i → minutes 0-59
     *      ss → seconds 00-59 ex: 09
     *      s → seconds 0-59
     *      SSS → milliseconds 000-999
     * Everything else is left as literal.
     * ```
     * const now = new Date('2025-02-18T14:07:09.123Z');
     * formatDate('yy.mm.dd hh:ii:ss', now);        // "25.02.18 14:07:09"
     * formatDate('yyyy‑m‑d', now);                 // "2025‑2‑18"
     * formatDate("dd/mm/yyyy 'T' hh:ii", now);     // "18/02/2025 T 14:07"
     * formatDate('hh:ii:ss SSS', 1736920029123);   // час + мс
     * ```
     * @param fmt
     * @param dateInput
     * @returns {*}
     */
    static formatDate(fmt, dateInput = undefined) {
        let date = new Date();
        switch (typeof dateInput) {
            case 'number':
            case 'string': date = new Date(dateInput);
                break
            case 'object': date = dateInput instanceof Date ? dateInput : new Date();
        }

        const pad = (num, len = 2) =>
            String(num).padStart(len, '0');

        const tokens = {
            'yyyy': date.getFullYear(),
            'yy': pad(date.getFullYear() % 100),
            'mm': pad(date.getMonth() + 1),
            'm': date.getMonth() + 1,
            'dd': pad(date.getDate()),
            'd': date.getDate(),
            'hh': pad(date.getHours()),
            'h': date.getHours(),
            'ii': pad(date.getMinutes()),
            'i': date.getMinutes(),
            'ss': pad(date.getSeconds()),
            's': date.getSeconds(),
            'SSS': pad(date.getMilliseconds(), 3)
        };

        // regular expression searches for any token from the list, guarantees the appropriate order
        const re = new RegExp(
            '\\b(' + Object.keys(tokens).sort().join('|') + ')\\b',
            'g'
        );

        return fmt.replace(re, (match) => tokens[match]);
    }
}
