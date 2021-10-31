import { ErrorMapper } from "utils/ErrorMapper";
import './utils/traveler'
import './utils/init_functions';
import * as Config from "./config";
import * as Utils from "./utils/utils";
import * as finder from "./utils/finder";
import * as packRat from "./utils/packrat";
import * as spawner from "classes/spawner";
import * as buildPlanner from "classes/buildplanner";

import * as harvester from "classes/harvester";
import * as skeleton from "classes/skeleton";
import * as builder from "classes/builder";
import * as upgrader from "classes/upgrader";

import * as Profiler from "./Profiler";

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
    rooms: Record<string, RoomMemory>;
    empire: any;
  }

  interface RoomMemory{
    updater: Record<string, number>;
    build_map: Record<string, any>;
    structures: Record<string, any>;
    creeps: Creep[];
    safe_delete: boolean;
    flags: Flag[];
    avoid: any;
    lvl: number;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    spawn_name: string;
    target_type: any;
    lvl: number;
    is_renewing: boolean;
    _trav: any;
    _travel: any;
  }

  namespace NodeJS {
    interface Global {
      log: any;
      warn: any;
      err: any;
      error: any;
      delete_all_construction_sites : any;
      delete_all_roads : any;
      delete_all : any;
      create_roads : any;
      create_struct:any
      _C: any;
      debug: any;
      update_room_memory: any;
      Profiler: any;
    }
  }
}

Utils.debug();
Memory["rooms"] = {};
// global.Profiler = Profiler.init();

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
        const room_name = spawn.room.name
        Utils.manage_roombased_variables(spawn)
        if (Utils.check_if_roombased_variables_are_up(spawn)) {
          finder.UPDATE(spawn,['creeps','spawn','sources','to_repair'])
          let creeps = Memory["rooms"][room_name].creeps
          spawner.handle_creep_spawning(spawn)
          buildPlanner.manage_buildings(spawn)
          _.each(creeps, (creep: Creep) => {
            //? EMERGENCY
            // run_all_classes["harvester"].run(creep)

            if (!skeleton.manageRenew(creep, spawn))
              run_all_classes[creep.memory.role].run(creep)
          }
          );
        }
        else
          console.log("Room variables couldn't be set , Room : " + room_name)
      }
    });
