interface Memory {
    uuid: number;
    log: any;
    debug_mode: boolean;
    debug_speak: boolean;
    rooms: Record<string, RoomMemory>;
    empire: any;
}

interface RoomMemory {
    updater: Record<string, number>;
    build_map: Record<string, any>;
    structures: Record<string, any>;
    creeps: Creep[];
    safe_delete: boolean;
    avoid: any;
    lvl: number;

    flags: Flag[];
    structure_ids: Record<string, any>;
    creeps_name: string[];
}

interface CreepMemory {
    role: string;
    room: string;
    // working: boolean;
    spawn_name: string;
    target?: Id<any>;
    action: any;
    // target_type: any;
    lvl: number;
    is_renewing: boolean;
    _trav: any;
    _travel: any;
}

namespace NodeJS {
    interface Global {
        log: any;
        warn: any;
        err: any;
        error: any;
        delete_all_construction_sites: any;
        delete_all_roads: any;
        delete_all: any;
        create_roads: any;
        create_struct: any;
        _C: any;
        debug: any;
        update_room_memory: any;
        Profiler: any;
    }
}

interface PathfinderReturn {
    path: RoomPosition[];
    ops: number;
    cost: number;
    incomplete: boolean;
}

interface TravelToReturnData {
    nextPos?: RoomPosition;
    pathfinderReturn?: PathfinderReturn;
    state?: TravelState;
    path?: string;
}

interface TravelToOptions {
    ignoreRoads?: boolean;
    ignoreCreeps?: boolean;
    ignoreStructures?: boolean;
    preferHighway?: boolean;
    highwayBias?: number;
    allowHostile?: boolean;
    allowSK?: boolean;
    range?: number;
    obstacles?: { pos: RoomPosition }[];
    roomCallback?: (roomName: string, matrix: CostMatrix) => CostMatrix | boolean;
    routeCallback?: (roomName: string) => number;
    returnData?: TravelToReturnData;
    restrictDistance?: number;
    useFindRoute?: boolean;
    maxOps?: number;
    movingTarget?: boolean;
    freshMatrix?: boolean;
    offRoad?: boolean;
    stuckValue?: number;
    maxRooms?: number;
    repath?: number;
    route?: { [roomName: string]: boolean };
    ensurePath?: boolean;
}

interface TravelData {
    state: any[];
    path: string | undefined;
}

interface TravelState {
    stuckCount: number;
    lastCoord: Coord;
    destination: RoomPosition;
    cpu: number;
}

interface Creep {
    travelTo(destination: HasPos | RoomPosition, ops?: TravelToOptions): number;
}

interface Memory {
    profiler: ProfilerMemory;
}

interface ProfilerMemory {
    data: { [name: string]: ProfilerData };
    start?: number;
    total: number;
}

interface ProfilerData {
    calls: number;
    time: number;
}

interface Profiler {
    clear(): void;
    output(): void;
    start(): void;
    status(): void;
    stop(): void;
}

declare const __PROFILER_ENABLED__: boolean;

type Coord = { x: number; y: number };
type HasPos = { pos: RoomPosition };
