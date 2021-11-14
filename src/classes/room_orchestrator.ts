import * as Config from "../config";
import * as Utils from "../utils/utils";
import { Memory_manager } from "./memory_manager";
import { Creep_factory } from "./creep_factory";
import { Bunker_planner } from "./room_bunker_planner";
import { Creep_manager } from "./creep_manager";
import { Building_manager } from "./building_manager";

import * as packRat from "../utils/packrat";
import { Mnemonic, mnemon } from "../utils/mnemonic";
import { Visualizer } from "./visualizer";

export class Room_orchestrator implements Mnemonic {
    spawn_name: string;

    room_name: string;
    memory_manager: Memory_manager;
    bunker_planner: Bunker_planner;
    creep_manager: Creep_manager;
    building_manager: Building_manager;
    visualizer: Visualizer;
    spawn_id: Id<StructureSpawn>;

    controller: Id<StructureController>;

    constructor(room_name: string, spawn: StructureSpawn) {
        Memory.rooms_new[room_name] = this._init_room(room_name);

        this.room_name = room_name;
        this.spawn_id = spawn.id;
        this.controller = Game.rooms[room_name].controller!.id;
        this.spawn_name = spawn.name;

        this.memory_manager = new Memory_manager(room_name);
        this.bunker_planner = new Bunker_planner(room_name, this.spawn_id);
        this.visualizer = new Visualizer(room_name);
        this.creep_manager = new Creep_manager(room_name);
        this.building_manager = new Building_manager(room_name);
        console.log("Room orchestrator of " + room_name + " created");
    }

    public locator(): { [key: string]: any } {
        return Memory.rooms_new[this.room_name];
    }

    private _check_if_room_is_initialized(): boolean {
        return Memory.rooms_new[this.room_name] && this.spawn_id && this.controller;
    }

    private _init_room(room_name: string) {
        let all_classes: Record<string, number> = {};
        let creeps_name: string[] = [];
        return Config.room_schema;
    }

    private _manage_emergency() {
        if (!Memory.rooms_new[this.room_name].commands.all_harvester) {
            if (
                (Memory.rooms_new[this.room_name].classes_in_room["harvester"] === 0 &&
                    Memory.rooms_new[this.room_name].cripple_creeps.length > 0) ||
                Memory.rooms_new[this.room_name].cripple_creeps.length >= Config.EMERGENCY_CRIPPLE
            )
                Memory.rooms_new[this.room_name].commands.all_harvester = true;
        } else if (Memory.rooms_new[this.room_name].cripple_creeps.length === 0) {
            Memory.rooms_new[this.room_name].commands.all_harvester = false;
        }
    }

    public update(): void {
        // console.log(`repair task ${Memory.rooms_new[this.room_name].room_tasks["repair"]}`);

        // this.locator();
        this.memory_manager.update(); //* Always first
        this.bunker_planner.update();

        this.building_manager.update();
        this.creep_manager.update();
        this.visualizer.update();
    }

    public run(): void {
        if (this._check_if_room_is_initialized()) {
            this._manage_emergency();
            this.memory_manager.run();
            this.bunker_planner.run();
            this.building_manager.run();
            this.creep_manager.run();
            this.visualizer.run();
        } else {
            console.log("[" + this.room_name + "]" + "[" + this.spawn_id + "]" + " Roombased variables aren't up!");
        }
    }
}
