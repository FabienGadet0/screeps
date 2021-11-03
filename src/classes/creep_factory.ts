import { config } from "chai";
import { all } from "lodash";
import * as Config from "../config";
import * as Utils from "../utils/utils";
import * as Finder from "../utils/finder";
import { profile } from "../Profiler/Profiler";

// import { ICreep, ACTION } from "./creeps/ICreep";
import { Harvester } from "./creeps/harvester";
import { Builder } from "./creeps/builder";
import { Upgrader } from "./creeps/upgrader";

@profile
class Creep_factory {
    room_name: string;
    lvl: number;
    spawn_id: Id<StructureSpawn>;

    constructor(room_name: string, spawn_id: Id<StructureSpawn>) {
        this.room_name = room_name;
        this.lvl = 300;
        this.spawn_id = spawn_id;
    }

    //TODO Make it a real factory with <T>
    public generate(role: string, room_name: string): any {
        switch (role) {
            case "harvester":
                return new Harvester(room_name);
            case "builder":
                return new Builder(room_name);
            case "upgrader":
                return new Upgrader(room_name);
        }
    }

    public set_lvl(lvl: number) {
        this.lvl = lvl;
    }

    private _get_amount_of_creep_with_role(room_name: string, _role: string) {
        return _.size(_.filter(Game.creeps, (c: Creep) => c.name in Memory.rooms[room_name].creeps_name && c.memory.role === _role));
    }

    private _can_spawn_new_creep(_spawn: StructureSpawn, _role: string): Boolean {
        const already_spawned = this._get_amount_of_creep_with_role(_spawn.room.name, _role);
        return (
            _spawn.spawnCreep(Config.role_to_bodyparts[this.lvl][_role], "testspace", { dryRun: true }) === 0 &&
            already_spawned < Config.limit_per_role_per_room[_role] &&
            !_spawn.spawning
        );
    }

    private _spawn_creep(spawn: StructureSpawn, name: string, _role: string, lvl: number): ScreepsReturnCode {
        console.log("spawn " + lvl + " role " + _role); //TODO BETTER NAMING
        return spawn.spawnCreep(Config.role_to_bodyparts[lvl][_role], name, {
            memory: {
                _trav: undefined,
                _travel: undefined,
                role: _role,
                source_to_target: 0,
                needs_energy: false,
                target: undefined,
                action: "IDLE",
                room: spawn.room.name,
                spawn_name: spawn.name,
                lvl: lvl,
            },
        });
    }

    public update(): void {
        this.lvl = Memory.rooms[this.room_name].lvl;
    }

    public run(): void {
        let total = 0;
        const count_creeps = _.size(Memory["rooms"][this.room_name].creeps_name);
        if (count_creeps < Config.total_possible_creeps) {
            const spawn = Finder.from_id(this.spawn_id);

            _.each(Config.all_roles, (role: string) => {
                if (this._can_spawn_new_creep(spawn, role)) {
                    const name = role + "/" + String(this.lvl) + "/" + Game.time;
                    const r = this._spawn_creep(spawn, name, role, this.lvl);

                    if (r !== OK) Utils._C(spawn.name, r);
                }
            });
        }
    }
}

export { Creep_factory };
