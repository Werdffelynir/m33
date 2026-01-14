

```js
const fps = 30
this.ctx = this.elements.canvas.getContext('2d');
this.gfx = new Graphic(this.ctx);

this.animatorCallbacks = new Set()

this.animator = new AnimationLoop({
    update: (delta, iteration,  renderRequest) => {
        renderRequest()
    },
    render: (delta, iteration) => {
        // {ctx: this.ctx, gfx: this.gfx, delta, iteration}
        this.animatorCallbacks.forEach(cb => cb (this.ctx, this.gfx, delta, iteration))
    },
    fixedDelta: 1 / fps,
    timeScale: 1
});

this.animator.start()
this.animator.stop()
```