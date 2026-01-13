



```js


let register,
    config,
    assets, rmd

config = {
    width: window.innerWidth,
    height: window.innerHeight,
    preload: [
        {type: 'image', name: 'picture', url: '/resources/images/picture.png'},
        {type: 'audio', name: 'click1', url: './resources/sounds/click5.mp3'},
        {type: 'json',  name: 'demo_scene', url: '/resources/scenes/street.scene.json'},
    ],
    keymap: {
        up: {pressed: false, codes: ['ArrowUp',], callbacks: []},
        down: {pressed: false, codes: ['ArrowDown',], callbacks: []},
        left: {pressed: false, codes: ['ArrowLeft',], callbacks: []},
        right: {pressed: false, codes: ['ArrowRight',], callbacks: []},

        space: {pressed: false, codes: ['Space'], callbacks: []},
        shift: {pressed: false, codes: ['ShiftLeft'], callbacks: []},
        ctrl: {pressed: false, codes: ['CtrlLeft'], callbacks: []},
        alt: {pressed: false, codes: ['AltLeft'], callbacks: []},

        q: {pressed: false, codes: ['KeyQ'], callbacks: []},
        e: {pressed: false, codes: ['KeyE'], callbacks: []},
        f: {pressed: false, codes: ['KeyF'], callbacks: []},

        dig1: {pressed: false, codes: ['Digit1',], callbacks: []},
        dig2: {pressed: false, codes: ['Digit2',], callbacks: []},
    },
};

register = new Register({
    config: config,
    state: {
        played: false,
    },
})
await register.setup()


let scene, camera, keyman

keyman = register.controlManager.keyboardManager
keyman.onKey('*', (pressed, event) => {
})


register.modules.get('Rerender')
register.assets.get('demo_scene')
register.components.get('MyComponent')
register.uis.show('MyUIView')
 

const rerender = new Theater3D(register)
register.registerModules({Theater3D: rerender})


const UI_Tools = new ReaComponent(register, {
    name: `UI_Tools`,
    template: `
div.guis.absolute.top.right
  div[data-id=tools]
    spam.button[onclick=@playme]: "play/stop"
  div[data-id=units]
`,
    css: `
.guis{ background-color: rgba(0,0,0,0.51); color: #00FF7F; }
.active{background-color: #00FF7F; color: rgb(102,133,159)}
`,
    state: {
        playme: ({event, target}) => {
            rerender.loop.togglePause()
            if (rerender.loop.isPlayed) target.classList.add('active')
            else target.classList.remove('active')
        }
    }
})
register.registerComponents({'UI_Tools': UI_Tools})
register.registerUIs({'UI_Tools': UI_Tools.root})
register.uis.show('UI_Tools')

const UI_Menu = new ReaComponent(register, {
    template: `div: "UI_Menu"`,
    css: ``,
    parent: UI_Tools.elements['units'],
    state: {},
})
register.registerComponents({'UI_Menu': UI_Menu})
UI_Menu.mount()


scene = new THREE.Scene()
scene.name = 'demo'

rerender.createWebGLRenderer({})
rerender.setScene(scene)
rerender.setCameraPerspective()
rerender.setupJSON(register.assets.get('demo_scene'))
rerender.render()

```