import { ErrorMapper } from "utils/ErrorMapper";
import * as Config from "./config";
import * as Utils from "./utils/utils";
import * as packRat from "./utils/packrat";
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
    build_map: Record<string,Record<string, any>>;
    my_structures: Record<string, Record<string, any>>;
    my_creeps: Creep[];
    safe_delete: boolean;
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
      warn: any;
      err: any;
      error: any;
    }
  }
}

// function log(arg: string) {
//   if (Memory.debug_mode) return console.log(arg)
// }
// function warn(arg: string) {
//   if (Memory.debug_mode) return console.log('<span style=color:#FFBF3F>' + arg + '</span>');
// }
// function err(arg: string) {
//   if (Memory.debug_mode) return console.log('<span style=color:#D18F98>' + arg + '</span>');
// }
// function error(arg: string) {
//   if (Memory.debug_mode) return console.log('<span style=color:#D18F98>' + arg + '</span>');
// }

//     global.log = log;
//     global.warn = warn;
//     global.err = err;
//     global.error = error;


    Utils.init_variables()

    function _manage_memory() {
      if (!Memory.uuid || Memory.uuid > 100)
        Memory.uuid = 0;

      //* Automatically delete memory of missing creeps
      for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
          delete Memory.creeps[name];
        }
      }
    }

    export const loop = ErrorMapper.wrapLoop(() => {
      _manage_memory()

      for (const spawn_name in Game.spawns) {
        let spawn = Game.spawns[spawn_name]
        let creeps = spawn.room.find(FIND_MY_CREEPS);
        const room_name = spawn.room.name
        Utils.manage_roombased_variables(spawn)
        if (Utils.check_if_roombased_variables_are_up(spawn)) {
          spawner.handle_creep_spawning(spawn)

          // spawner.create_buildings(spawn)
          if (Memory.build_map[room_name]['build_roads']) {
            spawner.create_roads(spawn)
            Memory.build_map[room_name]['build_roads'] = false
          }
              if (Memory.build_map[room_name]['build_extensions']) {
                spawner.create_extensions(spawn)
                Memory.build_map[room_name]['build_extensions'] = false
          }
          if (Memory.safe_delete)
            spawner.delete_all(spawn.room)

          _.each(Memory.my_creeps, (creep: Creep) => {
            if (!skeleton.manageRenew(creep, spawn))
              run_all_classes[creep.memory.role].run(creep)
          });
        }
        else
          console.log("Room variables couldn't be set , Room : " + room_name)
      }
    });
