import * as Config from "../config";
import * as skeleton from "./skeleton";
import {_C} from "../utils/utils"

function _harvest(creep: Creep, opts?: {} | undefined): void {
    let source: Source = Memory.my_structures[creep.room.name]['sources'][0]

    if (source)
        creep.pos.isNearTo(source) ? creep.harvest(source) : skeleton.moveTo(creep,source.pos);
}

function _transfer_to_spawn(creep: Creep): void {
    let spawn = Memory.my_structures[creep.room.name]['spawn']
    if (creep.pos.isNearTo(spawn))
        if (_C(creep.transfer(spawn, RESOURCE_ENERGY)) !== 0)
            creep.drop(RESOURCE_ENERGY);
    else
        _C(skeleton.moveTo(creep,spawn.pos))
}

export function run(creep: Creep) {
    if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity())
        creep.memory.working = true
    else if (creep.store[RESOURCE_ENERGY] <= 1)
        creep.memory.working = false

        creep.memory.working ? _transfer_to_spawn(creep) : _harvest(creep)
}
