import * as THREE from 'three';
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {FBXLoader} from "three/addons/loaders/FBXLoader.js";
import {TransformControls} from "three/addons/controls/TransformControls.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import {Ut} from "../Ut.js";
import {Register} from "../Register.js";


/**
 * ```
 * loadTexture( '/resources/images/background/grasslight-big.jpg' )
 * loadTexture( '/resources/images/background/grasslight-big.jpg', () => {} )
 * ````
 **/
export async function loadTexture(url, reduce, repeated = 1) {
    const textureLoader = new THREE.TextureLoader()
    /**@type {THREE.Texture} */
    const texture = await textureLoader.loadAsync(url)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    texture.repeat.set(repeated, repeated);

    reduce?.(texture)

    return texture
}


/**
 * ```
 * loadScene(url, (scene) => {
 *     scene.traverse( (obj3d) => {
 *          obj3d
 *     } )
 * }).then()
 *
 * ```
 * @param url
 * @param callback
 * @return {Promise<Object3D>}
 */
export async function loadScene(url, callback) {
    const loader = new THREE.ObjectLoader();

    try {
        const response = await fetch(url);
        const jsonObj = await response.json();

        const scene = await loader.parseAsync(jsonObj.scene)

        callback?.(scene)

        return scene

    } catch (error) {
        console.error('Error loading scene:', error);
    }
}



export async function loadSceneModel(url, reduce) {
    const loader = new GLTFLoader()
    const gltf = await loader.loadAsync( url )

    /**@type {Scene} */
    const scene = gltf.scene;
    scene.scale.setScalar( 1 );
    scene.position.set( 0, 0, 0 );

    if (reduce) scene.traverse(reduce)

    return scene
}





export const drawCanvasTexture = ({draw, width, height}) => {
    const canvas = document.createElement('canvas');
    canvas.width = width ?? 512;
    canvas.height = height ?? 512;

    const ctx = canvas.getContext('2d');
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.font = 'Bold 62px sans, sans-serif, Arial';

    draw?.(ctx)

    const texture = new THREE.CanvasTexture(canvas);

    texture.colorSpace = THREE.SRGBColorSpace;
    return texture
}





export class PerlinNoise {
    _seed = 0
    size = 1
    scale = 1

    constructor(seed) {

        this._seed = seed ?? Math.random()

        const p = Array.from({length: 256}, (_, i) => i)

        for (let i = 255; i > 0; i--) {

            let j = Math.floor(this._seed * (i + 1));

            [p[i], p[j]] = [p[j], p[i]];
        }


        this._perm = p.concat(p);
    }
    fade(t) {return t * t * t * (t * (t *  6 - 15) + 10); }
    lerp(a, b, t) { return a + t * (b - a); }
    grad(hash, x, y) {
        switch (hash & 3) {
            case 0: return  x + y;
            case 1: return -x + y;
            case 2: return  x - y;
            case 3: return -x - y;
        }
    }

    perlin(x, y) {
        return this.noise(
            x * this.scale,
            y * this.scale
        ) * this.size
    }

    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);

        const perm = this._perm;

        const aa = perm[X + perm[Y]];
        const ab = perm[X + perm[Y + 1]];
        const ba = perm[X + 1 + perm[Y]];
        const bb = perm[X + 1 + perm[Y + 1]];

        return this.lerp(
            this.lerp(this.grad(aa, x, y),     this.grad(ba, x - 1, y),     u),
            this.lerp(this.grad(ab, x, y - 1), this.grad(bb, x - 1, y - 1), u),
            v
        );
    }
}


/**
 * select object - mouse dblclick, or shiftKey + click
 * hotkeys:
 *     Digit1  translate
 *     Digit2  rotate
 *     Digit3  scale
 *     Digit4  space local / world
 *     Digit5    detach
 */
export class SelectTransformTarget {

    constructor() {

    }

    setup({renderer, camera, scene, onChange, onDragging, onSelect, enabled = false}) {
        this.renderer = renderer;
        this.camera = camera;
        this.scene = scene;
        this.onChange = onChange;
        this.onDragging = onDragging;
        this.onSelect = onSelect;
        this.enabled = enabled;


        const mouse = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();

        const checkSelectable = (object) => {

            //  && (object?.geometry?.type && ["BoxGeometry", "PlaneGeometry", "CylinderGeometry","CapsuleGeometry"].includes(object.geometry.type)
            return object
                && object.isObject3D  && ( object.isSprite || object.isMesh  )
                && !object.isTransformControlsPlane && object.tag !== "helper"
        }

        const checkIntersects = (intersects) => {
            for (var i = intersects.length - 1; i >= 0; i--) {
                if (checkSelectable(intersects[i].object)) return intersects[i].object;
            }
            return false
        }

        const onClick = (event) => {

            event.preventDefault();
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

            raycaster.setFromCamera( mouse, this.camera );

            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {

                const object = checkIntersects(intersects) // intersects[0].object;
                if (object) {
                    this.intersectedObject = object// intersects[0].object;


                } else {
                    this.intersectedObject = undefined;
                }

            } else {
                if (this.intersectedObject) {}
                this.intersectedObject = undefined;
            }



            if (this.enabled){
                if (this.intersectedObject) {
                    this.transformControls.attach(this.intersectedObject);

                    this.transformControls.space = 'world' // reset space
                } else {
                    this.transformControls.detach();
                }
            }



            this.onSelect?.(event, this.intersectedObject)
        };



        this.renderer.domElement.addEventListener('dblclick', (event) => {
            if (!this.enabled) return;
            onClick (event)
        })

        this.renderer.domElement.addEventListener('click', (event) => {
            if (!this.enabled) return;
            if (Register.instance.inputs.keyboardManager.keys.shiftKey)
                onClick (event)
        })



        if (this.enabled)
            this._setTransformControls()
    }

    _setTransformControls() {

        const transformControls = new TransformControls(this.camera, this.renderer.domElement);
        transformControls.setMode('translate')

        Register.instance.inputs.keyboardManager.onKeyJust('Digit1', () => transformControls.setMode('translate'))
        Register.instance.inputs.keyboardManager.onKeyJust('Digit2', () => transformControls.setMode('rotate'))
        Register.instance.inputs.keyboardManager.onKeyJust('Digit3', () => transformControls.setMode('scale'))
        Register.instance.inputs.keyboardManager.onKeyJust('Digit4', () => {
            if (this.intersectedObject) {
                transformControls.space = transformControls.space === 'world' ? 'local' : 'world'
                this.onChange({}, this.intersectedObject)
            }
        })
        Register.instance.inputs.keyboardManager.onKeyJust('Digit5', () => transformControls.detach())

        // target: null, type: "change"
        transformControls.addEventListener('change', (event) => {
            if (event.target) {
                this.onChange(event, this.intersectedObject)
            }
        });

        transformControls.addEventListener('dragging-changed', (event) => {
            this.onDragging(event, this.intersectedObject)
        });

        const gizmo = transformControls.getHelper();
        transformControls.size = 0.65

        this.scene.add(gizmo);

        this.transformControls = transformControls;
    }
}


