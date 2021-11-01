// import * as Config from "../../config";
// import * as Utils from "../../utils/utils";
import { ICreep } from "./ICreep";
// import * as Finder from "../../utils/finder";
import { profile } from "../../Profiler/Profiler";

@profile
export class Builder extends ICreep {
    constructor(creep_name: string) {
        super(creep_name);
    }

    protected logic() {}
}

// //* LOGIC : -----------------------------------------
// // if no energy
// // go to energy
// // if energy
// // get construction sites or repair sites
// // repair in priority
// // if no construction sites -> repair
// // if no repair -> Construction sites

// //  if build
// //     build first sites
// //     if not in range then moveto first site
// // else (repair)
// //     repair first sites
// //     if not in range then moveto first site
// //* -------------------------------------------------

// function _next_job(creep: Creep) {
//     if (creep.memory.target_type === "build") creep.memory.target_type = "to_repair";
//     else creep.memory.target_type = "construction_sites";
//     // finder.UPDATE(Game.spawns[creep.memory.spawn_name], [creep.memory.target_type]); //? update will be repair
//     return Finder.from_id(Memory["rooms"][creep.room.name].structure_ids[creep.memory.target_type][0]);
// }

// function _work(creep: Creep) {
//     let r = 0;
//     let to_search = creep.memory.target_type === "construction_sites" ? "construction_sites" : "to_repair";
//     let target = Finder.from_id(Memory["rooms"][creep.room.name].structure_ids[to_search][0]);
//     if (!target) target = _next_job(creep);

//     if (target && creep.memory.target_type === "construction_sites" && creep.memory.working) r = creep.build(target);
//     else if (target && creep.memory.target_type === "to_repair" && creep.memory.working) r = creep.repair(target);

//     if (r === ERR_NOT_IN_RANGE) ICreep.moveTo(creep, target);
//     else Utils._C(creep.name, r);
// }

// export function run(creep: Creep, _?: {}) {
//     // finder.UPDATE(Game.spawns[creep.memory.spawn_name], ["to_repair"]);

//     if (Finder.from_id(Memory["rooms"][creep.room.name].structure_ids["to_repair"])) creep.memory.target_type = "to_repair";
//     //? Set to repair by default
//     // finder.UPDATE(Game.spawns[creep.memory.spawn_name], ["construction_sites"]);
//     else creep.memory.target_type = "construction_sites";

//     //? If he isn't working then fully charge , else work.
//     creep.memory.working =
//         (!creep.memory.working && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) ||
//         (creep.memory.working && creep.store[RESOURCE_ENERGY] > 0);
//     creep.memory.working ? _work(creep) : ICreep.harvest(creep, 0);
// }
