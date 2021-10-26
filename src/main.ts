import { ErrorMapper } from "utils/ErrorMapper";
import * as Config from "./config";
import * as spawner from "classes/spawner";
import * as harvester from "classes/harvester";

export let creeps: Creep[];
export let creepCount: number = 0;

export let harvesters: Creep[] = [];

function _loadCreeps(room: Room) {
  creeps = room.find(FIND_MY_CREEPS);
  creepCount = _.size(creeps);

  // Iterate through each creep and push them into the role array.
  harvesters = _.filter(creeps, (creep) => creep.memory.role === "harvester");
}

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

export const loop = ErrorMapper.wrapLoop(() => {
  // console.log(`Current game tick is ${Game.time}`);

  if (!Memory.uuid || Memory.uuid > 100)
    Memory.uuid = 0;

//* Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  //   for (let creep in _.filter(Memory.creeps, { role: "harvester" })) {
  //     harvester.run(creep)

  //     }
  // }

  for (const spawn_name in Game.spawns) {
  //* Spawn new creeps
  if (spawner.space_available(Game.spawns[spawn_name], "harvester")) {
      spawner.spawn_creep(Game.spawns[spawn_name], "", "harvester")
    }

    _loadCreeps(Game.spawns[spawn_name].room)
    _.each(harvesters, (creep: Creep) => {
        harvester.run(creep)
      }
    );
  }
});
