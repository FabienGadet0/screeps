import * as Config from "../config";
import * as skeleton from "./skeleton";
import {_C} from "../utils/utils"

function _harvest(creep: Creep, opts?: {} | undefined): void {
    let mineral: Mineral = Memory.my_structures[creep.room.name]['minerals'][0]

    if (mineral)
        creep.pos.isNearTo(mineral) ? creep.harvest(mineral) : skeleton.moveTo(creep,mineral.pos,{reusePath:10});
}

function _transfer_to_spawn(creep: Creep): number {
    let spawn = Memory.my_structures[creep.room.name]['spawn']
    if (creep.pos.isNearTo(spawn))
        return _C(creep.name,creep.transfer(spawn, RESOURCE_ENERGY))
    else
        return _C(creep.name,skeleton.moveTo(creep,spawn.pos))
}

export function run(creep: Creep) {
    if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity())
        creep.memory.working = true
    else if (creep.store[RESOURCE_ENERGY] <= 1)
        creep.memory.working = false

        creep.memory.working ? _transfer_to_spawn(creep) : _harvest(creep)
}
