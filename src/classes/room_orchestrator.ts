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
    // controller_id?: Id<StructureController>;
    room_name: string;
    memory_manager: Memory_manager;
    room_build_planner: Room_build_planner;
    creep_manager: Creep_manager;
    @mnemon
    lvl: number;

    @mnemon
    spawn_id: Id<StructureSpawn>;

    constructor(room_name: string, spawn: StructureSpawn) {
        this.room_name = room_name;
        this.spawn_id = spawn.id;
        this.spawn_name = spawn.name;
        // this.controller_id = spawn.room.controller ? spawn.room.controller.id : undefined;
        this.lvl = this.locator().lvl;

        this._manage_roombased_variables(room_name);
        this.memory_manager = new Memory_manager(room_name);
        this.room_build_planner = new Room_build_planner(room_name, this.spawn_id);

        this.creep_manager = new Creep_manager(room_name);
        console.log("Room orchestrator of " + room_name + " created");
    }

    public locator(): { [key: string]: any } {
        return Memory.rooms_new[this.room_name];
    }

    //? Check if vars are up and update mandatory vars.
    private _manage_roombased_variables(room_name: string) {
        if (!Memory["rooms"][room_name]) Memory["rooms"][room_name] = Utils._init_room_memory();
    }

    // protected set_lvl_of_room() {
    //     //? lvl is the total amount of energy that can be used.
    //     this.lvl = Utils.round_lvl(300 + _.size(Memory.rooms[this.room_name].structure_ids["extensions"]) * 50);
    //     Memory.rooms[this.room_name].lvl = this.lvl;
    //     //TODO if there are many spawns it doesn't work.
    // }

    public update(): void {
        this.memory_manager.update(); //* Always first

        this.locator();
        this.lvl = Utils.round_lvl(300 + _.size(Memory.rooms[this.room_name].structure_ids["extensions"]) * 50);
        // this.set_lvl_of_room();

        this.room_build_planner.update();
        this.creep_manager.update();
    }

    public run(): void {
        if (Utils.check_if_roombased_variables_are_up(this.room_name)) {
            this.memory_manager.run();
            this.room_build_planner.run();
            this.creep_manager.run();
        } else console.log("[" + this.room_name + "]" + "[" + this.spawn_id + "]" + " Roombased variables aren't up!");
    }
}
