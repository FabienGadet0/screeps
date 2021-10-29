import { spawn } from "child_process"

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

function _FIND_MY_STRUCTURES(room: Room): AnyStructure[]
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
    if (Memory.my_structures[spawn.room.name])
        _.each(Memory.my_structures[spawn.room.name]["extensions"], (extension: any) => { extensions_available_energy += extension.energy; extensions_available_energy += extension.energyCapacity})

    return  {"max_energy" : (extensions_max_energy + spawn_max_energy), "available_energy" : (extensions_available_energy + spawn_available_energy)}
}

function init_variables() {
    Memory.debug_mode  = false;
    Memory.debug_speak = false;
    Memory.build_map = {};
    Memory.my_structures = {};
    Memory.safe_delete = false;
}

function _FIND_EXTENSIONS(room: Room): AnyStructure[] {
    return _.filter(_FIND_MY_STRUCTURES(room), (struct : Structure) => struct.structureType === 'extension')
}

function populate_my_structures(spawn: StructureSpawn) {
    Memory.my_structures[spawn.room.name] = {
        'spawn': _FIND_SPAWN(spawn.name),
        'controller': _FIND_CONTROLLER(spawn.room),
        // 'roads': _FIND_ROADS(spawn.room), //? too costly.
        'sources': _FIND_SOURCES(spawn.room),
        'construction_sites': _FIND_CONSTRUCTION_SITES(spawn.room), //todo insert / update only when builders need it.
        'extensions': _FIND_EXTENSIONS(spawn.room),
        'minerals': _FIND_MINERALS(spawn.room)
    }
}

function populate_build_map(spawn: StructureSpawn) {
    Memory.build_map[spawn.room.name] = {
        'build_roads': false,
        'build_extensions': false
    }
}

function manage_roombased_variables(spawn: StructureSpawn) {

    if (!(Memory.build_map[spawn.room.name]))
        populate_build_map(spawn)

    // if (!(Memory.my_structures[spawn.room.name]))
    populate_my_structures(spawn)

    Memory.my_creeps = spawn.room.find(FIND_MY_CREEPS) //todo change to memory.creeps .
}

function check_if_roombased_variables_are_up(spawn: StructureSpawn) : boolean {
    return (Memory.build_map[spawn.room.name] !== undefined)
}

export {debug,init_variables,populate_my_structures, populate_build_map,check_if_roombased_variables_are_up,manage_roombased_variables, flatten, GET_ENERGY_STATS,_FIND_ROADS,_C}
