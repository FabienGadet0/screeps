import * as Config from "../config";
import * as skeleton from "./skeleton";
import { _C} from "../utils/utils"

function _harvest(creep: Creep, opts?: {} | undefined): void {
    let source: Source = Memory.my_structures[creep.room.name]['sources'][0]
    if (source)
        creep.pos.isNearTo(source) ? _C(creep.name,creep.harvest(source),"harvesting " + creep.name) : _C(creep.name,skeleton.moveTo(creep,source.pos), "moving to" + creep.name);

}

function _upgrade_controller(creep: Creep): void {
    const controller = Memory.my_structures[creep.room.name]['controller']
        if (controller && creep.upgradeController(controller) === ERR_NOT_IN_RANGE)
            _C(creep.name,skeleton.moveTo(creep, controller))
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
