import * as Config from "../config";
import * as skeleton from "./skeleton";
import {_C,UPDATE} from "../utils/utils"

function _dosomethingwtf(creep: Creep, to_do: any) {
    let r = 0
    if (creep.memory.target_type === 'build')
        r = creep.build(to_do)
    else if(creep.memory.target_type === 'repair')
        r = creep.repair(to_do)

    if (r === ERR_NOT_IN_RANGE) {
            skeleton.moveTo(creep, to_do)
    }
    else
        _C(creep.name, r)
}

export function run(creep: Creep) {
    if (UPDATE(Game.spawns[creep.memory.spawn_name], ["construction_sites"])) {
        const to_build = Memory["rooms"][creep.room.name].structures['construction_sites']
        if (to_build && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
            creep.memory.working = true
            creep.memory.target_type = 'build'
        }
        else if (creep.store[RESOURCE_ENERGY] <= 1)
            creep.memory.working = false

        if(to_build.length < Config.REPAIR_WHEN_CONSTRUCTION_SITE_UNDER)
           creep.memory.target_type = 'repair'

        creep.memory.working ? _dosomethingwtf(creep, to_build[0]) : skeleton.harvest(creep, 0)
    }
}
