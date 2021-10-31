import * as Utils from "./utils";
import * as buildPlanner from "classes/buildplanner";

global.delete_all_construction_sites = buildPlanner.delete_all_construction_sites;
global.delete_all_roads = buildPlanner.delete_all_roads;
global.delete_all = buildPlanner.delete_all;
global.create_roads = buildPlanner.create_roads;
global.create_struct = buildPlanner.create_struct ;
global.create_roads = buildPlanner.create_roads;

global._C = Utils._C
// global.update_room_memory = finder.UPDATE_room_memory
global.debug = Utils.debug
// global.update_room_memory = finder.UPDATE_room_memory
