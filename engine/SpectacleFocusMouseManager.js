import {MouseManager} from "./MouseManager.js";
import {STATUSES} from "./Register.js";



/**
 * ```
 * spectacle = mouseman.mousetargetSpectacle
 * mouseGlobal = mouseman.mouseGlobal
 *
 * mouseman = new SpectacleFocusMouseManager(register);
 * mouseman.configured({
 *     spectacle: this,
 *     eventsOn: true,
 *     scalingOn: true,
 *     draggableOn: true,
 *     onlyfocus: true,
 *     //infocus: ()=>{ console.log('infocus', this) },
 *     //outfocus: () =>{ console.log('outfocus', this) },
 * });
 * mouseman.setup();
 * ```
 */
export class SpectacleFocusMouseManager extends MouseManager {

    constructor(register) {
        super(register);

    }

    /**
     * draggableButton: 'left', 'middle', 'right', 'button4', 'button5', 'button6'
     *
     * @param spectacle {Spectacle}
     * @param eventsOn {boolean}
     * @param scalingOn {boolean}
     * @param draggableOn {boolean}
     * @param draggableButton {string}
     * @param target {HTMLElement|HTMLCanvasElement}
     * @param onlyfocus {boolean}
     * @param infocus {function|null}
     * @param outfocus {function|null}
     */
    configured({
                   target,
                   eventsOn,
                   onlyfocus,
                   spectacle,
                   scalingOn,
                   draggableOn,
                   draggableButton,
                   infocus,
                   outfocus,
               } = {}) {

        /**@type {Spectacle} */             this.spectacle = spectacle;
        /**@type {LayerManager} */      this.layerman = spectacle.layerman;
        /**@type {Camera} */            this.camera = spectacle.camera;

        this.mousetarget = target ?? this.layerman.frontCanvas;
        this.eventsOn = eventsOn ?? true;
        this.onlyfocus = onlyfocus ?? true;

        this.scalingOn = scalingOn ?? true;
        this.draggableOn = draggableOn ?? true;
        this.draggableButton = draggableButton ?? 'right';
        this.infocus = infocus ?? null;
        this.outfocus = outfocus ?? null;

        this.mousetargetSpectacleMapping = new Map();
        this.mousetargetSpectacleMapping.set(this.mousetarget, spectacle);


        super.configured({
            target: this.mousetarget,
            eventsOn: this.eventsOn,
            onlyfocus: this.onlyfocus,
            draggableOn: this.draggableOn,
            scalingOn: this.scalingOn,
        });

        // Camera draggable
        //
        //
        this.addListener('drag', (mouse) => {

            if (!this.draggableOn || this.register.state.status !== STATUSES.PLAYING) return;

            // mouse.right
            if (mouse[this.draggableButton]) {
                let x = this.camera.x - this.mouse.drag.x / this.camera.zoom;
                let y = this.camera.y - this.mouse.drag.y / this.camera.zoom;

                spectacle.cameraTo(x, y);
            }
        })


        // Scroll button
        //
        //
        this.addListener('middle', (mouse, event) => {
            spectacle.setZoom(1);

            this.register.state.wheel = 0;
        });


        // Scroll wheel. Camera zoom
        //
        //
        this.addListener('wheel', (mouse, event) => {

            if (!this.scalingOn || this.register.state.status !== STATUSES.PLAYING) return;

            if (event.deltaY > 0) {
                spectacle.zoomOut();

                if (this.register.state.wheel < 0) this.register.state.wheel = 0;
                this.register.state.wheel --;
            } else {
                spectacle.zoomIn();

                if (this.register.state.wheel > 0) this.register.state.wheel = 0;
                this.register.state.wheel ++;
            }
        });

    }

    get mousetargetSpectacle() {
        return this.mousetargetSpectacleMapping.get(this.mousetarget)
    }

    get mouseGlobal() {
        return {...this.camera.mouseToWorld(this.mouse.x, this.mouse.y), ...this.mouse}
    }
}
