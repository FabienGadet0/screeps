import { spawn } from "child_process"

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

function _FIND_CONSTRUCTION_SITES(room: Room): any
{
    return room.find(FIND_CONSTRUCTION_SITES);
}

function _C(code: ScreepsReturnCode | CreepMoveReturnCode | number) {
    if (code !== OK && Memory.debug_mode)
        console.log("[ERROR] :" + code)
}

function _FIND_CONTROLLER(room: Room):  StructureController | undefined
{
    return room.controller
}



export {_FIND_SPAWN,_FIND_SOURCE, _FIND_CONTROLLER,_FIND_CONSTRUCTION_SITES,_C}
