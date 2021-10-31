import { config } from "chai";
import { all } from "lodash";
import { off } from "process";
import * as Config from "../config";
import * as Utils from "../utils/utils"
import * as finder from "../utils/finder"

function delete_all_construction_sites(room: Room) {
    let constructions = Memory["rooms"][room.name].structures['construction_sites']
   _.each(constructions, (construction)=> {construction.remove()})
}
function delete_all_roads(room: Room) {
    //todo Delete this call.
   let roads = finder._FIND_ROADS(room)
  _.each(roads, (construction)=> {construction.destroy()})
}

function delete_all(room: Room) {
    delete_all_construction_sites(room);
    delete_all_roads(room);
}

function create_roads(spawn: StructureSpawn) {
   let built = false

        //? Roads to sources
        const sources = Memory["rooms"][spawn.room.name].structures['sources']
        _.each(sources, (source: Source) => {
            const path = spawn.pos.findPathTo(source.pos, { ignoreCreeps: true })
            _.each(path, (pos) => {
                const position_in_room = spawn.room.getPositionAt(pos.x, pos.y)
                if (position_in_room && position_in_room.look().length === 1) {//? check if position is free
                    Utils._C(spawn.id, spawn.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD))
                    built = true
                }
            })
        })
        if (built)
            console.log("Building roads to energy")

        built = false
        // //? Road to controller
        const controller = Memory["rooms"][spawn.room.name].structures['controller'];
        if (controller) {
            const path = spawn.pos.findPathTo(controller.pos, { ignoreCreeps: true })
            _.each(path, (pos) => {
                const position_in_room = spawn.room.getPositionAt(pos.x, pos.y)
                if (position_in_room && position_in_room.look().length === 1) { //? check if position is free
                    Utils._C(spawn.id, spawn.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD))
                    built = true
                }
            })
        }

        built = false
        //? Road to minerals
        const minerals = Memory["rooms"][spawn.room.name].structures['minerals'];
        if (minerals) {
            _.each(minerals, (mineral) => {
                const path = spawn.pos.findPathTo(mineral.pos, { ignoreCreeps: true })
                _.each(path, (pos) => {
                    const position_in_room = spawn.room.getPositionAt(pos.x, pos.y)
                    if (position_in_room && position_in_room.look().length === 1) { //? check if position is free
                        Utils._C(spawn.id, spawn.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD))
                        built = true
                    }
                });
            });
        }
        if (built)
            console.log("Building roads to minerals")
    }


function _on_left(pos: RoomPosition, offset : number = 4) {
    return RoomPosition(pos.x - offset, pos.y, pos.roomName)
}

function _on_right(pos: RoomPosition, offset : number = 4) {
    return RoomPosition(pos.x + offset, pos.y, pos.roomName)
}

function _on_bottom(pos: RoomPosition, offset : number = 4) {
    return RoomPosition(pos.x, pos.y + offset, pos.roomName)
}

function _on_top(pos: RoomPosition, offset : number = 4) {
    return RoomPosition(pos.x , pos.y - offset, pos.roomName)
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
  return Utils.flatten(all_pos)
}


//* If amount_to_create is undefined then it will create the maximum possible.
function _create_closest_to_pos(pos: RoomPosition, spawn: StructureSpawn, structure: BuildableStructureConstant,depth : number = 1, amount_to_create : number = 1000) {
    let breaker = false;
    let created = 0
   while (!breaker && depth <= Config.MAX_DEPTH_FOR_BUILDING) {
       const all_pos = _get_all_position_in_square(pos.x,pos.y, depth)
       for (let pos of all_pos) {
           const r = Utils._C(spawn.id, spawn.room.createConstructionSite(pos[0], pos[1], structure))
           if (r === ERR_INVALID_ARGS) {
               Utils._C(spawn.id, r, "Construction fail");
               break;
           }
           if (r === ERR_FULL || r === ERR_RCL_NOT_ENOUGH) {
               //? set extensions build map to false because we reached the maximum possible for now.
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

function _search_flaggy_flaggy(spawn : StructureSpawn, name: string) {
    return _.filter(Memory["rooms"][spawn.room.name].flags, (flag: Flag) => flag.name.includes(name))
}

function create_struct(spawn: StructureSpawn, struct: BuildableStructureConstant) {
        if(finder.UPDATE(spawn,["flags"])){
            const flags = _search_flaggy_flaggy(spawn, struct);
            let pos = spawn.pos;
            //? Set an offset if there is no flag to not spawn structures directly at the spawn.
            let offset = 3;
            if (flags) {
                pos = flags[0].pos;
                offset = 0;
            }
            _create_closest_to_pos(pos, spawn, struct)
    }
}

function manage_buildings(spawn: StructureSpawn) {
    const room_name = spawn.room.name
    if (Memory["rooms"][room_name].build_map['build_roads']) {
       create_roads(spawn)
       Memory["rooms"][room_name].build_map['build_roads'] = false
     }
    if (Memory["rooms"][room_name].build_map['build_extensions']) {
        create_struct(spawn, STRUCTURE_EXTENSION);
        Memory["rooms"][room_name].build_map['build_extensions'] = false;
    }
    if (Memory["rooms"][room_name].safe_delete )
        delete_all(spawn.room)
}

export { manage_buildings, create_struct,delete_all_construction_sites, delete_all, delete_all_roads, create_roads}

