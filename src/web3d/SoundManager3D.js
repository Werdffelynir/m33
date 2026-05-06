import * as THREE from "three";
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper.js';



export class SoundManager3D {

    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);

        this.loader = new THREE.AudioLoader();
        this.buffers = new Map();
        this.sounds = new Map();

        this.masterVolume = 1.0;
        this.sfxVolume = 1.0;
        this.musicVolume = 0.5;

        // Initialize Filter
        this.lowPassFilter = this.listener.context.createBiquadFilter();
        this.lowPassFilter.type = 'lowpass';
        this.lowPassFilter.frequency.value = 22000;

    }

    async loadSound(name, url) {
        if (this.buffers.has(name)) return this.buffers.get(name);
        try {
            const buffer = await this.loader.loadAsync(url);
            this.buffers.set(name, buffer);
            return buffer;
        } catch (error) {
            console.error(`Failed to load audio: ${url}`, error);
            throw error;
        }
    }

    async loadSoundsBatch(sounds) {
        const entries = Object.entries(sounds);

        const loadingPromises = entries.map(async ([name, url]) => {
            const buffer = await this.preloadSound(name, url);
            return [name, buffer];
        });

        const results = await Promise.all(loadingPromises);

        return Object.fromEntries(results);
    }

    async rawSound(name, rawData) {
        let arrayBuffer = (rawData instanceof ArrayBuffer) ? rawData : await rawData.arrayBuffer();
        const audioBuffer = await this.listener.context.decodeAudioData(arrayBuffer);
        this.buffers.set(name, audioBuffer);
        return audioBuffer;
    }

    async rawSoundsBatch(soundsData) {
        const entries = Object.entries(soundsData);

        const processingPromises = entries.map(async ([name, data]) => {
            const audioBuffer = await this.rawSound(name, data);
            return [name, audioBuffer];
        });

        const results = await Promise.all(processingPromises);

        return Object.fromEntries(results);
    }

    /**
     * Internal method to clear memory after sound is finished
     */
    _manageLifeCycle(sound) {
        const originalOnEnded = sound.onEnded;

        sound.onEnded = () => {
            if (originalOnEnded) originalOnEnded();
            this._cleanupSound(sound);
        };

        // If sound is looping, we need a "zombie" check
        if (sound.getLoop()) {
            const checkParent = () => {
                // If sound was stopped or removed from mesh
                if (!this.sounds.has(sound)) return;

                // Check if the mesh (parent) is still in the scene
                if (sound.parent) {
                    // Check if parent eventually reaches the Scene
                    let isAttached = false;
                    sound.traverseAncestors((ancestor) => {
                        if (ancestor.type === 'Scene') isAttached = true;
                    });

                    if (!isAttached) {
                        this._cleanupSound(sound);
                        return;
                    }

                    // Re-check after 1 second (don't do this every frame!)
                    setTimeout(checkParent, 1000);
                } else {
                    this._cleanupSound(sound);
                }
            };

            // Start monitoring
            setTimeout(checkParent, 1000);
        }
    }

    /**
     * @param {THREE.Audio|String} sound - Sound object
     */
    _cleanupSound(sound) {
        if (sound?.constructor === String)
            sound = this.sounds.get(sound);

        if (!sound) return;
        if (sound.isPlaying) sound.stop();

        this.sounds.delete(name);

        if (sound.parent)
            sound.parent.remove(sound);

        sound.disconnect();
    }


    setGlobal(name, {
        volume = 1,
        isMusic = true,
        loop = false,
        once = true,
    } = {}) {
        const buffer = this.buffers.get(name);
        if (!buffer)
            return console.warn(`Sound ${name} not loaded!`);

        const sound = new THREE.Audio(this.listener);
        sound.setBuffer(buffer);
        sound.setLoop(loop);

        volume = (volume || 1) * this.masterVolume * (isMusic ? this.musicVolume : this.sfxVolume);
        sound.setVolume(volume);

        this.sounds.set(name, sound);

        if (once && !loop) {
            sound.onEnded = () => this._cleanupSound(name);
        }

        return sound;
    }

    setPositional(name, target, {
        refDistance = 1,
        maxDistance = 20,
        distanceModel = 'linear',
        rolloff = 1,
        loop = true,
        volume = 1,
        isMusic = true,
        cone = [],
        position = [0, 0, 0],
        helper = false,
        rename = false,
        once = false,
    } = {}) {
        const buffer = this.buffers.get(name);
        if (!buffer) return;

        const sound = new THREE.PositionalAudio(this.listener);
        sound.setBuffer(buffer);
        sound.setLoop(loop || false);
        sound.setRefDistance(refDistance || 1);
        sound.setRolloffFactor(rolloff || 1);
        sound.setDistanceModel(distanceModel || 'inverse');
        sound.setMaxDistance(maxDistance || 10);

        if (cone.length === 3) sound.setDirectionalCone(...cone);

        volume = (volume || 1) * this.masterVolume * (isMusic ? this.musicVolume : this.sfxVolume);
        sound.setVolume(volume);

        sound.position.fromArray(position || [0, 0, 0]);

        if (target instanceof THREE.Object3D) {
            target.add(sound);
        } else if (target instanceof THREE.Vector3) {
            const anchor = new THREE.Object3D();
            anchor.position.copy(target);
            this.scene.add(anchor);
            anchor.add(sound);
            // Cleanup anchor on end
            sound.onEnded = () => {
                this.scene.remove(anchor);
            };
        }

        if (helper) {
            // Import PositionalAudioHelper from three/addons/helpers/PositionalAudioHelper.js
            const audioHelper = new PositionalAudioHelper(sound, maxDistance);
            sound.add(audioHelper);
            sound.onEnded = () => sound.remove(audioHelper);
        }

        this.sounds.set(rename || name, sound);

        if (once && !loop) {
            sound.onEnded = () => this._cleanupSound(rename || name);
        }

        return sound;
    }

    /**
     * @param {THREE.Audio|String} sound - Sound object
     * @param active
     * @param duration
     */
    setMuffled(sound, active, duration = 0.5) {

        if (sound?.constructor === String)
            sound = this.sounds.get(sound);

        if (!(sound instanceof THREE.Audio)) throw new Error(`Sound ${sound} not found.`);

        const targetFreq = active ? 400 : 22000;
        this.lowPassFilter.frequency.exponentialRampToValueAtTime(
            targetFreq,
            this.listener.context.currentTime + duration
        );

        if (sound?.isPlaying === true)
            sound.setFilters(active ? [this.lowPassFilter] : []);
    }



    /**
     * Fade In (Rise): Sound appears from silence. Volume goes from 0 to 1.
     * @param {THREE.Audio|String} sound - Sound object
     * @param {number} duration - Duration in seconds
     * @param {number} targetVolume - Target volume (0-1)
     */
    fadeIn(sound, duration = 1.5, targetVolume = 1.0) {
        if (sound?.constructor === String) sound = this.sounds.get(sound);
        if (!(sound instanceof THREE.Audio)) throw new Error(`Sound ${sound} not found.`);

        const gainNode = sound.gain.gain;
        const now = this.listener.context.currentTime; // sound.context.currentTime

        gainNode.cancelScheduledValues(now);
        // gainNode.setValueAtTime(gainNode.value, now);
        gainNode.setValueAtTime(0, now);
        gainNode.linearRampToValueAtTime(targetVolume, now + duration);

        if (this.listener.context.state !== 'suspended' && !sound.isPlaying)
            sound.play();
    }

    /**
     * Fade Out (Fade): The sound fades out. The volume goes from 1 to 0.
     * @param {THREE.Audio| String} sound - Sound object
     * @param {number} duration - Duration in seconds
     * @param {boolean} stopAfter - Whether to stop the sound completely after fading out
     */
    fadeOut(sound, duration = 1.5, stopAfter = true, cleanAfter = false) {
        if (sound?.constructor === String) sound = this.sounds.get(sound);
        if (!(sound instanceof THREE.Audio)) throw new Error(`Sound ${sound} not found.`);

        const gainNode = sound.gain.gain;
        const now = this.listener.context.currentTime;

        gainNode.cancelScheduledValues(now);
        gainNode.setValueAtTime(gainNode.value, now);
        gainNode.linearRampToValueAtTime(0, now + duration);

        if (stopAfter) {
            // Schedule the actual stop on the AudioContext clock
            setTimeout(() => this._cleanupSound(sound), duration * 1000);

            // setTimeout(() => {
            //
            //     if (cleanAfter)
            //         this._cleanupSound(sound)
            //
            //     else if (this.listener.context.state !== 'suspended' && !sound.isPlaying)
            //         sound.stop();
            //
            // }, duration * 1000)

        }
    }

    /**
     * Smooth transition between two sounds (Crossfade)
     * For example, changing the background music when moving to another location
     */
    crossfade(soundOut, soundIn, duration = 2.0) {
        this.fadeOut(soundOut, duration, true);
        this.fadeIn(soundIn, duration, soundIn.userData.targetVol || 1.0);
    }

    /**
     * ```
     * soundManager.stopAllFromObject(enemyMesh);
     * scene.remove(enemyMesh);
     * ```
     * Clean up all sounds attached to a specific object
     * Call this before mesh = null or scene.remove(mesh)
     */
    stopAllFromObject(mesh) {
        const toRemove = [];

        this.sounds.forEach(sound => {
            if (sound.parent === mesh || mesh.children.includes(sound)) {
                toRemove.push(sound);
            }
        });

        toRemove.forEach(sound => this._cleanupSound(sound));
    }



    // CONTROLS

    async resumeContext() {
        if (this.listener.context.state === 'suspended') {
            await this.listener.context.resume();
        }
    }

    play(name) {
        /** @type {THREE.PositionalAudio} */
        const sound = this.sounds.get(name)
        sound.play()
    }

    playAll() {
        this.sounds.forEach((sound) => {
            if (sound.isPlaying !== true) sound.play()
        })

    }

    pause(name) {
        const sound =this.sounds.get(name)
        sound.pause()
    }


    async pauseAll() {
        const context = this.listener.context;
        if (context.state === 'running') {
            await context.suspend();
        }
    }

    async resumeAll() {
        const context = this.listener.context;
        if (context.state === 'suspended') {
            await context.resume();
        }
    }

    stopAll() {
        this.sounds.forEach(sound => this._cleanupSound(sound))
    }
}


