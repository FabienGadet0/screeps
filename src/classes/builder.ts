import * as Config from "../config";
import * as Utils from "../utils/utils";
import * as skeleton from "./skeleton";
import * as finder from "../utils/finder";

//* LOGIC : -----------------------------------------
// if no energy
    // go to energy
// if energy
    // get construction sites or repair sites
    // repair in priority
    // if no construction sites -> repair
    // if no repair -> Construction sites

    //  if build
    //     build first sites
    //     if not in range then moveto first site
    // else (repair)
    //     repair first sites
    //     if not in range then moveto first site
//* -------------------------------------------------

function _next_job(creep: Creep) {
    if(creep.memory.target_type === "build")
        creep.memory.target_type = 'to_repair'
    else
        creep.memory.target_type = 'build'
    finder.UPDATE(Game.spawns[creep.memory.spawn_name], [creep.memory.target_type]); //? update will be repair
    return Memory["rooms"][creep.room.name].structures[creep.memory.target_type][0];
}

function _work(creep: Creep) {
    let r = 0
    let to_search = creep.memory.target_type === "build" ? 'construction_sites' : 'to_repair'
    finder.UPDATE(Game.spawns[creep.memory.spawn_name], [to_search]);
    let target = Memory["rooms"][creep.room.name].structures[to_search][0]
    if (!target)
        target = _next_job(creep)

    if (target && creep.memory.target_type === 'build' && creep.memory.working)
        r = creep.build(target)
    else if (target && creep.memory.target_type === 'to_repair' && creep.memory.working)
        r = creep.repair(target)

    if (r === ERR_NOT_IN_RANGE)
            skeleton.moveTo(creep, target)
    else
        Utils._C(creep.name, r)
}

export function run(creep: Creep, _?: {}) {
    if(creep.memory.target_type != 'to_repair')
        creep.memory.target_type = 'to_repair' //? Set to repair by default

    //? If he isn't working then fully charge , else work.
    creep.memory.working = (!creep.memory.working && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) || (creep.memory.working && creep.store[RESOURCE_ENERGY] > 0)
    creep.memory.working ? _work(creep) : skeleton.harvest(creep, 0)
}
