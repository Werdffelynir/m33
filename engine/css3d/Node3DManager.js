

export class Node3DManager {
    constructor(rootElement) {
        this.rootElement = rootElement;
        this.nodes = new Map();          // { id: node }
        this.hierarchy = new Map();      // { parentId: [childId, ...] }
    }

    addNode(id, node, parentId = null) {
        if (this.nodes.has(id)) {
            console.warn(`NodeManager: node with id "${id}" already exists`);
            return;
        }

        this.nodes.set(id, node);
        node.id = id;
        node.manager = this;

        if (parentId && this.nodes.has(parentId)) {
            const parentNode = this.nodes.get(parentId);
            parentNode.element.appendChild(node.element);

            if (!this.hierarchy.has(parentId))
                this.hierarchy.set(parentId, []);
            this.hierarchy.get(parentId).push(id);
        } else {
            this.rootElement.appendChild(node.element);
        }
    }

    removeNode(id) {
        if (!this.nodes.has(id)) return;

        // remove children
        const children = this.hierarchy.get(id);
        if (children) {
            for (const childId of children) this.removeNode(childId);
            this.hierarchy.delete(id);
        }

        // remove the DOM
        const node = this.nodes.get(id);
        if (node.element && node.element.parentNode) {
            node.element.parentNode.removeChild(node.element);
        }

        this.nodes.delete(id);

        // also remove from parent lists
        for (const [pid, list] of this.hierarchy) {
            const idx = list.indexOf(id);
            if (idx !== -1) list.splice(idx, 1);
        }
    }
    getNode(id) {
        return this.nodes.get(id) || null;
    }
    traverse(callback) {
        for (const [id, node] of this.nodes.entries()) {
            callback(node, id);
        }
    }
    updateAll() {
        this.traverse(node => node.update && node.update());
    }
    getChildren(id) {
        const list = this.hierarchy.get(id);
        if (!list) return [];
        return list.map(cid => this.nodes.get(cid)).filter(Boolean);
    }
    reparentNode(id, newParentId = null) {
        const node = this.getNode(id);
        if (!node) return;

        // remove from old parent
        for (const [pid, list] of this.hierarchy) {
            const idx = list.indexOf(id);
            if (idx !== -1) list.splice(idx, 1);
        }

        // new DOM parent
        if (newParentId && this.nodes.has(newParentId)) {
            const parent = this.nodes.get(newParentId);
            parent.element.appendChild(node.element);

            if (!this.hierarchy.has(newParentId)) this.hierarchy.set(newParentId, []);
            this.hierarchy.get(newParentId).push(id);
        } else {
            this.rootElement.appendChild(node.element);
        }
    }
    clear() {
        this.nodes.forEach(node => {
            if (node.element && node.element.parentNode) {
                node.element.parentNode.removeChild(node.element);
            }
        });
        this.nodes.clear();
        this.hierarchy.clear();
    }

    toJSON() {
        const result = [];
        this.traverse((node, id) => {
            result.push({
                id,
                parentId: this._findParentId(id),
                state: node.state || {},
                transform: node.matrix ? node.matrix.toJSON() : null
            });
        });
        return result;
    }

    _findParentId(childId) {
        for (const [pid, list] of this.hierarchy.entries()) {
            if (list.includes(childId)) return pid;
        }
        return null;
    }
}

