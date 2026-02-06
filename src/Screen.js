/**
 * events chain
 *  - create
 *  - render
 *  - attach
 *  - setup
 *  - change
 *  --- switch controller
 *  - detach
 *  - destroy
 *
 *
 *
 *
 */
export class Screen {

    constructor(register) {
        this.register = register;
        this.parent = null;
        this._attached = false;

        this.create();
    }

    // should be called only once.
    // if switch Controller is called, "setup" is applied first, then "init"
    setup(params) {
        if (this._installed) return;
        this._installed = true;

        GLog(1, `{${this.constructor.name}.setup}`)
    }

    // called every time when called ScreenManager.change
    // auto-call chain
    // Use: ScreenManager.change
    async change(params) {
        // Use
        GLog(1, `{${this.constructor.name}.change}`)
    }

    // can be changed to form a new template, user interface logic
    create({root} = {}) {
        GLog(1, `{${this.constructor.name}.create}`)

        if (root && root.nodeType === Node.ELEMENT_NODE) {
            this.root = root;
        } else {
            this.root = document.createElement('div');
        }

        this.root.id = this.constructor.name;

        return this.root;
    }

    render({parent, root}) {

    }

    destroy() {
        this.detach();
        GLog(1, `{${this.constructor.name}.destroy}`)
    }

    // auto-call chain ScreenManager.change
    attach(parent) {
        if (this._attached) return;

        this.parent = parent;
        this.render({root: this.root, parent: this.parent});

        this.parent.appendChild(this.root);
        this._attached = true;
        this._installed = false;
        GLog(1, `{${this.constructor.name}.attach}`)
    }

    // detached view
    detach(parent) {
        if (parent) this.parent = parent;
        if (this._attached && this.root.parentNode) {
            // todo ? this.root.remove();
            this.parent.removeChild(this.root)
            this._attached = false;
        }
        GLog(1, `{${this.constructor.name}.detach}`, this._attached && this.root.parentNode)
    }

    // replace view
    replace(template) {
        if (template instanceof Node) {
            // this.detach();
            // this.root.textContent = '';
            this.root.firstElementChild?.remove()
            this.root.appendChild( template)
            // this.attach();
        } else {
            throw Error (`{Screen.replace(template)} template is not type Node`);
        }
        GLog(1, `{${this.constructor.name}.replace}`)
    }

    // append view
    append(template) {
        if (template instanceof Node) {
            this.root.appendChild(template);
        } else {
            throw Error (`{Screen.append(template)} template is not type Node`);
        }
        GLog(1, `{${this.constructor.name}.append}`)
    }

    regulate() {
        // reserved for dynamic interface adjustment (possible: resize, adaptation)
    }

}

