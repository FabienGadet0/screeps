import { ICreep, ACTION } from "./ICreep";
import { profile } from "../../Profiler/Profiler";

@profile
export class Harvester extends ICreep {
    main_source_target: Id<Source>;
    // target?: Id<StructureExtension | StructureSpawn>
    // target_list: Id<StructureSpawn | StructureExtension>[];

    constructor(creep_name: string) {
        super(creep_name);
        this.main_source_target = this.source_ids[0];
        this.main_action = ACTION.TRANSFER;
        this.set(ACTION.HARVEST, this.main_source_target);
    }

    private _softlock_guard() {
        if (!this.target && this.action) {
            if (this.action === ACTION.HARVEST || this.action === ACTION.PICKUP) this.set(ACTION.HARVEST, this.main_source_target);

            // if (this.action === ACTION.TRANSFER && Memory.rooms[this.creep.room.name].room_tasks["to_transfer"])
            //     this.target = Game.spawns[this.spawn_name].id;

            if (this.action !== ACTION.IDLE) {
                console.log(this.creep + " i got softlock guard , have fun debugging lel " + this.action + " to " + this.target);
            }
        } else if (this.target && Game.getObjectById(this.target) === null) this.set(ACTION.HARVEST, this.main_source_target);
    }

    protected logic() {
        //* LOGIC : -----------------------------------------
        // harvest source
        // transfer to spawn
        // if spawn is full
        // transfer to extensions.
        //* -------------------------------------------------

        //* start a task
        console.log("wesh " + this.target + " -> " + this.creep.store[RESOURCE_ENERGY] + " / " + this.action);
        if (
            ((this.action === ACTION.HARVEST || this.action === ACTION.PICKUP || this.action === ACTION.IDLE) &&
                this.creep.store[RESOURCE_ENERGY] > 0) ||
            (!this.action && this.creep.store[RESOURCE_ENERGY] > 0)
        )
            this._start_task("to_transfer");

        //* finished task
        if (this.target) {
            const target_obj = Game.getObjectById(this.target);
            if (this.action === ACTION.TRANSFER && target_obj && target_obj.store[RESOURCE_ENERGY] === 0) this._task_finished();
        }

        //* harvest if empty
        if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) this.set(ACTION.HARVEST, this.main_source_target);

        //TODO pickup if there is energy on the ground
        // if (this.action === ACTION.HARVEST && !_.isEmpty(Memory.rooms[this.creep.room.name].structure_ids["dropped_resources"]))
        //     this.set(ACTION.PICKUP, Memory.rooms[this.creep.room.name].structure_ids["dropped_resources"].shift());

        this._softlock_guard();
    }
}
