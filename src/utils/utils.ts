import { spawn } from "child_process"
import { REPAIR_THRESHOLD } from "../config"

function flatten(arr: any[][]) : any[] { return arr.reduce((acc, val) => acc.concat(val), []); }

function debug(): void{
    Memory.debug_mode = !Memory.debug_mode
    console.log("Debug set to " + Memory.debug_mode)
}

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

//todo add closest source etc.
function _FIND_SOURCE(room: Room): Source
{
    return room.find(FIND_SOURCES_ACTIVE)[0]
}

function _FIND_SOURCES(room: Room): Source[]
{
    return room.find(FIND_SOURCES_ACTIVE)
}

function _FIND_CONSTRUCTION_SITES(room: Room): ConstructionSite<BuildableStructureConstant>[]
{
    return room.find(FIND_MY_CONSTRUCTION_SITES);
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

function _C(id : any,code: ScreepsReturnCode | CreepMoveReturnCode | number, additional_msg: string = "") {
    let code_str = ""
    switch (code) {
        case  0:  code_str = "OK"; break;
        case -1:  code_str = "ERR_NOT_OWNER"; break;
        case -2:  code_str = "ERR_NO_PATH"; break;
        case -3:  code_str = "ERR_NAME_EXISTS"; break;
        case -4:  code_str = "ERR_BUSY"; break;
        case -5:  code_str = "ERR_NOT_FOUND"; break;
        case -6:  code_str = "ERR_NOT_ENOUGH_ENERGY/RESSOURCES/EXTENSIONS"; break;
        case -7:  code_str = "ERR_INVALID_TARGET"; break;
        case -8:  code_str = "ERR_FULL"; break;
        case -9:  code_str = "ERR_NOT_IN_RANGE"; break;
        case -10: code_str = "ERR_INVALID_ARGS"; break;
        case -11: code_str = "ERR_TIRED"; break;
        case -12: code_str = "ERR_NO_BODYPART"; break;
        case -14: code_str = "ERR_RCL_NOT_ENOUGH"; break;
        case -15: code_str = "ERR_GCL_NOT_ENOUGH"; break;
    }

    if (code !== OK && Memory.debug_mode)
        console.log("[ERR]["+id+'] ' + code  + " -> " + code_str + " " + additional_msg)
    return code
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

function init_variables() {
    Memory.debug_mode  = false;
    Memory.debug_speak = false;
}

function _FIND_EXTENSIONS(room: Room): AnyStructure[] {
    return _.filter(_FIND_structures(room), (struct : Structure) => struct.structureType === 'extension')
}

function _FIND_FLAGS(room: Room): Flag[] {
    return room.find(FIND_FLAGS)
}


function _FIND_ALL_TO_REPAIR(room: Room): Structure[] {
    return _.filter(room.find(FIND_MY_STRUCTURES), (struct) => {
        (struct.hits / struct.hitsMax) < REPAIR_THRESHOLD;
    });
}


function _init_room_memory(spawn: StructureSpawn): RoomMemory {
    console.log(spawn.room.name + "-> Init_room_memory")
    // {
//     updater: {
//         "creeps": 0,
//         "flags": 0,
//         'spawn': 0,
//         'controller': 0,
//         'roads': 0,
//         'sources': 0,
//         'construction_sites': 0,
//         'extensions': 0,
//         'minerals':0
//     },
//     structures: {
//         'spawn': {},
//         'controller': {},
//         'roads':{},
//         'sources': {},
//         'construction_sites': {},
//         'extensions': {},
//         'minerals': {}
//     },
//     build_map : {
//         'build_roads': false,
//         'build_extensions': false
//     },
//     creeps: [],
//     safe_delete: false,
//     flags: []
// }
    return {
        updater: {},
        structures: {},
        build_map : {
                    'build_roads': false,
                    'build_extensions': false
                },
        creeps: [],
        safe_delete: false,
        flags: [],
        to_repair:[]
    }
}

// function update_room_memory(spawn: StructureSpawn): void {
//     Memory["rooms"][spawn.room.name].structures =
//     {
//         'spawn': _FIND_SPAWN(spawn.name),
//         'controller': _FIND_CONTROLLER(spawn.room),
//         // 'roads': _FIND_ROADS(spawn.room), //? too costly.
//         'sources': _FIND_SOURCES(spawn.room),
//         'construction_sites': _FIND_CONSTRUCTION_SITES(spawn.room), //todo insert / update only when builders need it.
//         'extensions': _FIND_EXTENSIONS(spawn.room),
//         'minerals': _FIND_MINERALS(spawn.room),
//     };
//     Memory["rooms"][spawn.room.name].creeps = spawn.room.find(FIND_MY_CREEPS);
//     Memory["rooms"][spawn.room.name].flags = _FIND_FLAGS(spawn.room);
// }


// function UPDATE(spawn: StructureSpawn, to_update: string[]) {
//     // Memory["rooms"][spawn.room.name].updater[to_update] = !Memory["rooms"][spawn.room.name].updater[to_update]
//     update_room_memory(spawn)
// }

function UPDATE(spawn: StructureSpawn, update_list: string[]): boolean {
    let r = true
    if (update_list.length >= 1)
        _.each(update_list, (up) => {
            if (!Memory["rooms"][spawn.room.name].updater[up] || Memory["rooms"][spawn.room.name].updater[up] !== Game.time) {
                // console.log(Game.time + " = " + up)
                switch (up) {
                    case "spawn": { Memory["rooms"][spawn.room.name].structures['spawn'] = _FIND_SPAWN(spawn.name);  break; }
                    case 'controller': { Memory["rooms"][spawn.room.name].structures['controller'] = _FIND_CONTROLLER(spawn.room);  break; }
                    case 'roads': { Memory["rooms"][spawn.room.name].structures['roads'] = _FIND_ROADS(spawn.room);  break; } //? too costly.
                    case 'sources': { Memory["rooms"][spawn.room.name].structures['sources'] = _FIND_SOURCES(spawn.room);  break; }
                    case 'construction_sites': { Memory["rooms"][spawn.room.name].structures['construction_sites'] = _FIND_CONSTRUCTION_SITES(spawn.room);  break; } //todo insert / update only when builders need it.
                    case 'extensions': { Memory["rooms"][spawn.room.name].structures['extensions'] = _FIND_EXTENSIONS(spawn.room);  break; }
                    case 'minerals': { Memory["rooms"][spawn.room.name].structures['minerals'] = _FIND_MINERALS(spawn.room);  break; }
                    case 'creeps': { Memory["rooms"][spawn.room.name].creeps = spawn.room.find(FIND_MY_CREEPS);  break; }
                    case 'flags': { Memory["rooms"][spawn.room.name].flags = _FIND_FLAGS(spawn.room);  break; }
                    case 'to_repair': { Memory["rooms"][spawn.room.name].to_repair = _FIND_ALL_TO_REPAIR(spawn.room);  break; }
                    default: { _C("UPDATER", -1000, "Couldn't find corresponding update for" + up); r = false; break; }
                }
                Memory["rooms"][spawn.room.name].updater[up] = Game.time
        }
        });
        return r
}

//? Check if vars are up and update mandatory vars.
function manage_roombased_variables(spawn: StructureSpawn) {
    if(!Memory["rooms"][spawn.room.name])
        Memory["rooms"][spawn.room.name] = _init_room_memory(spawn)
}

function check_if_roombased_variables_are_up(spawn: StructureSpawn) : boolean {
    return (Memory["rooms"][spawn.room.name].build_map !== undefined)
}

export {debug,init_variables,UPDATE, check_if_roombased_variables_are_up,manage_roombased_variables, flatten, GET_ENERGY_STATS,_FIND_ROADS,_C}
