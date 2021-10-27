import * as Config from "../config";
import * as skeleton from "./skeleton";
import {_FIND_SPAWN,_FIND_SOURCE,_FIND_CONTROLLER, _C} from "../utils/utils"

function _harvest(creep: Creep, opts?: {} | undefined): void {
    let source: Source = _FIND_SOURCE(creep.room)
    if (source)
        creep.pos.isNearTo(source) ? creep.harvest(source) : skeleton.moveTo(creep,source.pos);

}

function _upgrade_controller(creep: Creep): void {
    const controller = _FIND_CONTROLLER(creep.room)
        if (controller && creep.upgradeController(controller) === ERR_NOT_IN_RANGE)
            skeleton.moveTo(creep, controller)
}

export function run(creep: Creep) {
    if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity())
        creep.memory.working = true
    else if (creep.store[RESOURCE_ENERGY] <= 1)
        creep.memory.working = false
    creep.memory.working ? _upgrade_controller(creep) : _harvest(creep)
        // creep.memory.working = creep.store[RESOURCE_ENERGY] < 10 ? creep.memory.working
            // ? _harvest(creep) : _upgrade_controller(creep)
    }
