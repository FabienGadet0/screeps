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

    _ACTION_to_func: Record<ACTION, any>;

    protected _get_sources() {
        return _.map(this.creep.room.find(FIND_SOURCES_ACTIVE), (source: Source) => {
            return source.id;
        });
    }

    constructor(creep_name: string) {
        const c = Game.creeps[creep_name];
        this.creep_name = creep_name;
        this.creep_id = c.id;
        this.action = c.memory.action;
        this.target = c.memory.target;
        this.lvl = c.memory.lvl;
        this.spawn_name = c.memory.spawn_name;
        this.ticksToLive = c.ticksToLive;
        this.creep = c;
        this.source_ids = this._get_sources();
        this.last_return_code = OK;
        this.creep.memory.action = this.action;
        this.creep.memory.target = this.target;
        this._ACTION_to_func = {
            IDLE: this.idle,
            HARVEST: this.creep.harvest,
            MOVETO: this.moveTo,
            RENEW: this.renew,
            BUILD: this.creep.build,
            REPAIR: this.creep.repair,
            TRANSFER: this.creep.transfer,
            UPGRADE_CONTROLLER: this.creep.upgradeController,
        };
        console.log("New creep " + creep_name + " in spawn " + this.spawn_name);
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

            case ACTION.TRANSFER:
                return this.creep.transfer(target[0], RESOURCE_ENERGY); //TODO for now it's only resource energy , but maybe i can do a second arg thing.

            case ACTION.UPGRADE_CONTROLLER:
                return this.creep.upgradeController(target[0]);
        }
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
        this.action = this.creep.memory.action;
        this.target = this.creep.memory.target;
        this.ticksToLive = this.creep.ticksToLive;
    }

    protected logic() {}

    public run() {
        this.logic();
        if (this.action && this.target) {
            const target_obj = Game.getObjectById(this.target);

            this.last_return_code = this.action_to_func(target_obj);
            console.log(
                this.creep + " action " + this.action + " " + target_obj + " r " + Utils._C(this.creep_name, this.last_return_code),
            );
            if (this.last_return_code === ERR_NOT_IN_RANGE) {
                // this.creep.travelTo(target_obj);
                this.moveTo(target_obj);
            }
        }
    }

    public moveTo(target: ConstructionSite | Structure | RoomPosition, opts?: MoveToOpts | undefined): number {
        return this.creep.travelTo(target, opts);
    }

    //* Renew is a bit special because the creep needs to go to a spawn
    //* and renew is made from spawn side (in creep_manager)
    public renew(...target: any): any {
        console.log(this.creep.pos.isNearTo(target));
        if (!this.creep.pos.isNearTo(target)) return ERR_NOT_IN_RANGE;
        return 0;
    }

    protected idle(_: any): any {
        return this.creep.say("i'm IDLE wtf");
    }
}
