
/**
 *
 * ```
 * let i = 0;
 *
 * const tasks = new DeferredTasks([
 *     () => { return i < 1000 },
 *     () => { return i < 2000 },
 * ]);
 *
 *
 * loop(delta) {
 *     this.tasks.updateTasks(delta);
 * }
 *
 *
 * await game.tasks.waitUntil(() => player.near(planet));
 * console.log('The player has approached the planet!');
 *
 * waitForSeconds(2);
 * waitForEvent('planet:scanned');
 * waitNextFrame();
 * ```
 */
export class DeferredTasks {

    constructor(tasks = []) {
        this._tasks = new Set();
        this.registerTasks(tasks)
     }

     registerTasks (callbacks) {
         for (const task of callbacks) {
             if (typeof task === 'function')
                 this._tasks.add(this.waitUntil(task))
             else
                 throw new Error(`Deferred Tasks one of received task is not function type: "${(typeof task)}"`)
         }
     }

    /**
     * Called externally every frame (e.g. from Register.update)
     */
    updateTasks(delta) {
        for (let task of this._tasks) {

            if (task.check(delta)) {
                task.resolve();
                this._tasks.delete(task);
            }
        }
    }

    /**
     * Waiting for the condition to be met
     *
     * @param {() => boolean} condition
     * @returns {Promise<void>}
     */
    waitUntil(condition) {
        return new Promise(resolve => {
            this._tasks.add({
                check: condition,
                resolve
            });
        });
    }

    clear() {
        this._tasks.clear();
    }
}
