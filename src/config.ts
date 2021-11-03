export const PERCENTAGE_TICKS_BEFORE_NEEDS_REFILL = 0.4;
export const MAX_DEPTH_FOR_BUILDING = 3;
export const REPAIR_THRESHOLD = 0.3;
export const REPAIR_WHEN_CONSTRUCTION_SITE_UNDER = 7;
export const MAX_TICKS_TO_LIVE = 1400;

export const limit_per_role_per_room: Record<string, number> = {
    harvester: 3,
    builder: 3,
    upgrader: 3,
};

//? Lvl = controller lvl if all extensions have been built , example -> lvl2 is 650 energy in total.
export let role_to_bodyparts: Record<number, Record<string, BodyPartConstant[]>> = {
    300: {
        harvester: [MOVE, MOVE, WORK, CARRY],
        builder: [MOVE, MOVE, WORK, CARRY],
        upgrader: [MOVE, MOVE, WORK, CARRY],
    },
    550: {
        //? 5 extensions 1 spawn
        harvester: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY],
        builder: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY],
        upgrader: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY], //? Fat mod
    },
    800: {
        //? 10 extensions 1 spawn
        harvester: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY],
        builder: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY],
        upgrader: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY],
    },
    1200: {
        //? temp
        harvester: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY],
        builder: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY],
        upgrader: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY],
    },
    1300: {
        //? 20 extensions 1 spawn
        harvester: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY],
        builder: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY],
        upgrader: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY],
    },
};

const roles = {
    miningCollector: "🚚",
    miningWorker: "⛏️",
    worker: "👷",
    upgrader: "⬆️",
    hauler: "🚛",
    scout: "👁️",
    scoutVision: "🕵️",
    reserver: "🏴",
    claimer: "🏁",
    cleaningCrew: "🧹",
    feeder: "📦",
    defender: "🛡️",
};

export const total_possible_creeps = _.sum(Object.values(limit_per_role_per_room));

export const all_roles = Object.keys(limit_per_role_per_room);
