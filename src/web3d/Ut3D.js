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


export async function loadPositionalAudio(url, options = {}, callback) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`PositionalAudio load failed: ${url} (${response.status})`);

    const buffer = await response.arrayBuffer();
    const listener = new THREE.AudioListener();
    const sound = new THREE.PositionalAudio(listener);

    sound.setBuffer(buffer);
    sound.setVolume(sound.volume);
    sound.setLoop(options?.loop || false);
    sound.setRefDistance(options?.refDistance || 1);
    sound.setRolloffFactor(options?.rolloff || 1);
    sound.setDistanceModel(options?.distanceModel || 'inverse');
    sound.setMaxDistance(options?.maxDistance || 10);
    if (options?.cone.length === 3)
        sound.setDirectionalCone(...options?.cone);
    if (options?.position.length === 3)
        sound.position.fromArray(sound.position || [0, 0, 0]);

    callback?.(sound)

    return {buffer, sound, listener}
}

export async function loadAudio(url, options = {}, callback) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`lAudio load failed: ${url} (${response.status})`);
    const buffer = await response.arrayBuffer();
    const listener = new THREE.AudioListener();
    const sound = new THREE.Audio( listener );
    const fftSize = 128;

    sound.setBuffer(buffer);
    sound.setVolume(sound.volume);
    sound.setLoop(options?.loop || false);

    callback?.(sound)

    return {buffer, sound, listener}
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
