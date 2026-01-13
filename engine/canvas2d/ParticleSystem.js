import {Particle} from "./Particle.js";


export class ParticleSystem {
    constructor() {
        this.particles = new Set();
    }

    spawn(x, y, life = 1) {
        const p = new Particle(x, y, life);
        this.particles.add(p);
        return p;
    }

    update(dt) {
        for (const p of this.particles) {
            p.update(dt);
            if (!p.isAlive()) this.particles.delete(p);
        }
    }

    draw(ctx, camera) {
        for (const p of this.particles) {
            const sx = (p.position.x - camera.x) * camera.zoom;
            const sy = (p.position.y - camera.y) * camera.zoom;
            ctx.fillStyle = "white";
            ctx.fillRect(sx, sy, 2, 2);
        }
    }
}