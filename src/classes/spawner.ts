//? Spawns handler
import { config } from "chai";
import { _C } from "utils/utils";
import * as Config from "../config";

function space_available(spawn: StructureSpawn, _role: string): Boolean {
    const already_spawned = _.size(_.filter(spawn.room.find(FIND_MY_CREEPS), (c : Creep) => c.memory.role === _role))
    return spawn.spawnCreep(Config.role_to_bodyparts[_role], "testspace", { dryRun: true }) === 0
        && already_spawned < Config.limit_per_role[_role] ;
}

//Memory test : don't return creep instance
function spawn_creep(spawn: StructureSpawn, name: string, _role: string): { name: string; spawn_error_code: ScreepsReturnCode; } {
    if (name === "") name = _role + Game.time
    return { "name": name, "spawn_error_code" : spawn.spawnCreep(Config.role_to_bodyparts[_role], name, { memory: { role: _role, working: true, room: spawn.room.name, spawn_name:spawn.name} }) }
}

function handle_creep_spawning(spawn: StructureSpawn): Creep | undefined {
    let creep_name = ""
    const count_creeps = _.size(spawn.room.find(FIND_MY_CREEPS))
    if (count_creeps < Config.total_possible_creeps) {
        _.each(Config.all_roles, (role: string) => {
            if (space_available(spawn, role) && !spawn.spawning) {
                const new_creep = spawn_creep(spawn, "", role)
                creep_name = new_creep.name
                _C(new_creep.spawn_error_code)
            }
        })
    }
    return Game.creeps[creep_name]
}

export {space_available, spawn_creep,handle_creep_spawning}
