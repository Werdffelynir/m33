
export class DBFile {

    dbFileHandle = null;

    async initDBFile(props = {open: true, data: {}}) {

        const filename = props?.filename ||'database.json'
        const open = !!props?.open
        const data = props?.data || {}

        try {
            if (open) {
                const [handle] = await window.showOpenFilePicker({
                    types: [{
                        description: 'JSON Database',
                        accept: { 'application/json': ['.json'] }
                    }],
                    excludeAcceptAllOption: true,
                    multiple: false
                });
                this.dbFileHandle = handle;
                console.log('Existing DB file selected:', this.dbFileHandle.name);
            } else {
                this.dbFileHandle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'JSON Database',
                        accept: { 'application/json': ['.json'] }
                    }]
                });

                // Create an empty file immediately
                const writable = await this.dbFileHandle.createWritable();
                await writable.write(JSON.stringify(data, null, 2));
                await writable.close();

                console.log('New DB file created:', this.dbFileHandle.name);
            }

        } catch (err) {
            console.error('Failed to initialize DB file:', err);
            return;
        }

        return this.dbFileHandle;
    }
    async readDBFile() {
        if (!this.dbFileHandle) {
            console.warn("DB file is not initialized. Call initDBFile() first.");
            return;
        }

        try {
            const file = await this.dbFileHandle.getFile();
            const contents = await file.text();
            return JSON.parse(contents);
        } catch (err) {
            console.error("Failed to read DB file:", err);
            throw err;
        }
    }
    async writeDBFile(data) {
        if (!this.dbFileHandle) {
            console.warn("DB file is not initialized. Call initDBFile() first.")
            return;
        }

        try {
            const writable = await this.dbFileHandle.createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
            console.log("DB file saved successfully.");

            return true;
        } catch (err) {
            console.error("Failed to write DB file:", err);
            throw err;
        }
    }
}



