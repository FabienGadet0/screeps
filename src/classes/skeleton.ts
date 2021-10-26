import { ErrorMapper } from "utils/ErrorMapper";
import * as Config from "../config";

//* Skeleton for all  creeps

// A wrapper for `Creep.moveTo()`.
export function moveTo(creep: Creep, target: Structure | RoomPosition): number {
  let result: number = 0;

  // Execute moves by cached paths at first
  result = creep.moveTo(target);

  return result;
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
  return spawn.renewCreep(creep);
}

// Moves a creep to a designated renew spot (in this case the spawn).
export function moveToRenew(creep: Creep, spawn: StructureSpawn): void {
  if (tryRenew(creep, spawn) === ERR_NOT_IN_RANGE) {
    creep.moveTo(spawn);
  }
}

export function manageRenew(creep: Creep, spawn: StructureSpawn): void {
  if (needsRenew(creep)) {
    if (tryRenew(creep, spawn) === ERR_NOT_IN_RANGE) {
      creep.moveTo(spawn);
    }
  }
}

// Attempts transferring available resources to the creep.
export function getEnergy(creep: Creep, roomObject: RoomObject): void {
  let energy: Resource = <Resource>roomObject;

  if (energy) {
    if (creep.pos.isNearTo(energy)) {
      creep.pickup(energy);
    } else {
      moveTo(creep, energy.pos);
    }
  }
}
