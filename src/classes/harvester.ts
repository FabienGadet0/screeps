import * as Config from "../config";
import * as skeleton from "./skeleton";
import {_C} from "../utils/utils"

function _harvest(creep: Creep, opts?: {} | undefined): void {
    let source: Source = Memory.my_structures[creep.room.name]['sources'][0]

    if (source)
        creep.pos.isNearTo(source) ? creep.harvest(source) : skeleton.moveTo(creep,source.pos,{reusePath:10});
}

function _transfer_to_first_available_extensions(creep: Creep): number {
    //? Find extensions that aren't full yet.
    let not_full_extensions = _.filter(Memory.my_structures[creep.room.name]['extensions'],
        (struct: StructureExtension) => struct.isActive()
            && struct.store
            && (struct.store.getCapacity(RESOURCE_ENERGY) - struct.store[RESOURCE_ENERGY]) > 0)
    if (not_full_extensions) {
        if (creep.pos.isNearTo(not_full_extensions[0]))
            return _C(creep.transfer(not_full_extensions[0], RESOURCE_ENERGY))
        else
            return _C(skeleton.moveTo(creep, not_full_extensions[0].pos))
    }
    return -1000
}

function _transfer_to_structs(creep: Creep): void {
    //? Transfer to spawn in priority and if full transfer to extensions.
    if (_transfer_to_spawn(creep) === ERR_FULL)
        _transfer_to_first_available_extensions(creep)
}

function _transfer_to_spawn(creep: Creep): number {
    let spawn = Memory.my_structures[creep.room.name]['spawn']
    if (creep.pos.isNearTo(spawn))
        return _C(creep.transfer(spawn, RESOURCE_ENERGY))
    else
        return _C(skeleton.moveTo(creep,spawn.pos))
}

export function run(creep: Creep) {
    if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity())
        creep.memory.working = true
    else if (creep.store[RESOURCE_ENERGY] <= 1)
        creep.memory.working = false

        creep.memory.working ? _transfer_to_structs(creep) : _harvest(creep)
}
