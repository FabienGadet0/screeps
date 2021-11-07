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
import { close } from "fs";

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
    structure_id: string[];

    constructor(room_name: string) {
        this.room_name = room_name;
        this.creeps = {};
        // this.spawn_id = this.locator().spawn_id;
        // this.lvl = this.locator().lvl;
        // this.creeps_name = this.locator().creeps_name;
        Memory.rooms_new[this.room_name].cripple_creeps = this.locator().cripple_creeps;
        // this.structure_id = this.locator().structure_id;

        // this.room_tasks = this.locator().room_tasks;
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

    public run(): void {
        this.creep_factory.run();

        _.each(this.creeps, (creep: ICreep) => {
            creep.run();
        });
        const spawn = Game.getObjectById(this.spawn_id) as StructureSpawn;

        if (Memory.rooms_new[this.room_name].cripple_creeps.length > 0 && !spawn.spawning) {
            const close_creep = _.map(Memory.rooms_new[this.room_name].cripple_creeps, (c: string) => {
                if (this.creeps[c].creep && this.creeps[c].creep.pos.isNearTo(spawn)) return this.creeps[c];
            });
            if (close_creep) this.tryRenew(close_creep[0], spawn);
        }
    }

    public update(): boolean {
        this.locator();
        // this._manage_tasks();

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

    protected tryRenew(creep: ICreep, spawn: StructureSpawn): number {
        let r = 0;
        if (!spawn.pos.isNearTo(creep.creep.pos)) console.log("renew " + creep.creep + " waiting for you bitch");
        else {
            let r = Utils._C(spawn.name, spawn.renewCreep(creep.creep));
            // if (r === OK) console.log("renew creep " + creep.creep);
        }
        return r;
    }
}

export { Creep_manager };
