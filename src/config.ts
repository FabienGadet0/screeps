import * as Utils from "./utils/utils";

export const PERCENTAGE_TICKS_BEFORE_NEEDS_REFILL = 0.4;
export const MAX_DEPTH_FOR_BUILDING = 3;
export const REPAIR_THRESHOLD = 0.3;
export const REPAIR_WHEN_CONSTRUCTION_SITE_UNDER = 7;
export const MAX_TICKS_TO_LIVE = 1400;
export const REFRESHING_RATE = 5;
export const MEMHACK = true;

//? Lvls :
//* 300  -> 1 spawn
//* 550  -> 5 extensions 1 spawn
//* 800  -> 10 extensions 1 spawn
//* 1300 -> 20 extensions 1 spawn

export const class_to_source: Record<string, number> = {
    harvester: 0,
    builder: 0,
    upgrader: 1,
};

export const limit_per_role_per_room: Record<number, Record<string, number>> = {
    300: { harvester: 3, builder: 2, upgrader: 4 },
    550: { harvester: 3, builder: 2, upgrader: 4 },
    800: { harvester: 3, builder: 3, upgrader: 3 },
    1300: { harvester: 2, builder: 2, upgrader: 2 },
};

// prettier-ignore
//? Lvl = controller lvl if all extensions have been built , example -> lvl2 is 650 energy in total.
export let role_to_bodyparts: Record<number, Record<string, BodyPartConstant[]>> = {
    300: {
        harvester: [MOVE,MOVE,WORK,CARRY],
        builder: [MOVE,MOVE,WORK,CARRY],
        upgrader: [MOVE,MOVE,WORK,CARRY],
    },
    550: {
        harvester: [MOVE,MOVE,MOVE,MOVE,WORK,WORK,CARRY,CARRY],
    builder: [MOVE,MOVE,MOVE,MOVE,WORK,WORK,CARRY,CARRY],
        upgrader: [MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY],//? Fat mod
    },
    800: {
        harvester: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY],
        builder: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY],
        upgrader: [MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY],//? Fat mod
    },
    1300: {
        harvester: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY],
        builder: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
        upgrader: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],//? Fat mod
    },
};

// const roles = {
//     miningCollector: "🚚",
//     miningWorker: "⛏️",
//     worker: "👷",
//     upgrader: "⬆️",
//     hauler: "🚛",
//     scout: "👁️",
//     scoutVision: "🕵️",
//     reserver: "🏴",
//     claimer: "🏁",
//     cleaningCrew: "🧹",
//     feeder: "📦",
//     defender: "🛡️",
// };

export function total_possible_creeps(lvl: number) {
    return _.sum(Object.values(limit_per_role_per_room[Utils.round_lvl(lvl)]));
}

export function all_roles(lvl: number) {
    return Object.keys(limit_per_role_per_room[Utils.round_lvl(lvl)]);
}

export const room_schema = {
    classes_in_room: {},
    lvl: 300,
    room_tasks: {
        updater: { transfer: 0, build: 0, repair: 0 },
        transfer: [],
        build: [],
        repair: [],
    },
    checkpoints: {},
    creeps_name: [],
    cripple_creeps: [],
    structure_id: {
        updater: {
            roads: 0,
            sources: 0,
            construction_sites: 0,
            extensions: 0,
            minerals: 0,
            extensions_not_full: 0,
            flags: 0,
            dropped_resources: 0,
            containers_not_full: 0,
            repair: 0,
        },
        roads: [],
        sources: [],
        construction_sites: [],
        extensions: [],
        minerals: [],
        extensions_not_full: [],
        flags: [],
        dropped_resources: [],
        containers_not_full: [],
        repair: [],
    },
    build_plan: {
        road_to_energy: false,
        road_to_controller: false,
        road_to_minerals: false,
        road_to_exits: false,
        every_roads: false,
        square_road_around_spawn: false,
        extensions: false,
        towers: false,
        defensive_rampart: false,
        delete_sites: false,
        delete_roads: false,
    },

    commands: { all_harvest: undefined, all_transfer_to_spawn: undefined },
    update_map: {
        new_creep: false,
        roads: false,
        sources: false,
        construction_sites: false,
        extensions: false,
        minerals: false,
        extensions_not_full: false,
        flags: false,
        dropped_resources: false,
        containers_not_full: false,
        repair: false,
        room_tasks: false,
        lvl: false,
        forced: false,
    },
};
