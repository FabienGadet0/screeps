import * as Config from "../config";
import * as Utils from "../utils/utils";
import { profile } from "../Profiler/Profiler";
import { Mnemonic, mnemon } from "../utils/mnemonic";
import { match, __ } from "ts-pattern";
// import { FuncTimer } from "./deprecated/functimer";

@profile
export class Bunker_planner implements Mnemonic {
    room_name: string;

    @mnemon
    spawn_id: Id<StructureSpawn>;

    @mnemon
    lvl: number;

    @mnemon
    controller: Id<StructureController>;

    @mnemon
    build_plan: Record<string, any>;

    @mnemon
    flags: string[];

    @mnemon
    structure_id: Record<string, any>;

    @mnemon
    updater: Record<string, number>;

    plan_to_func: Record<string, any>;

    // func_timer: FuncTimer;

    constructor(room_name: string, spawn_id: Id<StructureSpawn>) {
        this.room_name = room_name;
        // this.func_timer = new FuncTimer(this.room_name, )
        this.plan_to_func = {
            road_to_energy: () => this._road(this.spawn_id, this.structure_id.sources),
            road_to_controller: () => this._road(this.spawn_id, [this.controller]),
            road_to_minerals: () => this._road(this.spawn_id, this.structure_id.minerals),
            road_to_exits: () => {}, //TODO add exits
            delete_sites: () => this._delete_all_construction_sites(),
            delete_roads: () => this._delete_all_roads(),
            every_roads: () => {
                this._road(this.spawn_id, this.structure_id.sources);
                this._road(this.spawn_id, [this.controller]);
                this._road(this.spawn_id, this.structure_id.minerals);
                //TODO add exits
            },
        };
    }

    locator() {
        return Memory.rooms_new[this.room_name];
    }

    private _delete_all_construction_sites() {
        //TODO it's an id and not an object
        _.each(this.structure_id["construction_sites"], (construction) => {
            (Game.getObjectById(construction) as ConstructionSite).remove();
        });
    }

    private _create_structs(lvl: number, bunker_structure_lvl: string[], bunker_blueprint: string[], top_left_corner_pos: RoomPosition) {
        let y = 0;
        let x = 0;
        const room = Game.rooms[this.room_name];
        _.each(bunker_structure_lvl, (line: string) => {
            _.each(line, (c: string) => {
                if (parseInt(c) <= lvl) {
                    const struct = Config.letter_to_structure[bunker_blueprint[y][x]];
                    room.createConstructionSite(
                        new RoomPosition(top_left_corner_pos.x + x, top_left_corner_pos.y + y, this.room_name),
                        struct,
                    );
                }
                x += 1;
            });
            x = 0;
            y += 1;
        });
    }

    private _create_structures_with_actual_lvl() {
        const rcl = Game.rooms[this.room_name].controller!.level;
        this._create_structs(rcl, Config.bunkerStructureLevels, Config.blueprint, Game.flags["bunker_top_left"].pos);
        this._create_structs(rcl, Config.bunkerRampartLevels, Config.bunkerRampartBlueprint, Game.flags["bunker_top_left"].pos);
    }

    private _delete_all_roads() {
        const roads = Game.rooms[this.room_name].find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_ROAD } });
        _.each(roads, (r) => {
            r.destroy();
        });
        //TODO shouldn't reset from here.
        this.structure_id["roads"] = [];
        Memory.rooms[this.room_name].room_tasks["repair"] = [];
    }

    public update(): void {}

    private _road(from: any, to: Id<Structure>[]) {
        const from_obj = Game.getObjectById(from) as Structure;
        _.each(to, (to_id: Id<Source>) => {
            const to_obj = Game.getObjectById(to_id) as Source;
            const path = from_obj.pos.findPathTo(to_obj.pos, {
                ignoreCreeps: true,
            });
            const room = Game.rooms[this.room_name];
            _.map(path, (pos) => {
                if (room.lookAt(pos.x, pos.y).length === 1) room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
            });
        });
    }

    public run(): void {
        const spawn = Game.getObjectById(this.spawn_id) as StructureSpawn;

        _.each(Object.keys(this.build_plan), (key: string) => {
            if (this.build_plan[key]) {
                this.plan_to_func[key]();
                this.build_plan[key] = false;
            }
        });
        //? Build bunker every 100 ticks.
        if (this.flags && this.flags.includes("bunker_top_left") && Game.time >= this.updater["build_bunker"] + 100) {
            this._create_structures_with_actual_lvl();
            this.updater["build_bunker"] = Game.time;
        }
        this.locator();
    }
}
