import * as Config from "../config";
import * as Utils from "../utils/utils";
import { Memory_manager } from "./memory_manager";
import { Creep_factory } from "./creep_factory";
import { Room_build_planner } from "./build_planner";
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
        this.controller = this.locator().controller;
        this.lvl = this.locator().lvl;

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
        // _.each(Game.rooms[room_name].find(FIND_MY_CREEPS), (creep: Creep) => {
        //     if (!all_classes[creep.memory.role]) all_classes[creep.memory.role] = 1;
        //     else all_classes[creep.memory.role] += 1;
        //     creeps_name.push(creep.name);
        // });

        return {
            classes_in_room: {},
            lvl: 300,
            room_tasks: {
                updater: { to_transfer: 0, to_build: 0, to_repair: 0 },
                to_transfer: [],
                to_build: [],
                to_repair: [],
            },
            creeps_name: [],
            cripple_creeps: [],
            structure_id: {
                updater: {
                    roads: 0,
                    sources: 0,
                    construction_sites: 0,
                    extensions: 0,
                    minerals: 0,
                    extensions_not_full: 0,
                    flags: 0,
                    dropped_resources: 0,
                    containers_not_full: 0,
                    to_repair: 0,
                },
                roads: [],
                sources: [],
                construction_sites: [],
                extensions: [],
                minerals: [],
                extensions_not_full: [],
                flags: [],
                dropped_resources: [],
                containers_not_full: [],
                to_repair: [],
            },
            build_plan: {},
            commands: { all_harvest: false, all_transfer_to_spawn: false },
            update_map: {
                new_creep: false,
                roads: false,
                sources: false,
                construction_sites: false,
                extensions: false,
                minerals: false,
                extensions_not_full: false,
                flags: false,
                dropped_resources: false,
                containers_not_full: false,
                to_repair: false,
                room_tasks: false,
                lvl: false,
                forced: false,
            },
        };
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
            this.memory_manager.run();
            this.room_build_planner.run();
            this.creep_manager.run();
        } else {
            console.log("[" + this.room_name + "]" + "[" + this.spawn_id + "]" + " Roombased variables aren't up!");
        }
    }
}
