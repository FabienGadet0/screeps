import * as Config from "../config";
import * as skeleton from "./skeleton";
import {_C} from "../utils/utils"

function _harvest(creep: Creep, opts?: {} | undefined): void {
    let source: Source[] = Memory.my_structures[creep.room.name]['sources']

    //? Builders go to source 2 for now.
    if (source)
        creep.pos.isNearTo(source[1]) ? creep.harvest(source[1]) : skeleton.moveTo(creep,source[1].pos);
}

function _build(creep: Creep)  {
    let targets = Memory.my_structures[creep.room.name]['construction_sites']
    if (targets.length) {
        let r = creep.build(targets[0])
        if(r === ERR_NOT_IN_RANGE) {
             skeleton.moveTo(creep, targets[0])
        }
        else if (r === ERR_INVALID_TARGET) // A creep is probably on the construction site
        console.log("Error building ERR_INVALID_TARGET -> " + targets[0].pos)
    }
}


export function run(creep: Creep) {
    const to_build = Memory.my_structures[creep.room.name]['construction_sites'][0]
    if (to_build && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity())
        creep.memory.working = true
    else if (creep.store[RESOURCE_ENERGY] <= 1)
        creep.memory.working = false

    creep.memory.working ? _build(creep) : _harvest(creep)
        // const build_energy = to_build.progressTotal - to_build.progress
        // const energy_needed_to_finish = build_energy < creep.store.getCapacity() ? build_energy : creep.store.getCapacity()

    }
