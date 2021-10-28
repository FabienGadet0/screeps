export const DEFAULT_MIN_LIFE_BEFORE_NEEDS_REFILL = 400
export const MAX_DEPTH_FOR_BUILDING = 3

export const limit_per_role: Record<string, number> = {
    'harvester': 2,
    'builder': 3,
    'upgrader': 4
}


export const harvester_bodyparts = [MOVE,WORK,CARRY,CARRY,CARRY]
export const builder_bodyparts = [MOVE,WORK,CARRY,CARRY,CARRY]
export const upgrader_bodyparts = [MOVE,WORK,CARRY,CARRY,CARRY]

export const role_to_bodyparts : Record<string, BodyPartConstant[]> = {
    'harvester': harvester_bodyparts,
    'builder': builder_bodyparts,
    'upgrader': upgrader_bodyparts
}


export const total_possible_creeps = _.sum(Object.values(limit_per_role))

export const all_roles = Object.keys(limit_per_role)
