import * as Finder from "../utils/finder";
import * as Config from "../config";
import * as Utils from "../utils/utils";

// import * as Harvester from "./creeps/harvester";
import { ICreep, ACTION } from "./creeps/ICreep";
// import * as Upgrader from "./creeps/upgrader";
import { profile } from "../Profiler/Profiler";
import { Creep_factory } from "./creep_factory";
import { match, __, when, select } from "ts-pattern";

import { Harvester } from "./creeps/harvester";
import { Builder } from "./creeps/builder";
import { Upgrader } from "./creeps/upgrader";
import { Mnemonic, mnemon } from "../utils/mnemonic";

@profile
class Creep_manager implements Mnemonic {
    room_name: string;
    creeps: Record<string, any>;
    creep_factory: Creep_factory;

    @mnemon
    spawn_id: Id<StructureSpawn>;

    @mnemon
    lvl: number;

    @mnemon
    cripple_creeps: string[];

    @mnemon
    room_tasks: Record<string, Id<any>[]>;

    @mnemon
    creeps_name: string[];

    constructor(room_name: string) {
        this.room_name = room_name;
        this.creeps = {};
        this.spawn_id = this.locator().spawn_id;
        this.lvl = this.locator().lvl;
        this.creeps_name = this.locator().creeps_name;
        this.cripple_creeps = this.locator().cripple_creeps;

        this.room_tasks = this.locator().room_tasks;
        this.creep_factory = new Creep_factory(room_name, this.spawn_id);

        _.each(Game.rooms[room_name].find(FIND_MY_CREEPS), (creep: Creep) => {
            this.creeps[creep.name] = this._generate(creep.memory.role, creep.name);
        });
    }

    public locator(): { [key: string]: any } {
        return Memory.rooms_new[this.room_name];
    }

    // prettier-ignore
    private _generate(role: string, room_name: string): any {
        return match(role)
            .with ("harvester", () => { return new Harvester(room_name) })
            .with ("builder", () => { return new Builder(room_name) })
            .with("upgrader", () => { return new Upgrader(room_name) })
            .with(__, () => {return undefined})
            .exhaustive()
    }

    private _manage_tasks(): void {
        //* harvesters tasks

        const spawn = Game.getObjectById(this.spawn_id);
        const extensions_not_full = Memory.rooms_new[this.room_name].structure_id["extensions_not_full"];
        // const containers_not_full = Memory.rooms_new[this.room_name].structure_id["containers_not_full"];
        const to_build = Memory.rooms_new[this.room_name].structure_id["construction_sites"];
        const to_repair = Memory.rooms_new[this.room_name].structure_id["to_repair"];

        // console.log("to transfer + " + Memory.rooms_new[this.room_name].structure_id.room_tasks["to_transfer"]);
        // console.log("empty tasks :" + _.isEmpty(Memory.rooms_new[this.room_name].room_tasks));
        if (_.isEmpty(Memory.rooms_new[this.room_name].room_tasks["to_transfer"])) {
            //* Harvester

            if (spawn!.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                this.room_tasks["to_transfer"] = [this.spawn_id].concat(extensions_not_full);
            // Memory.rooms_new[this.room_name].room_tasks["to_transfer"] = [this.spawn_id].concat(extensions_not_full);
            // Memory.rooms_new[this.room_name].room_tasks["to_transfer"].push(this.spawn_id);
            else this.room_tasks["to_transfer"] = Memory.rooms_new[this.room_name].room_tasks["to_transfer"].concat(extensions_not_full);
            // Memory.rooms_new[this.room_name].room_tasks["to_transfer"] =
            //     Memory.rooms_new[this.room_name].room_tasks["to_transfer"].concat(extensions_not_full);

            // Memory.rooms_new[this.room_name].room_tasks["to_transfer"].concat(extensions_not_full);
        }
        //*------------------

        //* - builder tasks -
        if (_.isEmpty(Memory.rooms_new[this.room_name].room_tasks["to_repair"])) this.room_tasks["to_repair"] = to_repair;
        // Memory.rooms_new[this.room_name].room_tasks["to_repair"] = to_repair;
        if (_.isEmpty(Memory.rooms_new[this.room_name].room_tasks["to_build"])) this.room_tasks["to_build"] = to_build;
        // Memory.rooms_new[this.room_name].room_tasks["to_build"] = to_build;
        //*-------------------
    }

    public run(): void {
        this.creep_factory.run();

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
        this.locator();
        this._manage_tasks();
        // this.lvl = Memory.rooms_new[this.room_name].lvl;
        // this.creep_factory.set_lvl(this.lvl);
        this.creep_factory.update();

        // let game_creeps = Memory.rooms_new[this.room_name].creeps_name;

        if (_.size(this.creeps) - _.size(Memory.rooms_new[this.room_name].creeps_name) !== 0) this._manage_new_and_dead_creeps();

        _.map(this.creeps, (creep: ICreep) => {
            creep.update();
        });
        // if (creep.is_renewing() && !Memory.rooms_new[this.room_name].cripple_creeps.includes(creep.creep_name)) {
        //     // console.log("cripple " + creep.creep_name + " in " + Memory.rooms_new[this.room_name].cripple_creeps);
        //     // console.log("bool : " + !Memory.rooms_new[this.room_name].cripple_creeps.includes(creep.creep_name));
        //     Memory.rooms_new[this.room_name].cripple_creeps.push(creep.creep_name); //? add if need renew.
        // }
        // if (
        //     creep.is_renewing() &&
        //     creep.creep_name in Memory.rooms_new[this.room_name].cripple_creeps &&
        //     (creep.ticksToLive || 0) >= Config.MAX_TICKS_TO_LIVE - 50
        // )
        //     //? Delete if no longer needs renew
        //     delete Memory.rooms_new[this.room_name].cripple_creeps[
        //         Memory.rooms_new[this.room_name].cripple_creeps.findIndex((item) => item == creep.creep_name)
        //     ];
        // });
        // this.cripple_creeps = Memory.rooms_new[this.room_name].cripple_creeps;
        return false;
    }

    // public set_lvl(lvl: number) {
    //     this.lvl = lvl;
    // }

    //* creeps in memory -------------------------------------------

    private _manage_new_and_dead_creeps(): void {
        for (const name in this.creeps) {
            if (!(name in Game.creeps)) {
                delete this.creeps[name];
                console.log(name, " deleted");
            }
            // if (name in Memory.rooms_new[this.room_name].cripple_creeps)
            //TODO delete creep in cripples if get deleted while needing heal . Doesn't work atm
            // Memory.rooms_new[this.room_name].cripple_creeps = _.filter(Memory.rooms_new[this.room_name].cripple_creeps, (c: string) => {
            //     return !(c in this.creeps);
            // });
        }
        for (const name in Game.creeps) {
            if (!(name in this.creeps)) {
                this.creeps[name] = this._generate(Game.creeps[name].memory.role, name);
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
