import { REPAIR_THRESHOLD, TICK_BEFORE_REFRESH, room_schema } from "../config";
import * as Utils from "../utils/utils";
import * as Config from "../config";
import { profile } from "../Profiler/Profiler";
import { match, __, when, select } from "ts-pattern";
import { Mnemonic, mnemon } from "../utils/mnemonic";

@profile
class Memory_manager implements Mnemonic {
    room_name: string;

    @mnemon
    controller?: Id<StructureController>;

    @mnemon
    structure_id: Record<string, any[]>;

    // @mnemon
    // room_tasks: Record<string, any[]>;

    @mnemon
    classes_in_room: Record<string, number>;

    @mnemon
    creeps_name: string[];

    @mnemon
    spawn_id: Id<StructureSpawn>;

    @mnemon
    lvl: number;

    @mnemon
    energy_available: number;

    @mnemon
    flags: string[];

    // hostile_creeps: Id<Creep>[];

    @mnemon
    updater: Record<string, number>[];

    constructor(room_name: string) {
        this.room_name = room_name;
        this.controller = this._find_controller_id(Game.rooms[room_name]);
        this.locator();
        this.update_room_component(Game.rooms[room_name], [
            "creeps",
            "spawns",
            "sources",
            "construction_sites",
            "extensions",
            "tower",
            "minerals",
            "repair",
            "tower",
            "links",
            "repair_rampart",
            "ruins_with_energy",
            "extensions_not_full",
            "containers_not_full",
        ]);
        if (this.structure_id["spawns"].length > 0) Memory.rooms_new[this.room_name].spawn_id = this.structure_id["spawns"][0];
        else Memory.rooms_new[this.room_name].spawn_id = 0;
    }

    public locator(): { [key: string]: any } {
        return Memory.rooms_new[this.room_name];
    }

    private _get_not_full(structure_ids: Id<any>[]) {
        const spawns_obj = _.map(structure_ids, Game.getObjectById);
        return _.map(spawns_obj, (s: any) => {
            if (s.store.getFreeCapacity(RESOURCE_ENERGY) > 0) return s.id;
        });
    }

    //TODO ugly code but roots of all memory
    public update() {
        this.locator();

        const room = Game.rooms[this.room_name];

        this.lvl = Game.rooms[this.room_name].energyCapacityAvailable;
        this.energy_available = Game.rooms[this.room_name].energyAvailable;
        this.update_room_component(room, ["hostile_creeps", "flags"], 5);
        this.update_room_component(room, ["creeps"], 30);
        this.update_room_component(room, ["ruins_with_energy", "links"], 100);

        //* TASKS ------------------------------------------------------------------

        if (_.isEmpty(Memory.rooms_new[this.room_name].room_tasks["transfer"])) {
            this.update_room_component(room, ["extensions_not_full", "containers_not_full", "dropped_resources", "towers", "spawns"], 5);

            const not_full_spawns = this._get_not_full(this.structure_id["spawns"]);
            const not_full_towers = this._get_not_full(this.structure_id["towers"]);
            if (this.structure_id["extensions_not_full"].length > 0 || not_full_spawns || not_full_towers) {
                let to_add = [not_full_spawns, this.structure_id["extensions_not_full"]];
                if (this.structure_id["extensions_not_full"].length === 0) to_add.push(not_full_towers);
                Memory.rooms_new[this.room_name].room_tasks["transfer"] = _.filter(_.flatten(to_add), (v) => !!v);
            }
        }

        if (_.isEmpty(Memory.rooms_new[this.room_name].room_tasks["build"])) {
            this.update_room_component(room, ["construction_sites"], 5);
            if (this.structure_id["construction_sites"].length > 0)
                Memory.rooms_new[this.room_name].room_tasks["build"] = this.structure_id["construction_sites"];
        }

        if (
            _.isEmpty(Memory.rooms_new[this.room_name].room_tasks["repair"]) &&
            Game.time >= this.updater["repair"] + Config.REFRESHING_RATE
        ) {
            const repairs = this._find_all_repair_ids(room);
            if (repairs.length > 0) {
                Memory.rooms_new[this.room_name].room_tasks["repair"] = repairs;
                this.updater["repair"] = Game.time;
            } else if (Memory.rooms_new[this.room_name].room_tasks["build"].length === 0) {
                Memory.rooms_new[this.room_name].room_tasks["repair"] = this.find_repair_rampart(room);
                this.updater["repair"] = Game.time;
            }
        }

        Memory.rooms_new[this.room_name].room_tasks["attack"] = Memory.rooms_new[this.room_name]["hostile_creeps"];
    }

    public run() {}

    private _find_sources_ids(room: Room): Id<Source>[] {
        return _.map(room.find(FIND_SOURCES_ACTIVE), (struct) => {
            //? TOOK OF _ACTIVE
            return struct.id;
        });
    }

    private _find_construction_sites_ids(room: Room): Id<any>[] {
        return _.map(room.find(FIND_MY_CONSTRUCTION_SITES), (struct) => {
            return struct.id;
        });
    }

    private _find_minerals_ids(room: Room): Id<Mineral>[] {
        return _.map(room.find(FIND_MINERALS), (struct) => {
            return struct.id;
        });
    }

    private _find_spawns_ids(room: Room): Id<StructureSpawn>[] {
        return _.map(room.find(FIND_MY_SPAWNS), (struct) => {
            return struct.id;
        });
    }

    private _find_roads_ids(room: Room): Id<any>[] {
        return _.map(room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_ROAD } }), (struct) => {
            return struct.id;
        });
    }

    private _find_controller_id(room: Room): Id<StructureController> | undefined {
        return room.controller ? room.controller.id : undefined;
    }

    private _find_extensions_ids(room: Room): Id<any>[] {
        return _.map(room.find(FIND_MY_STRUCTURES, { filter: { structureType: "extension" } }), (struct) => {
            return struct.id;
        });
    }

    private _find_not_full_extension_ids(room: Room): Id<any>[] {
        return _.map(
            room.find(FIND_MY_STRUCTURES, {
                filter: (i: StructureExtension) => i.structureType === STRUCTURE_EXTENSION && i.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
            }),
            (struct) => {
                return struct.id;
            },
        );
    }

    private _find_links(room: Room): Id<any>[] {
        return room
            .find(FIND_MY_STRUCTURES)
            .filter((structure) => structure.structureType === STRUCTURE_LINK)
            .map((t) => t.id);
    }

    private _find_not_full_containers_ids(room: Room): Id<any>[] {
        return _.map(
            room.find(FIND_MY_STRUCTURES, {
                filter: (i: StructureExtension) =>
                    i.structureType !== STRUCTURE_EXTENSION &&
                    i.structureType === STRUCTURE_CONTAINER &&
                    i.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
            }),
            (struct) => {
                return struct.id;
            },
        );
    }

    private _find_towers_ids(room: Room): Id<any>[] {
        return _.map(room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }), (resource) => {
            return resource.id;
        });
    }

    private _find_dropped_resources_ids(room: Room): Id<Resource>[] {
        return _.map(room.find(FIND_DROPPED_RESOURCES), (resource) => {
            return resource.id;
        });
    }

    private _find_flags_names(room: Room): string[] {
        return _.map(room.find(FIND_FLAGS), (flag) => {
            return flag.name;
        });
    }

    private _find_all_creeps(room: Room) {
        return _.map(room.find(FIND_MY_CREEPS), (creep: Creep) => {
            return creep.name;
        });
    }

    //TODO CAN BE OPTIMIZED
    private _find_all_repair_ids(room: Room): Id<any>[] {
        return _.map(
            room
                .find(FIND_MY_STRUCTURES, { filter: (i) => i.hits / i.hitsMax < REPAIR_THRESHOLD && i.structureType !== STRUCTURE_RAMPART })
                .concat(
                    room.find(FIND_STRUCTURES, {
                        filter: (i) => i.structureType == STRUCTURE_ROAD && i.hits / i.hitsMax < REPAIR_THRESHOLD,
                    }),
                )
                .slice(0, 5),
            (struct) => {
                return struct.id;
            },
        );
    }

    private find_repair_rampart(room: Room): Id<any>[] {
        return _.map(
            room
                .find(FIND_MY_STRUCTURES, { filter: (i) => i.hits / i.hitsMax < REPAIR_THRESHOLD && i.structureType === STRUCTURE_RAMPART })
                .slice(0, 5),
            (struct) => {
                return struct.id;
            },
        );
    }

    private _find_hostile_creeps(room: Room): Id<Creep>[] {
        // private _find_hostile_creeps(room: Room): Id<Creep>[] {
        // return _.map(
        return _.map(room.find(FIND_HOSTILE_CREEPS), (c) => {
            return c.id;
        });

        // (creep: Creep) => {
        //     console.log(`creep ${creep} ${creep.id}`);
        //     return creep.id;
        // },
    }

    private _creeps_variables(room: Room) {
        _.each(room.find(FIND_MY_CREEPS), (creep: Creep) => {
            if (!this.creeps_name.includes(creep.name)) {
                if (!this.classes_in_room[creep.memory.role]) this.classes_in_room[creep.memory.role] = 1;
                else this.classes_in_room[creep.memory.role] += 1;
                this.creeps_name.push(creep.name);
            }
        });
    }

    private _find_ruins_with_resources(room: Room): Id<Ruin>[] {
        return room
            .find(FIND_RUINS)
            .filter((structure) => structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
            .map((t) => t.id);
    }

    // prettier-ignore
    public update_room_component(room: Room, update_list: string[],tick_before_refresh:number=Config.TICK_BEFORE_REFRESH): void {
        if (update_list.length >= 1)
            _.each(update_list, (up: string) => {
                if (!this.updater[up]
                    || Game.time >= this.updater[up] + tick_before_refresh
                    || this.updater[up] === 0){
                    match(up)
                        .with("creeps", () => { this._creeps_variables(room); })
                        .with("hostile_creeps", () => { Memory.rooms_new[this.room_name]["hostile_creeps"] = this._find_hostile_creeps(room); })
                        .with("roads", () => { this.structure_id["roads"] = this._find_roads_ids(room); }) //? too costly.
                        .with("ruins_with_energy", () => { this.structure_id["ruins_with_energy"] = this._find_ruins_with_resources(room); })
                        .with("links", () => { this.structure_id["links"] = this._find_links(room); })
                        .with("sources", () => { this.structure_id["sources"] = this._find_sources_ids(room); })
                        .with("spawns", () => { this.structure_id["spawns"] = this._find_spawns_ids(room); })
                        .with("construction_sites", () => { this.structure_id["construction_sites"] = this._find_construction_sites_ids(room); })
                        .with("extensions", () => { this.structure_id["extensions"] = this._find_extensions_ids(room); })
                        .with("towers", () => { this.structure_id["towers"] = this._find_towers_ids(room); })
                        .with("minerals", () => { this.structure_id["minerals"] = this._find_minerals_ids(room); })
                        .with("repair", () => { this.structure_id["repair"] = this._find_all_repair_ids(room); })
                        .with("repair_rampart", () => { this.structure_id["repair_rampart"] = this.find_repair_rampart(room); })
                        .with("flags", () => { this.flags = this._find_flags_names(room); })
                        .with("extensions_not_full", () => { this.structure_id["extensions_not_full"] = this._find_not_full_extension_ids(room); })
                        .with("dropped_resources", () => { this.structure_id["dropped_resources"] = this._find_dropped_resources_ids(room); })
                        .with("containers_not_full", () => { this.structure_id["containers_not_full"] = this._find_not_full_containers_ids(room); })
                        .with(__, () => {Utils._C("UPDATER", -1000, "Couldn't find corresponding update for " + up);})
                        .exhaustive()
                    this.updater[up] = Game.time;
                    // console.log(up + " updated");
                }
            });
    }
}

export { Memory_manager };
