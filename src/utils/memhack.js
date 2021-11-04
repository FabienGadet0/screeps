//to use, import into your main js/ts file, and then export the result of wrap function as your game loop. Pass in a function containing all your actual game logic as the parameter fn
//for example:
//let Memhack = require("memhack.js");
//export const loop = Memhack.wrap(() =>
//{
// YOUR CODE HERE
//});

const ENABLE_MEMHACK = true;

export function wrap(fn) {

    if(!ENABLE_MEMHACK)
    {
        console.log("Memhack is disabled");
        return fn;
    }
    var memory;
    var tick;

    console.log("Applying memhack");
    return () => {
        if (tick && tick + 1 === Game.time && memory) {
            // this line is required to disable the default Memory deserialization
            delete global.Memory;
            global.Memory = memory;
        } else {
            memory = Memory;
        }

        tick = Game.time;

        fn();

        // there are two ways of saving Memory with different advantages and disadvantages
        // 1. RawMemory.set(JSON.stringify(Memory));
        // + ability to use custom serialization method
        // - you have to pay for serialization
        // - unable to edit Memory via Memory watcher or console
        // 2. RawMemory._parsed = Memory;
        // - undocumented functionality, could get removed at any time
        // + the server will take care of serialization, it doesn't cost any CPU on your site
        // + maintain full functionality including Memory watcher and console

        // this implementation uses the official way of saving Memory
        RawMemory.set(JSON.stringify(Memory));
    };
};
