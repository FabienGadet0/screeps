import * as Finder from "../utils/finder";

import * as harvester from "./creeps/harvester";
import * as ICreep from "./creeps/ICreep";
import * as builder from "./creeps/builder";
import * as upgrader from "./creeps/upgrader";

const _run_all_classes: Record<string, any> = {
    harvester: harvester,
    builder: builder,
    upgrader: upgrader,
};

import { profile } from "../Profiler/Profiler";

@profile
class Creep_manager {
    room_name: string;
    creeps_ids: Id<Creep>[];

    constructor(room_name: string) {
        this.room_name = room_name;
        this.creeps_ids = _.map(Game.rooms[room_name].find(FIND_MY_CREEPS), (creep) => {
            return creep.id;
        });
    }

    public update(): void {
        if (_.size(this.creeps_ids) !== _.size(Memory.rooms[this.room_name].creeps_ids))
            this.creeps_ids = Memory.rooms[this.room_name].creeps_ids;
    }

    public run(): void {
        let creeps = Finder.from_ids(Memory.rooms[this.room_name].creeps_ids);
        _.each(creeps, (creep: Creep) => {
            if (!ICreep.manageRenew(creep)) _run_all_classes[creep.memory.role].run(creep);
        });
    }
}

export { Creep_manager };
