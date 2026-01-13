



```js
const box = { x: 0, opacity: 1 };

const moveTween = new Tween(box, { x: 300 }, 2000)
    .easingFn(Tween.Easing.easeInOut)
    .onUpdateFn((target, t) => {
        console.log("Move:", target.x.toFixed(2));
    })
    .onCompleteFn(() => console.log("Move complete"));

const fadeTween = new Tween(box, { opacity: 0 }, 1000)
    .onUpdateFn((target, t) => {
        console.log("Fade:", target.opacity.toFixed(2));
    })
    .onCompleteFn(() => console.log("Fade complete"));

const timeline = new Timeline()
    .add(moveTween, 0)      
    .add(fadeTween, 2000)   
    .start();



let lastTime = performance.now();
function loop(now) {
    const delta = now - lastTime;
    lastTime = now;

    timeline.update(delta);

    if (timeline.running) requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

