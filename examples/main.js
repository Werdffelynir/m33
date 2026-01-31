import {Register, STATUSES} from "engine/Register.js";
import {MenuComponent} from "./components/MenuComponent.js";
import {GenTerranQuadsComponent} from "./components/GenTerranQuadsComponent.js";
import {DefComponent} from "./components/DefComponent.js";
import {CellularAutomataComponent} from "./components/CellularAutomataComponent.js";
import {LabyrinthDFSClassicComponent} from "./components/LabyrinthDFSClassicComponent.js";
import {DummyDungeonRoomsComponent} from "./components/DummyDungeonRoomsComponent.js";
import {SceneBackgroundCanvasTextureComponent} from "./components/SceneBackgroundCanvasTextureComponent.js";
import {RandomWalkComponent} from "./components/RandomWalkComponent.js";
import {SidewinderComponent} from "./components/SidewinderComponent.js";
import {BinaryTreeMazeComponent} from "./components/BinaryTreeMazeComponent.js";
import {MirrorBranchComponent} from "./components/MirrorBranchComponent.js";
import {AddonTextSpriteComponent} from "./components/AddonTextSpriteComponent.js";
import {ExtrudeHolesComponent} from "./components/ExtrudeHolesComponent.js";
import {GenTerraBasicComponent} from "./components/GenTerraBasicComponent.js";
import {SimpleRaycastControlPlayerComponent} from "./components/SimpleRaycastControlPlayerComponent.js";
import {SimpleControlPlayerComponent} from "./components/SimpleControlPlayerComponent.js";


const game = new Register({
    config: {
        fps: 10,
        width: window.innerWidth,
        height: window.innerHeight,
        preload: [],
        keymap: {
            up: {pressed: false, codes: ['ArrowUp','KeyW'], callbacks: []},
            down: {pressed: false, codes: ['ArrowDown','KeyS'], callbacks: []},
            left: {pressed: false, codes: ['ArrowLeft','KeyA'], callbacks: []},
            right: {pressed: false, codes: ['ArrowRight','KeyD'], callbacks: []},
            jump: {pressed: false, codes: ['Space'], callbacks: []},

            space: {pressed: false, codes: ['Space'], callbacks: []},
            shift: {pressed: false, codes: ['ShiftLeft'], callbacks: []},
            ctrl: {pressed: false, codes: ['CtrlLeft'], callbacks: []},
            alt: {pressed: false, codes: ['AltLeft'], callbacks: []},

            q: {pressed: false, codes: ['KeyQ'], callbacks: []},
            e: {pressed: false, codes: ['KeyE'], callbacks: []},
            f: {pressed: false, codes: ['KeyF'], callbacks: []},
            r: {pressed: false, codes: ['KeyR'], callbacks: []},

            dig1: {pressed: false, codes: ['Digit1',], callbacks: []},
            dig2: {pressed: false, codes: ['Digit2',], callbacks: []},
            dig3: {pressed: false, codes: ['Digit3',], callbacks: []},
        },
    },

    state: {},
})

game.registerComponents({
    Menu: new MenuComponent(game),
    Def: new DefComponent(game, {menu: true, title: "I await for example"}),

    CellularAutomata: new CellularAutomataComponent(game, {menu: true, title: "Dungeon generator of Cellular Automata (simple)"}),
    LabyrinthDFSClassic: new LabyrinthDFSClassicComponent(game, {menu: true, title: "Labyrinth DFS generator Classic"}),
    DummyDungeonRooms: new DummyDungeonRoomsComponent(game, {menu: true, title: "\"Dummy\" Dungeon Rooms generator (ROGUE Style)"}),
    SceneBackgroundCanvasTexture: new SceneBackgroundCanvasTextureComponent(game, {menu: true, title: "Sky alternative. Scene.background = CanvasTexture"}),
    RandomWalk: new RandomWalkComponent(game, {menu: true, title: "Random Walk - Corridors generator"}),
    Sidewinder: new SidewinderComponent(game, {menu: true, title: "Sidewinder - Maze generator. simple and fast algoritm"}),
    BinaryTreeMaze: new BinaryTreeMazeComponent(game, {menu: true, title: "Binary Tree Maze. (max simpled)"}),
    MirrorBranch: new MirrorBranchComponent(game, {menu: true, title: "Mirror Branch Generator"}),
    AddonTextSprite: new AddonTextSpriteComponent(game, {menu: true, title: "TextSprite Component"}),
    ExtrudeHoles: new ExtrudeHolesComponent(game, {menu: true, title: "ExtrudeGeometry and Holes"}),
    GenTerraBasic: new GenTerraBasicComponent(game, {menu: true, title: "Basic Terran Generation"}),
    GenTerranQuads: new GenTerranQuadsComponent(game, {menu: true, title: "Terran Quads by Segments Generation (Noise BufferGeometry)"}),
    SimpleControlPlayer: new SimpleControlPlayerComponent(game, {menu: true, title: "Simple example of Camera Control Player"}),
    SimpleRaycastControlPlayer: new SimpleRaycastControlPlayerComponent(game, {menu: true, title: "Simple example of Camera Control Player with Ground Raycaster"}),
});


await game.setup()


if (location.hash.length > 1) {
    game.components.get(location.hash.slice(1)).mount()
} else {
    game.components.get("Menu").mount()
}

