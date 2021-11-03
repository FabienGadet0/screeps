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
        if (!this.action) this.set(ACTION.HARVEST, this.main_source_target);

        if (this.last_return_code !== ERR_NOT_IN_RANGE && this.last_return_code !== OK)
            console.log(this.creep + " last error is " + this.last_return_code);
    }

    protected logic() {
        //* LOGIC : -----------------------------------------
        // harvest source
        // transfer to spawn
        // if spawn is full
        // transfer to extensions.
        //* -------------------------------------------------

        this.debug_me();

        //* finish a task
        if (this.target && Game.getObjectById(this.target) && Game.getObjectById(this.target).getFreeCapacity(RESOURCE_ENERGY) === 0) {
            // const target_obj = Game.getObjectById(this.target);
            this._task_finished();
        }

        //* start a task
        if (this.action in [ACTION.HARVEST, ACTION.PICKUP, ACTION.WAITING_NEXT_TASK] && this.has_energy()) this._start_task("to_transfer");

        //* harvest if empty
        if (!this.has_energy()) this.set(ACTION.HARVEST, this.main_source_target);

        //TODO pickup if there is energy on the ground
        // if (this.action === ACTION.HARVEST && !_.isEmpty(Memory.rooms[this.creep.room.name].structure_ids["dropped_resources"]))
        //     this.set(ACTION.PICKUP, Memory.rooms[this.creep.room.name].structure_ids["dropped_resources"].shift());

        this._softlock_guard();
    }
}
