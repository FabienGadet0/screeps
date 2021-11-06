import { Mnemonic, mnemon } from "./mnemonic";
import { round_lvl } from "./utils";

enum LOG_LVL {
    DEBUG = 0,
    WARN,
    ERROR,
    LOG,
}

export class Terminal {
    //implements Mnemonic{
    // @mnemon
    log_lvl: LOG_LVL;
    last_room: string;

    constructor() {
        this.log_lvl = LOG_LVL.LOG;
        this.last_room = "";
    }

    public build_plan(room_name: string, key: string) {
        if (Memory.rooms_new[room_name].build_plan[key]) {
            // this.last_room = room_name;
            Memory.rooms_new[room_name].build_plan[key] = true;
        } else console.log(`[ERROR] ${key} doesn't exist in ${Object.keys(Memory.rooms_new[room_name].build_plan[key].commands)}`);
    }

    public command(room_name: string, key: string) {
        if (Memory.rooms_new[room_name].commands[key]) {
            // this.last_room = room_name;
            Memory.rooms_new[room_name].commands[key] = true;
        } else console.log(`[ERROR] ${key} doesn't exist in ${Object.keys(Memory.rooms_new[room_name].commands)}`);
    }

    public lvl(room_name: string, lvl: number) {
        if (Memory.rooms_new[room_name]) {
            // this.last_room = room_name;
            Memory.rooms_new[room_name].lvl = round_lvl(lvl);
        } else console.log(`[ERROR] ${room_name} doesn't exist in ${Object.keys(Memory.rooms_new)}`);
    }

    public help(): boolean {
        console.log("Commands :");
        console.log("- build_plan(room_name,key_to_update) -> update variable in build_plan of room");
        console.log("- command(room_name,key)              -> update commands in rooms_new");
        console.log("- this.lvl(room_name,lvl)             -> update lvl of a room , lvl will be rounded");
        return true;
    }
    //todo ADD UPDATE rooms component.

    // locator() {
    //     return Memory.commands
    // }
}
