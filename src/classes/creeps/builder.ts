import { ICreep, ACTION } from "./ICreep";

import { profile } from "../../Profiler/Profiler";

@profile
export class Builder extends ICreep {
    constructor(creep_name: string) {
        super(creep_name);
        this.main_action = ACTION.BUILD;
        this.set(ACTION.WAITING_NEXT_TASK, undefined);
    }

    protected logic() {
        //*  dont need energy and task available. -> get task -> if no task go idle
        if (!this.target) {
            if (this._task_available("repair")) this._start_task("repair", ACTION.REPAIR);
            else if (this._task_available("build")) this._start_task("build", ACTION.BUILD);
        }
        //* is doing a task and task is full   finish task -> not doing task
        if (this.doing_task && this.target) {
            const target_obj = Game.getObjectById(this.target);
            if (this.action === ACTION.REPAIR && target_obj.hits === target_obj.hitsMax) this._task_finished();
            else if (this.action === ACTION.BUILD && !target_obj) this._task_finished();
        }
        this._softlock_guard();
    }

    private _softlock_guard() {
        if (!this.doing_task && !this.target && !this._task_available("repair") && !this._task_available("build")) this._do_nothing();
        // if (this.doing_task && this.action && !this.target) {
        //     this._do_nothing();
        //     console.log("got softlock " + this.debug_me());
        // }
    }
}
