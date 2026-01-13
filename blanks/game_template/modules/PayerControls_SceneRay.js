import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

import {Register} from "engine/Register.js";
import {Ut} from "engine/Ut.js";
import {Doom} from "engine/utils/Doom.js";
import {Module} from "engine/Module.js";




function _use_example ( /** @type {Register} */ register) {

    /** @type {KeyboardManager} */const controlsKeyboard = register.controlManager.keyboardManager
    /** @type {MouseManager} */const controlsMouse = register.controlManager.mouseManager
    /** @type {Theater3DModule} */const theater = register.theater


    const controller = new PayerControls_SceneRay()

    const highlightInteract = new THREE.BoxHelper()


    controller.setup({
        camera: theater.camera,
        renderer: theater.renderer,
        scene: theater.scene,
        // speed,
        // gravity,
        // radius,
        // height,
        // body,
        // face,
        // onUpdate
        onInteract: (obj3d => {
            if (obj3d) {

                highlightInteract.setFromObject(obj3d)

                theater.scene.add(highlightInteract)

            } else {
                highlightInteract.removeFromParent()
            }
        })
    })


    // adding circular meshes for all processed objects (on scene), such as: Collider, addInteract and addArea
    controller.addCollider(mesh)
    controller.addInteract(mesh)
    controller.addArea(mesh)


    controlsKeyboard.onKeyJust("KeyE", (params, event) => {
        if ( !this.enabled ) return;

        controller.checkInteractable()
    })


    // to loop animation
    controller.update(delta)
}








/**
 * Special for scenes created in three-editor.
 * Control use raycast
 * scenes handler use object3d name, end of word:
 *  "@Interact"
 *  "@StaticBody"
 *  "@Area"
 *
 *  ```
 *          this.controlsKeyboard.onKeyJust("KeyE", (params, event) => {
 *             if ( !this.enabled ) return;
 *
 *             .checkInteractable()
 *         })
 *
 *
 *
 *  ```
 */
export class PayerControls_SceneRay {

    constructor() {
        this.enabled = true
        this.updatable = false
        this.type = "payerControls"
        this.areasObjects = new Set()
        this.staticBodies = new Set()
        this.interactableObjects = new Set()
        this.areas = new Set()

        this.raycaster = new THREE.Raycaster();
        this.dirDown = new THREE.Vector3(0, -1, 0);
        this.dirForward = new THREE.Vector3(0, 0, 1);
    }

    clearCollider(mesh) {
        if (mesh) {
            if (mesh instanceof THREE.Mesh ) {
                this.staticBodies.delete(mesh)
            } else
                console.warn("Clear mesh failed! Unknown mesh " + mesh)
        } else {
            this.staticBodies.clear()
        }
    }

    // bounding @Area
    addArea(mesh) {
        this.areasObjects.add(mesh)
    }


    // bounding @Interact
    addInteract(mesh) {
        this.interactableObjects.add(mesh)
    }

    // bounding @StaticBody
    addCollider(mesh) {

        let bounding = new THREE.Box3().setFromObject(mesh)

        this.staticBodies.add(bounding)
    }

    setup ({
               camera,
               renderer,
               scene,
               speed,
               gravity,
               radius,
               height,
               body,
               face,
               onUpdate,
               onInteract,
               keymap
           } = {}) {

        keymap = keymap ?? {
            forward: {pressed: false},
            backward: {pressed: false},
            left: {pressed: false},
            right: {pressed: false},
            boost: {pressed: false},
            jump: {pressed: false},
        }

        /** @type {THREE.Camera}*/
        this.camera = camera
        /** @type {THREE.WebGLRenderer}*/
        this.renderer = renderer
        /** @type {THREE.Scene}*/
        this.scene = scene

        this.onUpdate = onUpdate
        this.onInteract = onInteract

        let yaw = 0
        let pitch = 0
        let onGround = false
        speed = speed ?? 2.5
        gravity = gravity ?? 4.5
        radius = radius ?? 0.25
        height = height ?? 1

        const jumpHeight = 2.5
        const speedFixed = speed


        // TODO:
        // const playerObject3D =  (player && player instanceof THREE.Object3D) ? player : new THREE.Object3D()
        // this.player = playerObject3D;
        //
        // playerObject3D.position.set(0, height, 0)
        // camera.position.set(0, height, 0)
        //
        // playerObject3D.add(camera)
        // body,
        //     face,
        // scene.add(playerObject3D)


        const playerGhost = this.playerGhost = new THREE.Group()
        const faceGhost = this.faceGhost = new THREE.Group()

        faceGhost.position.set(0, height, 0)
        playerGhost.add(faceGhost)

        if (body && body.isObject3D) {
            playerGhost.add(body)
        }

        if (face && body.isObject3D) {
            face.removeFromParent()
            playerGhost.add(face)
        }




        const velocity = new THREE.Vector3()
        const dir = new THREE.Vector3()
        const tmp = new THREE.Vector3()
        const normal = new THREE.Vector3()

        const resolveCollisions = () => {

            onGround = false

            const h = radius * radius

            for(const box of this.staticBodies) {

                box.clampPoint(playerGhost.position, tmp);
                const d2 = tmp.distanceToSquared(playerGhost.position);

                if(d2 < h) {
                    normal.subVectors(playerGhost.position, tmp).normalize();
                    playerGhost.position.addScaledVector(
                        normal,
                        radius - Math.sqrt(d2)
                    );
                    velocity.projectOnPlane(normal);

                    if (velocity.y === 0)
                        onGround = true
                }
            }
        }

        renderer.domElement.addEventListener('mousemove', e => {
            if (!this.enabled || e.buttons !== 1) return
            yaw   -= e.movementX * 0.002
            pitch -= e.movementY * 0.002
            pitch = Math.max(-1, Math.min(1, pitch))
        });

        this.update = (delta) => {

            // --- rotation ---
            playerGhost.rotation.y = yaw
            faceGhost.rotation.x = pitch

            // --- input (intent) ---
            let inputX = 0
            let inputZ = 0

            if (keymap.forward.pressed)  inputZ -= 1
            if (keymap.backward.pressed) inputZ += 1
            if (keymap.left.pressed)     inputX -= 1
            if (keymap.right.pressed)    inputX += 1

            if (onGround && keymap.jump.pressed ) {
                velocity.y += jumpHeight
                onGround = false
            }

            // --- horizontal movement ---
            if (inputX !== 0 || inputZ !== 0) {

                if (onGround && keymap.boost.pressed ) {
                     speed = speedFixed * 3
                } else {
                     speed = speedFixed
                }

                // normalize intent (no Vector3)
                const invLen = 1 / Math.hypot(inputX, inputZ)
                inputX *= invLen
                inputZ *= invLen

                // yaw rotation (Three.js: forward = -Z)
                const sinYaw = Math.sin(yaw)
                const cosYaw = Math.cos(yaw)
                const worldX =  inputX * cosYaw + inputZ * sinYaw
                const worldZ = -inputX * sinYaw + inputZ * cosYaw

                velocity.x = worldX * speed
                velocity.z = worldZ * speed
            } else {
                velocity.x = 0
                velocity.z = 0
            }

            // --- gravity ---
            velocity.y -= gravity * delta

            // --- integrate ---
            playerGhost.position.x += velocity.x * delta
            playerGhost.position.y += velocity.y * delta
            playerGhost.position.z += velocity.z * delta

            // --- collisions ---
            resolveCollisions()

            // --- exec custom update render ---
            if (this.onUpdate) this.onUpdate?.()
        }

    }

    checkInteractable() {

        this.scene.updateWorldMatrix(true, true);

        const origin = new THREE.Vector3();
        const direction = new THREE.Vector3();

        this.camera.getWorldPosition(origin);
        this.camera.getWorldDirection(direction);

        origin.addScaledVector(direction, 0.05);

        this.raycaster.set(origin, direction);
        this.raycaster.far = 1.5;

        const hits = this.raycaster.intersectObjects([...this.interactableObjects], true);

        if (this._lastInteractObject) {
            this._lastInteractObject = null
            this.onInteract?.()
        }

        if (hits.length > 0) {
            this._lastInteractObject = hits[0].object

            this.onInteract?.(this._lastInteractObject)

            hits[0].object?.onInteract?.()
        }

    }

}

