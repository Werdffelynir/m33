import * as THREE from 'three';
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {FBXLoader} from "three/addons/loaders/FBXLoader.js";
import {OBJLoader} from "three/addons/loaders/OBJLoader.js";
import {MTLLoader} from "three/addons/loaders/MTLLoader.js";
import {TransformControls} from "three/addons/controls/TransformControls.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import {Ut} from "../Ut.js";
import {Register} from "../Register.js";
import {HDRLoader} from "three/addons/loaders/HDRLoader.js";




const objectLoader = new THREE.ObjectLoader();
const textureLoader = new THREE.TextureLoader()
const audioLoader = new THREE.AudioLoader();
const gltfLoader = new GLTFLoader()
const objLoader = new OBJLoader()
const mtlLoader = new MTLLoader();
const fbxLoader = new FBXLoader();
const hdrLoader = new HDRLoader()


/**
 * ```
 * texture = await loadTexture( '/resources/images/background/grasslight-big.jpg' )
 * loadTexture( '/resources/images/background/grasslight-big.jpg', (texture) => {} )
 * ````
 **/
export async function loadTexture(url, callback, repeated = 1) {
    /**@type {THREE.Texture} */
    const texture = await textureLoader.loadAsync(url)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    texture.repeat.set(repeated, repeated);

    callback?.(texture)

    return texture
}


/**
 * ```
 * await loadScene or promiseAll
 * loadScene(url, (scene) => {
 *     scene.traverse( (obj3d) => {
 *          obj3d
 *     } )
 * }).then()
 *
 * ```
 * @param url
 * @param callback
 * @return {Promise<THREE.Object3D>}
 */
export async function loadScene(url, callback) {

    try {
        const response = await fetch(url);
        const jsonObj = await response.json();

        const scene = await objectLoader.parseAsync(jsonObj.scene)

        callback?.(scene)

        return scene

    } catch (error) {
        console.error('Error loading scene:', error);
    }
}


export async function loadGLTF(url, callback) {
    const gltf = await gltfLoader.loadAsync( url )

    callback?.(gltf)

    return gltf

    /**@type {THREE.Scene|THREE.Group} */
    // const scene = gltf.scene;
    // scene.scale.setScalar( 1 );
    // scene.position.set( 0, 0, 0 );
    // if (callback) scene.traverse(callback)
    // return scene
}


export async function loadFBX(url, callback) {

    const object = await fbxLoader.loadAsync(url)

    if (callback) callback(object)
    else
        object.traverse((obj) => {

            if (obj.isMesh) {

                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => {
                        m.emissiveIntensity = 0
                        m.metalness = 0
                        m.shininess = 0
                        m.opacity = 1
                        m.needsUpdate = true;
                    })
                } else {
                    obj.material.emissiveIntensity = 0
                    obj.material.metalness = 0
                    obj.material.shininess = 0
                    obj.material.opacity = 1
                    obj.material.needsUpdate = true;
                }

            }
        })

    return object
}


export async function loadOBJ(url, urlMLT, callback) {

    let materials;

    if (urlMLT) {
        const materials = await mtlLoader.loadAsync( urlMLT )
        materials.preload();
    }

    if (materials) 
        objLoader.setMaterials( materials );

    return await objLoader.loadAsync( url );
}

// todo me
export async function loadAudio(url, callback) {
    const listener = new THREE.AudioListener();
    const sound = new THREE.Audio( listener );

    const fftSize = 128;

    await audioLoader.loadAsync(url, function( buffer ) {
        // sound.setBuffer( buffer );
        // sound.setLoop( true );
        // sound.setVolume( 0.5 );
        // sound.play();
    });

    // const songElement = document.getElementById( 'song' );
    // sound1.setMediaElementSource( songElement );
    // sound1.setRefDistance( 20 );
    // songElement.play();

    callback?.(sound)

    return sound
}


/**
 * ```
 * loadHDR('/resources/hdr/skybox_night_4_2k.hdr', (texture) => {
 *     texture.mapping = THREE.EquirectangularReflectionMapping;
 *     this.theater.scene.background = texture;
 *     this.theater.scene.environment = texture;
 *     this.theater.scene.backgroundBlurriness = 0;
 *     this.theater.scene.fog = new THREE.FogExp2(0x020205, 0.04);
 *     this.theater.scene.add(new THREE.AmbientLight(0x080810, 0.2));
 * });
 * ```
 * */
export async function loadHDR(url, callback) {
    return await hdrLoader.loadAsync( url, callback )
}



/**
 * ```
 * canvasTexture ( ctx => {
 *      const gfx = new Graphic(ctx, {
 *          font: "52px bold Play, sans, sans-serif",
 *          textBaseline: "top"
 *      });
 *      
 *      gfx.rect(0, 0, 256, 128, '#1a1b18')        
 *      gfx.text("Hello", 20, 20, '#fa3cc2')
 * }, 256, 128 )
 * ```
 * 
 * @param {*} callback 
 * @param {*} width 
 * @param {*} height 
 * @returns 
 */
export const canvasTexture = (callback, width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width ?? 512;
    canvas.height = height ?? 512;

    const ctx = canvas.getContext('2d');
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.font = 'Bold 32px Play, Arial, sans, sans-serif'

    callback?.(ctx)

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture
}
export const imageTexture = (img, callback, width, height) => {
    img.width = width
    img.height = height
    const tex = new THREE.Texture(img);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    callback?.(texture)

    return texture;
}



/**
 * ```
 * perlin = new PerlinNoise(seedNumber)
 * perlin.noise(x, y)
 *         this._seed = seed ?? math?.random?.() ?? Math.random()
 * ```
 */

export class PerlinNoise {

    constructor(seed = 1, math) {


        // simple deterministic RNG (LCG)
        let s = seed >>> 0
        this.random = math?.random ?? (() => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)

        this.seedGenerate()
    }

    seedGenerate() {
        const p = new Uint8Array(256)
        this.perm = new Uint8Array(512)

        for (let i = 0; i < 256; i++) p[i] = i
        
        // Fisher–Yates shuffle
        for (let i = 255; i > 0; i--) {
            const j = (this.random() * (i + 1)) | 0
            ;[p[i], p[j]] = [p[j], p[i]]
        }

        for (let i = 0; i < 512; i++) {
            this.perm[i] = p[i & 255]
        }
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10)
    }

    lerp(a, b, t) {
        return a + t * (b - a)
    }

    grad(hash, x, y) {
        switch (hash & 7) {
            case 0: return  x + y
            case 1: return -x + y
            case 2: return  x - y
            case 3: return -x - y
            case 4: return  x
            case 5: return -x
            case 6: return  y
            case 7: return -y
        }
    }

    noise(x, y) {
        const X = Math.floor(x) & 255
        const Y = Math.floor(y) & 255

        const xf = x - Math.floor(x)
        const yf = y - Math.floor(y)

        const u = this.fade(xf)
        const v = this.fade(yf)

        const p = this.perm

        const aa = p[X +     p[Y]]
        const ab = p[X +     p[Y + 1]]
        const ba = p[X + 1 + p[Y]]
        const bb = p[X + 1 + p[Y + 1]]

        const x1 = this.lerp(
            this.grad(aa, xf,     yf),
            this.grad(ba, xf - 1, yf),
            u
        )

        const x2 = this.lerp(
            this.grad(ab, xf,     yf - 1),
            this.grad(bb, xf - 1, yf - 1),
            u
        )

        // [-1, 1]
        return this.lerp(x1, x2, v)
    }
}


/* export class PerlinNoise {

    constructor(seed, math) {

        this._seed = seed ?? math?.random?.() ?? Math.random()

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
} */

    // perlin(x, y) {
    //     return this.noise(
    //         x * this.scaleX,
    //         y * this.scaleY
    //     ) * this.size
    // }

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


