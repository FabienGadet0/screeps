import * as Config from "../../config";
import * as Utils from "../../utils/utils";
import * as Finder from "../../utils/finder";
import { ICreep, ACTION } from "./ICreep";
import { profile } from "../../Profiler/Profiler";

@profile
export class Upgrader extends ICreep {
    controler_id: Id<StructureController>;
    upgrading: boolean;

    constructor(creep_name: string) {
        super(creep_name);
        this.controler_id = Game.spawns[this.spawn_name].room.controller!.id;
        this.upgrading = false;
        this.main_action = ACTION.UPGRADE_CONTROLLER;
        this.set(this.main_action, this.controler_id);
    }

    protected _softlock_guard() {
        if (!this.target) {
            if (this.action === ACTION.IDLE) this.set(ACTION.HARVEST, this.source_ids[0]);
            if (this.action === ACTION.HARVEST) this.target = this.source_ids[0];
            if (this.action === ACTION.UPGRADE_CONTROLLER) this.target = this.controler_id;
        }
    }

    protected logic() {
        //* LOGIC : -----------------------------------------
        // harvest source
        // upgrade controller
        //* -------------------------------------------------

        if (this.creep.store[RESOURCE_ENERGY] === this.creep.store.getCapacity() && this.action !== ACTION.UPGRADE_CONTROLLER) {
            this.set(ACTION.UPGRADE_CONTROLLER, this.controler_id);
            this.upgrading = false;
        } else if (this.creep.store[RESOURCE_ENERGY] === 0) {
            this.set(ACTION.HARVEST, this.source_ids[0]);
            this.upgrading = true;
        }
        this._softlock_guard();
    }
}
