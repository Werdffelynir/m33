/**
 *
 * ```
 * deferredTask = new ActionCondition( TASK_FUNCTION, CONDITION_FUNCTION )
 * deferredTask.update();
 * deferredTask.run();
 *
 * // Example 1
 * const task = new ActionCondition(() => {
 *     console.log('Task completed!');
 * }, true);
 *
 * task.run();
 *
 * // Example 2
 * const task = new ActionCondition(() => {
 *     console.log('Task completed!');
 * }, () => vessel.isDocked );
 *
 * task.run();
 *
 * // Place in the update loop function! to make it work
 * loop () {
 *      task.update();
 * }
 * ```
 */
export class ActionCondition {

    constructor(action, condition) {
        this.action = action;
        this.condition = (typeof condition === 'function') ? condition : () => true;
        this.executed = false;
    }

    run(params) {
        if (!this.executed) {
            this.action?.(params);
            this.executed = true;
        }
    }

    update() {
        if (!this.executed && this.condition()) {
            this.action();
            this.executed = true;
        }
    }
}
