import * as Config from "../config";
import * as skeleton from "./skeleton";

function _harvest(creep: Creep, opts? : {} | undefined): void {
    let source: Source = creep.room.find(FIND_SOURCES_ACTIVE)[0]

    if (source) {
        creep.pos.isNearTo(source) ? creep.harvest(source) : skeleton.moveTo(creep, source.pos);
      }
}

function _transfer_to_spawn(creep: Creep): void {
    let spawn: StructureSpawn = creep.room.find(FIND_MY_SPAWNS)[0]
    if (creep.pos.isNearTo(spawn)) {
        creep.transfer(spawn, RESOURCE_ENERGY);
    }
    else {
        skeleton.moveTo(creep, spawn.pos);
      }
}

export function run(creep: Creep) {
    console.log("test" + creep.name)
    skeleton.manageRenew(creep, Game.spawns[creep.memory.room]);
    creep.store[RESOURCE_ENERGY] < creep.store.getCapacity() ? _harvest(creep) : _transfer_to_spawn(creep)
}
