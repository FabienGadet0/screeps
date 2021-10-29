import { ErrorMapper } from "utils/ErrorMapper";

import './utils/init_functions';
import * as Config from "./config";
import * as Utils from "./utils/utils";
import * as packRat from "./utils/packrat";
import * as spawner from "classes/spawner";
import * as buildPlanner from "classes/buildplanner";


import * as harvester from "classes/harvester";
import * as mineralharvester from "classes/mineralharvester";
import * as skeleton from "classes/skeleton";
import * as builder from "classes/builder";
import * as upgrader from "classes/upgrader";


const run_all_classes : Record<string, any> = {
  'harvester': harvester,
  'mineralharvester': mineralharvester,
  'builder': builder,
  'upgrader': upgrader
}


declare global {
  interface Memory {
    uuid: number;
    log: any;
    debug_mode: boolean;
    debug_speak: boolean;
    build_map: Record<string, Record<string, any>>;
    my_structures: Record<string, Record<string, any>>;
    my_creeps: Creep[];
    safe_delete: boolean;
    // energy: Record<string, any>;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    spawn_name: string;
    target_type: string;
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
      create_extensions : any;
      create_containers:any
      _C: any;
      debug: any;
      populate_build_map : any;
      populate_my_structures: any;
    }
  }
}


// global.test = test;

    Utils.init_variables()
    Utils.debug()

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
          buildPlanner.manage_buildings(spawn)
          _.each(Memory.my_creeps, (creep: Creep) => {
            if (!skeleton.manageRenew(creep, spawn))
              run_all_classes[creep.memory.role].run(creep)
          });
        }
        else
          console.log("Room variables couldn't be set , Room : " + room_name)
      }
    });
