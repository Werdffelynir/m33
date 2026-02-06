
## 1. Movement towards the target
Classic: calculating the movement vector towards the target.
```js
const ship = new Vector3(0, 0, -100);
const target = new Vector3(0, 0, 0);

const dir = target.clone().sub(ship).normalize(); // напрямок
ship.add(dir.multiplyScalar(5)); // рух вперед на 5 одиниць
```


## 2. Distance between objects
Checking the visibility radius or attack zone.
```js
const player = new Vector3(5, 0, 0);
const enemy = new Vector3(15, 0, 0);

if (player.distanceTo(enemy) < 10) {
    console.log("Enemy is close!");
}
```


## 3. View direction / angles
Determining at what angle from the player the enemy is located.
```js
const forward = new Vector3(0, 0, -1);
const enemyDir = new Vector3(10, 0, -10).normalize();

const angle = forward.angleTo(enemyDir) * (180 / Math.PI);
console.log("Angle to enemy:", angle, "degrees");
```


## 4. Speed / vector with limit
Used to control the speed of movement (cars, planes, ships).
```js
let velocity = new Vector3(2, 3, 0);
const maxSpeed = 5;

if (velocity.length() > maxSpeed) {
    velocity.setLength(maxSpeed);
}
```


## 5. Reflection from a surface
Reflection of a ball or beam from a wall.
```js
const incoming = new Vector3(1, -1, 0).normalize();
const normal = new Vector3(0, 1, 0); // поверхня вгору

const reflected = incoming.clone().reflect(normal).normalize();
console.log(reflected.toString()); 
```


## 6. Linear Interpolation (LERP)
Smooth motion between two points.
```js
const start = new Vector3(0, 0, 0);
const end = new Vector3(100, 0, 0);

const pos = start.clone().lerp(end, 0.25); 
console.log(pos.toString()); // Vector3(25,0,0)
```


## 7. Manhattan distance (quick proximity estimation)
Used in grid-based games (dungeon crawler, voxel world).
```js
const a = new Vector3(1, 2, 3);
const b = new Vector3(4, 6, 8);

console.log(a.manhattanDistanceTo(b)); // 12
```


## 8. Projection onto an axis
Useful to find velocity along an axis 
(e.g. forward/backward, not taking into account lateral motion).
```js
const velocity = new Vector3(10, 5, 0);
const forward = new Vector3(1, 0, 0);

const proj = velocity.clone().projectOnVector(forward);
console.log(proj.toString()); // Vector3(10,0,0)
```


## 9. The camera "looks" at a point
Basic logic of `lookAt` in 3D.
```js
const camera = new Vector3(0, 0, 10);
const target = new Vector3(0, 0, 0);

const dir = target.clone().sub(camera).normalize();
// dir = вектор куди має дивитися камера
```


## 10. Position limit (clamp)
Used to keep from going outside the map.
```js
const pos = new Vector3(15, -5, 50);
const min = new Vector3(0, 0, 0);
const max = new Vector3(10, 10, 10);

pos.clamp(min, max);
console.log(pos.toString()); // Vector3(10,0,10)
```


## 11. NPC orientation towards the player
```js
const npc = new Vector3(0, 0, 0);
const player = new Vector3(5, 0, 5);

const dir = player.clone().sub(npc).normalize();
npc.add(dir.multiplyScalar(0.1)); // NPC повзе за гравцем
```


## 12. Point between two points - Midpoint
Used to position an object in the middle.
```js
const a = new Vector3(0, 0, 0);
const b = new Vector3(10, 0, 0);

const mid = a.clone().add(b).divideScalar(2);
console.log(mid.toString()); // Vector3(5,0,0)
```



---

## 1. Reflection from a surface (`reflect`)

### Summary:

Imagine the velocity vector of a ball or ray. When it hits a surface, it is reflected.
The reflection vector is calculated by the formula:

```
R = I - 2 * (I · N) * N
```
* **I** — incoming vector
* **N** — surface normal (unit vector, length = 1)
* **R** — reflected vector

### Example (the bullet hits the floor):

```js
const incoming = new Vector3(1, -1, 0).normalize();  // flies at a downward angle
const normal = new Vector3(0, 1, 0);  // floor (normal up)

const reflected = incoming.clone().reflect(normal);

console.log("Incoming:", incoming.toString());  
console.log("Reflected:", reflected.toString());  
```

Here, a bullet that was flying **downward at an angle** is reflected **upward at an angle**, preserving "mirroriness".
This is useful for:

* ballistics (ricochets)
* ray tracing
* animations like "ball bouncing off a wall"

---

2. Manhattan distance (`manhattanDistanceTo`)

### Summary:

This is the "city distance" (if you only travel on the streets in the grid).
Formula:

```
d = |x1 - x2| + |y1 - y2| + |z1 - z2|
```

Unlike the regular (Euclidean) distance, here **the diagonal is not counted**.

### Example (player in a voxel/grid game):

```js
const player = new Vector3(2, 0, 3);
const enemy = new Vector3(5, 0, 7);

console.log("Euclidean distance:", player.distanceTo(enemy).toFixed(2));
console.log("Manhattan distance:", player.manhattanDistanceTo(enemy));
```

Result:

```
Euclidean distance: 5.00
Manhattan distance: 7
```
That is:

* Euclidean distance (sqrt(x²+y²+z²)) is suitable for a smooth world.
* Manhattan distance is fast and correct in **grid games** (labyrinths, dungeon crawlers, voxel worlds, pathfinding A\*).

---

* **reflect** = "how an object reflects off a wall/floor"
* **manhattan** = "fast proximity check on a grid, without diagonals"
