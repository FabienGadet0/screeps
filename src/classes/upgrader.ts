import * as Config from "../config";
import * as skeleton from "./skeleton";
import { UPDATE, _C} from "../utils/utils"


function _upgrade_controller(creep: Creep): void {
    if (UPDATE(Game.spawns[creep.memory.spawn_name], ['controller'])) {
        const controller = Memory["rooms"][creep.room.name].structures['controller']
        if (controller && creep.upgradeController(controller) === ERR_NOT_IN_RANGE)
            _C(creep.name, skeleton.moveTo(creep, controller))
    }
}

export function run(creep: Creep) {
    if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity())
        creep.memory.working = true
    else if (creep.store[RESOURCE_ENERGY] <= 1)
        creep.memory.working = false

    creep.memory.working ? _upgrade_controller(creep) : skeleton.harvest(creep)
        // creep.memory.working = creep.store[RESOURCE_ENERGY] < 10 ? creep.memory.working
            // ? _harvest(creep) : _upgrade_controller(creep)
    }
