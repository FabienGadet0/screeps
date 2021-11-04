import { ErrorMapper } from "utils/ErrorMapper";
import "./utils/traveler";
import "./utils/init_functions";
import * as Config from "./config";
import * as Utils from "./utils/utils";
import * as Finder from "./utils/finder";
import * as packRat from "./utils/packrat";

import * as Profiler from "./Profiler";
import { Room_orchestrator } from "classes/room_orchestrator";
import { match, __, when, select } from "ts-pattern";

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

function _manage_memory() {
    if (!Memory.uuid || Memory.uuid > 100) Memory.uuid = 0;

    //* Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
}
export const loop = ErrorMapper.wrapLoop(() => {
    _manage_memory();

    if (_.size(Game.rooms) !== _.size(room_orchestators)) {
        for (const room_name in Game.rooms) {
            let spawn = Game.rooms[room_name].find(FIND_MY_SPAWNS)[0]; //TODO don't get only first spawn.

            if (!(room_name in Object.keys(room_orchestators))) {
                room_orchestators[room_name] = new Room_orchestrator(room_name, spawn);
            }
        }
    }

    _.each(room_orchestators, (room_orchestator: Room_orchestrator) => {
        room_orchestator.update();
        room_orchestator.run();
    });
});
