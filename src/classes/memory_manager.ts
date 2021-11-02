import { REPAIR_THRESHOLD } from "../config";
import * as Utils from "../utils/utils";

function get(room_name: string, val: string): any {
    if (val === "lvl" || val === "creeps_name") return Memory.rooms[room_name][val];

    return Memory.rooms[room_name].structure_ids[val];
}

function from_id(id: Id<any>) {
    return Game.getObjectById(id);
}

function from_ids(ids: Id<any>[]): any[] {
    return _.map(ids, (id: Id<any>) => {
        return Game.getObjectById(id);
    });
}

function push_id(room_name: string, to: string, id: Id<any>): void {
    if (to === "creeps_name") Memory.rooms[room_name][to].push(id);

    Memory.rooms[room_name].structure_ids[to].push(id);
}

function push_ids(room_name: string, to: string, ids: Id<any>[]): void {
    _.map(ids, (id: Id<any>) => {
        push_id(room_name, to, id);
    });
}

import { profile } from "../Profiler/Profiler";

class Memory_manager {
    room_name: string;
    constructor(room_name: string) {
        this.room_name = room_name;
    }
    public update() {
        this.update_ids(Game.rooms[this.room_name], [
            "lvl",
            "controller",
            "roads",
            "sources",
            "construction_sites",
            "extensions",
            "minerals",
            "to_repair",
            "creeps_ids",
            "extensions_not_full",
            "containers_not_full",
        ]);
    }
    public run() {}

    //? Find original spawn of the creep
    private _FIND_SPAWN(c: string | Creep): StructureSpawn {
        let spawn_name = "";
        if (typeof c === "string") spawn_name = c;
        else spawn_name = c.memory.spawn_name;
        return Game.spawns[spawn_name];
    }

    private _FIND_SOURCES(room: Room): Source[] {
        return room.find(FIND_SOURCES_ACTIVE);
    }

    private _FIND_SOURCES_IDS(room: Room): Id<Source>[] {
        return _.map(room.find(FIND_SOURCES_ACTIVE), (struct) => {
            return struct.id;
        });
    }

    private _FIND_CONSTRUCTION_SITES(room: Room): ConstructionSite<BuildableStructureConstant>[] {
        return room.find(FIND_MY_CONSTRUCTION_SITES).slice(0, 8);
    }

    private _FIND_CONSTRUCTION_SITES_IDS(room: Room): Id<ConstructionSite<BuildableStructureConstant>>[] {
        return _.map(room.find(FIND_MY_CONSTRUCTION_SITES), (struct) => {
            return struct.id;
        });
    }

    private _FIND_MINERALS(room: Room): Mineral[] {
        return room.find(FIND_MINERALS);
    }

    private _FIND_MINERALS_IDS(room: Room): Id<Mineral>[] {
        return _.map(room.find(FIND_MINERALS), (struct) => {
            return struct.id;
        });
    }

    private _FIND_ROADS(room: Room): AnyStructure[] {
        return room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_ROAD } });
    }

    private _FIND_ROADS_IDS(room: Room): Id<any>[] {
        return _.map(room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_ROAD } }), (struct) => {
            return struct.id;
        });
    }

    private _FIND_structures(room: Room): AnyStructure[] {
        return room.find(FIND_MY_STRUCTURES);
    }

    private _FIND_CONTROLLER(room: Room): StructureController | undefined {
        return room.controller;
    }

    private _FIND_CONTROLLER_ID(room: Room): Id<StructureController> | undefined {
        return room.controller ? room.controller.id : undefined;
    }

    private GET_ENERGY_STATS(spawn: StructureSpawn): { max_energy: number; available_energy: number } {
        let extensions_max_energy = 0;
        let extensions_available_energy = 0;

        let spawn_max_energy: number | null = 0;
        let spawn_available_energy: number | null = 0;

        if (spawn.store) {
            spawn_available_energy = spawn.store.getFreeCapacity() || 0;
            spawn_max_energy = spawn.store.getCapacity() || 0;
        }
        if (Memory["rooms"][spawn.room.name].structures)
            _.each(Memory["rooms"][spawn.room.name].structures["extensions"], (extension: any) => {
                extensions_available_energy += extension.energy;
                extensions_available_energy += extension.energyCapacity;
            });

        return {
            max_energy: extensions_max_energy + spawn_max_energy,
            available_energy: extensions_available_energy + spawn_available_energy,
        };
    }
    private _FIND_EXTENSIONS(room: Room): AnyStructure[] {
        return room.find(FIND_MY_STRUCTURES, { filter: { structureType: "extension" } });
    }

    private _FIND_EXTENSIONS_IDS(room: Room): Id<any>[] {
        return _.map(room.find(FIND_MY_STRUCTURES, { filter: { structureType: "extension" } }), (struct) => {
            return struct.id;
        });
    }

    private _FIND_NOT_FULL_EXTENSIONS(room: Room): AnyStructure[] {
        return room.find(FIND_MY_STRUCTURES, {
            filter: (i: StructureExtension) => i.structureType === "extension" && i.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
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

    private _FIND_NOT_FULL_CONTAINERS(room: Room): AnyStructure[] {
        return room.find(FIND_MY_STRUCTURES, {
            filter: (i: StructureExtension) =>
                i.structureType !== STRUCTURE_EXTENSION &&
                i.structureType === STRUCTURE_CONTAINER &&
                i.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
        });
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

    private _FIND_FLAGS(room: Room): Flag[] {
        return room.find(FIND_FLAGS);
    }

    private _FIND_FLAGS_NAMES(room: Room): string[] {
        return _.map(room.find(FIND_FLAGS), (struct) => {
            return struct.name;
        });
    }
    private _FIND_ALL_CREEPS(room: Room) {
        return _.map(room.find(FIND_MY_CREEPS), (creep: Creep) => {
            return creep.name;
        });
    }

    private GET_LVL_OF_ROOM(room: Room) {
        return 300 + _.size(Memory["rooms"][room.name].structure_ids["extensions"]) * 50 < 650 ? 1 : 2;
    }

    private _FIND_ALL_TO_REPAIR(room: Room): Structure[] {
        return room
            .find(FIND_MY_STRUCTURES, { filter: (i) => i.hits / i.hitsMax < REPAIR_THRESHOLD })
            .concat(
                room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_ROAD && i.hits / i.hitsMax < REPAIR_THRESHOLD }),
            )
            .slice(0, 3);
    }

    private _FIND_ALL_TO_REPAIR_IDS(room: Room): Id<any>[] {
        return _.map(
            room
                .find(FIND_MY_STRUCTURES, { filter: (i) => i.hits / i.hitsMax < REPAIR_THRESHOLD })
                .concat(
                    room.find(FIND_STRUCTURES, {
                        filter: (i) => i.structureType == STRUCTURE_ROAD && i.hits / i.hitsMax < REPAIR_THRESHOLD,
                    }),
                )
                .slice(0, 3),
            (struct) => {
                return struct.id;
            },
        );
    }

    public update_ids(room: Room, update_list: string[]): void {
        if (update_list.length >= 1)
            _.each(update_list, (up) => {
                if (!Memory["rooms"][room.name].updater[up] || Memory["rooms"][room.name].updater[up] !== Game.time) {
                    switch (up) {
                        case "lvl": {
                            Memory["rooms"][room.name]["lvl"] = this.GET_LVL_OF_ROOM(room);
                            break;
                        }
                        case "controller": {
                            Memory["rooms"][room.name].structure_ids["controller"] = this._FIND_CONTROLLER_ID(room);
                            break;
                        }
                        case "roads": {
                            Memory["rooms"][room.name].structure_ids["roads"] = this._FIND_ROADS_IDS(room);
                            break;
                        } //? too costly.
                        case "sources": {
                            Memory["rooms"][room.name].structure_ids["sources"] = this._FIND_SOURCES_IDS(room);
                            break;
                        }
                        case "construction_sites": {
                            Memory["rooms"][room.name].structure_ids["construction_sites"] = this._FIND_CONSTRUCTION_SITES_IDS(room);
                            break;
                        }
                        case "extensions": {
                            Memory["rooms"][room.name].structure_ids["extensions"] = this._FIND_EXTENSIONS_IDS(room);
                            break;
                        }
                        case "minerals": {
                            Memory["rooms"][room.name].structure_ids["minerals"] = this._FIND_MINERALS_IDS(room);
                            break;
                        }
                        case "creeps_ids": {
                            Memory["rooms"][room.name].creeps_name = this._FIND_ALL_CREEPS(room);
                            break;
                        }
                        case "to_repair": {
                            Memory["rooms"][room.name].structure_ids["to_repair"] = this._FIND_ALL_TO_REPAIR_IDS(room);
                            break;
                        }
                        case "extensions_not_full": {
                            Memory["rooms"][room.name].structure_ids["extensions_not_full"] = this._FIND_NOT_FULL_EXTENSION_IDS(room);
                            break;
                        }
                        case "containers_not_full": {
                            Memory["rooms"][room.name].structure_ids["containers_not_full"] = this._FIND_NOT_FULL_CONTAINERS_IDS(room); //TODO doesn't do shit
                            break;
                        }
                        default: {
                            Utils._C("UPDATER", -1000, "Couldn't find corresponding update for" + up);
                            break;
                        }
                    }
                    Memory["rooms"][room.name].updater[up] = Game.time;
                }
            });
    }
}

export { Memory_manager, get, from_id, from_ids, push_id, push_ids };
