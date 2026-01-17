import * as THREE from "three";



export class Actor3D  {
    constructor(actor3d) {
        /**
         * @type {THREE.Mesh}
         */
        this.actor3d = actor3d;
        this.active = true;
    }

    get isActor3D () { return true }

    start() {
        // викликається при додаванні компонента
    }

    update(dt) {
        // логіка компонента
    }

    dispose() {
        // очищення ресурсів
    }
}





















