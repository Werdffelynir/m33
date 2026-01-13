import {ReaComponent} from "../../../engine/ReaComponent.js";
import {GridDecor} from "../../actors/GridDecor.js";
import {Actor} from "../../../engine/canvas2d/Actor.js";
import {LayerManager} from "../../../engine/LayerManager.js";
import {MouseManager} from "../../../engine/MouseManager.js";
import {Camera} from "../../../engine/canvas2d/Camera.js";
import {SPECTACLE_STATUS} from "../../../engine/Spectacle.js";
import {AnimationLoop} from "../../../engine/AnimationLoop.js";


const CSS_CENTRAL = `
@layer layersloop{

    [data-id=canvases] > canvas:first-child {
       outline: 3px solid var(--cc5);
    }
    [data-id=canvases].active > canvas:first-child {
        outline: 3px solid var(--cr5);
    }
} 
`;
const HTML_CENTRAL = `
div: "{{title}}"
  div: ""
  div.center
    div[data-id=canvases][onclick=@onclickCanvas]
`;
export class BasicSandboxComponent extends ReaComponent {

    createDemoActors() {
        this.actors.add(new GridDecor({
            x: -this. camera.fieldWidth,
            y: -this. camera.fieldWidth,
            step: 1000,
            size: 10000,
        }))

        const helps = new Actor({
            x: 170,
            y: -100,
            draw (ctx) {
                ctx.fillStyle = 'rgba(142,217,117,0.6)'
                // Press and hold the right mouse button to move around the map
                // Use the mouse wheel to zoom in and out.
                ctx.fillText(`Press and hold`, this.x, this.y);
                ctx.fillText(`the right mouse button`, this.x, this.y + 50);
                ctx.fillText(`to move around the map`, this.x, this.y + 100);

                ctx.fillText(`Use the mouse wheel`, this.x + 400, this.y - 250);
                ctx.fillText(`to zoom in and out`, this.x + 400, this.y - 200);
            }
        })
        this.actors.add(helps);

        for (let i = 0; i < 360; i+=10) {
            const _mu = new Actor({
                posx: 170,
                posy: -100,
                x: 0,
                y: 0,
                radius: 20,
                angle: i * Math.PI / 180,
                angleSpeed: 0.0001,
                update (d) {
                    this.x = this.posx + Math.cos(this.angle) * 100 / (Math.sin(this.angle));
                    this.y = this.posy + Math.sin(this.angle) * 100 / (Math.cos(this.angle));
                    this.angle -= this.angleSpeed;
                    if (this.angle < 0) {
                        this.angle =  Math.PI * 2
                    }
                },
                draw (ctx) {
                    ctx.fillStyle = 'rgba(106,102,169,0.6)'
                    ctx.beginPath()
                    ctx.arc(this.x, this.y, this.radius, 0, 6.3);
                    ctx.fill()
                }
            })
            this.actors.add(_mu);
        }


        for (let j = 0; j < 360; j+=10) {
            const _mj = new Actor({
                posx: 0,
                posy: 0,
                x: 0,
                y: 0,
                radius: 5,
                angle: j * Math.PI / 180,
                angleSpeed: 0.01,
                _dx: 0,
                _ax: 0.85,
                distance: 100,
                update (d) {
                    this._dx -= this._ax;
                    this.x = this.posx + Math.cos(this.angle) * (this.distance / 2) + this._dx;
                    this.y = this.posy + Math.sin(this.angle) * this.distance - this._dx;

                    this.angle -= this.angleSpeed;
                    if (this.angle < 0) {
                        this.angle = Math.PI * 2;
                        this._ax *= -1;
                    }
                },
                draw (ctx) {
                    ctx.fillStyle = 'rgba(117,194,217,0.6)'
                    ctx.beginPath()
                    ctx.arc(this.x, this.y, this.radius, 0, 6.3);
                    ctx.fill()
                }
            })
            this.actors.add(_mj);
        }

    }
    drawIntro(ctx){
        ctx.fillStyle = '#52f67a'
        ctx.font = '36px Giger, Orpheus, system-ui '
        ctx.textAlign = 'center'
        ctx.fillText(`Hello my friend!`, this.layerman.game.width/2, 200, 800);
        ctx.fillText(`For START click on this canvas ;)`, this.layerman.game.width/2, 250, 800);
        ctx.fillText(`This controller contains - `, this.layerman.game.width/2, 350, 800);
        ctx.fillText(`templates and demo of basic Component`, this.layerman.game.width/2, 400, 800);
    }
    cameraConfigured(){
        this.camera.configured({
            width: this.width,
            height: this.height,
            fieldHeight: this.register.config.fieldHeight,
            fieldWidth: this.register.config.fieldWidth,
        });
    }
    layersConfigured(){
        this.layerman.configured({
            width: this.width,
            height: this.height,
            parent: this.elements['canvases'],
        })
    }

    mousemanConfigured(){

        this.mouseman.configured({
            target: this.layerman.ui.canvas,
            eventsOn: true,
            onlyfocus: false,
            draggableOn: true,
            scalingOn: true,
        })
        // Camera draggable
        //
        //
        this.mouseman.addListener('drag', (mouse) => {
            // const camera = this.camera;
            // console.log('drag', this.camera)

            if (!this.mouseman.draggableOn || this.register.state.status !== SPECTACLE_STATUS.PLAYING) return;
            // mouse.right
            if (this.mouseman.mouse['right']) {
                let x = this.camera.x - this.mouseman.mouse.drag.x / this.camera.zoom;
                let y = this.camera.y - this.mouseman.mouse.drag.y / this.camera.zoom;
                this.camera.moveTo(x, y);
            }
        })
        // Scroll button
        this.mouseman.addListener('middle', (mouse, event) => {
            this.camera.setZoom(1);
            this.register.state.wheel = 0;
        });
        // Scroll wheel. Camera zoom
        this.mouseman.addListener('wheel', (mouse, event) => {
            console.log('456', this.mouseman.scalingOn, this.register.state.status)
            if (!this.mouseman.scalingOn || this.register.state.status !== SPECTACLE_STATUS.PLAYING) return;

            if (event.deltaY > 0) {
                this.camera.zoomOut();
                if (this.register.state.wheel < 0) this.register.state.wheel = 0;
                this.register.state.wheel --;
            } else {
                this.camera.zoomIn();
                if (this.register.state.wheel > 0) this.register.state.wheel = 0;
                this.register.state.wheel ++;
            }
        });

        this.mouseman.setup()

    }


    create() {
        this.actors = new Set()
        this.width = 800
        this.height = 800
        this.name = this.constructor.name;
        this.layerman = new LayerManager(this.register);
        this.mouseman = new MouseManager(this.register);
        this.camera = new Camera();
        /**@type {LoopManager} */
        this.loopman = this.register.loopManager;

        super.create({
            template: HTML_CENTRAL,
            css: CSS_CENTRAL,
            state: {
                isStarted: false,
                onclickCanvas: (event, target) => {
                    if (this.state.isStarted) {
                        this.elements['canvases'].classList.remove('active');
                        this.loopman.stop('global')
                        this.state.isStarted = false;
                        this.register.state.status = SPECTACLE_STATUS.PAUSED
                    } else {
                        this.elements['canvases'].classList.add('active');
                        this.loopman.start('global')
                        this.state.isStarted = true;
                        this.register.state.status = SPECTACLE_STATUS.PLAYING
                    }
                },
                title: this.constructor.name,
            },
        });

        this.register.registerComponents({[this.name]: this})
    }

    loopmanConfigured(){
        const loop = () => {
            const skipFrame = this.register.config?.skipFrameRate || 0;

            const camera = this.camera;
            return new AnimationLoop({
                update: (delta, iteration,  renderRequest) => {
                    if (skipFrame && iteration % skipFrame === 0) return;


                    this.actors.forEach(actor => {

                        if(actor.updatable)
                            actor.update(delta, this.camera, iteration)
                    });

                    renderRequest()

                },
                render: (delta, iteration) => {
                    if (skipFrame && iteration % skipFrame === 0) return;

                    this.ctx.clearRect(0,0, this.width, this.height);

                    // Transform and runs all actors
                    //
                    //
                    //
                    camera.applyTransform(this.ctx)

                    this.actors.forEach(actor => {
                        if(!actor.drawable) return;

                        actor.draw(this.ctx, delta, this.camera, iteration)
                    });

                    camera.resetTransform(this.ctx)
                },
            });
        }


        this.loopman.configured({
            loops: {
                'global': loop(),
            },
            fixedDelta: 1 / this.register.config.fps,
            timeScale: this.register.config.timeScale
        })
    }

    onMount(){

        //
        // {layers}
        this.layersConfigured()

        this.layerman.game = this.layerman.get('game')
        this.layerman.ui = this.layerman.get('ui')
        this.layerman.bg = this.layerman.get('bg')
        this.ctx = this.layerman.game.ctx;

        //
        // {Camera} main parameters
        this.cameraConfigured()

        //
        // {Mouse events}
        this.mousemanConfigured()

        //
        // {Loops}
        this.loopmanConfigured()

        //
        // {Start}
        this.layerman.attach();
        this.drawIntro(this.ctx)
        this.createDemoActors();



        this.layerman.attach()
    }

    onUnmount(){
        this.layerman.detach()
    }

}

/*
export const SandboxControl = {
    listeners: {
        register: {},
        mouseman: {},
        wheel (mouse, event) {
            console.log('456', this.mouseman.scalingOn, this.register.state.status)
            if (!this.mouseman.scalingOn || this.register.state.status !== SPECTACLE_STATUS.PLAYING) return;

            if (event.deltaY > 0) {
                this.camera.zoomOut();
                if (this.register.state.wheel < 0) this.register.state.wheel = 0;
                this.register.state.wheel --;
            } else {
                this.camera.zoomIn();
                if (this.register.state.wheel > 0) this.register.state.wheel = 0;
                this.register.state.wheel ++;
            }
        }
    }
}*/
