//? Spawns handler
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
    return spawn.spawnCreep(role_to_bodyparts[_role], "testspace", { dryRun: true }) === 0;
}

//Memory test : don't return creep instance
function spawn_creep(spawn: StructureSpawn, name: string, _role: string): Creep {
    if (spawn.spawnCreep(role_to_bodyparts[_role], name, { memory: { role: _role, working:false, room:spawn.room.name } }) === OK)
        {
        spawn.room.visual.text(
            '🛠️' + _role,
            spawn.pos.x + 1,
            spawn.pos.y,
            { align: 'left', opacity: 0.8 });
    }
    return Game.creeps[name]
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

export {space_available, spawn_creep}
