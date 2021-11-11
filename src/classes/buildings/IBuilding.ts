//* ICreep for all  creeps

import * as Config from "../../config";
import * as Utils from "../../utils/utils";
import { match, __, when, select } from "ts-pattern";

export enum ACTION {
    IDLE = "IDLE",
    REPAIR = "REPAIR",
    TRANSFER = "TRANSFER",
    HEAL = "HEAL",
    ATTACK = "ATTACK",
}

export abstract class IBuilding {
    id: Id<any>;
    obj: any;

    action?: ACTION;
    target?: Id<any>;

    room_name: string;

    last_return_code: ScreepsReturnCode | CreepMoveReturnCode | number;
    main_action: ACTION;
    doing_task: boolean;
    _ACTION_to_func: Record<ACTION, any>;

    constructor(id: Id<any>, room_name: string) {
        this.id = id;
        this.room_name = room_name;
        this.obj = Utils.get_by_id(this.id);
        this.last_return_code = OK;
        this.doing_task = false;
        this.set(ACTION.IDLE, undefined);
        this.main_action = ACTION.IDLE;
    }

    //TODO make it better
    private action_to_func(...target: any): any {
        switch (this.action) {
            case ACTION.IDLE:
                return this.idle(target[0]);

            case ACTION.HEAL:
                return this.obj.heal(target[0]);

            case ACTION.ATTACK:
                return this.obj.attack(target[0]);

            case ACTION.REPAIR:
                return this.obj.repair(target[0]);

            case ACTION.TRANSFER:
                return this.obj.transfer(target[0], RESOURCE_ENERGY); //TODO for now it's only resource energy , but maybe i can do a second arg thing.
        }
    }

    protected _do_nothing(): void {
        this.set(ACTION.IDLE, undefined);
        this.doing_task = false;
    }

    protected _task_finished(): void {
        if (this.action === ACTION.ATTACK || this.action === ACTION.HEAL)
            Memory.rooms_new[this.room_name].room_tasks[this.action.toLowerCase()].shift();
        this.set(ACTION.IDLE, undefined);
    }

    protected _start_task(task_name: string, action?: ACTION): void {
        const act = action ? action : this.main_action;

        if (!_.isEmpty(Memory.rooms_new[this.room_name].room_tasks[task_name])) {
            let target = undefined;
            if (task_name === "attack" || task_name === "heal") target = Memory.rooms_new[this.room_name].room_tasks[task_name][0];
            else target = Memory.rooms_new[this.room_name].room_tasks[task_name].shift();

            this.set(act, target);
            this.doing_task = true;
        }
    }

    protected _task_available(task_names: string[]): string | undefined {
        let r: string = "";
        _.each(task_names, (task: string) => {
            if (!_.isEmpty(Memory.rooms_new[this.room_name].room_tasks[task]) && r === "") r = task.toUpperCase();
        });

        return r === "" ? undefined : r;
    }

    public set(action: ACTION, target?: Id<any>) {
        this.action = action;
        this.target = target;
    }

    public update() {
        this.obj = Utils.get_by_id(this.id);
    }

    protected logic() {}

    public run() {
        this.logic();

        if (this.action && this.target) {
            const target_obj = Game.getObjectById(this.target);
            if (!this.target) this.target = undefined;
            this.last_return_code = Utils._C(this.obj, this.action_to_func(target_obj));
        }
    }

    public has_energy(): boolean {
        return this.obj.store[RESOURCE_ENERGY] > 0;
    }

    public is_full(): boolean {
        return this.obj.store.getFreeCapacity(RESOURCE_ENERGY) === 0;
    }

    public is_empty(): boolean {
        return this.obj.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
    }

    private idle(_: any) {}
}
