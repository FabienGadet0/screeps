import * as Utils from "./utils";
import * as buildPlanner from "classes/buildplanner";

global.delete_all_construction_sites = buildPlanner.delete_all_construction_sites;
global.delete_all_roads = buildPlanner.delete_all_roads;
global.delete_all = buildPlanner.delete_all;
global.create_roads = buildPlanner.create_roads;
global.create_extensions = buildPlanner.create_extensions;
global.create_roads = buildPlanner.create_roads;
global.create_containers = buildPlanner.create_containers

global._C = Utils._C
global.populate_build_map = Utils.populate_build_map
global.populate_my_structures = Utils.populate_my_structures
global.debug = Utils.debug
