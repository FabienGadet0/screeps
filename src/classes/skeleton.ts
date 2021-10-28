import { ErrorMapper } from "utils/ErrorMapper";
import {} from "utils/utils";
import * as Config from "../config";

//* Skeleton for all  creeps

export function moveTo(creep: Creep, target: ConstructionSite| Structure | RoomPosition, visualize_path: boolean = false, opts?: MoveToOpts | undefined): number {
  if (Memory.debug_mode)
    return creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
  else
    return creep.moveTo(target,opts);
}

export function say(creep: Creep, msg: string) {
  if (Memory.debug_speak)
    creep.say(msg);
}

// Returns true if the `ticksToLive` of a creep has dropped below the renew limit set in config.
export function needsRenew(creep: Creep): boolean {
  if (creep.ticksToLive) {
    return creep.ticksToLive < Config.DEFAULT_MIN_LIFE_BEFORE_NEEDS_REFILL;
  }
  return false
}

// Shorthand method for `renewCreep()`.
export function tryRenew(creep: Creep, spawn: StructureSpawn): number {
  // console.log("creep " + creep)
  return spawn.renewCreep(creep);
}

export function manageRenew(creep: Creep, spawn :StructureSpawn): boolean {
  if (needsRenew(creep)) {
    say(creep,'Heck renew')
    // let spawn : StructureSpawn = Memory.my_structures[creep.room.name]['spawn']
    if (tryRenew(creep, spawn) === ERR_NOT_IN_RANGE) {
      moveTo(creep,spawn);
    }
    return true
  }
  return false
}
