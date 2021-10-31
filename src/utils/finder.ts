
import { REPAIR_THRESHOLD } from "../config"
import {_C} from "./utils"

//? Find original spawn of the creep
function _FIND_SPAWN(c: string | Creep): StructureSpawn
{
    let spawn_name = ""
    if (typeof c === 'string')
        spawn_name = c;
    else
         spawn_name = c.memory.spawn_name;
    return Game.spawns[spawn_name]
}

function _FIND_SOURCES(room: Room): Source[]
{
    return room.find(FIND_SOURCES_ACTIVE)
}

function _FIND_CONSTRUCTION_SITES(room: Room): ConstructionSite<BuildableStructureConstant>[]
{
    return room.find(FIND_MY_CONSTRUCTION_SITES).slice(0, 8)
}

function _FIND_MINERALS(room: Room): Mineral[]
{
    return room.find(FIND_MINERALS);
}

function _FIND_ROADS(room: Room): AnyStructure[]
{
    return room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_ROAD } });
}

function _FIND_structures(room: Room): AnyStructure[]
{
    return room.find(FIND_MY_STRUCTURES);
}


function _FIND_CONTROLLER(room: Room):  StructureController | undefined
{
    return room.controller
}

function GET_ENERGY_STATS(spawn: StructureSpawn): {"max_energy" :number, "available_energy": number} {
    let extensions_max_energy = 0
    let extensions_available_energy = 0

    let spawn_max_energy: number | null = 0
    let spawn_available_energy: number | null = 0

    if (spawn.store) {
        spawn_available_energy = spawn.store.getFreeCapacity() || 0
        spawn_max_energy = spawn.store.getCapacity() || 0
    }
    if (Memory["rooms"][spawn.room.name].structures)
        _.each(Memory["rooms"][spawn.room.name].structures["extensions"], (extension: any) => { extensions_available_energy += extension.energy; extensions_available_energy += extension.energyCapacity})

    return  {"max_energy" : (extensions_max_energy + spawn_max_energy), "available_energy" : (extensions_available_energy + spawn_available_energy)}
}
function _FIND_EXTENSIONS(room: Room): AnyStructure[] {
    return room.find(FIND_MY_STRUCTURES, { filter: { structureType: 'extension' } });
}

function _FIND_NOT_FULL_EXTENSIONS(room: Room): AnyStructure[] {
    return room.find(FIND_MY_STRUCTURES, {  filter: (i : StructureExtension) => i.structureType === "extension" && i.store.getFreeCapacity(RESOURCE_ENERGY) > 0 })
}

function _FIND_NOT_FULL_CONTAINERS(room: Room): AnyStructure[] {
    return room.find(FIND_MY_STRUCTURES, {  filter: (i : StructureExtension) => i.structureType !== "extension" && i.structureType === "container" && i.store.getFreeCapacity(RESOURCE_ENERGY) > 0  })
}

function _FIND_FLAGS(room: Room): Flag[] {
    return room.find(FIND_FLAGS)
}

function _GET_LVL_OF_ROOM(spawn: StructureSpawn) {
    return spawn.store[RESOURCE_ENERGY] + (_.size(Memory["rooms"][spawn.room.name].structures["extensions"]) * 50) < 650 ? 1 : 2;
}

function _FIND_ALL_TO_REPAIR(room: Room): Structure[] {
    return room.find(FIND_MY_STRUCTURES, { filter: (i) => i.hits / i.hitsMax < REPAIR_THRESHOLD })
        .concat(room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_ROAD && i.hits / i.hitsMax < REPAIR_THRESHOLD }))
        .slice(0, 3)
}
function UPDATE(spawn: StructureSpawn, update_list: string[]): boolean {
    let r = true
    if (update_list.length >= 1)
        _.each(update_list, (up) => {
            if (!Memory["rooms"][spawn.room.name].updater[up] || Memory["rooms"][spawn.room.name].updater[up] !== Game.time) {
                // console.log(Game.time + " = " + up)
                switch (up) {
                    case "lvl": { Memory["rooms"][spawn.room.name].lvl = _GET_LVL_OF_ROOM(spawn); break; }
                    case "spawn": { Memory["rooms"][spawn.room.name].structures['spawn'] = _FIND_SPAWN(spawn.name);  break; }
                    case 'controller': { Memory["rooms"][spawn.room.name].structures['controller'] = _FIND_CONTROLLER(spawn.room);  break; }
                    case 'roads': { Memory["rooms"][spawn.room.name].structures['roads'] = _FIND_ROADS(spawn.room);  break; } //? too costly.
                    case 'sources': { Memory["rooms"][spawn.room.name].structures['sources'] = _FIND_SOURCES(spawn.room);  break; }
                    case 'construction_sites': { Memory["rooms"][spawn.room.name].structures['construction_sites'] = _FIND_CONSTRUCTION_SITES(spawn.room);  break; }
                    case 'extensions': { Memory["rooms"][spawn.room.name].structures['extensions'] = _FIND_EXTENSIONS(spawn.room);  break; }
                    case 'minerals': { Memory["rooms"][spawn.room.name].structures['minerals'] = _FIND_MINERALS(spawn.room);  break; }
                    case 'creeps': { Memory["rooms"][spawn.room.name].creeps = spawn.room.find(FIND_MY_CREEPS);  break; }
                    case 'flags': { Memory["rooms"][spawn.room.name].flags = _FIND_FLAGS(spawn.room);  break; }
                    case 'to_repair': { Memory["rooms"][spawn.room.name].structures['to_repair'] = _FIND_ALL_TO_REPAIR(spawn.room); break; }
                    case 'extensions_not_full' : { Memory["rooms"][spawn.room.name].structures['extensions_not_full'] = _FIND_NOT_FULL_EXTENSIONS(spawn.room); break;}
                    case 'containers_not_full' : { Memory["rooms"][spawn.room.name].structures['containers_not_full'] = _FIND_NOT_FULL_CONTAINERS(spawn.room); break;}
                    default: { _C("UPDATER", -1000, "Couldn't find corresponding update for" + up); r = false; break; }
                }
                Memory["rooms"][spawn.room.name].updater[up] = Game.time
        }
        });
        return r
}

export {UPDATE, _FIND_ROADS}
