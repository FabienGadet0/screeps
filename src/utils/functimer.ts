// import { Mnemonic, mnemon } from "./mnemonic";

export class FuncTimer {
    room_name: string;

    last_tick: number;
    time_interval: number;
    updater_target: string;

    constructor(room_name: string, updater_target: string, time_interval: number) {
        this.room_name = room_name;
        this.updater_target = updater_target;
        this.time_interval = time_interval;
        this.last_tick = 0;
    }

    locator() {
        return Memory.rooms_new[this.room_name].updater;
    }

    can_run() {
        return Game.time >= this.last_tick + this.time_interval;
    }

    run(fn: Function, ...args: any) {
        if (this.can_run()) {
            fn(args);
            this.locator()[this.updater_target] = Game.time;
        }
    }
}
