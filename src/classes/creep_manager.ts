import * as Finder from "../utils/finder";
import * as Config from "../config";
import * as Utils from "../utils/utils";

// import * as Harvester from "./creeps/harvester";
import { ICreep, ACTION } from "./creeps/ICreep";
import { Builder } from "./creeps/builder";
// import * as Upgrader from "./creeps/upgrader";
import { profile } from "../Profiler/Profiler";
import { Creep_factory } from "./creep_factory";

@profile
class Creep_manager {
    room_name: string;
    spawn_id: Id<StructureSpawn>;
    creeps: Record<string, any>;
    creep_factory: Creep_factory;
    lvl: number;
    cripple_creeps: string[];

    constructor(room_name: string, spawn_id: Id<StructureSpawn>) {
        this.room_name = room_name;
        this.creeps = {};
        this.spawn_id = spawn_id;
        this.creep_factory = new Creep_factory(room_name, spawn_id);
        this.lvl = 300;
        this.cripple_creeps = [];

        _.each(Game.rooms[room_name].find(FIND_MY_CREEPS), (creep: Creep) => {
            this.creeps[creep.name] = this.creep_factory.generate(creep.memory.role, creep.name);
        });
    }

    private _manage_tasks() {
        //* harvesters tasks

        const spawn = Game.getObjectById(this.spawn_id);
        const extensions_not_full = Memory.rooms[this.room_name].structure_ids["extensions_not_full"];
        // const containers_not_full = Memory.rooms[this.room_name].structure_ids["containers_not_full"];
        const to_build = Memory.rooms[this.room_name].structure_ids["construction_sites"];
        const to_repair = Memory.rooms[this.room_name].structure_ids["to_repair"];

        // console.log("to transfer + " + Memory.rooms[this.room_name].structure_ids.room_tasks["to_transfer"]);
        // console.log("empty tasks :" + _.isEmpty(Memory.rooms[this.room_name].room_tasks));
        if (_.isEmpty(Memory.rooms[this.room_name].room_tasks["to_transfer"])) {
            //* Harvester

            if (spawn!.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                Memory.rooms[this.room_name].room_tasks["to_transfer"] = [this.spawn_id].concat(extensions_not_full);
            // Memory.rooms[this.room_name].room_tasks["to_transfer"].push(this.spawn_id);
            else
                Memory.rooms[this.room_name].room_tasks["to_transfer"] =
                    Memory.rooms[this.room_name].room_tasks["to_transfer"].concat(extensions_not_full);
            // Memory.rooms[this.room_name].room_tasks["to_transfer"].concat(extensions_not_full);
        }
        //*------------------

        //* - builder tasks -
        if (_.isEmpty(Memory.rooms[this.room_name].room_tasks["to_repair"]))
            Memory.rooms[this.room_name].room_tasks["to_repair"] = to_repair;
        if (_.isEmpty(Memory.rooms[this.room_name].room_tasks["to_build"]))
            Memory.rooms[this.room_name].room_tasks["to_build"].push(to_build || undefined);
        //*-------------------
    }

    public run(): void {
        this.creep_factory.run();
        this._manage_tasks();

        _.each(this.creeps, (creep: ICreep) => {
            creep.run();
        });

        //? Outside of loop because spawn can't renew many creeps at the same time.
        if (this.cripple_creeps.length > 0)
            //TODO if no one transfer energy to spawn and they need renew , they are fucked.
            Utils._C(
                this.spawn_id + "/" + this.room_name,
                this.tryRenew(this.creeps[this.cripple_creeps[0]], Game.getObjectById(this.spawn_id) as StructureSpawn),
            );
    }

    public update(): boolean {
        this.creep_factory.set_lvl(this.lvl);
        this.creep_factory.update();

        let game_creeps = Memory.rooms[this.room_name].creeps_name;

        if (_.size(this.creeps) - _.size(Memory.rooms[this.room_name].creeps_name) !== 0) this._manage_new_and_dead_creeps();

        _.map(this.creeps, (creep: ICreep) => {
            creep.update();
        });
        // if (creep.is_renewing() && !Memory.rooms[this.room_name].cripple_creeps.includes(creep.creep_name)) {
        //     // console.log("cripple " + creep.creep_name + " in " + Memory.rooms[this.room_name].cripple_creeps);
        //     // console.log("bool : " + !Memory.rooms[this.room_name].cripple_creeps.includes(creep.creep_name));
        //     Memory.rooms[this.room_name].cripple_creeps.push(creep.creep_name); //? add if need renew.
        // }
        // if (
        //     creep.is_renewing() &&
        //     creep.creep_name in Memory.rooms[this.room_name].cripple_creeps &&
        //     (creep.ticksToLive || 0) >= Config.MAX_TICKS_TO_LIVE - 50
        // )
        //     //? Delete if no longer needs renew
        //     delete Memory.rooms[this.room_name].cripple_creeps[
        //         Memory.rooms[this.room_name].cripple_creeps.findIndex((item) => item == creep.creep_name)
        //     ];
        // });
        this.cripple_creeps = Memory.rooms[this.room_name].cripple_creeps;
        return false;
    }

    public set_lvl(lvl: number) {
        this.lvl = lvl;
    }

    //* creeps in memory -------------------------------------------

    private _manage_new_and_dead_creeps(): void {
        for (const name in Object.keys(this.creeps)) {
            if (!(name in Game.creeps)) {
                delete this.creeps[name];
                console.log(name, " deleted");
            }
        }
        for (const name in Game.creeps) {
            if (!(name in Object.keys(this.creeps))) {
                this.creeps[name] = this.creep_factory.generate(Game.creeps[name].memory.role, name);
                delete this.creeps[name];
                console.log(name, " added");
            }
        }
    }

    //*  -------------------------------------------------------------

    protected tryRenew(creep: ICreep, spawn: StructureSpawn): number {
        let r = 0;
        if (!spawn.pos.isNearTo(creep.creep.pos)) console.log("renew " + creep.creep + " waiting for you bitch");
        else {
            let r = Utils._C(spawn.name, spawn.renewCreep(creep.creep));
            if (r === OK) console.log("renew creep " + creep.creep);
        }
        return r;
    }
}

export { Creep_manager };
