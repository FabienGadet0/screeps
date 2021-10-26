//? Spawns handler
import { config } from "chai";
import * as Config from "../config";

const harvester_bodyparts = [WORK,CARRY,MOVE]
const builder_bodyparts = [WORK,CARRY,MOVE]
const builder_only_bodyparts = [WORK,WORK,MOVE]
const upgrader_bodyparts = [WORK,CARRY,MOVE]

export const role_to_bodyparts : Record<string, BodyPartConstant[]> = {
    'harvester': harvester_bodyparts,
    'builder': builder_bodyparts,
    'upgrader': upgrader_bodyparts
}

function space_available(spawn : StructureSpawn, _role:string): Boolean {
    return spawn.spawnCreep(role_to_bodyparts[_role], "testspace", { dryRun: true }) === 0
        && _.size(spawn.room.find(FIND_MY_CREEPS)) < Config.AMOUNT_OF_HARVESTER_PER_ROOM;
}

//Memory test : don't return creep instance
function spawn_creep(spawn: StructureSpawn, name: string, _role: string): { name: string; spawn_error_code: ScreepsReturnCode; } {
    if (name === "") name = _role + Game.time
    return { "name": name, "spawn_error_code" : spawn.spawnCreep(role_to_bodyparts[_role], name, { memory: { role: _role, working: true, room: spawn.room.name, spawn_name:spawn.name} }) }
}

function handle_creep_spawning(spawn: StructureSpawn): Creep | undefined {
    let new_creep = undefined
    let creep_name = ""
    if (space_available(spawn, "harvester")) {
        new_creep = spawn_creep(spawn, "", "harvester")
        creep_name = new_creep.name
        if (new_creep.spawn_error_code !== 0) console.log("Error spawning creep " + new_creep)
        }
    return Game.creeps[creep_name]
}

//     for(var name in Game.creeps) {
//         var creep = Game.creeps[name];
//         if(creep.memory.role == 'harvester') {
//             roleHarvester.run(creep);
//         }
//         if(creep.memory.role == 'upgrader') {
//             roleUpgrader.run(creep);
//         }
//     }
// }

export {space_available, spawn_creep,handle_creep_spawning}
