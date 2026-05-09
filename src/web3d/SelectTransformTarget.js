import * as THREE from "three";
import {Register} from "/m33/Register.js";
import {TransformControls} from "three/addons/controls/TransformControls.js";

/**
 * select object - mouse dblclick, or shiftKey + click
 *
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


