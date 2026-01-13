

```js

class DemoExampleState extends IState {

    count = 0;

    /**
     *  Apply changes in action files.
     *  Determination of behavior depending on the change of state
     *
     * @param register {Register|any}
     */
    async setup({register}) {
        this.register = register;
        this.excluded = ['register', 'excluded', 'deepMixed', 'mixed'];

        this.reactive.on('count', (v) => {
            console.log(v)
        })
    }

    increment(props) {
        this.count++;
    }

    deepMixed(state) {
        const merge = (target, source) => {
            for (const [key, value] of Object.entries(source)) {
                if (
                    typeof value === 'object' &&
                    value !== null &&
                    typeof target[key] === 'object' &&
                    target[key] !== null
                ) {
                    merge(target[key], value);
                } else if (key in target) {
                    target[key] = value;
                }
            }
        };
        merge(this, state);
    }

}


// parts of main state example
// this.state.set('ObjectState', {...new ObjectState({}, {register:this.register})});
class ObjectState extends IState {
    constructor(state = {}, {register}) {
        super();
        register.eventBus.subscribe('playman:installed', (payload) => {
            register.state.on('vessel.enginOn', (name, value, prevValue) => {
                console.log('{ VesselState.enginOn changed! } ', name, value, prevValue)
            });
        })
    }
}



class DemoState extends IState {

    ui = {
        title: '',
    }

    constructor(state) {
        super(state);
        Object.keys(state).forEach(k => this[k] = state[k]);
    }
}

```