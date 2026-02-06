import {Node3D} from "./Node3D.js";


export const Camera3DControllerLabel = {
    //
    // z
    forward: `movement along the direction of view. Z axis`,
    backward: `movement backward from the direction of view. Z axis`,
    //
    // x
    left: 'movement to the sides (strafe). X axis',
    right: `inverted "left"`,
    //
    // y
    up: `vertical movement (jump or lift). Y axis`,
    down: `inverted "up"`,
    //
    // rx
    pitchUp: `Pitch - Up/Down | Look at the sky or the ground, camera rotation along the R-X axis (look up/down).`,
    pitchDown: `inverted "pitchUp"`,
    //
    // ry
    yawLeft: `Yaw - Left/Right | Horizontal View, rotation along the R-Y axis (look left / right).`,
    yawRight: `inverted "yawLeft"`,
    //
    // rz
    rollLeft: `Roll | Left/right roll | Like an airplane rolling, camera rotation to the left around the R-Z axis.`,
    rollRight: `inverted "rollLeft"`,
}
/**
 * Camera Controller 🎥
 *
 * ```
 * const cct = new Camera3DController(camera, {
 *      speed: 2, sensitivity: 0.02, distance: 2, mode: 'firstPerson', orthoPlane: 'xy', target: node
 * })
 *
 * cct.setCamera
 * cct.inputHandler( input )
 * cct.thirdPersonInput( input )
 * cct.orthoInput( input )
 * cct.firstPersonInput( input )
 * cct.freeInput( input )
 * cct.rotate(rotateX, rotateY)
 * cct.lookAt( target )
 * cct.reset()
 * cct.update()
 * cct.lockScreen()
 * ```
 */
export class Camera3DController {

    constructor(camera, {speed, sensitivity, distance, mode, orthoPlane, target} = {}) {
        /**@type {Camera3D} */
        this.camera = camera;
        // "firstPerson" | "thirdPerson" | "free" | "ortho"
        this.mode = mode ?? "free";
        /**@type {Node3D} */
        this.target = target ?? null; // {x: 0, y: 0, z: 0};
        this.distance = distance ?? 10;
        this.speed = speed ?? 0.1;
        this.sensitivity = sensitivity ?? 0.002;
        this.orthoPlane = orthoPlane ?? "xy";

        this.position = {x: 0, y: 0, z: 0};
        this.rotation = {x: 0, y: 0, z: 0};

        this.setCamera(this.camera);

        this.inputState = {
            // movement along the direction of view.
            // z
            forward: false,
            backward: false,
            // movement to the sides (strafe)
            // x
            left: false,
            right: false,
            // vertical movement (jump or lift).
            // y
            up: false,
            down: false,
            // Pitch - Up/Down | Look at the sky or the ground
            // camera rotation along the X axis (look up/down).
            // rx
            pitchUp: false,
            pitchDown: false,
            // Yaw - Left/Right | Horizontal View
            // rotation along the Y axis (look left / right).
            // ry
            yawLeft: false,
            yawRight: false,
            // Roll | Left/right roll | Like an airplane rolling
            // camera rotation to the left around the Z axis.
            // rz
            rollLeft: false,
            rollRight: false,
        }

        this.clearInputState = () =>
            Object.keys(this.inputState).forEach(k=>this.inputState[k]=false)
    }
    setTarget(target) {this.target = target}
    setMode(mode) {this.mode = mode}
    setCamera(camera) {
        this.camera = camera;
        this.position = {x: this.camera.x,  y: this.camera.y,  z: this.camera.z}; // pitch, yaw, roll
        this.rotation = {x: this.camera.rx, y: this.camera.ry, z: this.camera.rz};
    }

    inputHandler(input) {

        this.inputState = {...this.inputState, ...input}

        switch (this.mode) {
            case 'free':
                this.freeInput(this.inputState)
                break;
            case 'firstPerson':

                this.firstPersonInput(this.inputState)
                break;
            case 'ortho':
                this.orthoInput(this.inputState)
                break;
            case 'thirdPerson':
                this.thirdPersonInput(this.inputState)
                break;
        }
    }

    thirdPersonInput(input = this.inputState) {
        if(!this.target) return;

        const rotX = (input.pitchUp ? 1 : 0) - (input.pitchDown ? 1 : 0);
        const rotY = (input.yawRight ? 1 : 0) - (input.yawLeft ? 1 : 0);

        this.rotation.x += rotX * this.sensitivity;
        this.rotation.y += rotY * this.sensitivity;

        const limit = Math.PI / 2.2;
        this.rotation.x = Math.max(-limit, Math.min(limit, this.rotation.x));

        const tx = this.target.x;
        const ty = this.target.y;
        const tz = this.target.z;

        const cosPitch = Math.cos(this.rotation.x);
        const sinPitch = Math.sin(this.rotation.x);
        const cosYaw = Math.cos(this.rotation.y);
        const sinYaw = Math.sin(this.rotation.y);

        this.position.x = tx + this.distance * sinYaw * cosPitch;
        this.position.y = ty + this.distance * sinPitch;
        this.position.z = tz + this.distance * cosYaw * cosPitch;
    }

    orthoInput(input = this.inputState) {
        const target = this.target instanceof Node3D ? this.target : {x:0,y:0,z:0};

        if(input.forward) this.orthoPlane = "xy"
        if(input.backward) this.orthoPlane = "xy"
        if(input.left) this.orthoPlane = "yz"
        if(input.right) this.orthoPlane = "xz"

        const tx = target.x;
        const ty = target.y;
        const tz = target.z;

        switch (this.orthoPlane) {
            case "xy":
                this.position.x = tx;
                this.position.y = ty;
                this.position.z = tz + this.distance;
                this.rotation.x = Math.PI / 2;
                this.rotation.y = 0;
                this.rotation.z = 0;
                break;
            case "xz":
                this.position.x = tx;
                this.position.y = ty + this.distance;
                this.position.z = tz;
                this.rotation.x = 0;
                this.rotation.y = 0;
                this.rotation.z = 0;
                break;
            case "yz":
                this.position.x = tx + this.distance;
                this.position.y = ty;
                this.position.z = tz;
                this.rotation.x = 0;
                this.rotation.y = -Math.PI / 2;
                this.rotation.z = 0;
                break;
        }
    }

    firstPersonInput(input = this.inputState) {
        const speed = this.speed;
        const rotateSpeed = speed * this.sensitivity;
        // todo
        this.rotation.z = this.camera.rz

        if (input?.yawLeft) this.rotation.y += rotateSpeed;
        if (input?.yawRight) this.rotation.y -= rotateSpeed;

        if (input?.up) this.position.y -= speed;
        if (input?.down) this.position.y += speed;
        if (input?.right) this.position.x += speed;
        if (input?.left) this.position.x -= speed;

        if (input?.rollLeft) this.rotation.z -= rotateSpeed;
        if (input?.rollRight) this.rotation.z += rotateSpeed;

        if (input?.pitchUp) this.rotation.x -= rotateSpeed;
        if (input?.pitchDown) this.rotation.x += rotateSpeed;

        if (input?.forward) {
            this.position.x -= Math.sin(this.rotation.y) * speed;
            this.position.z -= Math.cos(this.rotation.y) * speed;
        }
        if (input?.backward) {
            this.position.x += Math.sin(this.rotation.y) * speed;
            this.position.z += Math.cos(this.rotation.y) * speed;
        }
    }
    /**
     *```
     * input = {
     *  forward: false,
     *  backward: false,
     *  left: false,
     *  right: false,
     *  up: false,
     *  down: false,
     *  pitchUp: false,
     *  pitchDown: false,
     *  yawLeft: false,
     *  yawRight: false
     *  rollLeft: false
     *  rollRight: false
     * }
     * ```
     */
    freeInput(input = this.inputState) {

        const speed = this.speed;
        const rotateSpeed = speed * this.sensitivity;

        const moveForward = (input.forward ? 1 : 0) - (input.backward ? 1 : 0);
        const moveRight = (input.right ? 1 : 0) - (input.left ? 1 : 0);
        const moveUp = (input.down ? 1 : 0) - (input.up ? 1 : 0);

        const rotX = (input.pitchUp ? 1 : 0) - (input.pitchDown ? 1 : 0);
        const rotY = (input.yawLeft ? 1 : 0) - (input.yawRight ? 1 : 0);
        const rotZ = (input.rollLeft ? 1 : 0) - (input.rollRight ? 1 : 0);

        this.rotation.x += rotX * rotateSpeed;
        this.rotation.y += rotY * rotateSpeed;
        this.rotation.z += rotZ * rotateSpeed;

        const cosY = Math.cos(this.rotation.y);
        const sinY = Math.sin(this.rotation.y);
        const cosX = Math.cos(this.rotation.x);
        const sinX = Math.sin(this.rotation.x);

        const dir = { x: -sinY * cosX, y: sinX, z: -cosY * cosX };
        const right = { x: cosY, y: 0, z: -sinY };
        const up = { x: sinY * sinX, y: cosX, z: cosY * sinX };

        this.position.x += (dir.x * moveForward + right.x * moveRight + up.x * moveUp) * speed;
        this.position.y += (dir.y * moveForward + right.y * moveRight + up.y * moveUp) * speed;
        this.position.z += (dir.z * moveForward + right.z * moveRight + up.z * moveUp) * speed;
    }

    /**
     * Changes yawLeft and yawRight
     *
     * ```
     * document.addEventListener("mousemove", (e) => {
     *     this.cameraControl.rotate(e.movementX , e.movementY)
     *     this.cameraControl.update()
     *     this.camera3D.needsUpdate()
     * });
     * ```
     * @param rotateX
     * @param rotateY
     */
    rotate(rotateX, rotateY) {
        this.rotation.y -= rotateX * this.sensitivity;
        this.rotation.x += rotateY * this.sensitivity;
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
    }


    lookAt(target) {

    }

    reset() {
        this.rotation.x = this.camera.rx
        this.rotation.y = this.camera.ry
        this.rotation.z = this.camera.rz
        this.position.x = this.camera.x
        this.position.y = this.camera.y
        this.position.z = this.camera.z
    }

    update() {
        this.camera.rx = this.rotation.x
        this.camera.ry = this.rotation.y
        this.camera.rz = this.rotation.z
        this.camera.x  = this.position.x
        this.camera.y  = this.position.y
        this.camera.z =  this.position.z
    }

    lockScreen () {
        this._lockElement = this.camera.element;
        this._lockScreen = () =>
            this._lockElement.requestPointerLock()
        this._lockElement.addEventListener("click",  this._lockScreen);
    }
}
