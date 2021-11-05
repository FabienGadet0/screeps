//* ICreep for all  creeps

import * as Config from "../../config";
import * as Utils from "../../utils/utils";
import { match, __, when, select } from "ts-pattern";

export enum ACTION {
    IDLE = "IDLE",
    // MOVETO = "MOVETO",
    RENEW = "RENEW",
    BUILD = "BUILD",
    REPAIR = "REPAIR",
    UPGRADE_CONTROLLER = "UPGRADE_CONTROLLER",
    TRANSFER = "TRANSFER",
    PICKUP = "PICKUP",
    WAITING_NEXT_TASK = "WAITING_NEXT_TASK",
}

export abstract class ICreep {
    creep_name: string;
    creep_id: Id<Creep>;
    action?: ACTION;
    target?: Id<any>;
    lvl: number;
    spawn_name: string;
    creep: Creep;
    ticksToLive?: number;
    source_ids: Id<Source>[];
    last_return_code: ScreepsReturnCode | CreepMoveReturnCode | number;
    main_action: ACTION;
    doing_task: boolean;
    needs_energy: boolean;

    _ACTION_to_icon: Record<ACTION, string>;
    _ACTION_to_func: Record<ACTION, any>;

    protected _get_sources() {
        return _.map(this.creep.room.find(FIND_SOURCES_ACTIVE), (source: Source) => {
            return source.id;
        });
    }

    constructor(creep_name: string) {
        this.creep = Game.creeps[creep_name];

        this.creep_name = creep_name;
        this.creep_id = this.creep.id;
        this.source_ids = this._get_sources();
        this.last_return_code = OK;
        this.lvl = this.creep.memory.lvl;
        this.spawn_name = this.creep.memory.spawn_name;
        this.ticksToLive = this.creep.ticksToLive;
        this.creep.memory.target = undefined;
        this.doing_task = false;
        this.set(ACTION.WAITING_NEXT_TASK, undefined);
        this.main_action = ACTION.WAITING_NEXT_TASK;
        this.needs_energy = false;
        this.creep.memory.source_to_target = 0;

        this._ACTION_to_func = {
            IDLE: this.idle,
            // MOVETO: this.moveTo,
            RENEW: this.renew,
            BUILD: this.creep.build,
            REPAIR: this.creep.repair,
            TRANSFER: this.creep.transfer,
            UPGRADE_CONTROLLER: this.creep.upgradeController,
            PICKUP: this.creep.pickup,
            WAITING_NEXT_TASK: undefined,
        };

        this._ACTION_to_icon = {
            IDLE: "",
            // HARVEST: "⛏️Harvest",
            // MOVETO: "",
            RENEW: "⬆️Renew",
            BUILD: "👷Build",
            REPAIR: "👷Repair",
            TRANSFER: "🚚Transfer",
            UPGRADE_CONTROLLER: "Upgrade",
            PICKUP: "Pickup",
            WAITING_NEXT_TASK: "",
        };
    }

    // // prettier-ignore
    // private action_to_func(...target: any): any {
    //     return match(this.action)
    //         .with(ACTION.IDLE, () => { this.idle(target[0]) })
    //         .with(ACTION.RENEW, () => { this.renew(target[0]) })
    //         .with(ACTION.BUILD, () => { this.creep.build(target[0]) })
    //         .with(ACTION.REPAIR, () => { this.creep.repair(target[0]) })
    //         .with(ACTION.RENEW, () => { this.idle(target[0]) })
    //         .with(ACTION.TRANSFER, () => { this.creep.transfer(target[0], RESOURCE_ENERGY) })
    //         .with(ACTION.UPGRADE_CONTROLLER, () => { this.creep.upgradeController(target[0]) })
    //         .with(__,()=> console.log("Action not registered ->> "+ this.action))
    //         // .exhaustive()
    // }

    //TODO make it better
    private action_to_func(...target: any): any {
        switch (this.action) {
            case ACTION.IDLE:
                return this.idle(target[0]);

            case ACTION.RENEW:
                return this.renew(target[0]);

            case ACTION.BUILD:
                return this.creep.build(target[0]);

            case ACTION.REPAIR:
                return this.creep.repair(target[0]);

            case ACTION.RENEW:
                return this.renew(target[0]);

            case ACTION.TRANSFER:
                return this.creep.transfer(target[0], RESOURCE_ENERGY); //TODO for now it's only resource energy , but maybe i can do a second arg thing.

            case ACTION.UPGRADE_CONTROLLER:
                return this.creep.upgradeController(target[0]);

            case ACTION.PICKUP:
                return this.creep.pickup(target[0]);
        }
    }

    protected _do_nothing(): void {
        this.set(ACTION.IDLE, undefined);
        this.doing_task = false;
    }

    protected _task_finished(): void {
        this.set(ACTION.WAITING_NEXT_TASK, undefined);
        this.creep.say("Finished");
    }

    protected _start_task(task_name: string, action?: ACTION): void {
        const act = action ? action : this.main_action;
        if (!_.isEmpty(Memory.rooms_new[this.creep.room.name].room_tasks[task_name])) {
            // const tasks = Utils.take_first(Memory.rooms_new[this.creep.room.name].room_tasks[task_name]);

            this.set(act, Memory.rooms_new[this.creep.room.name].room_tasks[task_name].shift());
            // Memory.rooms_new[this.creep.room.name].room_tasks[task_name] = tasks.new_list;

            console.log(
                "New task " +
                    this.action +
                    " ->> " +
                    this.target +
                    " " +
                    _.size(Memory.rooms_new[this.creep.room.name].room_tasks[task_name]) +
                    " tasks left for " +
                    task_name,
            );

            this.doing_task = true;
            this.creep.say(this._ACTION_to_icon[act]);
        }
    }

    protected _task_available(task_name: string): boolean {
        return !_.isEmpty(Memory.rooms_new[this.creep.room.name].room_tasks[task_name]);
    }

    public is_renewing(): boolean {
        return this.action === ACTION.RENEW;
    }

    public set(action: ACTION, target?: Id<any>) {
        this.creep.memory.action = action;
        this.creep.memory.target = target;
        this.action = action;
        this.target = target;
    }

    public update() {
        this.creep = Game.creeps[this.creep_name];
        this.ticksToLive = this.creep.ticksToLive;

        this.manageRenew(Game.spawns[this.spawn_name] as StructureSpawn);

        if (this.action !== ACTION.RENEW) {
            //? Renew is managed by the creep_manager
            this.set(this.creep.memory.action, this.creep.memory.target);
        }

        if (this.is_full()) this.needs_energy = false;
        if (this.is_empty()) this.needs_energy = true;

        this.creep.memory.needs_energy = this.needs_energy;
    }

    protected logic() {}

    private _emergency_handling() {
        if (Memory.commands.all_harvest) {
            if (this.creep.harvest(Game.getObjectById(this.source_ids[0]) as Source) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(Game.getObjectById(this.source_ids[0]) as Source);
                return -1;
            }
            if (this.is_renewing()) return OK;
            return -1;
        }
        if (Memory.commands.all_transfer_to_spawn) {
            if (this.creep.transfer(Game.spawns[this.spawn_name], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(Game.spawns[this.spawn_name]);
            }
            if (this.is_renewing()) return OK;
            return -1;
        }
        return OK;
    }

    public run() {
        if (this._emergency_handling() === OK) {
            let r = 0;

            if (this.needs_energy && !this.is_renewing()) {
                try {
                    let source_target = Game.getObjectById(this.source_ids[this.creep.memory.source_to_target]) as Source;

                    r = this.creep.harvest(source_target);
                    if (r === ERR_NOT_IN_RANGE) this.moveTo(source_target.pos);
                    //? If source is empty try another one , assuming there are only two in the map.
                    else if (r === ERR_NOT_ENOUGH_RESOURCES && this.source_ids.length > 0)
                        source_target = Game.getObjectById(this.source_ids[this.creep.memory.source_to_target === 0 ? 1 : 0]) as Source;
                    else Utils._C(this.creep, this.last_return_code);
                } catch (error) {}
            }
            if (!this.needs_energy && !this.is_renewing()) {
                if (this.action !== ACTION.RENEW) this.logic();

                //? if beside spawn and has energy , then give it.
                if (this.action === ACTION.RENEW && this.has_energy() && this.creep.pos.isNearTo(Game.spawns[this.spawn_name].pos))
                    this.creep.transfer(Game.spawns[this.spawn_name], RESOURCE_ENERGY);
            }

            if ((this.is_renewing() && this.target) || (!this.is_renewing() && this.target && this.action && !this.needs_energy)) {
                const target_obj = Game.getObjectById(this.target);
                this.last_return_code = this.action_to_func(target_obj);

                if (this.last_return_code === ERR_NOT_IN_RANGE) this.moveTo(target_obj);
                else Utils._C(this.creep, this.last_return_code);
            } //else console.log("doing task with a problem " + this.debug_me());
        }
    }

    public moveTo(target: ConstructionSite | Structure | RoomPosition, opts?: MoveToOpts | undefined): number {
        return this.creep.travelTo(target, opts);
    }

    public say_random() {
        this.creep.say("such random uwu");
    }

    //* Renew is a bit special because the creep needs to go to a spawn
    //* and renew is made from spawn side (in creep_manager)
    public renew(...target: any): any {
        if (!this.creep.pos.isNearTo(target)) return ERR_NOT_IN_RANGE;
        return OK;
    }

    protected idle(target: any): any {
        // const flag = Memory.rooms_new[this.creep.room.name].flags.includes("IDLES");
        // if (flag && this.creep.pos.isNearTo(flag.pos1))
        //TODO Game.flags will get all flags from all rooms , so it wont work if not in the same room , maybe check if in the same room with a method of pos.

        // this.creep.moveTo(flag.pos);
        return OK;
    }

    public has_energy(): boolean {
        return this.creep.store[RESOURCE_ENERGY] > 0;
    }

    public is_full(): boolean {
        return this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0;
    }

    public is_empty(): boolean {
        return this.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
    }

    // //* ----------------RENEWING LOGIC --------------------------
    protected needsRenew(): boolean {
        return (this.ticksToLive || 0) / Config.MAX_TICKS_TO_LIVE <= Config.PERCENTAGE_TICKS_BEFORE_NEEDS_REFILL;
    }

    protected manageRenew(spawn: StructureSpawn): void {
        // if ((creep.memory.role === 'harvester' && spawn.store[RESOURCE_ENERGY] >= 200) || ( creep.memory.role !== 'harvester' && spawn.store[RESOURCE_ENERGY] > 20 ) ) { //* Harvester sacrifice to bring energy for others
        if (!this.is_renewing() && this.needsRenew()) {
            this.set(ACTION.RENEW, spawn.id);
            Memory.rooms_new[this.creep.room.name].cripple_creeps.push(this.creep_name);
        }
        //? if full life and was renewing , set to idle to get out of the renewing loop.
        else if (this.is_renewing() && this.ticksToLive && this.ticksToLive >= Config.MAX_TICKS_TO_LIVE - 50 && !this.needsRenew()) {
            console.log(this.creep + " -> me to cripple uwu " + this.ticksToLive);
            this.set(ACTION.WAITING_NEXT_TASK, undefined);
            Memory.rooms_new[this.creep.room.name].cripple_creeps.remove(this.creep_name);
        }
    }

    //* ------------------------------------------------------------------------------

    public debug_me(): string {
        return (
            "[DEBUG] " + this.creep + " lvl " + this.lvl + " ticks " + this.ticksToLive + " / action->" + this.action + " = " + this.target
        );
    }
}
