//? Spawns handler
import { config } from "chai";
import { all } from "lodash";
import * as Config from "../config";
import {_FIND_ROADS,flatten,_C } from "../utils/utils"
import * as Utils from "../utils/utils";

function space_available(spawn: StructureSpawn, _role: string, lvl:number): Boolean {
    const already_spawned = _.size(_.filter(Memory["rooms"][spawn.room.name].creeps, (c : Creep) => c.memory.role === _role))
    return spawn.spawnCreep(Config.role_to_bodyparts[lvl][_role], "testspace", { dryRun: true }) === 0
        && already_spawned < Config.limit_per_role_per_room[_role] ;
}

function spawn_creep(spawn: StructureSpawn, name: string, _role: string,lvl:number): { name: string; spawn_error_code: ScreepsReturnCode; } {
    if (name === "") name = _role + lvl +Game.time
    return { "name": name, "spawn_error_code" : spawn.spawnCreep(Config.role_to_bodyparts[lvl][_role], name, { memory: { role: _role, working: true, room: spawn.room.name, spawn_name:spawn.name, target_type:"", lvl: lvl} }) }
}


function handle_creep_spawning(spawn: StructureSpawn): Creep | undefined {
    let creep_name = ""
    const count_creeps = _.size(spawn.room.find(FIND_MY_CREEPS))
    let lvl = Utils.GET_ENERGY_STATS(spawn)["max_energy"] < 650 ? 1 : 2

    if (count_creeps < Config.total_possible_creeps) {
        _.each(Config.all_roles, (role: string) => {
            if (space_available(spawn, role,lvl) && !spawn.spawning) {
                const new_creep = spawn_creep(spawn, "", role,lvl)
                creep_name = new_creep.name
                _C(spawn.name,new_creep.spawn_error_code)
            }
        })
    }
    return Game.creeps[creep_name]
}

export {space_available,spawn_creep, handle_creep_spawning}
