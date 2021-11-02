import { ICreep, ACTION } from "./ICreep";
import { profile } from "../../Profiler/Profiler";

export class Harvester extends ICreep {
    harvesting: boolean;
    main_source_target: Id<Source>;
    target_list: Id<StructureSpawn | StructureExtension>[];

    constructor(creep_name: string) {
        super(creep_name);
        this.harvesting = false;
        this.main_source_target = this.source_ids[0];
        this.target_list = []; //? List of targets for harvesting only.
        this.creep.memory.action = ACTION.HARVEST;
    }

    private _set_target() {
        //* Set target spawn and then extensions for transfering energy.
        if (this.target_list.length === 0) {
            const spawn = Game.spawns[this.spawn_name];
            if (spawn.store[RESOURCE_ENERGY] !== spawn.store.getCapacity()) this.target_list.push(spawn.id);
            _.map(Memory.rooms[this.creep.room.name].structure_ids["extensions"], (ext: Id<StructureExtension>) => {
                const extension = Game.getObjectById(ext) as StructureExtension;
                if (extension.store.getFreeCapacity(RESOURCE_ENERGY) > 0) this.target_list.push(extension.id);
            });
        }
    }

    protected logic() {
        //* LOGIC : -----------------------------------------
        // harvest source
        // transfer to spawn
        // if spawn is full
        // transfer to extensions.
        //* -------------------------------------------------
        // if (this.last_return_code === ERR_FULL && !this.harvesting{

        // }
        this._set_target();

        if (this.target_list.length > 0) {
            let target = Game.getObjectById(this.target_list[0]);
            if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) this.target_list.shift();

            if (this.creep.store[RESOURCE_ENERGY] === this.creep.store.getCapacity() && !this.harvesting) {
                this.harvesting = false;
                this.set(ACTION.TRANSFER, this.target_list[0]);
            } else if (this.creep.store[RESOURCE_ENERGY] === 0) {
                this.set(ACTION.HARVEST, this.main_source_target);
                this.harvesting = true;
            }
        }
    }
}

// function _next_target(creep: Creep) {
//     if (creep.memory.target === "spawn") creep.memory.target = "extensions_not_full";
//     else creep.memory.target = "spawn";
//     // else  {
//     //? Check if all target have been filled. before going next.
//     // finder.UPDATE(Memory.rooms[creep.room.name].structures.spawn, [creep.memory.target_type]);
//     // if (_.size(Memory["rooms"][creep.room.name].structures[creep.memory.target_type]) === 0) {
//     // if (creep.memory.target_type === "extensions_not_full")
//     //     creep.memory.target_type = "containers_not_full";
//     // else if (creep.memory.target_type === "containers_not_full")
//     //     creep.memory.target_type = "spawn";
//     // }
//     // }
//     // finder.UPDATE(Game.spawns[creep.memory.spawn_name], [creep.memory.target_type]);
//     return Finder.from_id(Memory["rooms"][creep.room.name].structure_ids[creep.memory.target]);
// }

// function _work(creep: Creep): void {
//     let r = 0;

//     let target = undefined;
//     if (creep.memory.target === "spawn" && Game.spawns[creep.memory.spawn_name].store.getFreeCapacity(RESOURCE_ENERGY) === 0)
//         target = _next_target(creep);
//     // if ((target.store.getFreeCapacity() || 0) > 50) //? if spawn isnt full , it's the priority.
//     // creep.memory.target_type = 'spawn'
//     // if (creep.memory.target_type !== 'spawn') {
//     // finder.UPDATE(Game.spawns[creep.memory.spawn_name], [creep.memory.target_type]);
//     // finder.UPDATE(Game.spawns[creep.memory.spawn_name], [creep.memory.target_type]);
//     target = Finder.from_id(Memory["rooms"][creep.room.name].structure_ids[creep.memory.target]);
//     // }
//     // else
//     //     target = Memory["rooms"][creep.room.name].structures[creep.memory.target_type]

//     if (!_.isEmpty(target)) {
//         if (creep.memory.target !== "spawn") target = target[0];
//         r = Utils._C(creep.name, creep.transfer(target, RESOURCE_ENERGY));
//         if (r === ERR_NOT_IN_RANGE) creep.moveTo(target);
//         else if (r === ERR_FULL) {
//             if (creep.memory.target === "spawn") _next_target(creep);
//         }
//     } else _next_target(creep);
// }

// export function run(creep: Creep, opts?: {} | undefined) {
//     //? to reset
//     //creep.memory.target_type = 'spawn'

//     if (!creep.memory.target) creep.memory.target = "spawn"; //? Transfer to spawn in priority and if full transfer to extensions.

//     creep.memory.working =
//         (!creep.memory.working && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) ||
//         (creep.memory.working && creep.store[RESOURCE_ENERGY] > 0);
//     creep.memory.working ? _work(creep) : ICreep.harvest(creep, 1);
// }
