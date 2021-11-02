import * as Finder from "../utils/finder";
import * as Config from "../config";

// import * as Harvester from "./creeps/harvester";
import { ICreep, ACTION } from "./creeps/ICreep";
import { Builder } from "./creeps/builder";
// import * as Upgrader from "./creeps/upgrader";
import { profile } from "../Profiler/Profiler";
import { Creep_factory } from "./creep_factory";

class Creep_manager {
    room_name: string;
    spawn_id: Id<StructureSpawn>;
    creeps: Record<string, any>;
    creep_factory: Creep_factory;
    lvl: number;

    constructor(room_name: string, spawn_id: Id<StructureSpawn>) {
        this.room_name = room_name;
        this.creeps = {};
        this.spawn_id = spawn_id;
        this.creep_factory = new Creep_factory(room_name, spawn_id);
        this.lvl = 300;

        _.each(Game.rooms[room_name].find(FIND_MY_CREEPS), (creep: Creep) => {
            this.creeps[creep.name] = this.creep_factory.generate(creep.memory.role, creep.name);
        });
    }

    public run(): void {
        this.creep_factory.run();

        // this._set_target_distribution("harvester")
        // this._set_target_distribution("builder")

        _.each(this.creeps, (creep: ICreep) => {
            if (!this.manageRenew(creep)) {
                creep.run();
            }
        });
    }

    public set_lvl(lvl: number) {
        this.lvl = lvl;
    }

    // private _set_target_distribution(role:string): void {
    //     //* Harvester's logic ---------------------
    //     let harvesters: ICreep[] = [];
    //     let builders: ICreep[] = [];

    //     _.map(this.creeps, (creep: any) => {
    //         if(creep.creep.role === 'harvester')
    //             harvesters.push(creep)
    //         if(creep.creep.role === 'builder')
    //             builders.push(creep)
    //     })

    //     console.log("all harvesters : " + harvesters)
    //     console.log("all builders : " + builders)

    //     const spawn = Game.getObjectById(this.spawn_id)
    //     if (spawn!.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    //         const extensions_not_full = _.filter(Memory.rooms[this.room_name].structure_ids["extensions"], (ext) => {
    //             const extension = Game.getObjectById(ext) as StructureExtension;
    //             return extension.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    //         });
    //     }
    //     else

    //* -----------------------------------------

    public update(): boolean {
        this.creep_factory.set_lvl(this.lvl);
        this.creep_factory.update();

        const diff = _.size(this.creeps) - _.size(Memory.rooms[this.room_name].creeps_name);

        let game_creeps = Memory.rooms[this.room_name].creeps_name;

        if (diff < 0) return this._delete_old(game_creeps);
        else if (diff > 0) return this._add_new(game_creeps);

        _.map(this.creeps, (creep: ICreep) => {
            creep.update();
        });

        return false;
    }

    //* creeps in memory -------------------------------------------

    private _add_new(game_creeps: string[]): boolean {
        const my_creeps_names = Object.keys(this.creeps);
        let to_add = _.filter(game_creeps, (c: string) => {
            !(c in my_creeps_names);
        });
        if (to_add.length > 0)
            _.each(to_add, (creep_name: string) => {
                this.creeps[creep_name] = this.creep_factory.generate(Game.creeps[creep_name].memory.role, creep_name);
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

    //*  -------------------------------------------------------------

    protected needsRenew(creep: ICreep): boolean {
        return (creep.ticksToLive || 0) / Config.MAX_TICKS_TO_LIVE <= Config.PERCENTAGE_TICKS_BEFORE_NEEDS_REFILL;
    }

    protected tryRenew(creep: ICreep, spawn: StructureSpawn): number {
        let r = spawn.renewCreep(creep.creep);
        if (r === -6 && creep.creep.store[RESOURCE_ENERGY] !== 0) creep.set(ACTION.TRANSFER, spawn.id);
        creep.creep.transfer(spawn, RESOURCE_ENERGY);
        return r;
    }

    protected manageRenew(creep: ICreep): boolean {
        // if ((creep.memory.role === 'harvester' && spawn.store[RESOURCE_ENERGY] >= 200) || ( creep.memory.role !== 'harvester' && spawn.store[RESOURCE_ENERGY] > 20 ) ) { //* Harvester sacrifice to bring energy for others
        const spawn = Game.spawns[creep.spawn_name];

        if (!creep.is_renewing() && this.needsRenew(creep)) creep.set(ACTION.RENEW, spawn.id);
        else if ((creep.ticksToLive || 0) >= Config.MAX_TICKS_TO_LIVE) creep.set(ACTION.IDLE, undefined);

        if (creep.is_renewing()) this.tryRenew(creep, spawn);

        return creep.is_renewing();
    }
}

export { Creep_manager };
