

export class SpatialHash {
    constructor(cellSize = 256) {
        this.cellSize = cellSize;
        this.buckets = new Map();
    }

    _hash(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        return `${cx},${cy}`;
    }

    insert(actor) {
        const key = this._hash(actor.position.x, actor.position.y);
        if (!this.buckets.has(key)) this.buckets.set(key, new Set());
        this.buckets.get(key).add(actor);
    }

    query(x, y) {
        const key = this._hash(x, y);
        return this.buckets.get(key) || new Set();
    }

    clear() {
        this.buckets.clear();
    }
}