/**
 * ```
 * const spectacle = new Spectacle(document.getElementById("viewport"), { width: 800, height: 600 });
 * const culler = new CameraCuller(spectacle, 75); // поле зору = 75°
 *
 * function loop() {
 *     spectacle.update();
 *     culler.update();
 *     requestAnimationFrame(loop);
 * }
 * loop();
 * ```
 */
export class CameraCuller {
    constructor(spectacle) {
        this.spectacle = spectacle;
        this.visibly = [];
    }

    update() {
        const { cx, cy, cz, cry } = this.spectacle;

        this.visibly = [];

        for (const entity of this.spectacle.children) {
            //Vector from camera to object
            const dx = entity.x - cx;
            const dz = entity.z - cz;

            // Перехід у координати камери
            const rad = (cry * Math.PI) / 180;
            const czx = dx * Math.cos(rad) - dz * Math.sin(rad);
            const czz = dx * Math.sin(rad) + dz * Math.cos(rad);

            // Object behind - hide
            if (czz > 0) {
                entity.element.style.display = "none";
                continue;
            }

            entity.element.style.display = "block";

            // Remembering the depth
            this.visibly.push({ entity, depth: czz });
        }

        // Sort by distance (the "further away", the lower the z-index)
        this.visibly.sort((a, b) => a.depth - b.depth);

        // Assign z-index (0 = closest)
        this.visibly.forEach((v, i) => {
            v.entity.element.style.zIndex = i;
        });
    }
}


export class CameraCuller2 {
    constructor(spectacle, fov = 90) {
        this.spectacle = spectacle;
        this.fov = fov; // field of view in degrees
        this.halfFovRad = (fov / 2) * (Math.PI / 180);
    }

    update() {
        const { cx, cz, cry } = this.spectacle;
        const rad = (cry * Math.PI) / 180;

        const visible = [];

        for (const entity of this.spectacle.children) {
            const dx = entity.x - cx;
            const dz = entity.z - cz;

            // Switching to local camera coordinates
            const czx = dx * Math.cos(rad) - dz * Math.sin(rad);
            const czz = dx * Math.sin(rad) + dz * Math.cos(rad);

            // Behind the camera
            if (czz > 0) {
                entity.node.style.display = "none";
                continue;
            }

            // The angle between the camera direction and the object
            const angle = Math.atan2(czx, -czz);


            // If the object is outside the FOV → hide
            if (Math.abs(angle) > this.halfFovRad) {
                entity.node.style.display = "none";
                continue;
            }

            entity.node.style.display = "block";
            visible.push({ entity, depth: czz });
        }


        // Sort by depth (for correct overlay)
        visible.sort((a, b) => a.depth - b.depth);

        visible.forEach((v, i) => {
            v.entity.node.style.zIndex = i;
        });
    }
}