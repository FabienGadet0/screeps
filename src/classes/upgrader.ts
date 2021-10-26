import * as Config from "../config";
import * as skeleton from "./skeleton";
import {_FIND_SPAWN,_FIND_SOURCE,_FIND_CONTROLLER, _C} from "../utils/utils"

function _harvest(creep: Creep, opts?: {} | undefined): void {
    let source: Source = _FIND_SOURCE(creep)

    if (source)
        creep.pos.isNearTo(source) ? creep.harvest(source) : creep.moveTo(source.pos);
}

function _upgrade_controller(creep: Creep): void {
    const controller = _FIND_CONTROLLER(creep)
        if (controller && creep.upgradeController(controller) == ERR_NOT_IN_RANGE)
            creep.moveTo(controller);
}

export function run(creep: Creep) {
        creep.store[RESOURCE_ENERGY] < creep.store.getCapacity() && creep.memory.working
            ? _harvest(creep) : _upgrade_controller(creep)
    }
