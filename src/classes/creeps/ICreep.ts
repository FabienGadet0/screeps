//* ICreep for all  creeps

import * as Config from "../../config";
import * as Utils from "../../utils/utils";
import * as Finder from "../../utils/finder";

export enum ACTION {
    IDLE = "IDLE",
    HARVEST = "HARVEST",
    MOVETO = "MOVETO",
    RENEW = "RENEW",
    BUILD = "BUILD",
    REPAIR = "REPAIR",
    UPGRADE_CONTROLLER = "UPGRADE_CONTROLLER",
    TRANSFER = "TRANSFER",
    PICKUP = "PICKUP",
    WAITING_NEXT_TASK = "WAITING_NEXT_TASK",
}

export class ICreep {
    creep_name: string;
    creep_id: Id<Creep>;
    action: ACTION;
    target?: Id<any>;
    lvl: number;
    spawn_name: string;
    creep: Creep;
    ticksToLive?: number;
    source_ids: Id<Source>[];
    last_return_code: ScreepsReturnCode | CreepMoveReturnCode | number;
    main_action: ACTION;

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
        this.creep.memory.action = ACTION.IDLE;
        this.main_action = ACTION.IDLE;
        this.creep.memory.target = undefined; // Memory.rooms[Memory.spawns[this.spawn_name].room.name].flags["IDLES"] | undefined;

        this.action = this.creep.memory.action;
        this.target = this.creep.memory.target;

        this._ACTION_to_func = {
            IDLE: this.idle,
            HARVEST: this.creep.harvest,
            MOVETO: this.moveTo,
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
            HARVEST: "⛏️Harvest",
            MOVETO: "",
            RENEW: "⬆️Renew",
            BUILD: "👷Build",
            REPAIR: "👷Repair",
            TRANSFER: "🚚Transfer",
            UPGRADE_CONTROLLER: "Upgrade",
            PICKUP: "Pickup",
            WAITING_NEXT_TASK: "",
        };

        // console.log("New creep " + creep_name + " in spawn " + this.spawn_name);
    }

    private action_to_func(...target: any): any {
        switch (this.action) {
            case ACTION.IDLE:
                return this.idle(target[0]);

            case ACTION.HARVEST:
                return this.creep.harvest(target[0]);

            case ACTION.MOVETO:
                return this.moveTo(target[0]);

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

    protected _task_finished(): void {
        delete this.target;
        this.set(ACTION.IDLE, undefined);
        this.creep.say("Finished");
    }

    protected _start_task(task_name: string, action?: ACTION): void {
        const act = action ? action : this.main_action;
        if (!_.isEmpty(Memory.rooms[this.creep.room.name].room_tasks[task_name])) {
            this.set(act, Memory.rooms[this.creep.room.name].room_tasks[task_name].shift());
            console.log(this.creep + " task is " + this.target, " act " + act + " -> " + this.action);
            this.creep.say(this._ACTION_to_icon[this.action]);
        }
    }

    protected _task_available(task_name: string): boolean {
        return _.isEmpty(Memory.rooms[this.creep.room.name].room_tasks[task_name]);
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

        // if (this.action !== ACTION.RENEW) {
        //? Renew is managed by the creep_manager
        this.set(this.creep.memory.action, this.creep.memory.target);
        // this.action = this.creep.memory.action;
        // this.target = this.creep.memory.target;
        // }
    }

    protected logic() {}

    public run() {
        if (this.action !== ACTION.RENEW) this.logic();

        //? if beside spawn and has energy , then give it.
        if (
            this.action === ACTION.RENEW &&
            this.creep.store[RESOURCE_ENERGY] !== 0 &&
            this.creep.pos.isNearTo(Game.spawns[this.spawn_name].pos)
        )
            this.creep.transfer(Game.spawns[this.spawn_name], RESOURCE_ENERGY);

        if (this.action && this.target) {
            const target_obj = Game.getObjectById(this.target);
            this.last_return_code = this.action_to_func(target_obj);

            if (this.last_return_code === ERR_NOT_IN_RANGE) this.moveTo(target_obj);
            else Utils._C(this.creep, this.last_return_code);
        }
    }

    public moveTo(target: ConstructionSite | Structure | RoomPosition, opts?: MoveToOpts | undefined): number {
        return this.creep.travelTo(target, opts);
    }

    //* Renew is a bit special because the creep needs to go to a spawn
    //* and renew is made from spawn side (in creep_manager)
    public renew(...target: any): any {
        if (!this.creep.pos.isNearTo(target)) return ERR_NOT_IN_RANGE;
        // else if (this.creep.store.getCapacity(RESOURCE_ENERGY) > 0)
        //TODO Goes against run() and this.target rule , this.action logic by doing an action directly from here but for now it's ok.
        // this.creep.transfer(target, RESOURCE_ENERGY);
        return OK;
    }

    protected idle(target: any): any {
        console.log("go idle there " + Game.flags["IDLES"].pos);
        if (Game.flags["IDLES"])
            //TODO Game.flags will get all flags from all rooms , so it wont work if not in the same room
            this.creep.moveTo(Game.flags["IDLES"].pos);
        return OK;
        // if (!this.creep.pos.isNearTo(target)) return ERR_NOT_IN_RANGE;
        // return OK;
    }

    // //* ----------------RENEWING LOGIC --------------------------
    protected needsRenew(): boolean {
        return (this.ticksToLive || 0) / Config.MAX_TICKS_TO_LIVE <= Config.PERCENTAGE_TICKS_BEFORE_NEEDS_REFILL;
    }

    protected manageRenew(spawn: StructureSpawn): boolean {
        // if ((creep.memory.role === 'harvester' && spawn.store[RESOURCE_ENERGY] >= 200) || ( creep.memory.role !== 'harvester' && spawn.store[RESOURCE_ENERGY] > 20 ) ) { //* Harvester sacrifice to bring energy for others
        // const spawn = Game.spawns[this.spawn_name];
        // if (this.needsRenew())
        if (!this.is_renewing() && this.needsRenew()) {
            this.set(ACTION.RENEW, spawn.id);
            Memory.rooms[this.creep.room.name].cripple_creeps.push(this.creep_name);
        }
        //? if full life and was renewing , set to idle to get out of the renewing loop.
        else if (this.ticksToLive && this.ticksToLive >= Config.MAX_TICKS_TO_LIVE - 50) {
            this.set(ACTION.IDLE, undefined);
            Memory.rooms[this.creep.room.name].cripple_creeps.splice(
                Memory.rooms[this.creep.room.name].cripple_creeps.findIndex((item) => item == this.creep_name),
                1,
            );
        }
        // else if ((creep.ticksToLive || 0) >= Config.MAX_TICKS_TO_LIVE) creep.set(ACTION.IDLE, undefined);

        // if (this.is_renewing() && this.creep.pos.isNearTo(spawn)) this.tryRenew(spawn);

        return this.is_renewing();
    }
}
