import { ICreep, ACTION } from "./ICreep";
import { profile } from "../../Profiler/Profiler";

@profile
export class Builder extends ICreep {
    constructor(creep_name: string) {
        super(creep_name);
        this.main_action = ACTION.BUILD;
        this._softlock_guard();
        // this.set(ACTION.HARVEST, this.main_source_target);
    }

    protected logic() {
        //* LOGIC : -----------------------------------------
        // if no energy
        // go to energy
        // if energy
        // get construction sites or repair sites
        // repair in priority
        // if no construction sites -> repair
        // if no repair -> Construction sites

        //  if build
        //     build first sites
        //     if not in range then moveto first site
        // else (repair)
        //     repair first sites
        //     if not in range then moveto first site
        //* -------------------------------------------------

        //* start a task
        if (this.action === ACTION.HARVEST || (this.action === ACTION.IDLE && this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)) {
            if (this._task_available("to_repair")) this._start_task("to_repair");
            else if (this._task_available("to_build")) this._start_task("to_build");
        }

        //* finished task
        if ((this.action === this.main_action || this.action === ACTION.REPAIR) && this.target) {
            const target_obj = Game.getObjectById(this.target);
            if (this.action === ACTION.REPAIR && target_obj.hits === target_obj.hitsMax) this._task_finished();
            //? task finished for building action.
            if (this.action === ACTION.BUILD && !target_obj) this._task_finished();
        }

        //* harvest if empty
        if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) this.set(ACTION.HARVEST, this.source_ids[0]);

        this._softlock_guard();
    }

    private _softlock_guard() {
        if ((!this.target && this.action === ACTION.BUILD) || this.action === ACTION.REPAIR)
            //? shouldn't happen
            console.log(this.creep + " has an action " + this.action + " without target");

        if (this.target && !this.action) console.log(this.creep + " doesn't have an action but has a target " + this.target);
        if (!this.target && !this.action) this.set(ACTION.HARVEST, this.source_ids[0]);
    }
}
