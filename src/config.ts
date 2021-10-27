export const DEFAULT_MIN_LIFE_BEFORE_NEEDS_REFILL = 400

export const limit_per_role: Record<string, number> = {
    'harvester': 2,
    'builder': 5,
    'upgrader': 4
}


export const harvester_bodyparts = [WORK,CARRY,CARRY,MOVE]
export const builder_bodyparts = [WORK,WORK,CARRY,MOVE]
export const builder_only_bodyparts = [WORK,WORK,MOVE]
export const upgrader_bodyparts = [WORK,CARRY,CARRY,MOVE]

export const role_to_bodyparts : Record<string, BodyPartConstant[]> = {
    'harvester': harvester_bodyparts,
    'builder': builder_bodyparts,
    'upgrader': upgrader_bodyparts
}


export const total_possible_creeps = _.sum(Object.values(limit_per_role))

export const all_roles = Object.keys(limit_per_role)
