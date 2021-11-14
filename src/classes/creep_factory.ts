import { config } from "chai";
import { all } from "lodash";
import * as Config from "../config";
import * as Utils from "../utils/utils";
import * as Finder from "../../deprecated/finder";
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
export class Creep_factory implements Mnemonic {
    room_name: string;

    @mnemon
    classes_in_room: Record<string, number>;

    @mnemon
    lvl: number;

    @mnemon
    spawn_id: Id<StructureSpawn>;

    // @mnemon
    // spawning_queue: skeleton[];

    @mnemon
    creeps_name: string[];

    constructor(room_name: string) {
        this.room_name = room_name;
        // this.spawning_queue = [];
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
            _spawn.spawnCreep(Config.roles_settings[Utils.round_lvl(this.lvl)][_role].body_part, "testspace", { dryRun: true }) === 0 &&
            already_spawned < Config.roles_settings[Utils.round_lvl(this.lvl)][_role].limit &&
            !_spawn.spawning
        );
    }

    private _spawn_creep(spawn: StructureSpawn, name: string, _role: string, lvl: number): ScreepsReturnCode | number {
        // console.log("spawn " + lvl + " role " + _role + " Name " + name);
        if (!spawn.spawning) {
            return spawn.spawnCreep(Config.roles_settings[Utils.round_lvl(lvl)][_role].body_part, name, {
                memory: {
                    _trav: undefined,
                    _travel: undefined,
                    role: _role,
                    source_to_target: Config.roles_settings[Utils.round_lvl(lvl)][_role].source,
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

    private _try_spawn(spawn: StructureSpawn, role: string) {
        const r = Utils._C(`${spawn.name} spawning `, this._spawn_creep(spawn, Utils.name_new_creep(role, this.lvl), role, this.lvl));
        if (r === OK) this.classes_in_room[role] += 1;
    }

    public update(): void {
        this.locator();
    }

    public run(): void {
        const count_creeps = _.size(this.creeps_name);

        if (count_creeps < Config.total_possible_creeps(this.lvl)) {
            const spawn = Utils.get_by_id(this.spawn_id) as StructureSpawn;
            const roles = Config.all_roles(this.lvl);
            _.each(Config.all_roles(this.lvl), (role: string) => {
                if (this._can_spawn_new_creep(spawn, role)) this._try_spawn(spawn, role);
            });
        }
    }
}
