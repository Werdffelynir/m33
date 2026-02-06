import {Actor} from "../Actor.js";
import {Ut} from "../../Ut.js";
import {Camera} from "../Camera.js";

export const PlanetoidActorProps = {
    className: 'Planetoid',
    type: 'planetoid',

    mass: 1,            // 5.97 10**24kg (1e24)
    radius: 1,          // 6371km
    capacity: 1,        // 108 10**10km^3
    density: 1,         // 5513 kg/m^3
    // angle: 0,
    // angleSpeed: 10,
    // orbitCenter: null,      // center mass
    // orbitCenterDistance: 0, // distance to center

    orbitAngle: 0,
    orbitSpeed: 0,
    rotation: 0,
    rotationSpeed: 0,
    atmosphere: {},     // { O2: 0.2, CO2: 0.1, ... }
    composition: {},    // { Fe: 0.5, Si: 0.3, ... }
};

export class PlanetoidActor extends Actor {

    options = {label: false, track: false, colors: ['#8387a8', '#686c8a', '#4f536c']};

    constructor(props = {}) {
        super({...PlanetoidActorProps, ...props});

        this.type = PlanetoidActorProps.type;
        this.mass = props?.mass ?? PlanetoidActorProps.mass;
        this.radius = props?.radius ?? PlanetoidActorProps.radius;
        this.capacity = props?.capacity ?? PlanetoidActorProps.capacity;
        this.density = props?.density ?? PlanetoidActorProps.density;
        this.parent = props?.parent;
        this.children = props?.children || [];
        this.orbitAngle = props?.orbitAngle || 0;
        this.orbitSpeed = props?.orbitSpeed ?? PlanetoidActorProps.orbitSpeed;
        this.orbitRadius = null;

        this.skipFrameRate = props?.skipFrameRate || 0;
        this.missedDelta = 0;
        this.sleep = false;
        this.selected = false;

        this.label = props?.label ?? `${this.type}-${this.eid}`;

        if (props?.options && Ut.isObject(props.options)) {
            this.options = {...this.options, ...props.options};
        }

    }

    update(delta, camera, iterator) {
        if (!this.updatable) return;
        if (this.skipFrameRate && iterator % this.skipFrameRate !== 0) return;

        if (this.parent) {
            // Ініціалізація орбіти
            if (this.orbitRadius === null) {
                const dx = this.position?.x ?? 0 - this.parent.position?.x ?? 0;
                const dy = this.position?.y ?? 0 - this.parent.position?.y ?? 0;

                this.orbitRadius = Math.sqrt(dx * dx + dy * dy);

                // ❗ Захист від нульового радіусу
                if (!isFinite(this.orbitRadius)) {
                    this.orbitRadius = 1;
                }

                this.orbitAngle = Math.atan2(dy, dx);
            }

            // ❗ Перевірка orbitSpeed і angle
            if (!isFinite(this.orbitAngle)) this.orbitAngle = 0;
            if (!isFinite(this.orbitSpeed)) this.orbitSpeed = 0;

            this.orbitAngle += this.orbitSpeed * delta;

            // ❗ Перевірка _orbitRadius ще раз перед обчисленням
            if (!isFinite(this.orbitRadius)) this.orbitRadius = 0;

            this.position.set(
                this.parent.position.x + Math.cos(this.orbitAngle) * this.orbitRadius,
                this.parent.position.y + Math.sin(this.orbitAngle) * this.orbitRadius
            );
        }
    }


    /**
     * Do not use ZOOM in this method !!!
     * @param ctx {CanvasRenderingContext2D}
     * @param camera {Camera}
     */
    draw(ctx, camera) {
        //
        // Optional:
        //
        // if (!this.drawable || !camera.isInScreen(this)) return;

        //
        ctx.save();

        // Орбіта (для супутників/планет)
        if (this.parent && this.options.track && this.orbitRadius !== null) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255,255,255,0.78)';
            ctx.lineWidth = 0.4;
            ctx.arc(
                this.parent.position.x,
                this.parent.position.y,
                this.orbitRadius,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.fillStyle = this.options.colors[0];
        ctx.strokeStyle = this.options.colors[0];
        ctx.lineWidth = Camera.detailLevel(camera.zoom) === Camera.DetailLevelLow
            ? 4 / camera.zoom : 2

        ctx.arc(this.position.x, this.position.y, this.radius, 0, 6.3);
        ctx.stroke();

        // Optional: draw name
        if (this.options.label) { //  || camera.zoom < 0.4
            ctx.fillStyle = '#fff';
            ctx.font = `${16 / camera.zoom}px sans, sans-serif`;
            ctx.fillText(this.label, this.x + this.radius + 2, this.y + this.radius + 2);
        }

        if (this.selected) {
            this.drawSelected(ctx);
        }
        ctx.restore();
    }

    draw2(ctx, camera) {
        //
        // Optional:
        //
        // if (!this.drawable || !camera.isInScreen(this)) return;

        ctx.save();

        // Орбіта (для супутників/планет)
        if (this.parent && this.orbitRadius !== null) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.arc(
                this.parent.position.x,
                this.parent.position.y,
                this.orbitRadius,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }

        // Сам об'єкт
        ctx.beginPath();
        ctx.fillStyle = this.options.colors[0];
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawSelected(ctx, camera, iterator) {
        if (this.selected) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#545d9a';
            ctx.strokeRect(this.x - (this.radius+4), this.y - (this.radius+4), (this.radius * 2) + 8 , (this.radius * 2) + 8);
        }
    }



    moveAroundParent(delta) {
        if (this.parent) {
            // Обчислення кута обертання orbitAngle
            this.orbitAngle = (this.orbitAngle ?? 0) + this.orbitAngle * delta;

            // Центр обертання — позиція батьківського об'єкта
            const px = this.parent.position.x;
            const py = this.parent.position.y;

            const orbitRadius = this.orbitRadius ?? this.calculateOrbitRadius();

            // Нова позиція на орбіті
            this.position.x = px + Math.cos(this.orbitAngle) * orbitRadius;
            this.position.y = py + Math.sin(this.orbitAngle) * orbitRadius;
        }
    }

    calculateOrbitRadius() {
        if (!this.parent) return 0;
        const dx = this.position.x - this.parent.position.x;
        const dy = this.position.y - this.parent.position.y;
        this._orbitRadius = Math.sqrt(dx * dx + dy * dy);
        return this._orbitRadius;
    }

    /**
     * @param camera
     * @returns {{x: *, y: *}}
     */
    toScreenCoordinate(camera) {
        const x = (this.x - camera.centerX) + camera.halfWidth;
        const y = (this.y - camera.centerY) + camera.halfHeight;
        return {x, y}
    }

    _updateOptimized(delta, camera, iterator) {
        if (!this.updatable) return;
        if (this.skipFrameRate && iterator % this.skipFrameRate !== 0) return;

        const isVisible = camera.isInScreen(this);

        if (!isVisible) {
            this.missedDelta += delta;
            this.sleep = true;
            return;
        }

        const totalDelta = delta + this.missedDelta;
        this.missedDelta = 0;
        this.sleep = false;

        this.updateVisible(totalDelta, camera, iterator);
    }

    _updateOptimized2(delta, camera, iterator) {
        if (!this.updatable) return;
        if (this.skipFrameRate && iterator % this.skipFrameRate !== 0) return;

        if (!camera.isInScreen(this)) {
            this.skipFrameRate = 4;
        } else {
            this.skipFrameRate = 0;
        }
    }
}



// Початкове обчислення орбітального радіуса (тільки 1 раз)
// if (this._orbitRadius === null) {
//     const dx = this.position.x - this.parent.position.x;
//     const dy = this.position.y - this.parent.position.y;
//     this._orbitRadius = Math.sqrt(dx * dx + dy * dy);
//     this.orbitAngle = Math.atan2(dy, dx); // щоб зберегти напрямок
// }
// this._orbitRadius = this._orbitRadius || 0;
// // Збільшуємо кут обертання з урахуванням часу
// this.orbitAngle += this.orbitSpeed * delta;
// // console.log(this._orbitRadius)
// // Оновлюємо позицію згідно з обертанням навколо центру (parent)
// this.position.x = this.parent.position.x + Math.cos(this.orbitAngle) * this._orbitRadius;
// this.position.y = this.parent.position.y + Math.sin(this.orbitAngle) * this._orbitRadius;

// Якщо нема parent, тіло нерухоме (зоря)

// if (this.parent) {
//     // this.orbitCenter = this.parent.position;
//     const center = this.parent.position.copy();
//     let offset = this.position.copy().subtract(center);
//     offset = offset.rotate( this.orbitSpeed * delta );
//     this.position = center.copy().add(offset);
//     return;
// } else
// offset = this.orbitCenter.copy().add(offset);
// this.position.set(offset.x, offset.y);
// let offset = this.position.copy().subtract(this.orbitCenter);
//
// offset = offset.rotate( this.orbitSpeed * delta );
// offset = this.orbitCenter.copy().add(offset);
// // this.position = this.orbitCenter.copy().add(offset);
// this.position.set(offset.x, offset.y);
/*

const PlanetoidProps = {
    className: 'Planetoid',
    type: 'planetoid',

    mass: 1,            // 5.97 10**24kg (1e24)
    radius: 1,          // 6371km               from parent value
    capacity: 1,        // 108 10**10km^3
    density: 1,         // 5513 kg/m^3

    distance: 0,        // distance to parent
    speed: 0,
    orbitSpeed: 0,
    atmosphere: {},     // { O2: 0.2, CO2: 0.1, ... }
    composition: {},    // { Fe: 0.5, Si: 0.3, ... }

    parent: null,
    children: null,
    options: { showName: false },
    optimized: false,        // purpose for uses or ignores methods to optimize performance
};
export class Planetoid2 extends DisplayObject {
    options = {
        showName: false,
    };
    constructor(props) {
        super(props);
        const {
            className,
            type,
            mass,
            parent,
            children,
            distance,
            speed,
            orbitSpeed,
            atmosphere,
            composition,
            options,
            optimized,
        } = {...PlanetoidProps, ...props};

        this.className = className;
        this.type = type;
        this.mass = mass;
        this.parent = parent;
        this.children = children;
        this.distance = distance;
        this.speed = speed;
        this.orbitSpeed = orbitSpeed;
        this.atmosphere = atmosphere;
        this.composition = composition;
        this.options = options;
        this.optimized = optimized;

        if (props && typeof props.update === 'function') this.update = props.update;
        if (props && typeof props.draw === 'function') this.draw = props.draw;

        this.children = props?.children || new Set();
    }

    exportData() {
        const gdata =  super.exportData();
        return {...gdata, ...{
            className: PlanetoidProps.className,
            type: this.type,
            mass: this.mass,
            parent: this.parent,
            children: this.children,
            distance: this.distance,
            speed: this.speed,
            orbitSpeed: this.orbitSpeed,
            atmosphere: this.atmosphere,
            composition: this.composition,
            options: this.options,
            optimized: this.optimized,
        }};
    }

    // get optionShowName () {return this.options.showName}

    update(delta, camera) {
        // Optional: if (this.updatable && camera.isInScreen(this)) { }
        if (this.parent) {
            if (this.speed !== 0)
                this.angle += this.speed * delta ;
            this.x = this.parent.x + Math.cos(this.angle) * this.distance;
            this.y = this.parent.y + Math.sin(this.angle) * this.distance;
        }
        // Update children
        // for (let child of this.children) {
        //     child.update(deltaTime);
        // }
    }

}
*/

