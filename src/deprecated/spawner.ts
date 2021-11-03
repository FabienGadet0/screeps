// //? Spawns handler
// import { config } from "chai";
// import { all } from "lodash";
// import * as Config from "../config";
// import * as Utils from "../utils/utils";
// import * as finder from "../utils/finder";

// function space_available(spawn: StructureSpawn, _role: string, lvl: number): Boolean {
//     const already_spawned = _.size(_.filter(Memory["rooms"][spawn.room.name].creeps, (c: Creep) => c.memory.role === _role));
//     return (
//         spawn.spawnCreep(Config.role_to_bodyparts[lvl][_role], "testspace", { dryRun: true }) === 0 &&
//         already_spawned < Config.limit_per_role_per_room[_role]
//     );
// }

// function spawn_creep(
//     spawn: StructureSpawn,
//     name: string,
//     _role: string,
//     lvl: number,
// ): { name: string; spawn_error_code: ScreepsReturnCode } {
//     if (name === "") name = _role + "/" + String(lvl) + "/" + Game.time;
//     return {
//         name: name,
//         spawn_error_code: spawn.spawnCreep(Config.role_to_bodyparts[lvl][_role], name, {
//             memory: {
//                 _trav: undefined,
//                 _travel: undefined,
//                 role: _role,
//                 room: spawn.room.name,
//                 spawn_name: spawn.name,
//                 lvl: lvl,
//             },
//         }),
//     };
// }

// function handle_creep_spawning(spawn: StructureSpawn): Creep | undefined {
//     let creep_name = "";
//     let lvl = 1;
//     let total = 0;
//     const count_creeps = _.size(Memory["rooms"][spawn.room.name].creeps);
//     if (count_creeps < Config.total_possible_creeps) {
//         finder.UPDATE(spawn, ["extensions", "lvl"]);
//         lvl = Memory["rooms"][spawn.room.name]["lvl"];
//         _.each(Config.all_roles, (role: string) => {
//             if (space_available(spawn, role, lvl) && !spawn.spawning) {
//                 const new_creep = spawn_creep(spawn, "", role, lvl);
//                 creep_name = new_creep.name;
//                 Utils._C(spawn.name, new_creep.spawn_error_code);
//             }
//         });
//     }
//     return Game.creeps[creep_name];
// }

// export { space_available, spawn_creep, handle_creep_spawning };
