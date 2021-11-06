import * as Utils from "./utils";
import * as Profiler from "../Profiler/Profiler";
import { Room_orchestrator } from "classes/room_orchestrator";
import { Terminal } from "./terminal";

declare global {
    namespace NodeJS {
        interface Global {
            log: any;
            warn: any;
            err: any;
            error: any;

            Profiler: any;
            Memory: any;
            lvl: any;
            command: any;
            build_plan: any;
            help: any;
        }
    }
    interface Number {
        between: (a: number, b: number) => boolean;
    }
    interface Array<T> {
        remove(obj: any): void;
    }

    interface RoomVisual {
        box(x: number, y: number, w: number, h: number, style?: LineStyle): RoomVisual;
        infoBox(info: string[], x: number, y: number, opts?: { [option: string]: any }): RoomVisual;
        multitext(textLines: string[], x: number, y: number, opts?: { [option: string]: any }): RoomVisual;
        structure(x: number, y: number, type: string, opts?: { [option: string]: any }): RoomVisual;
        connectRoads(opts?: { [option: string]: any }): RoomVisual | void;
        speech(text: string, x: number, y: number, opts?: { [option: string]: any }): RoomVisual;
        animatedPosition(x: number, y: number, opts?: { [option: string]: any }): RoomVisual;
        resource(type: ResourceConstant, x: number, y: number, size?: number, opacity?: number): number;
        _fluid(type: string, x: number, y: number, size?: number, opacity?: number): void;
        _mineral(type: string, x: number, y: number, size?: number, opacity?: number): void;
        _compound(type: string, x: number, y: number, size?: number, opacity?: number): void;
        test(): RoomVisual;
    }
}

Number.prototype.between = function (a: number, b: number): boolean {
    var min = Math.min.apply(Math, [a, b]),
        max = Math.max.apply(Math, [a, b]);
    return this >= min && this <= max;
};

Array.prototype.remove = function (key: any): void {
    const index = this.indexOf(key, 0);
    if (index > -1) {
        this.splice(index, 1);
    }
};

const terminal = new Terminal();

global.build_plan = terminal.build_plan;
global.command = terminal.command;
global.lvl = terminal.lvl;
global.help = terminal.help;

// global.update_room_memory = finder.UPDATE_room_memory
// global.debug = Utils.debug;
// global.update_room_memory = finder.UPDATE_room_memory

// global.delete_all_construction_sites = buildPlanner.delete_all_construction_sites;
// global.delete_all_roads = buildPlanner.delete_all_roads;
// global.delete_all = buildPlanner.delete_all;
// global.create_roads = buildPlanner.create_roads;
// global.create_struct = buildPlanner.create_struct;
// global.create_roads = buildPlanner.create_roads;

global.Profiler = Profiler.init();
// global.Profiler.start();
// Utils.debug();
// Memory["rooms"] = {};
Memory.rooms_new = {};
