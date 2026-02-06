

export class SystemManager {
    constructor() {
        this.systems = new Set();
    }

    add(system) {
        if (!system || !system?.update) throw new Error("Actor3DManager.add: actor3d is null");

        this.systems.add(system);
    }

    remove(system) {
        this.systems.delete(system);
    }

    update(dt) {
        this.systems.forEach((system) => {

            system.update(dt);
        });
    }
}






