
export class Actor3DManager {

    constructor() {
        this.entities = new Map();    // id → Actor3D
        this.nextId = 1;
    }

    add(actor3d) {
        if (!actor3d || !actor3d.isActor3D) throw new Error("Actor3DManager.add: actor3d is null");

        const id = this.nextId++;
        actor3d.id = id;

        this.entities.set(id, actor3d);

        for (const c of actor3d.components) {
            if (typeof c.start === "function") c.start();
        }

        return actor3d;
    }

    /**
     * Видалити Actor3D.
     * Викликає dispose() на ентеті та всіх компонентах.
     */
    remove(actor3d) {
        if (!actor3d || !this.entities.has(actor3d.id)) return;

        // dispose компонентів
        for (const c of actor3d?.components ?? {}) {
            if (typeof c.dispose === "function") c.dispose();
        }

        // dispose Three.js object3D
        if (actor3d.object3D) {
            this._disposeObject3D(actor3d.object3D);
        }

        this.entities.delete(actor3d.id);
    }

    getById(id) {
        return this.entities.get(id) || null;
    }

    each(callback) {
        this.entities.forEach(callback);
    }


    update(dt) {
        for (const entity of this.entities.values()) {
            if (entity.active === false) continue;

            if (typeof entity.update === "function") {
                entity.update(dt);
            }
        }
    }

    clear() {
        for (const entity of this.entities.values()) {
            this.remove(entity);
        }
        this.entities.clear();
    }

    _disposeObject3D(obj) {
        if (!obj) return;

        obj.traverse((child) => {
            if (!child) return;

            // dispose geometry
            if (child.geometry) {
                child.geometry.dispose();
            }

            // dispose material
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((m) => {
                        if (m && typeof m.dispose === "function") m.dispose();
                    });
                } else {
                    child.material.dispose();
                }
            }

            // dispose textures
            if (child.material && child.material.map) {
                child.material.map.dispose();
            }
        });
    }
}
