
/**
 *
 * tasks.add('spawnBoss', () => spawnBoss());
 *
 * if function `spawnBoss` returns `false` - this repeat callback. if any value other than false is not repeats
 *
 * ```
 * const tasks = new DeferredQueue();
 *
 * tasks.add('spawnBoss', () => spawnBoss());
 *
 * tasks.add('enableShields', () => player.enableShields());
 *
 * tasks.add('movement', () => {
 *      player.x ++
 *      return player.x < 300 // used condition, next tasks after that return true!
 * });
 *
 * tasks.run('spawnBoss');
 *
 * tasks.run('movement'); // repeats until player.x less 300
 * ```
 *
 * @param queues {[]}
 */
export class DeferredQueue {

    constructor(queues = []) {
        this.queue = new Map();
        queues.forEach((queue) => this.add(queue.id, queue.task))
    }

    add(id, task) {
        if (typeof task !== 'function')
            throw new Error(`{DeferredQueue.add} task parameter is not function type`);

        this.queue.set(id, task);
    }

    run(id, transmittedData) {
        const queueTask = this.queue.get(id);

        const condition = queueTask(transmittedData);
        if (typeof condition === "boolean" && condition === false) {
            return false
        }

        this.queue.delete(id);
    }

    clear(id) {
        this.queue.delete(id);
    }

    clearAll() {
        this.queue.clear();
    }

    runAll(transmittedData) {
        for (let [id, task] of this.queue) {
            this.run(id, transmittedData);
        }
    }
}

