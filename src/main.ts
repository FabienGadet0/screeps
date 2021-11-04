import { ErrorMapper } from "utils/ErrorMapper";
import "./utils/traveler";
import "./utils/init_functions";
import * as Config from "./config";
import * as Utils from "./utils/utils";
import * as packRat from "./utils/packrat";

import * as Profiler from "./Profiler";
import { Room_orchestrator } from "classes/room_orchestrator";
import { match, __, when, select } from "ts-pattern";
import { wrap } from "./utils/memhack";

// import "./prototypes/room_visuals";

// type Data =
//   | { type: 'text'; content: string }
//   | { type: 'img'; src: string };

// type Result =
//   | { type: 'ok'; data: Data }
//   | { type: 'error'; error: Error };

// const result: Result = ...;

declare global {
    namespace NodeJS {
        interface Global {
            log: any;
            warn: any;
            err: any;
            error: any;
            delete_all_construction_sites: any;
            delete_all_roads: any;
            delete_all: any;
            create_roads: any;
            create_struct: any;
            _C: any;
            debug: any;
            update_room_memory: any;
            Profiler: any;
        }
    }
    interface Number {
        between: (a: number, b: number) => boolean;
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

global.Profiler = Profiler.init();
// global.Profiler.start();
Utils.debug();
Memory["rooms"] = {};
let room_orchestators: Record<string, Room_orchestrator> = {};
Memory.rooms_new = {};

function _manage_memory() {
    if (!Memory.uuid || Memory.uuid > 100) Memory.uuid = 0;

    //* Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
}

function init_room(room_name: string) {
    let all_classes: Record<string, number> = {};
    let creeps_name: string[] = [];
    _.each(Game.rooms[room_name].find(FIND_MY_CREEPS), (creep: Creep) => {
        if (!all_classes[creep.memory.role]) all_classes[creep.memory.role] = 1;
        else all_classes[creep.memory.role] += 1;
        creeps_name.push(creep.name);
    });

    return {
        classes_in_room: all_classes,
        lvl: 300,
        room_tasks: { to_transfer: [], to_build: [], to_repair: [] },
        creeps_name: creeps_name,
        cripple_creeps: [],
        structure_id: {
            updater: {
                roads: undefined,
                sources: undefined,
                construction_sites: undefined,
                extensions: undefined,
                minerals: undefined,
                extensions_not_full: undefined,
                flags: undefined,
                dropped_resources: undefined,
                containers_not_full: undefined,
                to_repair: undefined,
            },
            roads: [],
            sources: [],
            construction_sites: [],
            extensions: [],
            minerals: [],
            extensions_not_full: [],
            flags: [],
            dropped_resources: [],
            containers_not_full: [],
            to_repair: [],
        },
    };
}

// export const loop = wrap(() => {
export const loop = ErrorMapper.wrapLoop(() => {
    _manage_memory();

    if (_.size(Game.rooms) !== _.size(room_orchestators)) {
        _.each(Game.spawns["Spawn1"].room.find(FIND_MY_CREEPS), (c: Creep) => {
            console.log(c.memory.role);
        });
        for (const room_name in Game.rooms) {
            //TODO don't get only first spawn.
            let spawn = Game.rooms[room_name].find(FIND_MY_SPAWNS)[0];
            // Game.rooms[room_name].visual.infoBox(["testlist", "2ndline", "3rdline"], 15, 23);
            if (!(room_name in Object.keys(room_orchestators))) {
                Memory.rooms_new[room_name] = init_room(room_name);
                Memory.commands = { all_harvest: false, all_transfer_to_spawn: false };
                room_orchestators[room_name] = new Room_orchestrator(room_name, spawn);
            }
        }
    }

    _.each(room_orchestators, (room_orchestator: Room_orchestrator) => {
        room_orchestator.update();
        room_orchestator.run();
    });
});
// });
