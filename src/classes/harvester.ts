import * as Config from "../config";
import * as skeleton from "./skeleton";
import {_C,UPDATE} from "../utils/utils"

function _transfer_to_first_available_extensions(creep: Creep): number {
    //? Find extensions that aren't full yet.
    let not_full_extensions = _.filter(Memory["rooms"][creep.room.name].structures['extensions'],
        (struct: StructureExtension) => struct.isActive()
            && struct.store
            && (struct.store.getCapacity(RESOURCE_ENERGY) - struct.store[RESOURCE_ENERGY]) > 0)
    if (not_full_extensions.length > 1) {
        if (creep.pos.isNearTo(not_full_extensions[0]))
            return _C(creep.name, creep.transfer(not_full_extensions[0], RESOURCE_ENERGY), " transfer")
        else
            return _C(creep.name, skeleton.moveTo(creep, not_full_extensions[0].pos))
    }
    return -1000
}

function _transfer_to_structs(creep: Creep): void {

    //? Transfer to spawn in priority and if full transfer to extensions.
    if (creep.memory.target_type === 'spawn') {
        if (_C(creep.id, _transfer_to_spawn(creep)) === ERR_FULL) {
            if (UPDATE(Game.spawns[creep.memory.spawn_name], ["extensions"])) {
                if (Memory["rooms"][creep.room.name].structures["extensions"].length > 1)
                    creep.memory.target_type = 'extensions'
            }
        }
    }
    else if (creep.memory.target_type === 'extensions')
        _transfer_to_first_available_extensions(creep)
}

function _transfer_to_spawn(creep: Creep): number {
    let spawn = Memory["rooms"][creep.room.name].structures['spawn']
    if (creep.pos.isNearTo(spawn))
        return _C(creep.name,creep.transfer(spawn, RESOURCE_ENERGY))
    else
        return _C(creep.name,skeleton.moveTo(creep,spawn.pos))
}

export function run(creep: Creep) {
    if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
        creep.memory.working = true
        creep.memory.target_type = 'spawn'
    }
    else if (creep.store[RESOURCE_ENERGY] <= 1)
        creep.memory.working = false

    creep.memory.working ? _transfer_to_structs(creep) : skeleton.harvest(creep, 1)
}
