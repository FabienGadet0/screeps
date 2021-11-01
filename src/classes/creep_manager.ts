import * as Finder from "../utils/finder";
import * as Config from "../config";

// import * as harvester from "./creeps/harvester";
import { ICreep, ACTION } from "./creeps/ICreep";
// import * as builder from "./creeps/builder";
// import * as upgrader from "./creeps/upgrader";
import { profile } from "../Profiler/Profiler";

// const _run_all_classes: Record<string, any> = {
//     // harvester: harvester,
//     builder: builder,
//     upgrader: upgrader,
// };

@profile
class Creep_manager {
    room_name: string;
    creeps: Record<string, ICreep>;
    // creeps_ids:Id<Creep>[];

    constructor(room_name: string) {
        this.room_name = room_name;
        this.creeps = {};
        _.each(Game.rooms[room_name].find(FIND_MY_CREEPS), (creep: Creep) => {
            this.creeps[creep.name] = new ICreep(creep.name);
        });
    }

    public update(): void {
        const diff = _.size(this.creeps) - _.size(Memory.rooms[this.room_name].creeps_name);
        let game_creeps = Memory.rooms[this.room_name].creeps_name;
        if (diff < 0) this._delete_old(game_creeps);
        else if (diff > 0) this._add_new(game_creeps);
    }

    public run(): void {
        _.each(this.creeps, (creep: ICreep) => {
            if (!this.manageRenew(creep)) creep.run();
        });
    }

    private _add_new(game_creeps: string[]): boolean {
        const my_creeps_names = Object.keys(this.creeps);
        let to_add = _.filter(game_creeps, (c: string) => {
            !(c in my_creeps_names);
        });
        if (to_add.length > 0)
            _.each(to_add, (creep_name: string) => {
                this.creeps[creep_name] = new ICreep(creep_name);
            });
        console.log("Creep added " + to_add);
        return to_add.length > 0;
    }

    private _delete_old(game_creeps: string[]): boolean {
        const dead_creeps = _.filter(Object.keys(this.creeps), (creep_name: string) => {
            !(creep_name in game_creeps);
        });
        if (dead_creeps.length > 0)
            _.each(dead_creeps, (creep_name: string) => {
                delete this.creeps[creep_name];
            });

        console.log("Creep deleted " + dead_creeps);
        return dead_creeps.length > 0;
    }

    protected needsRenew(creep: ICreep): boolean {
        return (creep.ticksToLive || 0) / Config.MAX_TICKS_TO_LIVE <= Config.PERCENTAGE_TICKS_BEFORE_NEEDS_REFILL;
    }

    protected tryRenew(creep: ICreep, spawn: StructureSpawn): number {
        let r = spawn.renewCreep(creep.obj);
        if (r === -6 && creep.obj.store[RESOURCE_ENERGY] !== 0) creep.set(ACTION.TRANSFER, spawn.id);
        //? If not enough energy , everybody will give energy regarding of it's class.
        // creep.transfer(spawn, RESOURCE_ENERGY);
        return r;
    }

    protected manageRenew(creep: ICreep): boolean {
        // if ((creep.memory.role === 'harvester' && spawn.store[RESOURCE_ENERGY] >= 200) || ( creep.memory.role !== 'harvester' && spawn.store[RESOURCE_ENERGY] > 20 ) ) { //* Harvester sacrifice to bring energy for others
        const spawn = Game.spawns[creep.spawn_name]; //todo change it to Finder.from_id(

        if (!creep.is_renewing) creep.is_renewing = this.needsRenew(creep);
        else if ((creep.ticksToLive || 0) >= Config.MAX_TICKS_TO_LIVE) creep.is_renewing = false;

        if (creep.is_renewing && this.tryRenew(creep, spawn) === ERR_NOT_IN_RANGE) creep.set(ACTION.MOVETO, spawn.id); //creep.moveTo(spawn);

        return creep.is_renewing;
    }
}

export { Creep_manager };
