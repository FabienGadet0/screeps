import { config } from "chai";
import { all } from "lodash";
import * as Config from "../config";
import * as Utils from "../utils/utils";
import * as Finder from "../utils/finder";
import { profile } from "../Profiler/Profiler";

// import { ICreep, ACTION } from "./creeps/ICreep";

import { match, __, when, select } from "ts-pattern";
import { Mnemonic, mnemon } from "../utils/mnemonic";

interface skeleton {
    name: string;
    role: string;
    lvl: number;
}

@profile
class Creep_factory implements Mnemonic {
    room_name: string;

    @mnemon
    classes_in_room: Record<string, number>;

    @mnemon
    lvl: number;

    @mnemon
    spawn_id: Id<StructureSpawn>;

    @mnemon
    spawning_queue: skeleton[];

    constructor(room_name: string) {
        this.room_name = room_name;
        this.spawning_queue = [];
    }

    public locator(): { [key: string]: any } {
        return Memory.rooms_new[this.room_name];
    }

    //TODO also add new role in classes_in_room and shouldn't
    private _get_amount_of_creep_with_role(_role: string): number {
        if (!this.classes_in_room[_role]) this.classes_in_room[_role] = 0;
        return this.classes_in_room[_role];
    }

    private _can_spawn_new_creep(_spawn: StructureSpawn, _role: string): Boolean {
        const already_spawned = this._get_amount_of_creep_with_role(_role);
        return (
            _spawn.spawnCreep(Config.role_to_bodyparts[Utils.round_lvl(this.lvl)][_role], "testspace", { dryRun: true }) === 0 &&
            already_spawned < Config.limit_per_role_per_room[Utils.round_lvl(this.lvl)][_role] &&
            !_spawn.spawning
        );
    }

    private _spawn_creep(spawn: StructureSpawn, name: string, _role: string, lvl: number): ScreepsReturnCode | number {
        // console.log("spawn " + lvl + " role " + _role + " Name " + name);
        if (!spawn.spawning) {
            this.classes_in_room[_role] += 1;
            return spawn.spawnCreep(Config.role_to_bodyparts[lvl][_role], name, {
                memory: {
                    _trav: undefined,
                    _travel: undefined,
                    role: _role,
                    source_to_target: Config.class_to_source[_role],
                    needs_energy: false,
                    target: undefined,
                    action: "IDLE",
                    room: spawn.room.name,
                    spawn_name: spawn.name,
                    lvl: lvl,
                },
            });
        }
        return -20;
    }

    public update(): void {
        this.locator();

        const count_creeps = _.size(Memory.rooms_new[this.room_name].creeps_name);
        if (count_creeps < Config.total_possible_creeps(this.lvl)) {
            const spawn = Game.getObjectById(this.spawn_id) as StructureSpawn;

            _.each(Config.all_roles(this.lvl), (role: string) => {
                if (this._can_spawn_new_creep(spawn, role)) {
                    this.spawning_queue.push({
                        name: Utils.name_new_creep(role, this.lvl),
                        role: role,
                        lvl: this.lvl,
                    });
                }
                //TODO sort spawn queue
            });
        }
        // console.log(this.spawning_queue);
    }

    public run(): void {
        if (this.spawning_queue && this.spawning_queue.length > 0) {
            const spawn = Game.getObjectById(this.spawn_id) as StructureSpawn;
            const skelet = this.spawning_queue.shift();
            if (skelet) Utils._C(`${spawn.name} spawning `, this._spawn_creep(spawn, skelet.name, skelet.role, skelet.lvl));
        }
    }
}

export { Creep_factory };
