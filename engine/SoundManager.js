/**
 *
 * starts playing a sound by name
 * play(name, options = {}) {}
 *      options {volume: 1, loop: false, several: false, start: 0, end: 600})
 *          volume - increase the sound volume. value as standard from 0 to 1
 *          loop - looped sound, if `loop` is `true`, set `several` is always `false`
 *          several - sound can be played several times, one on top of the other
 *          start - start position time, not set by default
 *          end - end position time, not set by default
 *
 * sets the volume for all audio
 * setMasterVolume(value){}
 *
 * set the volume for a sound by name
 * setVolume(name, value){}
 *
 * turn on sound by name
 * unmute(name){}
 *
 * mute by name
 * mute(name){}
 *
 * stop all
 * stop(){}
 *
 * resume all
 * resume(){}
 *
 * ```
 * const sm = new SoundsManager();
 *
 * await sm.load('explosion', '/sounds/explosion.wav');
 * sm.play('explosion', { volume: 0.8 });
 *
 * sm.mute('explosion');
 * sm.unmute('explosion');
 *
 * sm.setVolume('explosion', 0.5);
 * sm.setMasterVolume(0.7);
 * sm.stop();
 * sm.resume();
 * ```
 *
 */
export class SoundManager {

    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.buffers = new Map();
        this.sources = new Map();
        this.volumes = new Map();
        this.muted = new Set();

        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        this.setMasterVolume(1);
    }

    async load(name, url) {
        if (this.buffers.has(name)) return;
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
        this.buffers.set(name, audioBuffer);
        return this;
    }

    /**
     *
     * starts playing a sound by name
     * play(name, options = {}) {}
     *      options {volume: 1, loop: false, several: false, start: 0, end: 600}
     *          volume - increase the sound volume. value as standard from 0 to 1
     *          loop - looped sound, if `loop` is `true`, set `several` is always `false`
     *          several - sound can be played several times, one on top of the other
     *          start - start position time, not set by default
     *          end - end position time, not set by default
     * ```
     * play(name,  { volume: 1, loop: false, several: false, start: 0, end: undefined }  )
     * ```
     */
    play(name, options = {}) {
        const buffer = this.buffers.get(name);
        if (!buffer) return;

        const {
            volume = 1,
            loop = false,
            several = false,
            start = 0,
            end = undefined,
            muted = true,
        } = options;

        if ((!several || loop) && this.sources.has(name)) {
            this.stop(name);
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;

        const gainNode = this.context.createGain();

        if (muted)
            gainNode.gain.value = this.muted.has(name) ? 0 : volume;
        else
            gainNode.gain.value = volume;

        source.connect(gainNode).connect(this.masterGain);

        source.start(0, start, end ? end - start : undefined);

        source.addEventListener('ended', () => {
            const list = this.sources.get(name);
            if (!list) return;
            const index = list.findIndex(entry => entry.source === source);
            if (index !== -1) {
                list.splice(index, 1);
                if (list.length === 0) {
                    this.sources.delete(name);
                }
            }
        });

        if (!this.sources.has(name)) this.sources.set(name, []);
        this.sources.get(name).push({source, gainNode});
        this.volumes.set(name, volume);

        if (this.sources.size > 100) {
            console.warn(`SoundsManager sources.size more 100 objects`)
        }
    }

    setMasterVolume(value) {
        this.masterGain.gain.value = value;
    }

    setVolume(name, value) {
        const list = this.sources.get(name) || [];
        list.forEach(({gainNode}) => gainNode.gain.value = this.muted.has(name) ? 0 : value);
        this.volumes.set(name, value);
    }

    static SOUND_STATUS_MUTED = 'muted';
    static SOUND_STATUS_RUNNING = 'running';
    static SOUND_STATUS_SUSPENDED = 'suspended';

    /**
     * getStatus('sound') === SoundManager.SOUND_STATUS_MUTED
     * @param name
     * @returns {string} 'none', 'muted', 'running', 'suspended', 'closed'
     */
    getStatus(name) {
        let _state = this.sources.has(name) && this.sources.get(name).length
            ? this.muted.has(name)
                ? 'muted' : this.sources.get(name)[0].gainNode.context.state
            : 'none';

        return _state;
    }

    currentTime(name) {
        return this.sources.has(name) && this.sources.get(name).length ? this.sources.get(name)[0].context.currentTime : false
    }

    mute(name) {
        if (this.muted.has(name)) return;

        this.muted.add(name);
        const list = this.sources.get(name) || [];
        list.forEach(({gainNode}) => gainNode.gain.value = 0);
    }

    unmute(name) {
        if (!this.muted.has(name)) return;

        this.muted.delete(name);
        const vol = this.volumes.get(name) ?? 1;
        const list = this.sources.get(name) || [];
        list.forEach(({gainNode}) => gainNode.gain.value = vol);
    }

    stop(name) {
        if (name) {
            const list = this.sources.get(name) || [];
            list.forEach(({source}) => {
                try {
                    source.stop();
                } catch (e) {
                }
            });
            this.sources.delete(name);
        } else {
            this.sources.forEach(list => list.forEach(({source}) => {
                try {
                    source.stop();
                } catch (e) {
                }
            }));
            this.sources.clear();
        }
    }

    pauseToggle(name) {
        const status = this.getStatus(name);

        if (status === SoundManager.SOUND_STATUS_MUTED) {
            this.unmute(name);
        } else if (status === SoundManager.SOUND_STATUS_RUNNING) {
            this.mute(name);
        } else if (status === SoundManager.SOUND_STATUS_SUSPENDED) {
            this.resume();
        }
    }

    pause() {
        if (this.context.state === 'running') {
            return this.context.suspend();
        }
    }

    resume() {
        if (this.context.state === 'suspended') {
            return this.context.resume();
        }
    }
}

