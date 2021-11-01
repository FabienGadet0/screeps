//* ICreep for all  creeps

import * as Config from "../../config";
import * as Utils from "../../utils/utils";
import * as Finder from "../../utils/finder";
import { profile } from "../../Profiler/Profiler";

//todo MAYBE NO ICREEP CLASS BECAUSE IM JUST USING MEMORY BASICALLY . BUT OK FOR ROLE BASED CLASSES.
export enum ACTION {
    IDLE = "IDLE",
    HARVEST = "HARVEST",
    MOVETO = "MOVETO",
    RENEW = "RENEW",
    BUILD = "BUILD",
    REPAIR = "REPAIR",
    TRANSFER = "TRANSFER",
}

@profile
export class ICreep {
    creep_name: string;
    creep_id: Id<Creep>;
    is_renewing: boolean;
    action: ACTION;
    target?: Id<any>;
    lvl: number;
    spawn_name: string;
    obj: Creep;
    ticksToLive?: number;

    constructor(creep_name: string) {
        const c = Game.creeps[creep_name];
        this.creep_name = creep_name;
        this.creep_id = c.id;
        this.action = c.memory.action;
        this.target = c.memory.target;
        this.is_renewing = c.memory.is_renewing;
        this.lvl = c.memory.lvl;
        this.spawn_name = c.memory.spawn_name;
        this.ticksToLive = c.ticksToLive;
        this.obj = c;
    }

    public update() {
        const c = Game.creeps[this.creep_name];
        this.action = c.memory.action;
        this.is_renewing = c.memory.is_renewing;
        this.target = c.memory.target;
        this.ticksToLive = c.ticksToLive;
        this.obj = c;
    }

    public run() {
        //todo -> parse all actions and set to target.
    }

    public set(action: ACTION, target: Id<any>) {
        this.obj.memory.action = action;
        this.obj.memory.target = target;
        this.action = action;
        this.target = target;
    }

    // protected harvest(source_number: number = 0, opts?: {} | undefined): void {
    //     let source: Source = Finder.from_id(Memory["rooms"][creep.mem room.name].structure_ids["sources"][source_number]);
    //     if (source)
    //         creep.pos.isNearTo(source)
    //             ? Utils._C(creep.name, creep.harvest(source), "harvesting " + creep.name)
    //             : Utils._C(creep.name, this.moveTo(creep, source.pos));
    // }

    public moveTo(target: ConstructionSite | Structure | RoomPosition, opts?: MoveToOpts | undefined): number {
        if (this.obj) return this.obj.travelTo(target, opts);
        else console.log("OBJ isn't here " + this.creep_name);
        return -1000;
    }

    protected say(creep: Creep, msg: string) {
        if (Memory.debug_speak) creep.say(msg);
    }
}
