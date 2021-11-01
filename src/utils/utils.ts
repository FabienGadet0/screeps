import { spawn } from "child_process";
import { REPAIR_THRESHOLD } from "../config";
import { profile } from "../Profiler";

function flatten(arr: any[][]): any[] {
    return arr.reduce((acc, val) => acc.concat(val), []);
}

function debug(): void {
    Memory.debug_mode = !Memory.debug_mode;
    console.log("Debug set to " + Memory.debug_mode);
}

function _C(id: any, code: ScreepsReturnCode | CreepMoveReturnCode | number, additional_msg: string = "") {
    let code_str = "";
    switch (code) {
        case 0:
            code_str = "OK";
            break;
        case -1:
            code_str = "ERR_NOT_OWNER";
            break;
        case -2:
            code_str = "ERR_NO_PATH";
            break;
        case -3:
            code_str = "ERR_NAME_EXISTS";
            break;
        case -4:
            code_str = "ERR_BUSY";
            break;
        case -5:
            code_str = "ERR_NOT_FOUND";
            break;
        case -6:
            code_str = "ERR_NOT_ENOUGH_ENERGY/RESSOURCES/EXTENSIONS";
            break;
        case -7:
            code_str = "ERR_INVALID_TARGET";
            break;
        case -8:
            code_str = "ERR_FULL";
            break;
        case -9:
            code_str = "ERR_NOT_IN_RANGE";
            break;
        case -10:
            code_str = "ERR_INVALID_ARGS";
            break;
        case -11:
            code_str = "ERR_TIRED";
            break;
        case -12:
            code_str = "ERR_NO_BODYPART";
            break;
        case -14:
            code_str = "ERR_RCL_NOT_ENOUGH";
            break;
        case -15:
            code_str = "ERR_GCL_NOT_ENOUGH";
            break;
    }

    if (code !== OK && Memory.debug_mode) console.log("[ERR][" + id + "] " + code + " -> " + code_str + " " + additional_msg);
    return code;
}

function init_variables() {
    Memory.debug_mode = false;
    Memory.debug_speak = false;
}

function _init_room_memory(room_name: string): RoomMemory {
    console.log(room_name + "-> Init_room_memory");

    return {
        updater: {},
        structures: {},
        build_map: {
            build_roads: false,
            build_extensions: false,
        },
        creeps: [],
        creeps_name: [],
        safe_delete: false,
        flags: [],
        structure_ids: {},
        avoid: undefined,
        lvl: 1,
    };
}

//? Check if vars are up and update mandatory vars.
function manage_roombased_variables(room_name: string) {
    if (!Memory["rooms"][room_name]) Memory["rooms"][room_name] = _init_room_memory(room_name);
}

function check_if_roombased_variables_are_up(room_name: string): boolean {
    return Memory["rooms"][room_name].build_map !== undefined;
}

export { debug, init_variables, check_if_roombased_variables_are_up, manage_roombased_variables, flatten, _C };
