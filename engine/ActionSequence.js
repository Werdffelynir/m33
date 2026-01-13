import {Ut} from "./Ut.js";

/**
 *
 * ```
 * // Save
 * const saveData = sequence.exportData();
 * localStorage.setItem('npcScript', JSON.stringify(saveData));
 *
 * // Save Restore
 * const rawData = JSON.parse(localStorage.getItem('npcScript'));
 * const restored = ActionSequence.fromGameData(rawData, callbacks);
 * restored.start();
 *
 * // Example 1
 * const callbacksActions = {
 *   idle: {
 *     onStart: () => console.log('idle start'),
 *     onEnd: ({ next }) => next()
 *   },
 *   lookAround: {
 *     onStart: () => console.log('lookAround start'),
 *     onEnd: ({ next }) => next()
 *   },
 *   patrol: {
 *     onStart: () => console.log('patrol start'),
 *     onEnd: ({ loop }) => loop('idle')
 *   }
 * };
 *
 * const sequence = new ActionSequence(callbacksActions);
 *
 * sequence.start();
 *
 *
 * // Example 2
 * const sequence = new ActionSequence();
 * onUpdate
 *
 * sequence.add({
 *   id: 'idle',
 *   duration: 1000,
 *   onStart: () => console.log('[idle] NPC'),
 *   onEnd: ({ next }) => next()
 * });
 *
 * sequence.add({
 *   id: 'lookAround',
 *   duration: 500,
 *   onStart: () => console.log('[lookAround] NPC'),
 *   onEnd: ({ next }) => next()
 * });
 *
 * sequence.add({
 *   id: 'patrol',
 *   duration: 1500,
 *   onStart: () => console.log('[patrol] NPC'),
 *   onEnd: ({ loop }) => loop('idle') // Зациклити
 * });
 *
 * sequence.start();
 *
 *
 * loop () {
 *   sequence.update(delta)
 * }
 *
 *
 * ```
 *
 */
export class ActionSequence {

    constructor(actions = []) {
        this.set(actions);
        this.actions = actions;
        this.currentIndex = 0;
        /** @type {{onStart(),onUpdate(),onEnd()}} */
        this.current = null;
        this.elapsed = 0;
        this.finished = false;
        this.history = [];
    }

    set(actions) {
        if(Ut.isObject(actions)) {
            let _actions = [];
            Object.keys(actions).forEach(id => {
                actions[id].id = id;
                _actions.push(actions[id]);
            })
            actions = _actions;
        }

        if(Ut.isArray(actions))
            this.actions = actions;
        else
            console.warn(`ErrorParam! Set "actions" is not type {Array} | {Object}`)
    }

    start() {
        if (this.actions.length === 0) return;

        this.finished = false;
        this.currentIndex = 0;
        this.elapsed = 0;
        this.current = this.actions[this.currentIndex];
        this.history = [this.currentIndex];
        this.current?.onStart?.();
    }

    update(delta) {
        if (this.finished || !this.current) return;
        this.elapsed += delta;
        this.current.onUpdate?.(delta);

        if (this.current.duration && this.elapsed >= this.current.duration) {
            const currentAction = this.current;
            const next = () => this.next();
            const goto = (id) => this.goto(id);
            const loop = (id) => this.loop(id);
            const back = () => this.back();

            currentAction.onEnd?.({ next, goto, loop, back });
        }
    }

    next() {
        this.elapsed = 0;
        this.currentIndex++;
        if (this.currentIndex >= this.actions.length) {
            this.finished = true;
            this.current = null;
            return;
        }
        this.current = this.actions[this.currentIndex];
        this.history.push(this.currentIndex);
        this.current?.onStart?.();
    }

    goto(id) {
        const index = this.actions.findIndex(act => act.id === id);
        if (index !== -1) {
            this.elapsed = 0;
            this.currentIndex = index;
            this.current = this.actions[this.currentIndex];
            this.history.push(this.currentIndex);
            this.current?.onStart?.();
        }
    }

    loop(id) {
        this.goto(id);
    }

    back() {
        if (this.history.length > 1) {
            this.history.pop();
            const prevIndex = this.history[this.history.length - 1];
            this.currentIndex = prevIndex;
            this.current = this.actions[this.currentIndex];
            this.elapsed = 0;
            this.current?.onStart?.();
        }
    }

    reset() {
        this.currentIndex = 0;
        this.elapsed = 0;
        this.current = this.actions[0];
        this.history = [0];
        this.finished = false;
        this.current?.onStart?.();
    }

    stop() {
        this.finished = true;
        this.current = null;
    }

    isFinished() {
        return this.finished;
    }


    add(action) {
        this.actions.push(action);
    }

    exportData() {
        return {
            actions: this.actions.map(a => ({
                id: a.id,
                duration: a.duration ?? null
                // функції не зберігаємо
            })),
            currentIndex: this.currentIndex,
            elapsed: this.elapsed,
            history: [...this.history],
            finished: this.finished
        };
    }

    static fromGameData(data, callbacksById = {}) {
        const actions = data.actions.map((a) => ({
            id: a.id,
            duration: a.duration,
            ...callbacksById[a.id] // вставляємо функції по id
        }));

        const seq = new ActionSequence(actions);
        seq.currentIndex = data.currentIndex;
        seq.elapsed = data.elapsed;
        seq.finished = data.finished;
        seq.history = [...data.history];
        seq.current = seq.actions[seq.currentIndex] || null;

        return seq;
    }
}
