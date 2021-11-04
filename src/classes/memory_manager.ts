import { REPAIR_THRESHOLD } from "../config";
import * as Utils from "../utils/utils";
import { profile } from "../Profiler/Profiler";
import { match, __, when, select } from "ts-pattern";
import { Mnemonic, mnemon } from "../utils/mnemonic";

// function get(room_name: string, val: string): any {
//     if (val === "lvl" || val === "creeps_name") return Memory.rooms[room_name][val];

//     return Memory.rooms[room_name].structure_ids[val];
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
//     if (to === "creeps_name") Memory.rooms[room_name][to].push(id);

//     Memory.rooms[room_name].structure_ids[to].push(id);
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
        this.controller = this._FIND_CONTROLLER_ID(Game.rooms[room_name]);
        this.structure_id = this.locator().structure_id;

        this.update_room_component(Game.rooms[room_name], [
            // "roads",
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
            Memory.rooms[this.room_name].room_tasks["to_transfer"] &&
            _.isEmpty(Memory.rooms[this.room_name].room_tasks["to_transfer"])
            // && Game.time >= Memory.rooms[this.room_name].updater.construction_sites + 5
        ) {
            this.update_room_component(Game.rooms[this.room_name], [
                "construction_sites",
                "extensions",
                "extensions_not_full",
                "containers_not_full",
                "dropped_resources",
            ]);
        }
        if (Memory.rooms[this.room_name].room_tasks["to_build"] && _.isEmpty(Memory.rooms[this.room_name].room_tasks["to_build"])) {
            this.update_room_component(Game.rooms[this.room_name], ["construction_sites"]);
        }
        if (Memory.rooms[this.room_name].room_tasks["to_repair"] && _.isEmpty(Memory.rooms[this.room_name].room_tasks["to_repair"]))
            this.update_room_component(Game.rooms[this.room_name], ["roads", "to_repair"]);
        this.locator();
    }

    public run() {}

    private _FIND_SOURCES_IDS(room: Room): Id<Source>[] {
        return _.map(room.find(FIND_SOURCES_ACTIVE), (struct) => {
            //? TOOK OF _ACTIVE
            return struct.id;
        });
    }

    private _FIND_CONSTRUCTION_SITES_IDS(room: Room): Id<any>[] {
        return _.map(room.find(FIND_MY_CONSTRUCTION_SITES), (struct) => {
            return struct.id;
        });
    }

    private _FIND_MINERALS_IDS(room: Room): Id<Mineral>[] {
        return _.map(room.find(FIND_MINERALS), (struct) => {
            return struct.id;
        });
    }

    private _FIND_ROADS_IDS(room: Room): Id<any>[] {
        return _.map(room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_ROAD } }), (struct) => {
            return struct.id;
        });
    }

    private _FIND_CONTROLLER_ID(room: Room): Id<StructureController> | undefined {
        return room.controller ? room.controller.id : undefined;
    }

    private _FIND_EXTENSIONS_IDS(room: Room): Id<any>[] {
        return _.map(room.find(FIND_MY_STRUCTURES, { filter: { structureType: "extension" } }), (struct) => {
            return struct.id;
        });
    }

    private _FIND_NOT_FULL_EXTENSION_IDS(room: Room): Id<any>[] {
        return _.map(
            room.find(FIND_MY_STRUCTURES, {
                filter: (i: StructureExtension) => i.structureType === STRUCTURE_EXTENSION && i.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
            }),
            (struct) => {
                return struct.id;
            },
        );
    }

    private _FIND_NOT_FULL_CONTAINERS_IDS(room: Room): Id<any>[] {
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

    private _FIND_DROPPED_RESOURCES_IDS(room: Room): Id<Resource>[] {
        return _.map(room.find(FIND_DROPPED_RESOURCES), (resource) => {
            return resource.id;
        });
    }

    private _FIND_FLAGS_NAMES(room: Room): string[] {
        return _.map(room.find(FIND_FLAGS), (flag) => {
            return flag.name;
        });
    }
    private _FIND_ALL_CREEPS(room: Room) {
        return _.map(room.find(FIND_MY_CREEPS), (creep: Creep) => {
            return creep.name;
        });
    }

    private GET_LVL_OF_ROOM(room: Room) {
        return 300 + _.size(Memory.rooms_new[room.name].structure_ids["extensions"]) * 50;
    }

    //TODO CAN BE OPTIMIZED
    private _FIND_ALL_TO_REPAIR_IDS(room: Room): Id<any>[] {
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
    //     // prettier-ignore
    //     public update_room_component(room: Room, update_list: string[]): void {
    //         if (update_list.length >= 1)
    //             _.each(update_list, (up) => {
    //                 if (!Memory.rooms_new[room.name].structure_id.updater[up] || Memory.rooms_new[room.name].structure_id.updater[up] !== Game.time) {
    //                     match(up)
    //                         .with("lvl", () => { Memory.rooms_new[room.name]["lvl"] = this.GET_LVL_OF_ROOM(room); })
    //                         .with("controller", () => { Memory.rooms_new[room.name].structure_ids["controller"] = this._FIND_CONTROLLER_ID(room); })
    //                         .with("roads", () => { Memory.rooms_new[room.name].structure_ids["roads"] = this._FIND_ROADS_IDS(room); }) //? too costly.
    //                         .with("sources", () => { Memory.rooms_new[room.name].structure_ids["sources"] = this._FIND_SOURCES_IDS(room); })
    //                         .with("construction_sites", () => { Memory.rooms_new[room.name].structure_ids["construction_sites"] = this._FIND_CONSTRUCTION_SITES_IDS(room); })
    //                         .with("extensions", () => { Memory.rooms_new[room.name].structure_ids["extensions"] = this._FIND_EXTENSIONS_IDS(room); })
    //                         .with("minerals", () => { Memory.rooms_new[room.name].structure_ids["minerals"] = this._FIND_MINERALS_IDS(room); })
    //                         // .with("creeps_ids", () => { Memory.rooms_new[room.name].creeps_name = this._FIND_ALL_CREEPS(room); })
    //                         .with("to_repair", () => { Memory.rooms_new[room.name].structure_ids["to_repair"] = this._FIND_ALL_TO_REPAIR_IDS(room); })
    //                         .with("flags", () => { Memory.rooms_new[room.name].flags = this._FIND_FLAGS_NAMES(room); })
    //                         .with("extensions_not_full", () => { Memory.rooms_new[room.name].structure_ids["extensions_not_full"] = this._FIND_NOT_FULL_EXTENSION_IDS(room); })
    //                         .with("dropped_resources", () => { Memory.rooms_new[room.name].structure_ids["dropped_resources"] = this._FIND_DROPPED_RESOURCES_IDS(room); })
    //                         .with("containers_not_full", () => { Memory.rooms_new[room.name].structure_ids["containers_not_full"] = this._FIND_NOT_FULL_CONTAINERS_IDS(room); })
    //                         .with(__, () => {Utils._C("UPDATER", -1000, "Couldn't find corresponding update for " + up);})
    //                         .exhaustive()
    //                     Memory.rooms_new[room.name].updater[up] = Game.time;
    //                 }
    //             });
    //     }
    // }

    // prettier-ignore
    public update_room_component(room: Room, update_list: string[]): void {
        if (update_list.length >= 1)
            _.each(update_list, (up : string) => {
                if (!this.structure_id.updater[up] || this.structure_id.updater[up] !== Game.time) {
                    match(up)
                        .with("roads", () => { this.structure_id["roads"] = this._FIND_ROADS_IDS(room); }) //? too costly.
                        .with("sources", () => { this.structure_id["sources"] = this._FIND_SOURCES_IDS(room); })
                        .with("construction_sites", () => { this.structure_id["construction_sites"] = this._FIND_CONSTRUCTION_SITES_IDS(room); })
                        .with("extensions", () => { this.structure_id["extensions"] = this._FIND_EXTENSIONS_IDS(room); })
                        .with("minerals", () => { this.structure_id["minerals"] = this._FIND_MINERALS_IDS(room); })
                        .with("to_repair", () => { this.structure_id["to_repair"] = this._FIND_ALL_TO_REPAIR_IDS(room); })
                        .with("flags", () => { this.structure_id.flags = this._FIND_FLAGS_NAMES(room); })
                        .with("extensions_not_full", () => { this.structure_id["extensions_not_full"] = this._FIND_NOT_FULL_EXTENSION_IDS(room); })
                        .with("dropped_resources", () => { this.structure_id["dropped_resources"] = this._FIND_DROPPED_RESOURCES_IDS(room); })
                        .with("containers_not_full", () => { this.structure_id["containers_not_full"] = this._FIND_NOT_FULL_CONTAINERS_IDS(room); })
                        .with(__, () => {Utils._C("UPDATER", -1000, "Couldn't find corresponding update for " + up);})
                        .exhaustive()
                    this.structure_id.updater[up] = Game.time;
                }
            });
    }
}

export { Memory_manager };
