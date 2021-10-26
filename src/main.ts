import { ErrorMapper } from "utils/ErrorMapper";
import * as Config from "./config";
import * as spawner from "classes/spawner";
import * as harvester from "classes/harvester";
import * as skeleton from "classes/skeleton";
import * as builder from "classes/builder";
import * as upgrader from "classes/upgrader";

const run_all_classes : Record<string, any> = {
  'harvester': harvester,
  'builder': builder,
  'upgrader': upgrader
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
    debug_mode: boolean;
    debug_speak: boolean;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    spawn_name: string;
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

  for (const spawn_name in Game.spawns) {
    spawner.handle_creep_spawning(Game.spawns[spawn_name])
    spawner.create_buildings(Game.spawns[spawn_name])
    let creeps = Game.spawns[spawn_name].room.find(FIND_MY_CREEPS);
    _.each(creeps, (creep: Creep) => {
      skeleton.manageRenew(creep);
      run_all_classes[creep.memory.role].run(creep)
      }
    );
  }
});
