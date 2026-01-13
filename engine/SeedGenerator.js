/**
 * ```
 * // use:
 * const generator = new SeedGenerator("space-42");
 * const spaceObjects = generator.generateObjects();
 * console.log(spaceObjects.slice(0, 5)); // view first 5
 * ```
 */
export class SeedGenerator {
    constructor(seed) {
        this.seed = this.hash(seed);
    }

    /**
     * Simple hash function from string to number
     *
     * @param str
     * @returns {number}
     */
    hash(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = (h << 5) - h + str.charCodeAt(i);
            h |= 0; // convert to 32-bit number
        }
        return Math.abs(h);
    }

    /**
     * Deterministic pseudorandom number generator (LCG)
     *
     * @returns {number}
     */
    random() {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }

    // Example Generator
    generateObjects(count = 1000) {
        const objects = [];

        for (let i = 0; i < count; i++) {
            const obj = {
                id: i,
                x: this.random() * 10000,
                y: this.random() * 10000,
                size: 5 + this.random() * 15,
                type: ['asteroid', 'station', 'planet'][Math.floor(this.random() * 3)],
                subtype: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9][Math.floor(this.random() * 10)],
            };
            objects.push(obj);
        }

        return objects;
    }

}

