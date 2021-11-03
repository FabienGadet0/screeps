import { ErrorMapper } from "utils/ErrorMapper";
import "./utils/traveler";
import "./utils/init_functions";
import * as Config from "./config";
import * as Utils from "./utils/utils";
import * as Finder from "./utils/finder";
import * as packRat from "./utils/packrat";

import * as Profiler from "./Profiler";
import { Room_orchestrator } from "classes/room_orchestrator";

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
}

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
            Finder.UPDATE_IDS(Game.rooms[room_name], [
                "controller",
                "roads",
                "sources",
                "construction_sites",
                "extensions",
                "minerals",
                "to_repair",
                "creeps_ids",
                "extensions_not_full",
                "containers_not_full",
                "lvl",
            ]);
        }
    }

    _.each(room_orchestators, (room_orchestator: Room_orchestrator) => {
        room_orchestator.update();
        room_orchestator.run();
    });
});
