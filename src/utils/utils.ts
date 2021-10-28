import { spawn } from "child_process"

function flatten(arr: any[][]) : any[] { return arr.reduce((acc, val) => acc.concat(val), []); }

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


function _FIND_ROADS(room: Room): AnyStructure[]
{
    return room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_ROAD } });
}

function _FIND_MY_STRUCTURES(room: Room): AnyStructure[]
{
    return room.find(FIND_MY_STRUCTURES);
}

function _C(code: ScreepsReturnCode | CreepMoveReturnCode | number, additional_msg : string = "") {
    if (code !== OK && Memory.debug_mode)
        console.log("[ERROR] :" + code + " " + additional_msg)
    return code
}

function _FIND_CONTROLLER(room: Room):  StructureController | undefined
{
    return room.controller
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

function _populate_my_structures(spawn: StructureSpawn) {
    Memory.my_structures[spawn.room.name] = {
        'spawn': _FIND_SPAWN(spawn.name),
        'controller': _FIND_CONTROLLER(spawn.room),
        'roads': _FIND_ROADS(spawn.room),
        'sources': _FIND_SOURCES(spawn.room),
        'construction_sites': _FIND_CONSTRUCTION_SITES(spawn.room),
        'extensions': _FIND_EXTENSIONS(spawn.room)
    }
}

function _populate_build_map(spawn: StructureSpawn) {
    Memory.build_map[spawn.room.name] = {
        'build_roads': false,
        'build_extensions': false
    }
}

function manage_roombased_variables(spawn: StructureSpawn) {

    if (!(Memory.build_map[spawn.room.name]))
        _populate_build_map(spawn)

    // if (!(Memory.my_structures[spawn.room.name]))
    _populate_my_structures(spawn)

    Memory.my_creeps = spawn.room.find(FIND_MY_CREEPS)
}

function check_if_roombased_variables_are_up(spawn: StructureSpawn) : boolean {
    return (Memory.build_map[spawn.room.name] !== undefined)
}


// function _top_left(x:number,y:number,depth:number){
//     return ([x-depth,y-depth])
//    }

// function _top_right(x:number,y:number,depth:number){
//    return ([x+depth,y-depth])
// }

// function _bottom_left(x:number,y:number,depth:number){
//    return ([x-depth,y+depth])
// }

// function _bottom_right(x: number, y: number, depth: number) {
//        return ([x + depth, y + depth])
// }
export {init_variables,check_if_roombased_variables_are_up,manage_roombased_variables, flatten, _FIND_ROADS,_C}
