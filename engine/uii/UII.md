

- default UIIBlock props
```js
props = {
    x: 0,
    y: 0,
    z: 0,
    width: 30,
    height: 30,
    fixed: true,
    content: true,
    style: {},
    cssClasses: ['UII', 'UIIBlock'],
}

```


## Uses for - every is new, created new blank with new elements
```js


```





## 
```js
const uii = new UII({
    theme: 'themeDarkBlue',
    parent: this.elements.content,
    props: { fixed: false, }
});
const s = new UIISwitcher(uii, 'ext1', {
    fixed: true,
})
uii.attach();

```




## Elements
```js
const uii = new UII({
    theme: 'themeDarkBlue',
});

//
//
// UIIBlock

//
//
// UIIButton

//
//
// UIICanvas

//
//
// UIIElement
const btnSettings = new UIIElement(uii, 'deskpad', {
    element: react.template,
    x: 10,
    y: 10,
    width: 300,
    height: 200,
})
//
//
// UIIElement
react
const btnSettings = new UIIElement(uii, 'deskpad', {
    element: react.template,
    x: 10,
    y: 10,
    width: 600,
    height: 400,
    draggable: true,
    drag: react.elements['holder'],
    actions: {up: false, down: false, left: false, right: false},
    bused: ['click','dblclick','mousedown', 'mouseup'],
})
const actions = {
    'mousedown:id:btn1': (data) => console.log('click', data),
    'mouseup:id:btn1': (data) => console.log('click', data),
}
Object.keys(actions).forEach(path => uiie.eventBus.subscribe(path, actions[path]))

//
//
// UIIHint

//
//
// UIILabel

//
//
// UIIMonitor
const mon = new UIIMonitor(this.uii, 'monitor', {
    element: NodeElement,
    parent: NodeElement,
    width: 960,
    height: 600,
    fixed: false,
})
mon.alignment({
    justify: {end: true},
    align: {start: true},
    text: {start: true}
});

//
//
// UIIMultitext

//
//
// UIIPhaser

//
//
// UIIRange

//
//
// UIISign

//
//
// UIISwitcher

//
//
// UIIText

//
//
// UIITextline


//
//
// UIIButton
const btnSettings = new UIIButton(uii, 'settings', {
    x: 400,
    y: 400,
    width: 100,
    content: `Settings`
})
btnSettings.onClick(() => {});

//
//
// UIIButton
const sign = new UIISign(uii, 'volume', {
    x: 0,
    y: 150,
    enabled: true,
})

sign.label('Volume', {corner: 'right', x: 10})
sign.turnOn();
sign.onChange((status) => { console.log('sign status', status) })


//
//
// UIIButton
range = new UIIRange ( uii, 'keyName', {
    x: 0,
    y: 0,
    width: 200,
    height: 30,
    vertical: false,
    haft: true,
    percent: 50,
    label: { width: 500, corner: 'top', y: -10},
    hint: { corner: 'bottom', y: 10 },
})

range.hint(`These are sound effects settings for all world events, sounds from player actions, sounds from interactive objects, or NPCs.`)
range.label(`Change Volume FX: 100%`)
range.onChange((value) => { range.label(`Change Volume FX: <b>${value}</b>%`) })


uii.attach();
```











