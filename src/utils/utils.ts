import { spawn } from "child_process";
import { REPAIR_THRESHOLD } from "../config";
import { profile } from "../Profiler";
import { match, __, when, select } from "ts-pattern";
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from "unique-names-generator";

function flatten(arr: any[][]): any[] {
    return arr.reduce((acc, val) => acc.concat(val), []);
}

// function debug(): void {
//     Memory.debug_mode = !Memory.debug_mode;
//     console.log("Debug set to " + Memory.debug_mode);
// }

// export function take_first(a: any): Record<string, any> {
//     //* Return the first elem and the whole list without first elem
//     const b = a[0];
//     const l = _.size(a);

//     return { elem1: b, new_list: a.slice(1, l - 1) };
// }

//* countries , languages, names
//TODO see if it works.
export function name_new_creep(role: string, lvl: number): string {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
    });
}

// prettier-ignore
export function round_lvl(n: number): number {
    return match(n)
        .when((n) => n.between(300, 549), () => { return 300 })
        .when((n) => n.between(550, 799), () => { return 550 })
        .when((n) => n.between(800, 1299), () => { return 800 })
        .when((n) => n.between(1300, 1700), () => { return 1300 })
        .with(__, () => { console.log("No number in range " + n); return -1 })
        .exhaustive();
}

// prettier-ignore
function number_to_screeps_return_code(code: ScreepsReturnCode | CreepMoveReturnCode | number) {
        return match (code)
        .with(0, () => { return "OK" })
        .with(-1, () => { return "ERR_NOT_OWNER" })
        .with(-2, () => { return "ERR_NO_PATH" })
        .with(-3, () => { return "ERR_NAME_EXISTS" })
        .with(-4, () => { return "ERR_BUSY" })
        .with(-5, () => { return "ERR_NOT_FOUND" })
        .with(-6, () => { return "ERR_NOT_ENOUGH_ENERGY/RESSOURCES/EXTENSIONS" })
        .with(-7, () => { return "ERR_INVALID_TARGET" })
        .with(-8, () => { return "ERR_FULL" })
        .with(-9, () => { return "ERR_NOT_IN_RANGE" })
        .with(-10, () => { return "ERR_INVALID_ARGS" })
        .with(-11, () => { return "ERR_TIRED" })
        .with(-12, () => { return "ERR_NO_BODYPART" })
        .with(-14, () => { return "ERR_GCL_NOT_ENOUGH" })
        .with(-15, () => { return "OK" })
        .with(__, () => {return "ERR_NOT_FOUND " + code })
        .exhaustive()
}

// prettier-ignore
function _C(id: any, code: ScreepsReturnCode | CreepMoveReturnCode | number, additional_msg: string = ""):  ScreepsReturnCode | CreepMoveReturnCode | number{
    const code_str = number_to_screeps_return_code(code);
    if (code !== OK && Memory.debug_mode) console.log("[ERR][" + id + "] " + code + " -> " + code_str + " " + additional_msg);
    return code;
}

function init_variables() {
    Memory.debug_mode = false;
    Memory.debug_speak = false;
}

// export function _init_room_memory(): RoomMemory {
//     return {
//         updater: {},
//         build_map: {
//             build_roads: false,
//             build_extensions: false,
//         },
//         creeps_name: [],
//         room_tasks: {
//             to_transfer: [],
//             to_build: [],
//             to_repair: [],
//         },
//         cripple_creeps: [],
//         safe_delete: false,
//         flags: [],
//         structure_ids: {},
//         avoid: undefined,
//         lvl: 300,
//     };
// }

function check_if_roombased_variables_are_up(room_name: string): boolean {
    return Memory.rooms_new[room_name].build_map !== undefined;
}

export { init_variables, check_if_roombased_variables_are_up, flatten, _C };
