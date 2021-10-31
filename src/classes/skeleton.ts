//* Skeleton for all  creeps

import { ErrorMapper } from "utils/ErrorMapper";
import {} from "utils/utils";
import * as Config from "../config";
import * as Utils from "../utils/utils";



export function harvest(creep: Creep, source_number: number = 0,opts?: {} | undefined): void {
  let source: Source = Memory["rooms"][creep.room.name].structures['sources'][source_number]
  if (source)
      creep.pos.isNearTo(source) ? Utils._C(creep.name,creep.harvest(source),"harvesting " + creep.name) : Utils._C(creep.name,moveTo(creep,source.pos));
}

export function moveTo(creep: Creep, target: ConstructionSite | Structure | RoomPosition, opts?: MoveToOpts | undefined): number {
  if (Memory.debug_mode)
    return creep.travelTo(target,opts);
  else
    return creep.travelTo(target,opts);
}

export function say(creep: Creep, msg: string) {
  if (Memory.debug_speak)
    creep.say(msg);
}

export function needsRenew(creep: Creep): boolean {
  return ((creep.ticksToLive || 0) / Config.MAX_TICKS_TO_LIVE <= Config.PERCENTAGE_TICKS_BEFORE_NEEDS_REFILL);
}

export function tryRenew(creep: Creep, spawn: StructureSpawn): number {
  let r = spawn.renewCreep(creep)
  console.log(creep.name + " + " + r)
  if (r === -6 && creep.store[RESOURCE_ENERGY] !== 0) { //? If not enough energy , everybody will give energy regarding of it's class.
    creep.transfer(spawn, RESOURCE_ENERGY);
    if(Memory.debug_mode)
      console.log("Renewing " + creep.name + "->ERR_NOT_ENOUGH_ENERGY/RESSOURCES/EXTENSIONS");
  }
  return r
}

export function manageRenew(creep: Creep, spawn: StructureSpawn): boolean {
  // if ((creep.memory.role === 'harvester' && spawn.store[RESOURCE_ENERGY] >= 200) || ( creep.memory.role !== 'harvester' && spawn.store[RESOURCE_ENERGY] > 20 ) ) { //* Harvester sacrifice to bring energy for others
    if (!creep.memory.is_renewing)
      creep.memory.is_renewing = needsRenew(creep);
    else if ((creep.ticksToLive || 0) >= Config.MAX_TICKS_TO_LIVE)
      creep.memory.is_renewing = false;

  if (creep.memory.is_renewing) {
      if (tryRenew(creep, spawn) === ERR_NOT_IN_RANGE)
        moveTo(creep, spawn);
    }

    return creep.memory.is_renewing
}
