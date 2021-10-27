//? Spawns handler
import { config } from "chai";
import * as Config from "../config";
import { _FIND_SPAWN, _FIND_SOURCE,_FIND_SOURCES,_FIND_CONTROLLER, _FIND_CONSTRUCTION_SITES, _C } from "../utils/utils"

//             SPAWNING


function space_available(spawn: StructureSpawn, _role: string): Boolean {
    const already_spawned = _.size(_.filter(spawn.room.find(FIND_MY_CREEPS), (c : Creep) => c.memory.role === _role))
    return spawn.spawnCreep(Config.role_to_bodyparts[_role], "testspace", { dryRun: true }) === 0
        && already_spawned < Config.limit_per_role[_role] ;
}

function spawn_creep(spawn: StructureSpawn, name: string, _role: string): { name: string; spawn_error_code: ScreepsReturnCode; } {
    if (name === "") name = _role + Game.time
    return { "name": name, "spawn_error_code" : spawn.spawnCreep(Config.role_to_bodyparts[_role], name, { memory: { role: _role, working: true, room: spawn.room.name, spawn_name:spawn.name} }) }
}


function handle_creep_spawning(spawn: StructureSpawn): Creep | undefined {
    let creep_name = ""
    const count_creeps = _.size(spawn.room.find(FIND_MY_CREEPS))
    if (count_creeps < Config.total_possible_creeps) {
        _.each(Config.all_roles, (role: string) => {
            if (space_available(spawn, role) && !spawn.spawning) {
                const new_creep = spawn_creep(spawn, "", role)
                creep_name = new_creep.name
                _C(new_creep.spawn_error_code)
            }
        })
    }
    return Game.creeps[creep_name]
}





/// BUILDING

function _delete_all_constructions(spawn: StructureSpawn) {
     let constructions = _FIND_CONSTRUCTION_SITES(spawn.room)
    _.each(constructions, (construction)=> {construction.remove()})
}

function _create_roads(spawn: StructureSpawn) {
    //? Roads to sources
    if (!Memory.build_roads_to_energy) {
        console.log("Building roads to energy")
        const sources = _FIND_SOURCES(spawn.room)
        _.each(sources, (source: Source) => {
            const path = spawn.pos.findPathTo(source.pos, { ignoreCreeps: true })
            _.each(path, (pos) => {
                const position_in_room = spawn.room.getPositionAt(pos.x, pos.y)
                if (position_in_room && position_in_room.look().length === 1) //? check if position is free
                    spawn.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD)
            })
        })
        Memory.build_roads_to_energy = true
    }


    // //? Road to controller
    if (!Memory.build_roads_to_controller) {
        console.log("Building roads to controller")
    const controller = _FIND_CONTROLLER(spawn.room)
    if (controller) {
        const path = spawn.pos.findPathTo(controller.pos,{ignoreCreeps: true})
        _.each(path, (pos) => {
            const position_in_room = spawn.room.getPositionAt(pos.x,pos.y)
            if(position_in_room && position_in_room.look().length === 1) //? check if position is free
                spawn.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD)
        })
    }
    Memory.build_roads_to_controller = true
}

}

function create_buildings(spawn: StructureSpawn) {
    _create_roads(spawn)
}
 /////
export {space_available, spawn_creep,handle_creep_spawning,create_buildings}
