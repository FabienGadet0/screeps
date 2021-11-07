import * as Config from "../config";
import * as Utils from "../utils/utils";
import { profile } from "../Profiler/Profiler";
import { Mnemonic, mnemon } from "../utils/mnemonic";
import { match, __ } from "ts-pattern";
import { stringify } from "querystring";

export enum SHAPE {
    CROSS = 0,
    SQUARE,
    SQUARE_OUTER,
    CIRCLE,
    DIAMOND,
    ANGLE_CROSS,
}

function _get_shape_offset(shape: SHAPE): number[][] {
    return match(shape)
        .with(SHAPE.CROSS, () => {
            return [
                [0, 0],
                [1, 0],
                [0, 1],
                [-1, 0],
                [0, -1],
            ];
        })
        .with(SHAPE.SQUARE, () => {
            return [
                [-1, -1],
                [0, -1],
                [+1, -1],
                [-1, 0],
                [0, 0],
                [+1, 0],
                [-1, +1],
                [0, +1],
                [+1, +1],
            ];
        })
        .with(SHAPE.SQUARE_OUTER, () => {
            return [
                [-1, -1],
                [0, -1],
                [+1, -1],
                [-1, 0],
                [+1, 0],
                [-1, +1],
                [0, +1],
                [+1, +1],
            ];
        })
        .with(SHAPE.CIRCLE, () => {
            return [
                [0, -1],
                [-1, 0],
                [+1, 0],
                [0, +1],
            ];
        })
        .with(SHAPE.DIAMOND, () => {
            return [
                [-1, 0],
                [+1, 0],
                [0, -1],
                [0, +1],
            ];
        })
        .with(SHAPE.ANGLE_CROSS, () => {
            return [
                [0, 0],
                [-1, -1],
                [+1, -1],
                [-1, +1],
                [+1, +1],
            ];
        })
        .with(__, () => {
            console.log(`shape is wrong ${shape}`);
            return [];
        })
        .exhaustive();
}

function get_position_with_offset(x: number, y: number, shape: SHAPE, depth: number = 1): any[][] {
    let offsets: any[] = [];
    while (depth !== 0) {
        offsets = _.flatten([offsets, _get_shape_offset(shape)]);
        depth -= 1;
    }
    // const offsets = _get_shape_offset(shape, depth);
    console.log(offsets + " its offset");
    return _.map(offsets, ([a, b]) => [a + x, b + y]);
}

// function _apply_offset(x, y) {
//     deltas.map(([a, b]) => [a + position[0], b + position[1]]);
// }

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

    plan_to_func: Record<string, any>;

    constructor(room_name: string, spawn_id: Id<StructureSpawn>) {
        this.room_name = room_name;
        this.plan_to_func = {
            road_to_energy: () => this._road(this.spawn_id, this.structure_id.sources),
            road_to_controller: () => this._road(this.spawn_id, [this.controller]),
            road_to_minerals: () => this._road(this.spawn_id, this.structure_id.minerals),
            road_to_exits: () => {}, //TODO add exits
            square_road_around_spawn: () => this.square_road_around_spawn(),

            extensions: () => this.extensions(),
            towers: () => this.towers(),
            defensive_rampart: () => this.defensive_rampart(),
            exit_rampart: () => this.exit_rampart(),
            delete_sites: () => this._delete_all_construction_sites(),
            delete_roads: () => this._delete_all_roads(),
            every_roads: () => {
                this._road(this.spawn_id, this.structure_id.sources);
                this._road(this.spawn_id, [this.controller]);
                this._road(this.spawn_id, this.structure_id.minerals);
                //TODO add exits
            },
        };
        this.build_plan = this.locator().build_plan;
        this.structure_id = this.locator().structure_id;
        this.spawn_id = this.locator().spawn_id;
        this.controller = this.locator().controller;
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

    private _get_structures_for_lvl(
        lvl: number,
        bunker_structure_lvl: string[],
        bunker_blueprint: string[],
        top_left_corner_pos: RoomPosition,
    ) {
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
        this._get_structures_for_lvl(rcl, Config.bunkerStructureLevels, Config.blueprint, Game.flags["bunker_top_left"].pos);
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

    private __get_corners(x: number, y: number, depth: number) {
        return [
            [x - depth, y - depth],
            [x + depth, y - depth],
            [x - depth, y + depth],
            [x + depth, y + depth],
        ];
    }

    private __coords_between(a: number, b: number, c: number, d: number): number[][] {
        let all_pos = [];
        while (a < c || b < d) {
            if (a < c) a += 1;
            else if (b < d) b += 1;
            all_pos.push([a, b]);
        }
        return all_pos;
    }

    // 0 -> 1 / 0 -> 2/ 1 -> 3 / 2 -> 3
    private _get_all_position_in_square(x: number, y: number, depth: number) {
        let all_pos = [];
        const corners = this.__get_corners(x, y, depth);
        all_pos.push([corners[0]]);
        all_pos.push(this.__coords_between(corners[0][0], corners[0][1], corners[1][0], corners[1][1]));
        all_pos.push(this.__coords_between(corners[0][0], corners[0][1], corners[2][0], corners[2][1]));
        all_pos.push(this.__coords_between(corners[1][0], corners[1][1], corners[3][0], corners[3][1]));
        all_pos.push(this.__coords_between(corners[2][0], corners[2][1], corners[3][0], corners[3][1]));
        return Utils.flatten(all_pos);
    }

    //* If amount_to_create is undefined then it will create the maximum possible.
    private create_from_shape(
        original_pos: RoomPosition,
        structure: BuildableStructureConstant,
        shape: SHAPE,
        size: number = 1,
        amount_to_create: number = 1000,
    ): void {
        let room = Game.rooms[this.room_name];
        const positions = get_position_with_offset(original_pos.x, original_pos.y, shape, size);
        _.map(positions, (pos) => {
            if (room.lookAt(pos[0], pos[1]).length === 1) Utils._C("[BUILD]", room.createConstructionSite(pos[0], pos[1], structure));
        });
    }

    private _search_flaggy_flaggy(spawn: StructureSpawn, name: string) {
        return _.filter(Memory.rooms_new[spawn.room.name].flags, (flag: Flag) => flag.name.includes(name));
    }

    public update(): void {
        this.locator();
        // if (this.flags && this.flags.includes("bunker_top_left")) {
        //     this._create_structures_with_actual_lvl();
        // }
    }

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

    private square_road_around_spawn(size: number = 2) {
        const spawn = Game.getObjectById(this.spawn_id) as StructureSpawn;
        const room = Game.rooms[this.room_name];

        let positions: number[] = [];
        while (size !== 0) {
            positions = _.flatten([positions, this._get_all_position_in_square(spawn.pos.x, spawn.pos.y, size)]);
            size -= 1;
        }
        _.map(positions, (pos) => {
            if (room.lookAt(pos[0], pos[1]).length === 1) Utils._C("[BUILD]", room.createConstructionSite(pos[0], pos[1], STRUCTURE_ROAD));
        });
    }

    private extensions() {}

    private towers() {}

    private defensive_rampart() {}

    private exit_rampart() {}

    public run(): void {
        const spawn = Game.getObjectById(this.spawn_id) as StructureSpawn;
        // if(_.filter(this.build_plan, (v) => !!v)

        _.each(Object.keys(this.build_plan), (key: string) => {
            // _.filter(this.build_plan, (v) => v).forEach((_, key) => {
            // console.log("going in " + Object.keys(this.build_plan)[key] + " = " + this.build_plan);
            if (this.build_plan[key]) {
                this.plan_to_func[key]();
                this.build_plan[key] = false;
            }
        });
        // });
    }
}
