import { ErrorMapper } from "utils/ErrorMapper";
import "./utils/traveler";
import "./utils/init_functions";
import * as Config from "../config";
import * as Utils from "../utils/utils";
import * as finder from "../utils/finder";
import * as packRat from "../utils/packrat";
import * as spawner from "classes/spawner";
import * as buildPlanner from "classes/buildplanner";

import * as harvester from "classes/harvester";
import * as skeleton from "classes/skeleton";
import * as builder from "classes/builder";
import * as upgrader from "classes/upgrader";

import * as Profiler from "../Profiler";

class Room_orchestrator {
    spawn: StructureSpawn;
    room_name: string;

    constructor(room_name: string, spawn: StructureSpawn) {
        this.room_name = room_name;
        this.spawn = spawn;
    }

    greet() {}
}
