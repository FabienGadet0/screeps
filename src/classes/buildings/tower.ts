import { IBuilding, ACTION } from "./IBuilding";
import { profile } from "../../Profiler/Profiler";

@profile
export class Tower extends IBuilding {
    // constructor(id: Id<any>) {
    //     super(id)
    // }

    //
    protected logic() {
        //*  dont need energy and task available. -> get task -> if no task go idle

        if (!this.target || (this.action === ACTION.IDLE && this.has_energy())) {
            const task = this._task_available(["attack", "heal", "repair"]);
            if (task) this._start_task(task.toLowerCase(), task as ACTION);
        }

        //* is doing a task and task is full   finish task -> not doing task
        if (this.doing_task && this.target) {
            const target_obj = Game.getObjectById(this.target);
            if ((this.action === ACTION.REPAIR || this.action === ACTION.HEAL) && target_obj.hits === target_obj.hitsMax)
                this._task_finished();
            else if (this.action === ACTION.TRANSFER && target_obj.store.getFreeCapacity() === 0) this._task_finished();
            else if (this.action === ACTION.ATTACK && !target_obj) this._task_finished();
        }
    }
}
