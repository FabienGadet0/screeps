import * as Config from "../config";
import * as Utils from "../utils/utils";
import { profile } from "../Profiler/Profiler";

@profile
export class Room_build_planner {
    room_name: string;
    spawn_id: Id<StructureSpawn>;

    constructor(room_name: string, spawn_id: Id<StructureSpawn>) {
        this.room_name = room_name;
        this.spawn_id = spawn_id;
    }

    private _delete_all_construction_sites(room: Room) {
        //TODO it's an id and not an object
        let constructions = Memory.rooms_new[room.name].structure_id["construction_sites"];
        _.each(constructions, (construction) => {
            construction.remove();
        });
    }

    private _delete_all_roads(room: Room) {
        //todo Delete this call.
        // let roads = Finder._FIND_ROADS(room);
        // _.each(roads, (construction) => {
        // construction.destroy();
        // });
    }

    private _delete_all(room: Room) {
        this._delete_all_construction_sites(room);
        this._delete_all_roads(room);
    }

    private _create_roads(spawn: StructureSpawn) {
        let built = false;

        //? Roads to sources
        //TODO it's an id and not an object
        const sources = Memory.rooms_new[spawn.room.name].structure_id["sources"];
        _.each(sources, (source: Source) => {
            const path = spawn.pos.findPathTo(source.pos, { ignoreCreeps: true });
            _.each(path, (pos) => {
                const position_in_room = spawn.room.getPositionAt(pos.x, pos.y);
                if (position_in_room && position_in_room.look().length === 1) {
                    //? check if position is free
                    Utils._C(spawn.id, spawn.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD));
                    built = true;
                }
            });
        });
        if (built) console.log("Building roads to energy");

        built = false;
        // //? Road to controller
        //TODO it's an id and not an object
        const controller = Memory.rooms_new[spawn.room.name].structure_id["controller"];
        if (controller) {
            const path = spawn.pos.findPathTo(controller.pos, { ignoreCreeps: true });
            _.each(path, (pos) => {
                const position_in_room = spawn.room.getPositionAt(pos.x, pos.y);
                if (position_in_room && position_in_room.look().length === 1) {
                    //? check if position is free
                    Utils._C(spawn.id, spawn.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD));
                    built = true;
                }
            });
        }

        built = false;
        //? Road to minerals
        //TODO it's an id and not an object
        const minerals = Memory.rooms_new[spawn.room.name].structure_id["minerals"];
        if (minerals) {
            _.each(minerals, (mineral) => {
                const path = spawn.pos.findPathTo(mineral.pos, { ignoreCreeps: true });
                _.each(path, (pos) => {
                    const position_in_room = spawn.room.getPositionAt(pos.x, pos.y);
                    if (position_in_room && position_in_room.look().length === 1) {
                        //? check if position is free
                        Utils._C(spawn.id, spawn.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD));
                        built = true;
                    }
                });
            });
        }
        if (built) console.log("Building roads to minerals");
    }

    private __on_left(pos: RoomPosition, offset: number = 4) {
        return RoomPosition(pos.x - offset, pos.y, pos.roomName);
    }

    private __on_right(pos: RoomPosition, offset: number = 4) {
        return RoomPosition(pos.x + offset, pos.y, pos.roomName);
    }

    private __on_bottom(pos: RoomPosition, offset: number = 4) {
        return RoomPosition(pos.x, pos.y + offset, pos.roomName);
    }

    private __on_top(pos: RoomPosition, offset: number = 4) {
        return RoomPosition(pos.x, pos.y - offset, pos.roomName);
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
    private __get_all_position_in_square(x: number, y: number, depth: number) {
        let all_pos = [];
        const corners = this.__get_corners(x, y, depth);
        all_pos.push([corners[0]]);
        all_pos.push(this.__coords_between(corners[0][0], corners[0][1], corners[1][0], corners[1][1]));
        all_pos.push(this.__coords_between(corners[0][0], corners[0][1], corners[2][0], corners[2][1]));
        all_pos.push(this.__coords_between(corners[1][0], corners[1][1], corners[3][0], corners[3][1]));
        all_pos.push(this.__coords_between(corners[2][0], corners[2][1], corners[3][0], corners[3][1]));
        all_pos.pop();
        return Utils.flatten(all_pos);
    }

    //* If amount_to_create is undefined then it will create the maximum possible.
    private _create_closest_to_pos(
        pos: RoomPosition,
        structure: BuildableStructureConstant,
        depth: number = 1,
        amount_to_create: number = 1000,
    ) {
        let breaker = false;
        let created = 0;
        let room = Game.rooms[this.room_name];
        while (!breaker && depth <= Config.MAX_DEPTH_FOR_BUILDING) {
            const all_pos = this.__get_all_position_in_square(pos.x, pos.y, depth);
            for (let pos of all_pos) {
                const r = Utils._C("Build planner " + this.room_name, room.createConstructionSite(pos[0], pos[1], structure));
                if (r === ERR_INVALID_ARGS) {
                    Utils._C("Build planner " + this.room_name, r, "Construction fail");
                    break;
                }
                if (r === ERR_FULL || r === ERR_RCL_NOT_ENOUGH) {
                    //? set extensions build map to false because we reached the maximum possible for now.
                    breaker = true;
                    break;
                }
                if (created >= amount_to_create) breaker = true;
                created += 1;
            }
            depth += 1;
        }
    }

    private _search_flaggy_flaggy(spawn: StructureSpawn, name: string) {
        return _.filter(Memory.rooms_new[spawn.room.name].flags, (flag: Flag) => flag.name.includes(name));
    }

    private _create_struct(spawn: StructureSpawn, struct: BuildableStructureConstant) {
        const flags = this._search_flaggy_flaggy(spawn, struct);
        let pos = spawn.pos;
        //? Set an offset if there is no flag to not spawn structures directly at the spawn.
        let offset = 3;
        // if (flags) {
        //     pos = Game.flags[flags[0]].pos;
        //     offset = 0;
        // }
        this._create_closest_to_pos(pos, struct);
    }

    public update(): void { }

    public run(): void {
        //     const spawn = Game.getObjectById(this.spawn_id) as StructureSpawn;

        //     if (Memory.rooms_new[this.room_name].build_map["build_roads"]) {
        //         this._create_roads(spawn);
        //         Memory.rooms_new[this.room_name].build_map["build_roads"] = false;
        //     }
        //     if (Memory.rooms_new[this.room_name].build_map["build_extensions"]) {
        //         this._create_struct(spawn, STRUCTURE_EXTENSION);
        //         Memory.rooms_new[this.room_name].build_map["build_extensions"] = false;
        //     }
        //     if (Memory.rooms_new[this.room_name].safe_delete) this._delete_all(spawn.room);
        // }
    }
}

