import * as Config from "../config";
import * as Utils from "../utils/utils";
import * as Finder from "../utils/finder";
import { Memory_manager } from "./memory_manager";
import { Creep_factory } from "./creep_factory";
import { Build_planner } from "./build_planner";
import { Creep_manager } from "./creep_manager";

import * as packRat from "../utils/packrat";

export class Room_orchestrator {
    spawn_id: Id<StructureSpawn>;
    spawn_name: string;
    controller?: StructureController;
    room_name: string;
    memory_manager: Memory_manager;
    build_planner: Build_planner;
    creep_manager: Creep_manager;
    lvl: number;

    constructor(room_name: string, spawn: StructureSpawn) {
        this.room_name = room_name;
        this.spawn_id = spawn.id;
        this.spawn_name = spawn.name;
        // this.controller = Game.rooms[room_name].controller ;
        this.lvl = 1;
        this.memory_manager = new Memory_manager(room_name);
        this.build_planner = new Build_planner(room_name, this.spawn_id);

        this.creep_manager = new Creep_manager(room_name, this.spawn_id);

        console.log("Room orchestrator of " + room_name + " created");
    }

    public update(): void {
        Finder.UPDATE_IDS(Game.spawns[this.spawn_name].room, [
            "lvl",
            "controller",
            "roads",
            "sources",
            "construction_sites",
            "extensions",
            "minerals",
            "to_repair",
            "creeps_ids",
            "extensions_not_full",
            "containers_not_full",
        ]);

        this.memory_manager.update();
        this.build_planner.update();
        this.creep_manager.update();
    }

    public run(): void {
        if (Utils.check_if_roombased_variables_are_up(this.room_name)) {
            this.memory_manager.run();
            this.creep_manager.run();
            this.build_planner.run();
        } else console.log("[" + this.room_name + "]" + "[" + this.spawn_id + "]" + " Roombased variables aren't up!");
    }
}
