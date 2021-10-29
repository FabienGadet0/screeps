import { config } from "chai";
import { all } from "lodash";
import * as Config from "../config";
import {_FIND_ROADS,flatten,_C } from "../utils/utils"

function delete_all_construction_sites(room: Room) {
    let constructions = Memory.my_structures[room.name]['construction_sites']
   _.each(constructions, (construction)=> {construction.remove()})
}
function delete_all_roads(room: Room) {
   let roads = _FIND_ROADS(room)
  _.each(roads, (construction)=> {construction.destroy()})
}

function delete_all(room: Room) {
    delete_all_construction_sites(room);
    delete_all_roads(room);
}

function create_roads(spawn: StructureSpawn) {
   let built = false

   //? Roads to sources
   const sources = Memory.my_structures[spawn.room.name]['sources']
   _.each(sources, (source: Source) => {
       const path = spawn.pos.findPathTo(source.pos, { ignoreCreeps: true })
       _.each(path, (pos) => {
           const position_in_room = spawn.room.getPositionAt(pos.x, pos.y)
           if (position_in_room && position_in_room.look().length === 1) {//? check if position is free
               _C(spawn.id,spawn.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD))
               built = true
           }
       })
   })
   if (built)
       console.log("Building roads to energy")

   built = false
   // //? Road to controller
   const controller = Memory.my_structures[spawn.room.name]['controller'];
   if (controller) {
       const path = spawn.pos.findPathTo(controller.pos,{ignoreCreeps: true})
       _.each(path, (pos) => {
           const position_in_room = spawn.room.getPositionAt(pos.x,pos.y)
           if (position_in_room && position_in_room.look().length === 1) { //? check if position is free
               _C(spawn.id,spawn.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD))
               built = true
           }
       })
   }

   built = false
   //? Road to minerals
    const minerals = Memory.my_structures[spawn.room.name]['minerals'];
    if (minerals) {
        _.each(minerals, (mineral) => {
            const path = spawn.pos.findPathTo(mineral.pos, { ignoreCreeps: true })
            _.each(path, (pos) => {
                const position_in_room = spawn.room.getPositionAt(pos.x, pos.y)
                if (position_in_room && position_in_room.look().length === 1) { //? check if position is free
                    _C(spawn.id, spawn.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD))
                    built = true
                }
            });
        });
   }
   if (built)
       console.log("Building roads to minerals")
}


function _get_corners(x: number, y: number, depth: number) {
  return [[x-depth,y-depth], [x+depth,y-depth], [x-depth,y+depth], [x + depth, y + depth]]
}

function _coords_between(a : number,b: number,c: number,d: number) : number[][]{
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
  return flatten(all_pos)
}


//* If amount_to_create is undefined then it will create the maximum possible.
function _create_closest_to_pos(spawn: StructureSpawn, structure: BuildableStructureConstant,depth : number = 1, amount_to_create : number = 1000) {
    let breaker = false;
    let created = 0
   while (!breaker && depth <= Config.MAX_DEPTH_FOR_BUILDING) {
       const all_pos = _get_all_position_in_square(spawn.pos.x, spawn.pos.y, depth)
       for (let pos of all_pos) {
           const r = _C(spawn.id, spawn.room.createConstructionSite(pos[0], pos[1], structure))
           if (r === ERR_INVALID_ARGS) {
               _C(spawn.id, r, "Construction fail");
               break;
           }
           if (r === ERR_FULL || r === ERR_RCL_NOT_ENOUGH) {
               // set extensions build map to false because we reached the maximum possible for now.
               breaker = true;
               break;
           }
           if (created >= amount_to_create)
               breaker = true;
           created += 1
       }
       depth += 1
   }
}

function create_extensions(spawn: StructureSpawn) {
    _create_closest_to_pos(spawn,STRUCTURE_EXTENSION)
}

function create_containers(spawn: StructureSpawn) {
    _create_closest_to_pos(spawn,STRUCTURE_CONTAINER,2)
}

function _create_buildings(spawn: StructureSpawn) {
    create_roads(spawn)
}

function manage_buildings(spawn: StructureSpawn) {
    // spawner.create_buildings(spawn)
    const room_name = spawn.room.name
    // delete_all_constructions_sites(spawn.room)
    if (Memory.build_map[room_name]['build_roads']) {
       create_roads(spawn)
       Memory.build_map[room_name]['build_roads'] = false
     }
    if (Memory.build_map[room_name]['build_extensions']) {
       create_extensions(spawn)
       Memory.build_map[room_name]['build_extensions'] = false
    }
    if (Memory.safe_delete)
        delete_all(spawn.room)
}

export { manage_buildings, create_containers,delete_all_construction_sites, delete_all, delete_all_roads, create_roads, create_extensions }

