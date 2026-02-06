import * as THREE from "three";



export class Actor3D  {
    constructor(mesh) {
        /**
         * @type {THREE.Mesh}
         */
        this.mesh = mesh;
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





















