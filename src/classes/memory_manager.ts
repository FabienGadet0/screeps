import { REPAIR_THRESHOLD } from "../config";
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

    @mnemon
    room_tasks: Record<string, any[]>;

    @mnemon
    classes_in_room: Record<string, number>;

    @mnemon
    creeps_name: string[];

    @mnemon
    spawn_id: Id<StructureSpawn>;

    constructor(room_name: string) {
        this.room_name = room_name;
        this.controller = this._find_controller_id(Game.rooms[room_name]);

        this.locator();
        this.update_room_component(Game.rooms[room_name], [
            "creeps",
            "sources",
            "construction_sites",
            "extensions",
            "minerals",
            "repair",
            "extensions_not_full",
            "containers_not_full",
        ]);
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
        if (_.isEmpty(this.room_tasks["transfer"]) && Game.time >= this.room_tasks.updater["transfer"] + Config.REFRESHING_RATE) {
            this.update_room_component(room, ["extensions_not_full", "containers_not_full", "dropped_resources", "spawns"]);
            this.structure_id.updater["extensions_not_full"] = Game.time;

            const not_full_spawns = this._get_not_full(this.structure_id["spawns"]);
            if (this.structure_id["extensions_not_full"].length > 0 || not_full_spawns) {
                // console.log("spawns arent full " + not_full_spawns + " ->> " + this.structure_id["extensions_not_full"]);
                this.room_tasks["transfer"] = _.flatten([not_full_spawns, this.structure_id["extensions_not_full"]]);
                this.room_tasks.updater["transfer"] = Game.time;
                console.log(_.size(this.room_tasks["transfer"]) + " transfer tasks added ");
            }
        }

        if (_.isEmpty(this.room_tasks["build"]) && Game.time >= this.room_tasks.updater["build"] + Config.REFRESHING_RATE) {
            this.update_room_component(room, ["construction_sites"]);
            this.structure_id.updater["construction_sites"] = Game.time;
            if (this.structure_id["construction_sites"].length > 0) {
                this.room_tasks["build"] = this.structure_id["construction_sites"];
                this.room_tasks.updater["build"] = Game.time;
                console.log(_.size(this.room_tasks["build"]) + " build tasks added ");
            }
        }
        if (_.isEmpty(this.room_tasks["repair"]) && Game.time >= this.room_tasks.updater["repair"] + Config.REFRESHING_RATE) {
            this.room_tasks["repair"] = this._find_all_repair_ids(room);
            this.room_tasks.updater["repair"] = Game.time;
            if (this.room_tasks["repair"].length > 0) {
                console.log(_.size(this.room_tasks["repair"]) + " repair tasks added ");
            }
        }
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

    private get_lvl_of_room(room: Room) {
        return 300 + _.size(Memory.rooms_new[room.name].structure_id["extensions"]) * 50;
    }

    //TODO CAN BE OPTIMIZED
    private _find_all_repair_ids(room: Room): Id<any>[] {
        return _.map(
            room
                .find(FIND_MY_STRUCTURES, { filter: (i) => i.hits / i.hitsMax < REPAIR_THRESHOLD })
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

    private _creeps_variables(room: Room) {
        _.each(room.find(FIND_MY_CREEPS), (creep: Creep) => {
            if (!this.creeps_name.includes(creep.name)) {
                if (!this.classes_in_room[creep.memory.role]) this.classes_in_room[creep.memory.role] = 1;
                else this.classes_in_room[creep.memory.role] += 1;
                this.creeps_name.push(creep.name);
            }
        });
    }

    // prettier-ignore
    public update_room_component(room: Room, update_list: string[],is_task:boolean=false): void {
        if (update_list.length >= 1)
            _.each(update_list, (up : string) => {
                if (!this.structure_id.updater[up]
                    || this.structure_id.updater[up] !== Game.time
                    || this.structure_id.updater[up] === 0) {
                    match(up)
                        .with("creeps", () => { this._creeps_variables(room); })
                        .with("roads", () => { this.structure_id["roads"] = this._find_roads_ids(room); }) //? too costly.
                        .with("sources", () => { this.structure_id["sources"] = this._find_sources_ids(room); })
                        .with("spawns", () => { this.structure_id["spawns"] = this._find_spawns_ids(room); })
                        .with("construction_sites", () => { this.structure_id["construction_sites"] = this._find_construction_sites_ids(room); })
                        .with("extensions", () => { this.structure_id["extensions"] = this._find_extensions_ids(room); })
                        .with("minerals", () => { this.structure_id["minerals"] = this._find_minerals_ids(room); })
                        .with("repair", () => { this.structure_id["repair"] = this._find_all_repair_ids(room); })
                        .with("flags", () => { this.structure_id.flags = this._find_flags_names(room); })
                        .with("extensions_not_full", () => { this.structure_id["extensions_not_full"] = this._find_not_full_extension_ids(room); })
                        .with("dropped_resources", () => { this.structure_id["dropped_resources"] = this._find_dropped_resources_ids(room); })
                        .with("containers_not_full", () => { this.structure_id["containers_not_full"] = this._find_not_full_containers_ids(room); })
                        .with(__, () => {Utils._C("UPDATER", -1000, "Couldn't find corresponding update for " + up);})
                        .exhaustive()
                    if (is_task) this.room_tasks.updater[up] = Game.time;
                    else this.structure_id.updater[up] = Game.time;
                }
                // console.log(up + " updated")
            });
    }
}

export { Memory_manager };
