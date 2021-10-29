import { ErrorMapper } from "utils/ErrorMapper";
import {} from "utils/utils";
import * as Config from "../config";
import * as Utils from "../utils/utils";

//* Skeleton for all  creeps


export function harvest(creep: Creep, source_number: number = 0,opts?: {} | undefined): void {
  let source: Source = Memory["rooms"][creep.room.name].structures['sources'][source_number]
  if (source)
      creep.pos.isNearTo(source) ? Utils._C(creep.name,creep.harvest(source),"harvesting " + creep.name) : Utils._C(creep.name,moveTo(creep,source.pos));
}

export function moveTo(creep: Creep, target: ConstructionSite | Structure | RoomPosition, opts?: MoveToOpts | undefined): number {
  //todo add opts += { visualizePathStyle: { stroke: '#ffffff' } }
  if (Memory.debug_mode)
    return creep.moveTo(target,opts);
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

export function tryRenew(creep: Creep, spawn: StructureSpawn): number {
  return spawn.renewCreep(creep);
}

export function manageRenew(creep: Creep, spawn :StructureSpawn): boolean {
  if (needsRenew(creep)) {
    say(creep,'Heck renew')
    // let spawn : StructureSpawn = Memory["rooms"][creep.room.name].structures['spawn']
    if (tryRenew(creep, spawn) === ERR_NOT_IN_RANGE) {
      moveTo(creep,spawn);
    }
    return true
  }
  return false
}
