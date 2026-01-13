import {Ut} from '../Ut.js';


export class Camera {

    // low = 0
    // medium = 1
    // high = 2
    static detailLevel(zoom) {
        if (zoom > 10) return 3;
        if (zoom > 2) return 2;
        if (zoom > 0.5) return 1;
        return 0;
    }

    static DetailLevelLow = 0
    static DetailLevelMedium = 1
    static DetailLevelHigh = 2
    static DetailLevelUltra = 3

    /**
     * ```
     * const param = {
     *     x: 0,
     *     y: 0,
     *     zoom: 1,
     *     width: 1000,
     *     height: 1000,
     *     fieldHeight: 10000,
     *     fieldWidth: 10000,
     *     margin: 1000,
     *     cameraSpeed: 10,
     *     zoomMin: 0.1,
     *     zoomMax: 3,
     * }
     *
     * configured ( {x, y, width, height, fieldHeight, fieldWidth, } )
     * ```
     * @param params
     */
    configured(params) {

        this.x = params?.x ?? 0;
        this.y = params?.y ?? 0;
        this.zoom = params?.zoom || 1;

        this.width = params.width;
        this.height = params.height;
        this.halfHeight = params.height / 2;
        this.halfWidth = params.width / 2;

        this.fieldHeight = params.fieldHeight;
        this.fieldWidth = params.fieldWidth;
        this.halfFieldHeight = params.fieldHeight / 2;
        this.halfFieldWidth = params.fieldWidth / 2;

        this.margin = params?.margin || 1000;
        this.cameraSpeed = params?.cameraSpeed || 2;
        this.target = null;
        this.zoomMin = params?.zoomMin || 0.1;
        this.zoomMax = params?.zoomMax || 3;
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Centred Camera to object
     *
     * ```
     * camera.follow( {DisplayObject} )
     * camera.follow( {x, y} )
     * ```
     * @param target {*}
     */
    follow(target) {
        if (!target)
           throw new Error('target most have x and y {y: 0, y: 0}');

        this.target = target;
    }

    followOff() {
        this.target = null;
    }

    isInScreen(obj, zoom = null) {
        const margin = zoom ?  this.margin / zoom : this.margin

        // todo rewrite to Vector2
        return obj.x > this.x - margin && obj.x < this.x + margin
            && obj.y > this.y - margin && obj.y < this.y + margin
    }

    isInScreen2(obj, multiple = 1) {
        const margin = multiple ? this.margin : this.margin * multiple;
        // todo rewrite to Vector2
        return obj.x > this.x - margin && obj.x < this.x + margin
            && obj.y > this.y - margin && obj.y < this.y + margin
    }

    getScreenBounds(multiple = 1) {
        const margin = this.margin * multiple;
        return {
            left: this.x - margin,
            right: this.x + margin,
            top: this.y - margin,
            bottom: this.y + margin
        };
        /*
        const bounds = camera.getScreenBounds();
        if (
            obj.x > bounds.left && obj.x < bounds.right &&
            obj.y > bounds.top && obj.y < bounds.bottom
        ) {
            // In screen
        }
        **/
    }

    setZoom(zoom) {
        this.zoom = Math.max(this.zoomMin, Math.min(zoom, this.zoomMax));

        return this.zoom
    }

    zoomIn(factor = 1.05) {

        return this.setZoom(this.zoom * factor);
    }

    zoomOut(factor = 1.05) {

        return this.setZoom(this.zoom / factor);
    }

    clampCamera() {
        const halfW = this.width / 2 / this.zoom;
        const halfH = this.height / 2 / this.zoom;
        this.x = Ut.clamp(this.x, halfW, this.fieldWidth - halfW);
        this.y = Ut.clamp(this.y, halfH, this.fieldHeight - halfH);
    }

    get centerX() {
        return this.x + this.halfWidth;
    }

    get centerY() {
        return this.y + this.halfHeight;
    }

    applyTransform(ctx) {
        if (this.target) {
            this.x = this.target.x;
            this.y = this.target.y;
        }

        const offsetX = this.halfWidth - this.x * this.zoom;
        const offsetY = this.halfHeight - this.y * this.zoom;

        ctx.setTransform(this.zoom, 0, 0, this.zoom, offsetX, offsetY);
    }

    resetTransform(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    /**
     * Convert world coordinates to screen coordinates
     * ```
     * ```
     * @param worldX
     * @param worldY
     * @returns {{x: number, y: number}}
     */
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.x) * this.zoom + this.halfWidth,
            y: (worldY - this.y) * this.zoom + this.halfHeight
        };
    }

    /**
     * Screen → World (for example, for clicks)
     * ```
     * ```
     * @param screenX
     * @param screenY
     * @returns {{x: *, y: *}}
     */
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.halfWidth) / this.zoom + this.x,
            y: (screenY - this.halfHeight) / this.zoom + this.y
        };
    }

    // Converts screen coordinates back to world coordinates (for mouse clicks)
    toWorld(screenX, screenY) {
        const worldX = screenX / this.zoom + this.x;
        const worldY = screenY / this.zoom + this.y;
        return {x: worldX, y: worldY};
    }

    // Converts world coordinates to screen coordinates
    toScreen(worldX, worldY) {
        const screenX = (worldX - this.x) * this.zoom;
        const screenY = (worldY - this.y) * this.zoom;
        return {x: screenX, y: screenY};
    }

    mouseToWorld (mouseX, mouseY) {
        return {
            x: mouseX / this.zoom + this.x - this.width  / ( 2 * this.zoom),
            y: mouseY / this.zoom + this.y - this.height / ( 2 * this.zoom),
        }
    }

    /**
     * todo: dev
     * ```
     * Ut.calcCoordinate('F877 8688-7455')
     * Ut.calcCoordinate('B2 54-1255');
     * Q: A - Z (A 1000)
     * S: 0-999
     * C: X5000Y5000
     * ```
     * @param coordinate
     * @returns {{coordinate}}
     */
    calcCoordinate(coordinate) {
        const result = {coordinate};
        const match = coordinate.match(/([A-Z]+)(\d{1,3})\s(\d{1,4})-(\d{1,4})/);
        result.q = match[1];
        result.s = match[2];
        result.x = match[3];
        result.y = match[4];
        return result;
    }
}
