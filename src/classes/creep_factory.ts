import { config } from "chai";
import { all } from "lodash";
import * as Config from "../config";
import * as Utils from "../utils/utils";
import * as Finder from "../utils/finder";
import { profile } from "../Profiler/Profiler";

@profile
class Creep_factory {
    room_name: string;
    lvl: number;
    spawn_id: Id<StructureSpawn>;

    constructor(room_name: string, spawn_id: Id<StructureSpawn>) {
        this.room_name = room_name;
        // this.lvl = Finder.GET_LVL_OF_ROOM(Game.rooms[room_name]);
        this.lvl = 0;
        this.spawn_id = spawn_id;
    }

    private _get_amount_of_creep_with_role(_role: string) {
        return _.size(_.filter(Memory["rooms"][this.room_name].creeps, (c: Creep) => c.memory.role === _role));
    }

    private _can_spawn_new_creep(_spawn: StructureSpawn, _role: string): Boolean {
        const already_spawned = this._get_amount_of_creep_with_role(_role);
        return (
            _spawn.spawnCreep(Config.role_to_bodyparts[this.lvl][_role], "testspace", { dryRun: true }) === 0 &&
            already_spawned < Config.limit_per_role_per_room[_role] &&
            !_spawn.spawning
        );
    }

    private _spawn_creep(spawn: StructureSpawn, name: string, _role: string, lvl: number): ScreepsReturnCode {
        return spawn.spawnCreep(Config.role_to_bodyparts[lvl][_role], name, {
            memory: {
                _trav: undefined,
                _travel: undefined,
                is_renewing: false,
                role: _role,
                target: undefined,
                action: "IDLE",
                room: spawn.room.name,
                spawn_name: spawn.name,
                // target_type: "",
                lvl: lvl,
            },
        });
    }

    public update(): void {
        this.lvl = Memory["rooms"][this.room_name]["lvl"];
    }

    public run(): void {
        let total = 0;
        const count_creeps = _.size(Memory["rooms"][this.room_name].creeps);
        if (count_creeps < Config.total_possible_creeps) {
            let lvl = Memory.rooms[this.room_name].lvl;
            const spawn = Finder.from_id(this.spawn_id);

            _.each(Config.all_roles, (role: string) => {
                if (this._can_spawn_new_creep(spawn, role)) {
                    const name = role + "/" + String(lvl) + "/" + Game.time;
                    const r = this._spawn_creep(spawn, "", role, lvl);

                    if (r === OK) {
                        //todo push id creep to creep.
                        // Game.creeps[name].id
                    } else Utils._C(spawn.name, r);
                }
            });
        }
    }
}

export { Creep_factory };
