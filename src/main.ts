import { ErrorMapper } from "utils/ErrorMapper";
import "./utils/traveler";
import "./utils/init_all";
import * as Config from "./config";
import * as Utils from "./utils/utils";
import * as packRat from "./utils/packrat";

import { Room_orchestrator } from "classes/room_orchestrator";
import { match, __, when, select } from "ts-pattern";
import { initMemHack } from "./utils/memhack";
import "./utils/init_all";
import "./prototypes/room_visuals";
// import {Visual} from "./utils/visual"

if (Config.MEMHACK) initMemHack();

function _manage_memory() {
    if (!Memory.uuid || Memory.uuid > 100) Memory.uuid = 0;

    //* Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
}

let room_orchestators: Record<string, Room_orchestrator> = {};

export const loop = ErrorMapper.wrapLoop(() => {
    _manage_memory();

    if (_.size(Game.rooms) !== _.size(room_orchestators)) {
        for (const room_name in Game.rooms) {
            //TODO don't get only first spawn.
            if (!(room_name in Object.keys(room_orchestators))) {
                let spawn = Game.rooms[room_name].find(FIND_MY_SPAWNS)[0];
                room_orchestators[room_name] = new Room_orchestrator(room_name, spawn);
            }
        }
    }

    _.each(room_orchestators, (room_orchestator: Room_orchestrator) => {
        room_orchestator.update();
        room_orchestator.run();
    });
});
