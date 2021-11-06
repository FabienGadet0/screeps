import { ICreep, ACTION } from "./ICreep";
import { profile } from "../../Profiler/Profiler";
import * as Utils from "../../utils/utils";

@profile
export class Harvester extends ICreep {
    constructor(creep_name: string) {
        super(creep_name);
        this.main_action = ACTION.TRANSFER;
        this.creep.memory.source_to_target = 0;
    }

    private _softlock_guard() {
        if (this.action === ACTION.WAITING_NEXT_TASK || (this.action === ACTION.IDLE && this._task_available("transfer")))
            this._start_task("transfer", ACTION.TRANSFER);
        // if (!this.action) this.set(ACTION.HARVEST, this.main_source_target);
        // if (this.last_return_code !== ERR_NOT_IN_RANGE && this.last_return_code !== OK)
        //     console.log(this.creep + " last error is " + Utils._C("", this.last_return_code));
    }

    protected logic() {
        //* LOGIC : -----------------------------------------
        // harvest source
        // transfer to spawn
        // if spawn is full
        // transfer to extensions.
        //* -------------------------------------------------

        //* is doing a task and task is full -> finish task -> not doing task
        if (this.doing_task && this.target) {
            const target_obj = Game.getObjectById(this.target);
            // console.log("logic -> " + (target_obj.store.getFreeCapacity(RESOURCE_ENERGY) === 0));
            if (target_obj.store.getFreeCapacity(RESOURCE_ENERGY) === 0) this._task_finished();
        }

        //*  dont need energy and task available. -> get task -> if no task go idle
        if (!this.target && this._task_available("transfer")) this._start_task("transfer", ACTION.TRANSFER);
        else if (!this.target) this._do_nothing();

        this._softlock_guard();
        //TODO pickup if there is energy on the ground
    }
}
