import * as Config from "../../config";
import * as Utils from "../../utils/utils";
import * as Finder from "../../utils/finder";
import { ICreep, ACTION } from "./ICreep";
// import * as Config from "../../config";
// import * as Utils from "../../utils/utils";
// import * as Finder from "../../utils/finder";
import { profile } from "../../Profiler/Profiler";

export class Upgrader extends ICreep {
    controler_id: Id<StructureController>;
    upgrading: boolean;

    constructor(creep_name: string) {
        super(creep_name);
        this.controler_id = Game.spawns[this.spawn_name].room.controller!.id;
        this.upgrading = false;
        this.creep.memory.action = ACTION.UPGRADE_CONTROLLER;
        this.creep.memory.target = this.controler_id;
    }

    protected logic() {
        //* LOGIC : -----------------------------------------
        // harvest source
        // upgrade controller
        //* -------------------------------------------------
        if (this.creep.store[RESOURCE_ENERGY] === this.creep.store.getCapacity() && !this.upgrading) {
            this.set(ACTION.UPGRADE_CONTROLLER, this.controler_id);
            this.upgrading = false;
        } else if (this.creep.store[RESOURCE_ENERGY] === 0) {
            this.set(ACTION.HARVEST, this.source_ids[0]);
            this.upgrading = true;
        }
    }
}

// function _upgrade_controller(creep: Creep): void {
//     // if (finder.UPDATE(Game.spawns[creep.memory.spawn_name], ["controller"])) {
//     const controller = Finder.from_id(Memory["rooms"][creep.room.name].structure_ids["controller"]);
//     if (controller && creep.upgradeController(controller) === ERR_NOT_IN_RANGE) Utils._C(creep.name, creep.moveTo(creep, controller));
//     // }
// }

// export function run(creep: Creep, opts?: {} | undefined) {
//     if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) creep.memory.working = true;
//     else if (creep.store[RESOURCE_ENERGY] <= 1) creep.memory.working = false;

//     creep.memory.working ? _upgrade_controller(creep) : ICreep.harvest(creep);
//     // creep.memory.working = creep.store[RESOURCE_ENERGY] < 10 ? creep.memory.working
//     // ? _harvest(creep) : _upgrade_controller(creep)
// }
