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
  interface Memory {
    uuid: number;
    log: any;
    debug_mode: boolean;
    debug_speak: boolean;
    build_roads_to_controller: boolean;
    build_roads_to_energy: boolean;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    spawn_name: string;
  }

  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

Memory.debug_mode= false;
Memory.debug_speak= false;
Memory.build_roads_to_controller= false;
Memory.build_roads_to_energy= false;


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
      if(!skeleton.manageRenew(creep))
        run_all_classes[creep.memory.role].run(creep)
      }
    );
  }
});
