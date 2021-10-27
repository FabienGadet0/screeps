import * as Config from "../config";
import * as skeleton from "./skeleton";
import {_FIND_SPAWN,_FIND_SOURCE,_FIND_CONTROLLER, _FIND_CONSTRUCTION_SITES, _C} from "../utils/utils"

function _harvest(creep: Creep, opts?: {} | undefined): void {
    let source: Source = _FIND_SOURCE(creep.room)

    if (source)
        creep.pos.isNearTo(source) ? creep.harvest(source) : skeleton.moveTo(creep,source.pos);
}

function _build(creep: Creep)  {
    let targets = _FIND_CONSTRUCTION_SITES(creep.room)
    if (targets.length) {
        if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
            skeleton.moveTo(creep,targets[0])
        }
    }
}


export function run(creep: Creep) {
    const to_build = _FIND_CONSTRUCTION_SITES(creep.room)[0]
    if (to_build && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity())
        creep.memory.working = true
    else if (creep.store[RESOURCE_ENERGY] <= 1)
        creep.memory.working = false

    creep.memory.working ? _build(creep) : _harvest(creep)
        // const build_energy = to_build.progressTotal - to_build.progress
        // const energy_needed_to_finish = build_energy < creep.store.getCapacity() ? build_energy : creep.store.getCapacity()

    }
