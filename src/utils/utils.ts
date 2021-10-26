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
function _FIND_SOURCE(creep: Creep): Source
{
    return creep.room.find(FIND_SOURCES_ACTIVE)[0]
}

function _C(code: ScreepsReturnCode) {
    if (code !== OK && Memory.debug_mode)
        console.log("[ERROR] :" + code)
}


export {_FIND_SPAWN,_FIND_SOURCE, _C}
