import * as Utils from "../utils/utils";

import { ICreep, ACTION } from "./creeps/ICreep";
import { profile } from "../Profiler/Profiler";
import { Creep_factory } from "./creep_factory";
import { match, __, when, select } from "ts-pattern";

import { Harvester } from "./creeps/harvester";
import { Builder } from "./creeps/builder";
import { Upgrader } from "./creeps/upgrader";
import { Mnemonic, mnemon } from "../utils/mnemonic";
import * as Config from "../config";

interface skeleton {
    name: string;
    role: string;
    lvl: number;
}

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

    @mnemon
    classes_in_room: Record<string, number>;

    @mnemon
    structure_id: string[];

    constructor(room_name: string) {
        this.room_name = room_name;
        this.creeps = {};
        this.creep_factory = new Creep_factory(room_name);

        _.each(Game.rooms[room_name].find(FIND_MY_CREEPS), (creep: Creep) => {
            this.creeps[creep.name] = this._generate(creep.memory.role, creep.name);
            console.log(`new creep ${creep.name} ${creep.memory.role}`);
        });
    }

    public locator(): { [key: string]: any } {
        return Memory.rooms_new[this.room_name];
    }

    private _generate(role: string, room_name: string): any {
        switch (role) {
            case "harvester":
                return new Harvester(room_name);
            case "builder":
                return new Builder(room_name);
            case "upgrader":
                return new Upgrader(room_name);
            default:
                console.log(`wrong role ${role}`);
        }
    }

    public run(): void {
        this.creep_factory.run();

        _.each(this.creeps, (creep: ICreep) => {
            creep.run();
        });
        const spawn = Game.getObjectById(this.spawn_id) as StructureSpawn;

        if (Memory.rooms_new[this.room_name].cripple_creeps.length > 0 && !spawn.spawning) {
            const close_creep = _.map(Memory.rooms_new[this.room_name].cripple_creeps, (c: string) => {
                if (this.creeps[c] && this.creeps[c].creep && this.creeps[c].creep.pos.isNearTo(spawn)) return this.creeps[c];
            });
            if (close_creep) {
                // console.log(`close_creep[0] -> ${close_creep[0].creep}`);

                this.tryRenew(close_creep[0], spawn);
            }
        }
    }

    private _fix_low_level_creeps() {
        const room = Game.rooms[this.room_name];
        //? Check if all creeps are at the same level as the room otherwise kill it , the factory will then respawn one at the right level.
        if (room.energyCapacityAvailable === room.energyAvailable && this.creeps_name.length > 0) {
            //TODO and if creep_queue is empty.
            //? if room is full of energy

            const under_level_creeps: ICreep[] = _.filter(this.creeps, (c: ICreep) => {
                return c.lvl < this.lvl;
            });

            if (under_level_creeps[0] && under_level_creeps[0].kys) under_level_creeps[0].kys = true;
        }
    }

    private _clean_creep() {
        // if (Game.rooms[this.room_name].energyAvailable === Game.rooms[this.room_name].energyCapacityAvailable) {
        //     Object.entries(this.classes_in_room).map(([key,value]))
        // }
        // for (const name in this.creeps) {
        //     if (!name) delete this.creeps[name];
        // }
    }

    // private _creep_queue() {
    //     _.each(this.classes_in_room, (role: string, amount : number) => {
    //         const limit = Config.limit_per_role_per_room[Utils.round_lvl(this.lvl)][role];
    //     });
    // }

    public update(): boolean {
        this.locator();
        this._clean_creep();
        this._fix_low_level_creeps();

        this.creep_factory.update();

        this._manage_new_and_dead_creeps();

        _.map(this.creeps, (creep: ICreep) => {
            creep.update();
        });
        return false;
    }

    //* creeps in memory -------------------------------------------

    private _manage_new_and_dead_creeps(): void {
        for (const name in this.creeps) {
            if (!(name in Game.creeps)) {
                delete this.creeps[name];
                console.log(name, " deleted");
                if (Memory.rooms_new[this.room_name].cripple_creeps.includes(name))
                    Memory.rooms_new[this.room_name].cripple_creeps.remove(name);
                if (this.creeps_name.includes(name)) this.creeps_name.remove(name);
            }
        }
        for (const name in Game.creeps) {
            if (!this.creeps_name.includes(name)) {
                this.creeps_name.push(name);
            }

            if (!(name in this.creeps)) {
                this.creeps[name] = this._generate(Game.creeps[name].memory.role, name);
                console.log(name, " added");
            }
        }
    }

    //*  -------------------------------------------------------------

    protected tryRenew(creep: ICreep, spawn: StructureSpawn): void {
        let r = 0;
        if (creep) {
            if (!spawn.pos.isNearTo(creep.creep.pos)) console.log("renew " + creep + " waiting for you bitch");
            else Utils._C(spawn.name, spawn.renewCreep(creep.creep));
            // if (r === OK) console.log("renew creep " + creep.creep);
            // return r;
        }
    }
}

export { Creep_manager };
