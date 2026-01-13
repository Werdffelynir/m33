import {ICommander} from "./ICommander.js";
import {Spectacle} from "./Spectacle.js";
import {AnimationLoop} from "./AnimationLoop.js";
import {STATUSES} from "./Register.js";



export class TheaterManager extends ICommander {

    /**
     * ```
     * theater = new TheaterManager(register);
     * theater.addSpectacle(gameSpectacle1)
     * theater.addSpectacle(gameSpectacle2)
     * theater.addSpectacle(gameSpectacle3)
     *
     * // creating and processing canvases, layers, camera handler|events, mouse events
     * theater.configured({
     *     loops: { [LOOP_MAIN]: LoopMain(this) },
     *     mainLoopKey: LOOP_MAIN,
     *     fps: 5,
     *     timeScale: 1,
     *     spectacles: {
     *         demo: {
     *             width: window.innerWidth,
     *             height: window.innerHeight,
     *             quality: false,
     *         },
     *         osci: {
     *             width: window.innerWidth,
     *             height: window.innerHeight,
     *             quality: false,
     *         },
     *     },
     * });
     *
     * theater.onStateGame(`running`, (value) => {});
     *
     * theater.loop // {AnimationLoop}
     *
     * ```
     * @param register {Register|*}
     */
    constructor(register) {
        super(register);
        this.updatable = true;
        this.drawable = true;

        this.props = {};

        /** @type {Map<string, Spectacle>} */
        this.spectacles = new Map();

    }
    /**
     * Configured all spectacles
     *
     * ```
     * theater.configured({
     *      fps: 30,
     *      timeScale: 1,
     *
     *      spectacles: {
     *          spectacleName: {
     *              width: 800,
     *              height: 600,
     *          }
     *      },
     *      state: {
     *          tutorial: false,
     *          permadeath: false,
     *          developmentMode: false,
     *          trueRandom: false,
     *      }
     * });
     * ```
     * @param props
     */
    configured(props = {}) {
        if (this.isConfigured) return;
        this.isConfigured = true;

        /** @type {Register|*} */
        const register = this.register;

        /** @type {LoopManager} */
        this.loopman = register.loopman;

        /** @type {EventBus} */
        this.eventBus = register.eventBus;

        this.bindEvents();

        this.eventBus.publish(`theater:init`, {theater: this});

        const _config = {...{
                fps: register.config?.fps || 30,
                timeScale: register.config?.timeScale || 1,
            }, ...props};

        this.fps = _config.fps;
        this.timeScale = _config.timeScale;
        this.parent = _config?.parent;
        this.mainLoopKey = _config?.mainLoopKey;



        // Loops
        //
        //
        //
        //
        if (!_config?.loops) return console.warn(`{TheaterManager.configured} loops not set. need install AnimationLoop`)

        for (const [name, loop] of Object.entries(_config.loops)) {
            if (!(loop instanceof AnimationLoop)) {
                return console.warn(`loop is not instance of AnimationLoop`)
            }
            if (!this.mainLoopKey) this.mainLoopKey = name;
        }
        const loops = _config.loops;

        // Spectacles
        //
        //
        //
        //
        if (props?.spectacles) {
            Object.keys(props.spectacles).forEach(name => {

                let spectaclesconf = props.spectacles[name];
                let spectacle = this.getSpectacle(name);

                if (!spectacle) {
                    console.warn(`Spectacle with name "${name}" not found! Create first new Spectacle, and add into actors `)
                    throw null;
                }

                // Every Spectacle configured
                //
                //
                //
                //
                spectacle.configured({
                    parent: this.parent,
                    width: spectaclesconf?.width,
                    height: spectaclesconf?.height,
                    quality: spectaclesconf?.quality,

                    onlyfocus: spectaclesconf?.onlyfocus,
                    eventsOn: spectaclesconf?.eventsOn,
                    scalingOn: spectaclesconf?.scalingOn,
                    draggableOn: spectaclesconf?.draggableOn,
                });
            })
        }



        // checked every spectacle to isConfigured
        this.spectacles.forEach(spectacle => {
            if (!spectacle.isConfigured)
                console.warn(`GameManager Warning! 
Object {ISpectacle} "${spectacle.name}" has not been configured yet.
Please remember this.`)
        })

        this.eventBus.publish(`spectacles:configured`, {name: 'theater', data: this });

        //
        //
        // loopman
        // Added loops into game handler.
        //
        //
        this.loopman.configured({
            fixedDelta: 1 / _config.fps,
            timeScale: _config.timeScale,

            //
            //
            // Shows on background fullscreen canvas on GameScreen
            // { 'loopName': LoopMain(register) }
            //
            loops: loops,
        });

        /**@type {AnimationLoop} */
        this.loop = this.loopman.get(this.mainLoopKey)

        this.eventBus.publish(`loopman:configured`, {name: 'configured', data: {theater: this} });

        // Update state
        //
        //
        //
        //
        let stateGame = {
            ...{
                started: false,
                iterator: 0,
                fps: 30,
                time: 0,
                timeScale: 1,
            }, ...{
                fps: _config.fps,
                timeScale: _config.timeScale,
            }, ...props?.state || {}
        }

        if (!register.state.theater) register.state.theater = {};

        Object.keys(stateGame).forEach(key =>
            register.state.theater[key] = stateGame[key]
        )

        this.eventBus.publish(`theater:configured`, {name: 'configured', data: {theater: this} });
    }

    clearSpectacle(name) {
        return this.spectacles.delete(name);
    }

    /**
     *
     * @param name
     * @return {Spectacle}
     */
    getSpectacle(name) {
        return this.spectacles.get(name)
    }

    addSpectacle(name, spectacle) {
        if (spectacle instanceof Spectacle) {
            if (this.spectacles.has(name)) return;

            return this.spectacles.set(name, spectacle)
        }
    }

    setGlobalSettings(settings = {}) {
        const allowed = ['timeScale', 'fps'];
        Object.keys(settings).forEach((key) => {
            if (!allowed.includes(key)) return console.warn(`setting not allowed: ${key}`);

            switch (key) {
                case 'fps':
                    break;
                case 'timeScale':
                    this.setTimeScale(settings[key]);
                    break;
            }

        })
    }

    setTimeScale(v) {
        const gameloop = this.loopman.get(this.mainLoopKey);
        gameloop.timeScale = this.register.state.theater.timeScale = v;
    }

    update(delta, iterator) {
        if (!this.updatable) return;
        this.spectacles.forEach((spectacle) => {
            if (!spectacle.updatable || !spectacle.isConfigured ) return;

            spectacle.update(delta, iterator);
        });
    }

    draw(delta, iterator) {
        if (!this.drawable) return;

        this.spectacles.forEach((spectacle) => {
            if (!spectacle.drawable || !spectacle.isConfigured ) return;
            spectacle.draw(delta, iterator);
        });
    }


    start() {
        this.register.state.status = STATUSES.PLAYING
    }

    stop() {
        this.register.state.status = STATUSES.PAUSED
    }

    startMainLoop() {
        if (!this.isConfigured || !this.loopman.has(this.mainLoopKey)) {
            console.warn(`Warning, Cannot apply start method! Class ${this.constructor.name} is not configured.`);
            return;
        }
        const loopName = this.mainLoopKey;

        if (this.loopman.get(loopName).started) {
            this.loopman.resume(loopName);
            this.eventBus.publish(`theater:resumed`, {name: 'resume', data: {theater: this} });
        } else {
            this.loopman.start(loopName);
            this.eventBus.publish(`theater:started`, {name: 'started', data: {theater: this} });
        }

        if (!this.register.state.theater.started) this.register.state.theater.started = true;
    }
    stopMainLoop() {
        const loopName = this.mainLoopKey;
        this.loopman.pause(loopName);
        this.eventBus.publish(`theater:paused`, {name: 'paused', data: {theater: this} });
    }
    get played() {
        const loopName = this.mainLoopKey;
        const loop =  this.loopman.get(loopName);
        return loop.started && !loop._paused
    }
    bindEvents() {
        this.register.state.on(`status`, (status) => {

            if (!this.isConfigured) return;

            if (status === STATUSES.PLAYING) {

                this.startMainLoop()
            } else {

                this.stopMainLoop()
            }
        })
    }
    attachedSpectacles = new Map();
    attachSpectacle(name, parent){
        const spectacle = this.getSpectacle(name);
        parent = parent && parent.nodeType === Node.ELEMENT_NODE ? parent : this.parent;

        if (!parent || parent.nodeType !== Node.ELEMENT_NODE) {
            console.warn(`Error. parent not {Element}`)
            return;
        }
        if (!spectacle || !(spectacle instanceof Spectacle)) {
            console.warn(`Error. spectacle not {Spectacle}. search by key ${name}`, spectacle)
            return;
        }

        spectacle.attach(parent);
        parent.setAttribute('data-spectacle', spectacle.name);

        this.attachedSpectacles.set(name, parent);
    }
    detachSpectacle(name, parent){
        parent = parent && parent.nodeType === Node.ELEMENT_NODE ? parent : this.parent;
        if (this.attachedSpectacles.has(name)) {
            parent = this.attachedSpectacles.get(name)
            this.attachedSpectacles.delete(name)
        }
        const spectacle = this.getSpectacle(name);
        parent.removeAttribute('data-spectacle')

        spectacle.detach(parent);
    }
}