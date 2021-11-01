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

    _ACTION_to_func: Record<string, any> = {
        IDLE: undefined,
        HARVEST: this.harvest,
        MOVETO: this.moveTo,
        RENEW: this.renew,
        BUILD: this.build,
        REPAIR: this.repair,
        TRANSFER: this.transfer,
    };

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
        console.log("New creep " + creep_name + " in spawn " + this.spawn_name);
    }

    public is_renewing(): boolean {
        return this.action === ACTION.RENEW;
    }
    public set(action: ACTION, target?: Id<any>) {
        this.creep.memory.action = action;
        this.creep.memory.target = target;
        // this.action = action;
        // this.target = target;
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
            let r = this._ACTION_to_func[this.action](target_obj);
            if (r === ERR_NOT_IN_RANGE) this.moveTo(target_obj);
        }
    }

    // protected harvest(source_number: number = 0, opts?: {} | undefined): void {
    //     let source: Source = Finder.from_id(Memory["rooms"][creep.mem room.name].structure_ids["sources"][source_number]);
    //     if (source)
    //         creep.pos.isNearTo(source)
    //             ? Utils._C(creep.name, creep.harvest(source), "harvesting " + creep.name)
    //             : Utils._C(creep.name, this.moveTo(creep, source.pos));
    // }

    public harvest(...target: any): any {
        return this.creep.harvest(target);
    }

    public moveTo(target: ConstructionSite | Structure | RoomPosition, opts?: MoveToOpts | undefined): number {
        return this.creep.travelTo(target, opts);
    }

    //* Renew is a bit special because the creep needs to go to a spawn
    //* and renew is made from spawn side (in creep_manager)
    public renew(...target: any): any {
        if (!this.creep.pos.isNearTo(target)) return this.moveTo(target);
        return 0;
    }

    public attack(...target: any): any {
        return this.creep.attack(target);
    }

    public build(...target: any): any {
        return this.creep.build(target);
    }

    public repair(...target: any): any {
        return this.creep.repair(target);
    }

    public transfer(...target: any): any {
        return this.creep.transfer(target[0], target[1]);
    }

    protected say(creep: Creep, msg: string) {
        if (Memory.debug_speak) creep.say(msg);
    }
}
