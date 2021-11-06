import * as Config from "../config";
import * as Utils from "../utils/utils";
import { Memory_manager } from "./memory_manager";
import { Creep_factory } from "./creep_factory";
import { Room_build_planner } from "./room_build_planner";
import { Creep_manager } from "./creep_manager";

import * as packRat from "../utils/packrat";
import { Mnemonic, mnemon } from "../utils/mnemonic";

export class Room_orchestrator implements Mnemonic {
    // export class Room_orchestrator {
    spawn_name: string;

    room_name: string;
    memory_manager: Memory_manager;
    room_build_planner: Room_build_planner;
    creep_manager: Creep_manager;
    @mnemon
    lvl: number;

    @mnemon
    spawn_id: Id<StructureSpawn>;

    @mnemon
    controller: Id<StructureController>;

    constructor(room_name: string, spawn: StructureSpawn) {
        Memory.rooms_new[room_name] = this._init_room(room_name);

        this.room_name = room_name;
        this.spawn_id = spawn.id;
        this.spawn_name = spawn.name;
        this.memory_manager = new Memory_manager(room_name);
        this.room_build_planner = new Room_build_planner(room_name, this.spawn_id);

        this.creep_manager = new Creep_manager(room_name);
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

    public update(): void {
        this.memory_manager.update(); //* Always first

        this.locator();
        this.lvl = Utils.round_lvl(300 + _.size(Memory.rooms_new[this.room_name].structure_id["extensions"]) * 50);

        this.room_build_planner.update();
        this.creep_manager.update();
    }

    public run(): void {
        if (this._check_if_room_is_initialized()) {
            // Game.rooms[this.room_name].visual.circle(10, 20).line(0, 0, 10, 20);
            this.memory_manager.run();
            this.room_build_planner.run();
            this.creep_manager.run();
        } else {
            console.log("[" + this.room_name + "]" + "[" + this.spawn_id + "]" + " Roombased variables aren't up!");
        }
    }
}
