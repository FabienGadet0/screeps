export const PERCENTAGE_TICKS_BEFORE_NEEDS_REFILL = 0.4
export const MAX_DEPTH_FOR_BUILDING = 3
export const REPAIR_THRESHOLD = 0.3
export const REPAIR_WHEN_CONSTRUCTION_SITE_UNDER = 7
export const MAX_TICKS_TO_LIVE = 1400

export const limit_per_role_per_room: Record<string, number> = {
    'harvester': 3,
    'builder': 5,
    'upgrader': 3
}


export const harvester_bodyparts = [MOVE,MOVE,WORK,CARRY]
export const builder_bodyparts = [MOVE,MOVE,WORK,CARRY]
export const upgrader_bodyparts = [MOVE,MOVE,WORK,CARRY]

//? lvl 2
export const harvester_bodyparts_lvl_2 = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY]
export const builder_bodyparts_lvl_2 = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY]
export const upgrader_bodyparts_lvl_2 = [MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY] //? Fat mod , normal is -> [MOVE,MOVE,MOVE,WORK,WORK,CARRY,CARRY,CARRY,CARRY]

//? lvl 3
export const harvester_bodyparts_lvl_3 = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY]
export const builder_bodyparts_lvl_3 = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY]
export const upgrader_bodyparts_lvl_3 = [MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY] //? Fat mod , normal is -> [MOVE,MOVE,MOVE,WORK,WORK,CARRY,CARRY,CARRY,CARRY]



//? Lvl = controller lvl if all extensions have been built , example -> lvl2 is 650 energy in total.
export let role_to_bodyparts: Record<number,Record<string, BodyPartConstant[]>> = {
    1 : {
        'harvester': harvester_bodyparts,
        'mineralharvester': harvester_bodyparts,
        'builder': builder_bodyparts,
        'upgrader': upgrader_bodyparts
    },
    2 : {
        'harvester': harvester_bodyparts_lvl_2,
        'mineralharvester': harvester_bodyparts_lvl_2,
        'builder': builder_bodyparts_lvl_2,
        'upgrader': upgrader_bodyparts_lvl_2,
    }
}

const roles = {
    miningCollector: '🚚',
    miningWorker: '⛏️',
    worker: '👷',
    upgrader: '⬆️',
    hauler: '🚛',
    scout: '👁️',
    scoutVision: '🕵️',
    reserver: '🏴',
    claimer: '🏁',
    cleaningCrew: '🧹',
    feeder: '📦',
    defender: '🛡️'
  }

export const total_possible_creeps = _.sum(Object.values(limit_per_role_per_room))

export const all_roles = Object.keys(limit_per_role_per_room)
