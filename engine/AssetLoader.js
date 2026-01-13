import {IManager} from "./IManager.js";

/**
 * ```
 *
 * const manifest = [
 *     { type: 'image', name: 'ship', url: './assets/images/ship.png' },
 *     { type: 'json', name: 'galaxyMap', url: './assets/maps/galaxy.json' },
 * ];
 * loader = new AssetLoader();
 *
 *
 * loader.get()
 *
 *
 * await loader.preload(manifest);
 * await loader.loadImage( 'ship', './assets/images/ship.png' )
 * await loader.loadJSON( 'galaxyMap', './assets/maps/galaxy.json' )
 * ```
 */
export class AssetLoader extends IManager {

    configured(params) {
        this.cache = {};
        this.preload = params?.preload ?? [];


        if (params?.soundManager)
            this.setSoundManager(params.soundManager);
        else
            console.warn(`SoundManager not installed`)
    }

    /**
     * ```
     * const manifest = [
     *     { type: 'image', name: 'ship', url: './assets/images/ship.png' },
     *     { type: 'json', name: 'galaxyMap', url: './assets/maps/galaxy.json' },
     *     { type: 'audio', name: 'click', url: './assets/sfx/click5.mp3' },
     *     { type: 'text', name: 'quest_suq1', url: './assets/quests/quest_suq1.text' },
     * ];
     * ```
     * @param params.preload
     * @returns {Promise<void>}
     */
    async init(preload) {
        if (preload && Array.isArray( preload )) this.preload = preload; // [...new Set([...this.preload, ...preload])]

        for (let res of this.preload ) {
            switch (res.type) {
                case 'blob':
                    await this.loadBlob(res.name, res.url);
                    break;
                case 'json':
                    await this.loadJSON(res.name, res.url);
                    break;
                case 'image':
                    await this.loadImage(res.name, res.url);
                    break;
                case 'text':
                    await this.loadText(res.name, res.url);
                    break;
                case 'audio':
                    if (this.soundManager){
                        const sound = await this.soundManager.load(res.name, res.url);
                        if (!this.cache[res.name]) this.cache[res.name] = sound;
                    } else {  throw new Error('Loader for audio not ready now') }

                    break;
                default:
                    throw new Error(`Loader type ${res.type} not found`)
            }
        }
    }

    setSoundManager(sm) {
        this.soundManager = sm;
    }

    async loadImage(name, url, cached = true) {

        if (!this.cache) {
           return console.warn(`Class is not configured`)
        }

        if (this.cache[name] && cached) return this.cache[name];

        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                this.cache[name] = img;

                resolve(img);
            };
            img.src = url;
        });
    }

    async loadJSON(name, url, cached = true) {
        if (this.cache[name] && cached) return this.cache[name];
        const response = await fetch(url);
        const data = await response.json(true);
        this.cache[name] = data;
        return data;
    }

    async loadText(name, url, cached = true) {
        if (this.cache[name] && cached) return this.cache[name];
        const response = await fetch(url);
        const data = await response.text();
        this.cache[name] = data;
        return data;
    }

    async loadBlob(name, url, cached = true) {
        if (this.cache[name] && cached) return this.cache[name];
        const response = await fetch(url);
        const blob = await response.blob();
        this.cache[name] = blob;
        return blob;
    }

    get(name) {
        return this.cache[name];
    }
}
