

/**
 *
 * ```
 * 
 * Metric.distance(fromX, fromY, toX, toY)
 * Metric.distanceSq
 * Metric.angle(fromX, fromY, toX, toY)
 * Metric.getXDistanceAngle(distance, angle)
 * Metric.getYDistanceAngle
 * Metric.sign(n)
 * Metric.middleNum(numbers)
 * Metric.toRoman(numbers)
 * Metric.wrap(n, min, max)
 * Metric.clamp(n, min, max)
 * Metric.isBetween(a, b, x)
 * Metric.distToLine(px, py, x1, y1, x2, y2)
 * Metric.distToLineSeg
 * Metric.closestPointToLineSeg(px, py, x1, y1, x2, y2)
 * Metric.vectorLen(x1, y1)
 * Metric.vectorAngle
 * Metric.twoPointAngle
 * Metric.angleDiff(a1, a2)
 * Metric.perpendicularRoot(px, py, x1, y1, x2, y2)
 * Metric.circleLineIntersect(cx, cy, cr, x1, y1, x2, y2)
 * Metric.circleLineSegIntersect(cx, cy, cr, x1, y1, x2, y2)
 * Metric.circleRectangleIntersect(cx, cy, cr, rcx, rcy, rhw, rhh)
 * Metric.pointInCircle(x, y, cx, cy, cr)
 * Metric.pontInRect(x, y, rx, ry, rw, rh)
 * Metric.arrNumCompressor
 * Metric.numCompressor
 * Metric.radian2degree
 * Metric.degree2radian
 * Metric.convertHEXtoRGB
 * Metric.convertRGBtoHEX
 * Metric.dice
 * Metric.percentageOf
 * Metric.percentageFrom
 * Metric.percentageDifferenceBetween
 * Metric.adjustHex
 * Metric.adjustRgba
 * Metric.adjustHsl
 * Metric.zoomPointsLiners
 *
 * Metric.randomOneWeight
 * Metric.randomBias
 * Metric.randomBool
 * Metric.randomUnique
 * Metric.randomOne
 * Metric.random
 * 
 * Metric.DEG_1 --- Metric.DEG_360 //radians
 * ```
 */
export class Metric {


    /**
     * dice('d6')
     * dice('3d6')
     * d2, d6, d8, 3d6, 3d12
     *
     * @returns {number}
     */
    static diceTrue(notation) {
        const match = notation.match(/^(\d*)d(\d+)$/i);
        if (!match) throw new Error('Invalid dice notation: ' + notation);

        const count = parseInt(match[1], 10) || 1;
        const sides = parseInt(match[2], 10);
        let sum = 0;

        for (let i = 0; i < count; i++) {
            sum += Math.floor(Math.random() * sides) + 1;
        }

        return sum;
    }


    // __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __ delay timer
    static delay = (func, ms) => {
        let timer;
        return function () {
            if (timer) clearTimeout(timer);

            if (!timer) {
                timer = setTimeout(() => {
                    func();
                    timer = false;
                }, ms);
            }
        };
    }
    static timer (func, ms) {
        let timer;
        return {
            started: false,
            start() {
                if (!timer) {
                    timer = setInterval(() => {
                        func.apply(func, arguments);
                    }, ms);
                    this.started = true;
                }
                return this;
            },
            stop() {
                if (timer) {
                    clearInterval(timer);
                    this.started = timer = false;
                    return this;
                }
            },
        }
    }


    // __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __Math Calculate Collision

    static pointToPoint(p1, p2) {
        return p1.x === p2.x && p1.y === p2.y;
    }

    static pointToCircle(point, circle) {
        const dx = point.x - circle.x;
        const dy = point.y - circle.y;
        return dx * dx + dy * dy <= circle.radius * circle.radius;
    }

    /**
     * ```
     * if (Metric.pointInCircle(mouse.x, mouse.y, obj.x, obj.y, 10)) {
     *     obj.selected = true;
     *     console.log('selected', obj);
     * }
     * ```
     * @param x
     * @param y
     * @param cx
     * @param cy
     * @param cr
     * @returns {boolean}
     */
    static pointInCirclePoints(x, y, cx, cy, cr) {
        const dx = cx - x;
        const dy = cy - y;

        return dx * dx + dy * dy < cr * cr;
    }

    static pointToEllipse(point, ellipse) {
        const dx = point.x - ellipse.x;
        const dy = point.y - ellipse.y;
        return ((dx * dx) / (ellipse.rx * ellipse.rx) + (dy * dy) / (ellipse.ry * ellipse.ry)) <= 1;
    }

    static pointToRect(point, rect) {
        return (
            point.x >= rect.x &&
            point.x <= rect.x + rect.width &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.height
        );
    }

    static pointToRectPoints(x, y, rx, ry, rw, rh) {
        return x > rx && x < rx + rw && y > ry && y < ry + rh;
    }

    static pointToShape(point, flatPoints) {
        let inside = false;
        const len = flatPoints.length;

        for (let i = 0, j = len - 2; i < len; j = i, i += 2) {
            const xi = flatPoints[i], yi = flatPoints[i + 1];
            const xj = flatPoints[j], yj = flatPoints[j + 1];

            const intersect =
                yi > point.y !== yj > point.y &&
                point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || 1e-10) + xi;

            if (intersect) inside = !inside;
        }

        return inside;
    }

    static rectToRect(r1, r2) {
        return !(
            r1.x + r1.width < r2.x ||
            r1.x > r2.x + r2.width ||
            r1.y + r1.height < r2.y ||
            r1.y > r2.y + r2.height
        );
    }

    static circleToRect(circle, rect) {
        const cx = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const cy = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        const dx = circle.x - cx;
        const dy = circle.y - cy;
        return dx * dx + dy * dy <= circle.radius * circle.radius;
    }

    static shapeToShape(flatA, flatB) {
        const testAxes = (points) => {
            const axes = [];
            for (let i = 0; i < points.length; i += 2) {
                const j = (i + 2) % points.length;
                const dx = points[j] - points[i];
                const dy = points[j + 1] - points[i + 1];
                const normal = {x: -dy, y: dx};
                axes.push(normal);
            }
            return axes;
        };

        const project = (points, axis) => {
            let min = Infinity;
            let max = -Infinity;
            for (let i = 0; i < points.length; i += 2) {
                const dot = points[i] * axis.x + points[i + 1] * axis.y;
                if (dot < min) min = dot;
                if (dot > max) max = dot;
            }
            return {min, max};
        };

        const axes = [...testAxes(flatA), ...testAxes(flatB)];

        for (let axis of axes) {
            const projA = project(flatA, axis);
            const projB = project(flatB, axis);
            if (projA.max < projB.min || projB.max < projA.min) {
                return false;
            }
        }

        return true;
    }

    static pointToEdgeDistance(point, flatPoints) {
        let minDist = Infinity;
        const len = flatPoints.length;

        for (let i = 0; i < len; i += 2) {
            const j = (i + 2) % len;
            const x1 = flatPoints[i], y1 = flatPoints[i + 1];
            const x2 = flatPoints[j], y2 = flatPoints[j + 1];

            const dx = x2 - x1;
            const dy = y2 - y1;
            const lenSq = dx * dx + dy * dy;

            let t = ((point.x - x1) * dx + (point.y - y1) * dy) / (lenSq || 1e-10);
            t = Math.max(0, Math.min(1, t));

            const projX = x1 + t * dx;
            const projY = y1 + t * dy;

            const dist = Math.hypot(point.x - projX, point.y - projY);
            if (dist < minDist) minDist = dist;
        }

        return minDist;
    }

    /**
     * given a line in 2 point form and a point
     * draw a line with min dist to the line and returns the point of intersections
     * >: make it more efficient?
     *
     * e.g.
     *     (0 4)
     *      o
     *      |
     *      |-------o (5, 2)
     *      |
     *      o
     *    (0 0)
     * returns (0, 2)
     *
     * perpenducular
     * perpendicular
     * @returns {{x: *, y: *}}
     */
    static perpendicularRoot(px, py, x1, y1, x2, y2) {
        var dtl = this.distanceToLine(px, py, x1, y1, x2, y2);
        const dtp1 = this.distance(px, py, x1, y1);
        const dp1r = Math.sqrt(dtp1 * dtp1 - dtl * dtl);
        const dp1p2 = this.distance(x1, y1, x2, y2);

        const ret = {
            x: x1 + (x2 - x1) * dp1r / dp1p2,
            y: y1 + (y2 - y1) * dp1r / dp1p2
        };
        return ret;
    }

    /**
     * http://mathworld.wolfram.com/Circle-LineIntersection.html
     * @returns {{x: number, y: number}|boolean}
     */
    static circleLineIntersect(cx, cy, cr, x1, y1, x2, y2) {
        x1 -= cx;
        y1 -= cy;
        x2 -= cx;
        y2 -= cy;

        let dx = x2 - x1;
        let dy = y2 - y1;
        let dr = Math.sqrt(dx * dx + dy * dy);

        const D = x1 * y2 - x2 * y1;

        // discriminant
        const disc = cr * cr * dr * dr - D * D;
        if (disc < 0)
            return false;

        const rdisc = Math.sqrt(disc);

        const poi1x = (D * dy + this.sign(dy) * dx * rdisc) / (dr * dr);
        const poi2x = (D * dy - this.sign(dy) * dx * rdisc) / (dr * dr);

        const poi1y = (-1 * D * dx + Math.abs(dy) * rdisc) / (dr * dr);
        const poi2y = (-1 * D * dx - Math.abs(dy) * rdisc) / (dr * dr);

        const poi1ToP1 = (poi1x - x1) * (poi1x - x1) + (poi1y - y1) * (poi1y - y1);
        const poi2ToP1 = (poi1x - x1) * (poi2x - x2) + (poi2y - y2) * (poi2y - y2);

        if (poi1ToP1 < poi2ToP1) {
            return {x: poi1x, y: poi1y};
        } else {
            return {x: poi2x, y: poi2y};
        }
    }

    static circleLineSegIntersect(cx, cy, cr, x1, y1, x2, y2) {
        const closest = this.closestPointToLineSeg(cx, cy, x1, y1, x2, y2);
        const dx = closest.x - cx;
        const dy = closest.y - cy;

        if (dx * dx + dy * dy > cr * cr)
            return false;

        // at this point we have a intersection for sure
        const returnMe = this.circleLineIntersect(cx, cy, cr, x1, y1, x2, y2);
        if (returnMe === false)
            document.writeln("col fail between circle and line....");

        return returnMe;
    }

    /**
     * Circle-Rectangle collision detection
     * http://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
     * @param cx    circle x,
     * @param cy    circle y,
     * @param cr    circle radius
     * @param rcx   rect center x
     * @param rcy   y
     * @param rhw   rect half width
     * @param rhh   rect half height
     * @returns {boolean}
     */
    static circleRectangleIntersect(cx, cy, cr, rcx, rcy, rhw, rhh) {
        let dx = Math.abs(cx - rcx);
        let dy = Math.abs(cy - rcy);

        if (dx > rhw + cr) {
            return false;
        }
        if (dy > rhh + cr) {
            return false;
        }

        if (dx <= rhw) {
            return true;
        }
        if (dy <= rhh) {
            return true;
        }

        const cornerDistance_sq = (dx - rhw) * (dx - rhw) + (dy - rhh) * (dy - rhh);

        return (cornerDistance_sq <= (cr * cr));
    }


    // __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __Math Calculates

    /**
     * Linearly interpolates between two numbers.
     *
     * @param {number} start The start value.
     * @param {number} stop The end value.
     * @param {number} amount The interpolation amount (0.0 to 1.0).
     * @returns {number} The interpolated value.
     */
    static lerp(start, stop, amount) {
        return start + amount * (stop - start);
    }

    /**
     * rotation.y = lerpAngle( rotation.y, targetAngle, 0.1 );
     */
    static lerpAngle(start, stop, amount) {
        let delta = stop - start;
        delta = Math.atan2(Math.sin(delta), Math.cos(delta));
        return start + delta * amount;
    }

    // get distance between two points
    static distance(fromX, fromY, toX, toY) {
        return Math.hypot
            ? Math.hypot(toX - fromX, toY - fromY)
            : Math.sqrt((fromX - toX) ** 2 + (fromY - toY) ** 2);

        /*
        // V1
        var dx = x2 - x1;
        var dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
        // V2
        return Math.sqrt( Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2) );
        // V3
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
        // V4
        return Math.hypot(x2 - x1, y2 - y1);
        */
    }

    static distanceSq(fromX, fromY, toX, toY) {
        const dx = toX - fromX;
        const dy = toY - fromY;
        return dx * dx + dy * dy;
    }

    static getXDistanceAngle(distance, angle) {
        return Math.cos(angle) * distance;
    }

    static getYDistanceAngle(distance, angle) {
        return Math.sin(angle) * distance;
    }

    static zoomPointsLiners(points, factor) {
        if (!Array.isArray(points) || points.length < 4) {
            throw new Error('Invalid points array');
        }

        // 1. Знайдемо центр форми
        let sumX = 0, sumY = 0;
        for (let i = 0; i < points.length; i += 2) {
            sumX += points[i];
            sumY += points[i + 1];
        }
        const centerX = sumX / (points.length / 2);
        const centerY = sumY / (points.length / 2);

        // 2. Масштабуємо відносно центру
        const zoomedPoints = [];
        for (let i = 0; i < points.length; i += 2) {
            const x = points[i];
            const y = points[i + 1];

            const dx = x - centerX;
            const dy = y - centerY;

            zoomedPoints.push(
                centerX + dx * factor,
                centerY + dy * factor
            );
        }

        return zoomedPoints;
    }

    static distanceToLine(px, py, x1, y1, x2, y2) {
        const t = Math.abs((x2 - x1) * (y1 - py) - (x1 - px) * (y2 - y1));
        const b = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        if (b === 0)
            return Math.sqrt((x2 - px) * (x2 - px) + (y2 - py) * (y2 - py));
        else
            return t / b;
    }

    static distanceToLineSeg(px, py, x1, y1, x2, y2) {
        const d2l = this.distanceToLine(px, py, x1, y1, x2, y2);

        const dtp1sq = (px - x1) * (px - x1) + (py - y1) * (py - y1);
        const dtp2sq = (px - x2) * (px - x2) + (py - y2) * (py - y2);
        const lineLenSq = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);

        const p1ProjSq = dtp1sq - d2l * d2l;
        const p2ProjSq = dtp2sq - d2l * d2l;

        if (p1ProjSq > lineLenSq)
            return Math.sqrt(dtp2sq);
        else if (p2ProjSq > lineLenSq)
            return Math.sqrt(dtp1sq);
        else
            return d2l;
    }

    static closestPointToLineSeg(px, py, x1, y1, x2, y2) {
        const ldx = x2 - x1;
        const ldy = y2 - y1;
        const lLen = Math.sqrt(ldx * ldx + ldy * ldy);

        const p1dx = px - x1;
        const p1dy = py - y1;

        const unitldx = ldx / lLen;
        const unitldy = ldy / lLen;

        const proj = p1dx * unitldx + p1dy * unitldy;
        if (proj <= 0)
            return {x: x1, y: y1};
        if (proj >= lLen)
            return {x: x2, y: y2};

        return {
            x: unitldx * proj + x1,
            y: unitldy * proj + y1
        };
    }

    /**
     * calculates the length (modulus, magnitude) of a vector in 2D space — that is,
     * the distance from the initial coordinate (0, 0) to the point (x1, y1).
     * Typical uses:
     * Determining the length of the direction of motion (velocity vector)
     * Normalizing vectors
     * Distance from the center of coordinates
     * Calculating velocity if x and y are components
     *
     *
     */
    static vectorLen(x1, y1) {
        return Math.sqrt(x1 * x1 + y1 * y1);
    }

    /**
     * Angle of vector
     * returns value between 0 to 2PI
     *
     * @param x1
     * @param y1
     * @returns {number}
     */
    static vectorAngle(x1, y1) {
        let d = Math.sqrt(x1 * x1 + y1 * y1);
        let angle = 0;
        if (d !== 0) {
            angle = Math.acos(x1 / d);
            if (y1 < 0) {
                angle = Math.PI * 2 - angle;
            }
        }
        return angle;
    }

    /**
     * vector angle from p1 to p2
     *
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @returns {number}
     */
    static pointsAngle(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.vectorAngle(dx, dy);
    }

    static angle(fromX, fromY, toX, toY) {
        return Math.atan2(toY - fromY, toX - fromX);
    }

    static angleCalm(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    }

    /**
     * returns positive # if a1 should turn cw to reach a2
     * negative number if ccw
     *
     * @param a1 current angle
     * @param a2 dest angle
     * @returns {number}
     */
    static angleDiff(a1, a2) {
        a1 = Math.wrap(a1, 0, 2 * Math.PI);
        a2 = Math.wrap(a2, 0, 2 * Math.PI);
        const t = a2 - a1;
        if (t > 0)
            return t > Math.PI ? t - Math.PI * 2 : t;
        else
            return t < -Math.PI ? t + Math.PI * 2 : t;
    }


    // __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __ Math Utils
    static sign(n) {
        if (n > 0) return 1;
        else return -1;
    }

    static middleNum(numbers) {
        const min = Math.min(...numbers)
        return (Math.max(...numbers) - min) / 2 + min;
    }

    static wrap(n, min, max) {
        if (n < min)
            return n + (max - min);
        else if (n > max)
            return n - (max - min);
        else
            return n;
    }

    static clamp(n, min, max) {
        // return Math.max(min, Math.min(max, n));
        if (n < min)
            return min;
        else if (n > max)
            return max;
        else
            return n;
    }

    static isBetween(a, b, x) {
        return (a <= x && x <= b) || (b <= x && x <= a);
    }


    // __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __ Percentage
    // 5 100 = 20%

    /**
     * Example: 20% from 1000 is 200
     *
     * @param perc
     * @param from
     * @returns {number}
     */
    static percentageOf(perc, from) {
        return (perc * from) / 100
    }

    /**
     * Example: 50 from 1000 is 5%
     * @param num
     * @param from
     * @returns {number}
     */
    static percentageFrom(num, from) {
        return (num / from) * 100; // (100 * partialValue) / totalValue;

    }

    /**
     * Example: 50 ~ 40 is 25%
     * @param num1
     * @param num2
     * @returns {number}
     */
    static percentageDifferenceBetween(num1, num2) {
        return Math.abs((num1 - num2) / num2) * 100;
    }

    /**
     * ```
     * Example get value 25% from diapason from 10 to 80
     * percentageRange(percent, 10, 80);
     * ```
     */
    static percentageRange = (value, outMin, outMax, inMin = 0, inMax = 100) =>
        outMin + ((outMax - outMin) / (inMax - inMin)) * (value - inMin);
    // __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __ Converts

    // __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __  __ Colors


    static radian2degree(ang) {
        return ang * 180 / Math.PI;
    }

    static degree2radian(ang) {
        return ang * Math.PI / 180;
    }

    /**
     * ```
     * ([-1,0,1,-2,3,4,5,6,7,8,9,10,11,12], 0, 10)
     * ```
     */
    static arrNumCompressor(arrNum, min, max) {
        return arrNum.map((n) => n < min ? min : n > max ? max : n)
    }

    static numCompressor(n, min, max) {
        return n < min ? min : n > max ? max : n;
    }

    static toRoman(num) {
        const romanMap = [
            {value: 1000, symbol: "M"},
            {value: 900, symbol: "CM"},
            {value: 500, symbol: "D"},
            {value: 400, symbol: "CD"},
            {value: 100, symbol: "C"},
            {value: 90, symbol: "XC"},
            {value: 50, symbol: "L"},
            {value: 40, symbol: "XL"},
            {value: 10, symbol: "X"},
            {value: 9, symbol: "IX"},
            {value: 5, symbol: "V"},
            {value: 4, symbol: "IV"},
            {value: 1, symbol: "I"}
        ];

        let result = "";

        for (const {value, symbol} of romanMap) {
            while (num >= value) {
                result += symbol;
                num -= value;
            }
        }

        return result;
    }

    static convertHEXtoRGB(hex) {
        hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function (m, r, g, b) {
            return r + r + g + g + b + b
        });
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16)} : null;
    }

    static convertRGBtoHEX(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    static parseRGBA (str) {
        const [r,g,b,a=1] = str.match(/rgba?\(([^)]+)\)/)[1].split(',').map(Number);
        return { r,g,b,a };
    };

    static _adjustChannel(value, n) {
        if (n > 0) return Math.min(255, Math.round(value + (255 - value) * n));
        else return Math.max(0, Math.round(value * (1 + n)));
    }

    /**
     * ```
     * Metric.adjustHex("#336699", 0.2);     // Яскравіше
     * Metric.adjustRgba("#336699", -0.2);   // Темніше
     * ```
     * @param color
     * @param n
     * @returns {string}
     */
    static adjustHex(color, n) {
        color = color.replace(/^#/, '');
        let r = parseInt(color.substring(0, 2), 16);
        let g = parseInt(color.substring(2, 4), 16);
        let b = parseInt(color.substring(4, 6), 16);

        [r, g, b] = [r, g, b].map(c => this._adjustChannel(c, n));

        return '#' +
            r.toString(16).padStart(2, '0') +
            g.toString(16).padStart(2, '0') +
            b.toString(16).padStart(2, '0');
    }

    /**
     * ```
     * Metric.adjustRgba("rgba(50,100,150,1)", -0.3); // Темніше
     * Metric.adjustRgba("rgba(50,100,150,1)", 0.3); // Яскравіше
     * ```
     * @param color
     * @param n
     * @returns {string}
     */
    static adjustRgba(color, n) {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d\.]+)?\)/);
        if (!match) return color;

        let [, r, g, b, a] = match;
        r = this._adjustChannel(parseInt(r), n);
        g = this._adjustChannel(parseInt(g), n);
        b = this._adjustChannel(parseInt(b), n);

        return `rgba(${r}, ${g}, ${b}, ${a ?? 1})`;
    }

    /**
     * ```
     * Metric.adjustHsl("hsl(200, 50%, 40%)", -0.2);   // Темніше
     * Metric.adjustHsl("hsl(200, 50%, 40%)", 0.2);   // Яскравіше
     * ```
     * @param color
     * @param n
     * @returns {string}
     */
    static adjustHsl(color, n) {
        const match = color.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
        if (!match) return color;

        let [, h, s, l] = match;
        h = parseInt(h);
        s = parseInt(s);
        l = parseInt(l);

        // Зміна яскравості (l)
        l = Math.max(0, Math.min(100, Math.round(l + (n * 100))));

        return `hsl(${h}, ${s}%, ${l}%)`;
    }

}

// depricated
Metric.RADDEG_1 = 0.017453292519943295;
Metric.RADDEG_2 = 0.03490658503988659;
Metric.RADDEG_3 = 0.05235987755982989;
Metric.RADDEG_4 = 0.06981317007977318;
Metric.RADDEG_5 = 0.08726646259971647;
Metric.RADDEG_6 = 0.10471975511965978;
Metric.RADDEG_7 = 0.12217304763960307;
Metric.RADDEG_8 = 0.13962634015954636;
Metric.RADDEG_9 = 0.15707963267948966;
Metric.RADDEG_10 = 0.17453292519943295;
Metric.RADDEG_45 = 0.7853981633974483;
Metric.RADDEG_90 = 1.5707963267948966;
Metric.RADDEG_135 = 2.356194490192345;
Metric.RADDEG_180 = 3.141592653589793;
Metric.RADDEG_270 = 4.71238898038469
Metric.RADDEG_360 = 6.283185307179586;

Metric.DEG_1 = 0.017453292519943295;
Metric.DEG_2 = 0.03490658503988659;
Metric.DEG_3 = 0.05235987755982989;
Metric.DEG_4 = 0.06981317007977318;
Metric.DEG_5 = 0.08726646259971647;
Metric.DEG_6 = 0.10471975511965978;
Metric.DEG_7 = 0.12217304763960307;
Metric.DEG_8 = 0.13962634015954636;
Metric.DEG_9 = 0.15707963267948966;
Metric.DEG_10 = 0.17453292519943295;
Metric.DEG_45 = 0.7853981633974483;
Metric.DEG_90 = 1.5707963267948966;
Metric.DEG_135 = 2.356194490192345;
Metric.DEG_180 = 3.141592653589793;
Metric.DEG_270 = 4.71238898038469
Metric.DEG_360 = 6.283185307179586;
