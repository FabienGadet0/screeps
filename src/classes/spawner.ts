//? Spawns handler
import { config } from "chai";
import * as Config from "../config";
import {_FIND_ROADS,_C } from "../utils/utils"

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

function _delete_all_constructions_sites(room: Room) {
     let constructions = Memory.my_structures[room.name]['construction_sites']
    _.each(constructions, (construction)=> {construction.remove()})
}
function _delete_all_roads(room: Room) {
    let roads = _FIND_ROADS(room)
   _.each(roads, (construction)=> {construction.destroy()})
}

function delete_all(room: Room) {
    _delete_all_constructions_sites(room)
    _delete_all_roads(room)
}

function create_roads(spawn: StructureSpawn) {
    let not_built = false

    //? Roads to sources
    // const sources = Memory.my_structures[spawn.room.name]['sources']
    // _.each(sources, (source: Source) => {
    //     const path = spawn.pos.findPathTo(source.pos, { ignoreCreeps: true })
    //     _.each(path, (pos) => {
    //         const position_in_room = spawn.room.getPositionAt(pos.x, pos.y)
    //         if (position_in_room && position_in_room.look().length === 1) {//? check if position is free
    //             spawn.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD)
    //             not_built = true
    //         }
    //     })
    // })
    // if (not_built)
    //     console.log("Building roads to energy")

    // not_built = false
    // //? Road to controller

    const controller = Memory.my_structures[spawn.room.name]['controller'];
    if (controller) {
        const path = spawn.pos.findPathTo(controller.pos,{ignoreCreeps: true})
        _.each(path, (pos) => {
            const position_in_room = spawn.room.getPositionAt(pos.x,pos.y)
            if (position_in_room && position_in_room.look().length === 1) { //? check if position is free
                spawn.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD)
                not_built = true
            }
        })
    }
    if (not_built)
        console.log("Building roads to controller")
}

function _get_corners(x: number, y: number, depth: number) {
   return [[x-depth,y-depth], [x+depth,y-depth], [x-depth,y+depth], [x + depth, y + depth]]
}

function _coords_between(a : number,b: number,c: number,d: number){
   let all_pos = []
   while(a < c || b < d){
       if(a < c)
           a += 1
       else if(b < d)
           b += 1
       all_pos.push([a,b])
   }
   return all_pos
}

// 0 -> 1 / 0 -> 2/ 1 -> 3 / 2 -> 3
function _get_all_position_in_square(x: number, y: number, depth: number) {
   let all_pos = []
   const corners = _get_corners(x,y,depth)
   all_pos.push([corners[0]])
   all_pos.push(_coords_between(corners[0][0],corners[0][1],corners[1][0],corners[1][1]))
   all_pos.push(_coords_between(corners[0][0],corners[0][1],corners[2][0],corners[2][1]))
   all_pos.push(_coords_between(corners[1][0],corners[1][1],corners[3][0],corners[3][1]))
   all_pos.push(_coords_between(corners[2][0],corners[2][1],corners[3][0],corners[3][1]))
   all_pos.pop()
//    return all_pos.flat() //TODO ERROR HERE
   return all_pos
}


// function create_closest_to_pos(spawn: StructureSpawn,structure: BuildableStructureConstant) {
//     let x = spawn.pos.x
//     let y = spawn.pos.y
//     let depth = 1
//     const all_pos = _get_all_position_in_square(x,y,depth)

//     //TODO faire la loop qui check si il peut construire .
//     // while (spawn.room.createConstructionSite(x, y, structure) !== )

// }



function create_extensions(spawn: StructureSpawn) {
    let x = spawn.pos.x
    let y = spawn.pos.y
    let depth = 1
    const corners = _get_corners(x, y, depth)


    let r = spawn.room.createConstructionSite(x,y,STRUCTURE_EXTENSION)
}


function create_buildings(spawn: StructureSpawn) {
    create_roads(spawn)
}

export { space_available, delete_all,spawn_creep, handle_creep_spawning, create_roads, create_buildings }
