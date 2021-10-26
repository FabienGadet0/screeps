import * as Config from "../config";
import * as skeleton from "./skeleton";
import {_FIND_SPAWN,_FIND_SOURCE, _C} from "../utils/utils"

function _harvest(creep: Creep, opts?: {} | undefined): void {
    let source: Source = _FIND_SOURCE(creep)

    if (source)
        creep.pos.isNearTo(source) ? creep.harvest(source) : creep.moveTo(source.pos);
}

function _transfer_to_spawn(creep: Creep): void {
    let spawn = _FIND_SPAWN(creep)
    if (creep.pos.isNearTo(spawn))
        _C(creep.transfer(spawn, RESOURCE_ENERGY));
    else
        _C(creep.moveTo(spawn.pos))
}

export function run(creep: Creep) {
    creep.store[RESOURCE_ENERGY] < creep.store.getCapacity() && creep.memory.working ? _harvest(creep) : _transfer_to_spawn(creep)
}
