import { REPAIR_THRESHOLD } from "../../config";
import { _C } from "../../utils/utils";

function from_id(id: Id<any>) {
    return Game.getObjectById(id);
}

function from_ids(ids: Id<any>[]): any[] {
    return _.map(ids, (id: Id<any>) => {
        return Game.getObjectById(id);
    });
}

// function add_id(room_name: string, to: string, id: Id<any>) {
//     if (to in ["creep", "creeps", "lvl"]) Memory.rooms[room_name][to].push(id);
//     return Game.getObjectById(id);
// }

// function add_ids(id: Id<any>[], to: string): any[] {
//     return _.map(ids, (id: Id<any>) => {
//         return Game.getObjectById(id);
//     });
// }

//? Find original spawn of the creep
function _FIND_SPAWN(c: string | Creep): StructureSpawn {
    let spawn_name = "";
    if (typeof c === "string") spawn_name = c;
    else spawn_name = c.memory.spawn_name;
    return Game.spawns[spawn_name];
}

function _FIND_SOURCES(room: Room): Source[] {
    return room.find(FIND_SOURCES_ACTIVE);
}

function _FIND_SOURCES_IDS(room: Room): Id<Source>[] {
    return _.map(room.find(FIND_SOURCES_ACTIVE), (struct) => {
        return struct.id;
    });
}

function _FIND_CONSTRUCTION_SITES(room: Room): ConstructionSite<BuildableStructureConstant>[] {
    return room.find(FIND_MY_CONSTRUCTION_SITES).slice(0, 8);
}

function _FIND_CONSTRUCTION_SITES_IDS(room: Room): Id<ConstructionSite<BuildableStructureConstant>>[] {
    return _.map(room.find(FIND_MY_CONSTRUCTION_SITES), (struct) => {
        return struct.id;
    });
}

function _FIND_MINERALS(room: Room): Mineral[] {
    return room.find(FIND_MINERALS);
}

function _FIND_MINERALS_IDS(room: Room): Id<Mineral>[] {
    return _.map(room.find(FIND_MINERALS), (struct) => {
        return struct.id;
    });
}


function _FIND_ROADS_IDS(room: Room): Id<any>[] {
    return _.map(room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_ROAD } }), (struct) => {
        return struct.id;
    });
}

function _FIND_CONTROLLER_ID(room: Room): Id<StructureController> | undefined {
    return room.controller ? room.controller.id : undefined;
}

// function GET_ENERGY_STATS(spawn: StructureSpawn): { max_energy: number; available_energy: number } {
//     let extensions_max_energy = 0;
//     let extensions_available_energy = 0;

//     let spawn_max_energy: number | null = 0;
//     let spawn_available_energy: number | null = 0;

//     if (spawn.store) {
//         spawn_available_energy = spawn.store.getFreeCapacity() || 0;
//         spawn_max_energy = spawn.store.getCapacity() || 0;
//     }
//     if (Memory["rooms"][spawn.room.name].structures)
//         _.each(Memory["rooms"][spawn.room.name].structures["extensions"], (extension: any) => {
//             extensions_available_energy += extension.energy;
//             extensions_available_energy += extension.energyCapacity;
//         });

//     return { max_energy: extensions_max_energy + spawn_max_energy, available_energy: extensions_available_energy + spawn_available_energy };
// }
=======
function GET_ENERGY_STATS(spawn: StructureSpawn): { max_energy: number; available_energy: number } {
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

function _FIND_EXTENSIONS(room: Room): AnyStructure[] {
    return room.find(FIND_MY_STRUCTURES, { filter: { structureType: "extension" } });
}

function _FIND_EXTENSIONS_IDS(room: Room): Id<any>[] {
    return _.map(room.find(FIND_MY_STRUCTURES, { filter: { structureType: "extension" } }), (struct) => {
        return struct.id;
    });
}


function _FIND_NOT_FULL_EXTENSION_IDS(room: Room): Id<any>[] {
    return _.map(
        room.find(FIND_MY_STRUCTURES, {
            filter: (i: StructureExtension) => i.structureType === STRUCTURE_EXTENSION && i.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
        }),
        (struct) => {
            return struct.id;
        },
    );
}

function _FIND_NOT_FULL_CONTAINERS_IDS(room: Room): Id<any>[] {
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


function _FIND_FLAGS_NAMES(room: Room): string[] {
    return _.map(room.find(FIND_FLAGS), (struct) => {
        return struct.name;
    });
}
function _FIND_ALL_CREEPS(room: Room) {
    return _.map(room.find(FIND_MY_CREEPS), (creep: Creep) => {
        return creep.name;
    });
}


function _FIND_ALL_repair(room: Room): Structure[] {
    return room
        .find(FIND_MY_STRUCTURES, { filter: (i) => i.hits / i.hitsMax < REPAIR_THRESHOLD })
        .concat(room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_ROAD && i.hits / i.hitsMax < REPAIR_THRESHOLD }))
        .slice(0, 3);
}

function _FIND_ALL_repair_IDS(room: Room): Id<any>[] {

    return _.map(
        room
            .find(FIND_MY_STRUCTURES, { filter: (i) => i.hits / i.hitsMax < REPAIR_THRESHOLD })
            .concat(
                room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_ROAD && i.hits / i.hitsMax < REPAIR_THRESHOLD }),
            )
            .slice(0, 3),
        (struct) => {
            return struct.id;
        },
    );
}

function get(room_name: string, val: string): any {
    if (val === "lvl" || val === "creeps_name") return Memory.rooms[room_name][val];

    return Memory.rooms[room_name].structure_ids[val];
}

function update_room_component(room: Room, update_list: string[]): boolean {
    let r = true;
    if (update_list.length >= 1)
        _.each(update_list, (up) => {
            // if (!Memory["rooms"][spawn.room.name].updater[up] || Memory["rooms"][spawn.room.name].updater[up] !== Game.time) {
            // console.log(Game.time + " = " + up)
            switch (up) {
                case "lvl": {
                    Memory["rooms"][room.name]["lvl"] = GET_LVL_OF_ROOM(room);
                    break;
                }

                case "controller": {
                    Memory["rooms"][room.name].structure_ids["controller"] = _FIND_CONTROLLER_ID(room);
                    break;
                }
                case "roads": {
                    Memory["rooms"][room.name].structure_ids["roads"] = _FIND_ROADS_IDS(room);
                    break;
                } //? too costly.
                case "sources": {
                    Memory["rooms"][room.name].structure_ids["sources"] = _FIND_SOURCES_IDS(room);
                    break;
                }
                case "construction_sites": {
                    Memory["rooms"][room.name].structure_ids["construction_sites"] = _FIND_CONSTRUCTION_SITES_IDS(room);
                    break;
                }
                case "extensions": {
                    Memory["rooms"][room.name].structure_ids["extensions"] = _FIND_EXTENSIONS_IDS(room);
                    break;
                }
                case "minerals": {
                    Memory["rooms"][room.name].structure_ids["minerals"] = _FIND_MINERALS_IDS(room);
                    break;
                }
                case "creeps_ids": {
                    Memory["rooms"][room.name].creeps_name = _FIND_ALL_CREEPS(room);
                    break;
                }
                case "repair": {
                    Memory["rooms"][room.name].structure_ids["repair"] = _FIND_ALL_repair_IDS(room);
                    break;
                }
                case "extensions_not_full": {
                    Memory["rooms"][room.name].structure_ids["extensions_not_full"] = _FIND_NOT_FULL_EXTENSION_IDS(room);
                    break;
                }
                case "containers_not_full": {
                    Memory["rooms"][room.name].structure_ids["containers_not_full"] = _FIND_NOT_FULL_CONTAINERS_IDS(room);
                    break;
                }
                default: {
                    _C("UPDATER", -1000, "Couldn't find corresponding update for" + up);
                    r = false;
                    break;
                }
            }
            // Memory["rooms"][spawn.room.name].updater[up] = Game.time;
            // }
        });
    return r;
}

// function UPDATE(spawn: StructureSpawn, update_list: string[]): boolean {
//     let r = true;
//     if (update_list.length >= 1)
//         _.each(update_list, (up) => {
//             if (!Memory["rooms"][spawn.room.name].updater[up] || Memory["rooms"][spawn.room.name].updater[up] !== Game.time) {
//                 // console.log(Game.time + " = " + up)
//                 switch (up) {
//                     case "lvl": {
//                         Memory["rooms"][spawn.room.name].lvl = GET_LVL_OF_ROOM(spawn.room);
//                         break;
//                     }

//                     case "controller": {
//                         Memory["rooms"][spawn.room.name].structures["controller"] = _FIND_CONTROLLER(spawn.room);
//                         break;
//                     }
//                     case "roads": {
//                         Memory["rooms"][spawn.room.name].structures["roads"] = _FIND_ROADS(spawn.room);
//                         break;
//                     } //? too costly.
//                     case "sources": {
//                         Memory["rooms"][spawn.room.name].structures["sources"] = _FIND_SOURCES(spawn.room);
//                         break;
//                     }
//                     case "construction_sites": {
//                         Memory["rooms"][spawn.room.name].structures["construction_sites"] = _FIND_CONSTRUCTION_SITES(spawn.room);
//                         break;
//                     }
//                     case "extensions": {
//                         Memory["rooms"][spawn.room.name].structures["extensions"] = _FIND_EXTENSIONS(spawn.room);
//                         break;
//                     }
//                     case "minerals": {
//                         Memory["rooms"][spawn.room.name].structures["minerals"] = _FIND_MINERALS(spawn.room);
//                         break;
//                     }
//                     // case "creeps": {
//                     //     Memory["rooms"][spawn.room.name].creeps = spawn.room.find(FIND_MY_CREEPS);
//                     //     break;
//                     // }
//                     case "flags": {
//                         Memory["rooms"][spawn.room.name].flags = _FIND_FLAGS(spawn.room);
//                         break;
//                     }
//                     case "repair": {
//                         Memory["rooms"][spawn.room.name].structures["repair"] = _FIND_ALL_repair(spawn.room);
//                         break;
//                     }
//                     case "extensions_not_full": {
//                         Memory["rooms"][spawn.room.name].structures["extensions_not_full"] = _FIND_NOT_FULL_EXTENSIONS(spawn.room);
//                         break;
//                     }
//                     case "containers_not_full": {
//                         Memory["rooms"][spawn.room.name].structures["containers_not_full"] = _FIND_NOT_FULL_CONTAINERS(spawn.room);
//                         break;
//                     }
//                     default: {
//                         _C("UPDATER", -1000, "Couldn't find corresponding update for" + up);
//                         r = false;
//                         break;
//                     }
//                 }
//                 Memory["rooms"][spawn.room.name].updater[up] = Game.time;
//             }
//         });
//     return r;
// }

export { _FIND_ROADS, update_room_component, from_id, from_ids, GET_LVL_OF_ROOM };
