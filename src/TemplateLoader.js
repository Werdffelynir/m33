
export class TemplateLoader {
    constructor(eventBus) {
        this.cache = new Map();
        this.eventBus = eventBus;
    }

    async load(url) {
        if (this.cache.has(url))
            return this.cache.get(url);

        const response = await fetch(url);

        if (response.status !== 200)
            throw new Error(`{TemplateLoader.load} status ${response.status }`)

        const data = await response.text();
        const div = document.createElement('div')

        div.innerHTML = data;
        const element = div.firstElementChild;

        this.cache.set(url, element);
        return element;
    }
}

