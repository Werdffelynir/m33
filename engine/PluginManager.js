import {IManager} from "./IManager.js";

/**
 * ## Events:
 *  - plugin:registered:${name}
 *  - plugin:installed:${name}
 */
export class PluginManager extends IManager {

    configured(params) {
        this.pluginsPath = params?.pluginsPath || '../plugins/';
        this.pluginsList = params?.pluginsList || [];
    }


    async setupConfigured() {
        for (let path of this.pluginsList) {
            const { default: instance } = await import(this.pluginsPath + path);
            const classes = {};
            classes[instance.id] = instance;

            this.registerPlugins(classes)
        }
    }

    registerPlugins(classes) {
        for (const [name, instance] of Object.entries(classes)) {

            this.register.eventBus.publish(`plugin:registered:${name}`, {name, data: instance})

            if (instance?.setup) {
                instance.setup(this.register);
                instance.installed = true;
                this.register.eventBus.publish(`plugin:installed:${name}`, {name, data: instance})
            }

            this.set(name, instance);
        }
    }
}


