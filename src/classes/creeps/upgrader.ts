import * as Config from "../../config";
import * as Utils from "../../utils/utils";
import { ICreep, ACTION } from "./ICreep";
import { profile } from "../../Profiler/Profiler";

@profile
export class Upgrader extends ICreep {
    controler_id: Id<StructureController>;

    constructor(creep_name: string) {
        super(creep_name);
        this.controler_id = Game.spawns[this.spawn_name].room.controller!.id;
        this.main_action = ACTION.UPGRADE_CONTROLLER;
        this.set(ACTION.UPGRADE_CONTROLLER, this.controler_id);
        // this.creep.memory.source_to_target = 0;
    }

    protected _softlock_guard() {
        if (!this.target && this.action === ACTION.UPGRADE_CONTROLLER) this.target = this.controler_id;
        if (!this.doing_task) this.doing_task = true; //? upgraders always work.
        if (this.action === ACTION.WAITING_NEXT_TASK) this.doing_task = false; //? upgraders always work.
    }

    protected logic() {
        //* LOGIC : -----------------------------------------
        // harvest source
        // upgrade controller
        //* -------------------------------------------------

        if (!this.doing_task) {
            this.set(ACTION.UPGRADE_CONTROLLER, this.controler_id);
            this.doing_task = true;
        }
        this._softlock_guard();
    }
}
