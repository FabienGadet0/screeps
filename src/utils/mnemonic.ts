export interface Mnemonic {
    // Returns the object which property accesses will occur against
    locator(): any;
}

// Property decorator
export const mnemon = (target: Mnemonic, key: string) => {
    const initGetter = function (this: any) {
        const chunk = this.locator();
        replaceProperty(this, chunk);
        return chunk[key];
    };

    const initSetter = function (this: any, val: any) {
        const chunk = this.locator();
        replaceProperty(this, chunk);
        chunk[key] = val;
    };

    const replaceProperty = (obj: any, chunk: any) => {
        const newGetter = () => {
            return chunk[key];
        };

        const newSetter = (val: any) => {
            chunk[key] = val;
        };

        Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: true,
            get: newGetter,
            set: newSetter,
        });
    };
    Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        get: initGetter,
        set: initSetter,
    });
};
