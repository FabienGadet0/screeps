import { REPAIR_THRESHOLD } from "../config";
import * as Utils from "../utils/utils";
import { profile } from "../Profiler/Profiler";
import { match, __, when, select } from "ts-pattern";
import { Mnemonic, mnemon } from "../utils/mnemonic";

// function get(room_name: string, val: string): any {
//     if (val === "lvl" || val === "creeps_name") return Memory.rooms_new[room_name][val];

//     return Memory.rooms_new[room_name].structure_id[val];
// }

// function from_id(id: Id<any>) {
//     return Game.getObjectById(id);
// }

// function from_ids(ids: Id<any>[]): any[] {
//     return _.map(ids, (id: Id<any>) => {
//         return Game.getObjectById(id);
//     });
// }

// function push_id(room_name: string, to: string, id: Id<any>): void {
//     if (to === "creeps_name") Memory.rooms_new[room_name][to].push(id);

//     Memory.rooms_new[room_name].structure_id[to].push(id);
// }

// function push_ids(room_name: string, to: string, ids: Id<any>[]): void {
//     _.map(ids, (id: Id<any>) => {
//         push_id(room_name, to, id);
//     });
// }

@profile
class Memory_manager implements Mnemonic {
    room_name: string;

    @mnemon
    controller?: Id<StructureController>;

    @mnemon
    structure_id: Record<string, any[]>;

    constructor(room_name: string) {
        this.room_name = room_name;
        this.controller = this._find_controller_id(Game.rooms[room_name]);
        this.structure_id = this.locator().structure_id;

        this.update_room_component(Game.rooms[room_name], [
            "sources",
            "construction_sites",
            "extensions",
            "minerals",
            "to_repair",
            "extensions_not_full",
            "containers_not_full",
        ]);
    }

    public locator(): { [key: string]: any } {
        return Memory.rooms_new[this.room_name];
    }

    public update() {
        this.locator();
        this.update_room_component(Game.rooms[this.room_name], ["sources", "flags"]);
        if (
            Memory.rooms_new[this.room_name].room_tasks["to_transfer"] &&
            _.isEmpty(Memory.rooms_new[this.room_name].room_tasks["to_transfer"])
            // && Game.time >= Memory.rooms_new[this.room_name].updater.construction_sites + 5
        ) {
            this.update_room_component(Game.rooms[this.room_name], [
                "construction_sites",
                "extensions",
                "extensions_not_full",
                "containers_not_full",
                "dropped_resources",
            ]);
        }
        if (Memory.rooms_new[this.room_name].room_tasks["to_build"] && _.isEmpty(Memory.rooms_new[this.room_name].room_tasks["to_build"])) {
            this.update_room_component(Game.rooms[this.room_name], ["construction_sites"]);
        }
        if (Memory.rooms_new[this.room_name].room_tasks["to_repair"] && _.isEmpty(Memory.rooms_new[this.room_name].room_tasks["to_repair"]))
            this.update_room_component(Game.rooms[this.room_name], ["to_repair"]);
        this.locator();
    }

    public run() {}

    private _find_sources_ids(room: Room): Id<Source>[] {
        return _.map(room.find(FIND_SOURCES_ACTIVE), (struct) => {
            //? TOOK OF _ACTIVE
            return struct.id;
        });
    }

    private _find_construction_sites_ids(room: Room): Id<any>[] {
        return _.map(room.find(FIND_MY_CONSTRUCTION_SITES), (struct) => {
            return struct.id;
        });
    }

    private _find_minerals_ids(room: Room): Id<Mineral>[] {
        return _.map(room.find(FIND_MINERALS), (struct) => {
            return struct.id;
        });
    }

    private _find_roads_ids(room: Room): Id<any>[] {
        return _.map(room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_ROAD } }), (struct) => {
            return struct.id;
        });
    }

    private _find_controller_id(room: Room): Id<StructureController> | undefined {
        return room.controller ? room.controller.id : undefined;
    }

    private _find_extensions_ids(room: Room): Id<any>[] {
        return _.map(room.find(FIND_MY_STRUCTURES, { filter: { structureType: "extension" } }), (struct) => {
            return struct.id;
        });
    }

    private _find_not_full_extension_ids(room: Room): Id<any>[] {
        return _.map(
            room.find(FIND_MY_STRUCTURES, {
                filter: (i: StructureExtension) => i.structureType === STRUCTURE_EXTENSION && i.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
            }),
            (struct) => {
                return struct.id;
            },
        );
    }

    private _find_not_full_containers_ids(room: Room): Id<any>[] {
        return _.map(
            room.find(FIND_MY_STRUCTURES, {
                filter: (i: StructureExtension) =>
                    i.structureType !== STRUCTURE_EXTENSION &&
                    i.structureType === STRUCTURE_CONTAINER &&
                    i.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
            }),
            (struct) => {
                return struct.id;
            },
        );
    }

    private _find_dropped_resources_ids(room: Room): Id<Resource>[] {
        return _.map(room.find(FIND_DROPPED_RESOURCES), (resource) => {
            return resource.id;
        });
    }

    private _find_flags_names(room: Room): string[] {
        return _.map(room.find(FIND_FLAGS), (flag) => {
            return flag.name;
        });
    }
    private _find_all_creeps(room: Room) {
        return _.map(room.find(FIND_MY_CREEPS), (creep: Creep) => {
            return creep.name;
        });
    }

    private get_lvl_of_room(room: Room) {
        return 300 + _.size(Memory.rooms_new[room.name].structure_id["extensions"]) * 50;
    }

    //TODO CAN BE OPTIMIZED
    private _find_all_to_repair_ids(room: Room): Id<any>[] {
        return _.map(
            room
                .find(FIND_MY_STRUCTURES, { filter: (i) => i.hits / i.hitsMax < REPAIR_THRESHOLD })
                .concat(
                    room.find(FIND_STRUCTURES, {
                        filter: (i) => i.structureType == STRUCTURE_ROAD && i.hits / i.hitsMax < REPAIR_THRESHOLD,
                    }),
                )
                .slice(0, 5),
            (struct) => {
                return struct.id;
            },
        );
    }

    // prettier-ignore
    public update_room_component(room: Room, update_list: string[]): void {
        if (update_list.length >= 1)
            _.each(update_list, (up : string) => {
                if (!this.structure_id.updater[up] || this.structure_id.updater[up] !== Game.time) {
                    match(up)
                        .with("roads", () => { this.structure_id["roads"] = this._find_roads_ids(room); }) //? too costly.
                        .with("sources", () => { this.structure_id["sources"] = this._find_sources_ids(room); })
                        .with("construction_sites", () => { this.structure_id["construction_sites"] = this._find_construction_sites_ids(room); })
                        .with("extensions", () => { this.structure_id["extensions"] = this._find_extensions_ids(room); })
                        .with("minerals", () => { this.structure_id["minerals"] = this._find_minerals_ids(room); })
                        .with("to_repair", () => { this.structure_id["to_repair"] = this._find_all_to_repair_ids(room); })
                        .with("flags", () => { this.structure_id.flags = this._find_flags_names(room); })
                        .with("extensions_not_full", () => { this.structure_id["extensions_not_full"] = this._find_not_full_extension_ids(room); })
                        .with("dropped_resources", () => { this.structure_id["dropped_resources"] = this._find_dropped_resources_ids(room); })
                        .with("containers_not_full", () => { this.structure_id["containers_not_full"] = this._find_not_full_containers_ids(room); })
                        .with(__, () => {Utils._C("UPDATER", -1000, "Couldn't find corresponding update for " + up);})
                        .exhaustive()
                    this.structure_id.updater[up] = Game.time;
                }
            });
    }
}

export { Memory_manager };
