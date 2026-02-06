import {Actor} from "../Actor.js";
import {Vector2} from "../Vector2.js";
import {Ut} from "../../Ut.js";


export const AI_COMMANDS = {
    none: 'none',
    wait: 'wait',
    autopilot: 'autopilot',
    thrust: 'thrust',
    brake: 'brake',
    fullStop: 'fullStop',
    turnLeft: 'turnLeft',
    turnRight: 'turnRight',
    turnToAngle: 'turnToAngle',
    moveToTarget: 'moveToTarget',
};

export const AI_STATUSES = {
    idle: 'idle',
    turning: 'turning',
    waiting: 'waiting',
    docking: 'docking',
    moving: 'moving',
    braking: 'braking',
    arrived: 'arrived',
};


const VesselActorProps = {
    // x: 0,
    // y: 0,
    width: 1,
    height: 1,
    type: 'vessel',
    name: 'Unknown',
    spectacle: null,
    deep: 0,
    drawable: true,         // designed to optimize performance
    updatable: true,        // designed to optimize performance

    target: null,
    thrustMax: 20,
    thrustPower: 1.8,
    turnPower: 0.90,
    brakePower: 0.966,
    rotation: 0,
    status: AI_STATUSES.idle,
    command: AI_COMMANDS.none,
    commandTimer: 0,
    commandDuration: 0,

    movementThreshold: 0.001,
    arrivalThreshold: 1,
    className: 'VesselActor',
};

let _idCollector = 0;

export class VesselActor extends Actor {

    constructor(props = {}) {
        super({...VesselActorProps, ...props});

        this.target = props?.target || VesselActorProps.target; // Vector2 or null
        this.thrustMax = props?.thrustMax || VesselActorProps.thrustMax;
        this.turnPower = props?.turnPower || VesselActorProps.turnPower;
        this.thrustPower = props?.thrustPower || VesselActorProps.thrustPower;
        this.brakePower = props?.brakePower || VesselActorProps.brakePower;
        this.rotation = props?.rotation || VesselActorProps.rotation;
        this.status = props?.status || VesselActorProps.status;

        this.command = props?.command || VesselActorProps.command;
        this.commandTimer = 0;
        this.commandDuration = 0;
        this.commandProps = {};

        this.onupdates = new Set();
        if (props?.onupdate) this.onupdates.add(props?.onupdate);
        // console.log(this)
        this.option = {
            wrap: false,
            wrapTarget: false,
        }

        this._id = (_idCollector++);
    }

    get id() {
        return this._id
    };

    update(delta, camera, iterator) {
        if (this.onupdates.size) {
            this.onupdates.forEach(cb => cb(delta, camera, iterator));
        }

        // if (this.target) {
        if (this.command === AI_COMMANDS.autopilot && this.target) {
            this.runAutopilot(delta, camera, iterator);
        } else if (this.command !== AI_COMMANDS.none) {
            this.executeCommand(delta);
        }
    }

    draw(ctx, camera, iterator) {
        // Optional:
        //if (!this.drawable || !camera.isInScreen(this)) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(-1, -1);
        ctx.lineTo(2, 0);
        ctx.lineTo(-1, 1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        if (this.option.wrap) {
            this.drawSelected(ctx);
        }

        if (this.target && this.option.wrapTarget) {
            this.drawTarget(ctx);
        }
    }

    runAutopilot(delta, camera, iterator) {

        if (this.target) {
            if (!this.autotimer) this.autotimer = 0;
            this.autotimer += delta;

            const step = this.target.copy().subtract(this.position).normalize();
            this.velocity = step.multiply(this.thrustMax);

            const dir = this.target.copy().subtract(this.position);
            this.rotation = Math.atan2(dir.y, dir.x);
            this.status = AI_STATUSES.turning;

            if (this.target.distanceTo(this.position) < this.arrivalThreshold) {
                this.velocity.set(0, 0);
                this.target = null;
                this.autotimer = null;
                this.status = AI_STATUSES.arrived;
            } else {
                this.position.add(this.velocity.copy().multiply(delta));
                this.status = AI_STATUSES.moving;
            }
            // if (this.velocity.isZero()) {
            //     this.status = AI_STATUSES.idle;
            // } else {
            //     this.position.add(this.velocity.copy().multiply(delta));
            //     this.status = AI_STATUSES.moving;
            // }
        }
    }

    /**
     * Clear command `setCommand( AI_COMMANDS.none )`
     */
    setCommand(command, duration = 0) {
        this.command = command;
        this.commandTimer = 0;
        this.commandDuration = duration;
        this.commandProps = {};
    }

    /**
     *
     * ```
     * vessel.setExecute(AI_COMMANDS.thrust);
     *
     * vessel.setTarget({x: y:});
     * vessel.setExecute(AI_COMMANDS.autopilot);
     *
     * vessel.setExecute(AI_COMMANDS.autopilot, {target: {x: y:} });
     * vessel.setExecute(AI_COMMANDS.autopilot, {target: lastTarget.position})
     *
     * vessel.setExecute(AI_COMMANDS.thrust, {
     *      // Allowed Params
     *     target: null,
     *     angle: 0,
     *     thrustMax: 2.4,
     *     thrustPower: 0.21,
     *     turnPower: 0.085,
     *     rotation: 0,
     *     status: AI_STATUSES.idle
     * });
     * ```
     * @param command
     * @param params
     */
    setExecute(command, params = {}) {
        let execute = {
            ...{
                timer: 0,
                duration: 0,
            }, ...params
        }

        if (command === AI_COMMANDS.autopilot)
            this.status = AI_STATUSES.moving;

        this.command = command;
        this.commandTimer = execute.timer;
        this.commandDuration = execute.duration;
        this.commandProps = params;

        // mix params
        const allowedParams = ['target', 'angle', 'thrustMax', 'thrustPower', 'turnPower', 'rotation', 'status'];
        Object.keys(params).forEach(name => {
            if (allowedParams.includes(name)) {
                this[name] = params[name];
            }
        });
    }

    executeCommand(delta) {
        const dir = new Vector2(Math.cos(this.rotation), Math.sin(this.rotation));

        switch (this.command) {
            case AI_COMMANDS.wait:
                break;

            case AI_COMMANDS.thrust:
                this.acceleration = dir.multiply(this.thrustPower);
                this.velocity.add(this.acceleration.copy().multiply(delta));
                this.status = AI_STATUSES.moving;
                break;

            case AI_COMMANDS.brake:
                this.velocity.multiply(this.brakePower);
                this.status = AI_STATUSES.braking;
                break;

            case AI_COMMANDS.fullStop:
                this.velocity = new Vector2(0, 0);
                this.acceleration = new Vector2(0, 0);
                this.status = AI_STATUSES.idle;
                break;

            case AI_COMMANDS.turnLeft:
                this.rotation -= this.turnPower * delta;
                this.velocity.multiply(this.brakePower);
                this.status = AI_STATUSES.turning;
                break;

            case AI_COMMANDS.turnRight:
                this.rotation += this.turnPower * delta;
                this.velocity.multiply(this.brakePower);
                this.status = AI_STATUSES.turning;
                break;

            case AI_COMMANDS.turnToAngle:
                const angle = this.commandProps?.angle;
                if (Ut.isNumber(angle)) {
                    let angleDiff = angle - this.rotation;
                    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
                    this.turnAmount = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.turnPower * delta);
                    this.rotation += this.turnAmount; //todo new prop turnAmount
                    this.status = AI_STATUSES.turning;
                }
                break;

            case AI_COMMANDS.moveToTarget:
                const target = this.commandProps?.target; // Vector
                if (target && target instanceof Vector2) {
                    const toTarget = target.copy().subtract(this.position);
                    const dir = toTarget.normalize();
                    this.acceleration.set(dir.x, dir.y).multiply(this.thrustPower);
                    this.status = AI_STATUSES.moving;
                }
                break;
        }

        // Рухаємось за інерцією
        this.velocity.limit(this.thrustMax);
        this.position.add(this.velocity.copy().multiply(delta));

        // Оновлюємо таймер і перевіряємо завершення
        this.commandTimer += delta;
        if ((this.commandDuration !== 0 && this.commandTimer >= this.commandDuration) || this.command === AI_COMMANDS.fullStop) {
            this.command = AI_COMMANDS.none;
            // console.log('commandTimer')
        }
    }

    setTarget(target) {
        this.target = target.copy();
        this.command = AI_COMMANDS.autopilot;
    }

    drawSelected(ctx, camera, iterator) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#545d9a';
        ctx.strokeRect(this.x - 25, this.y - 25, 50, 50);
    }

    drawTarget(ctx, camera) {
        ctx.strokeStyle = '#9ddc93';
        ctx.lineWidth = 0.4;
        ctx.setLineDash([1, 2]);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.target.x, this.target.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#545d9a';
        ctx.strokeRect(this.target.x - 25, this.target.y - 25, 50, 50);
    }

    handleInput(keys, delta) {

        if (keys['ArrowLeft']) {
            this.rotation -= this.turnPower * delta;
            this.status = AI_STATUSES.turning;
        }
        if (keys['ArrowRight']) {
            this.rotation += this.turnPower * delta;
            this.status = AI_STATUSES.turning;
        }

        if (keys['ArrowUp']) {
            const dir = new Vector2(Math.cos(this.rotation), Math.sin(this.rotation));
            this.acceleration = dir.multiply(this.thrustPower);
            this.velocity.add(this.acceleration.copy().multiply(delta));
            this.status = AI_STATUSES.moving;
        } else if (keys['ArrowDown']) {
            this.velocity.multiply(this.brakePower);
            this.status = AI_STATUSES.braking;
        }
    }
}

