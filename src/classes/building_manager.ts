import * as Utils from "../utils/utils";

import { profile } from "../Profiler/Profiler";
import { Tower } from "./buildings/tower";
import { match, __, when, select } from "ts-pattern";

import { Mnemonic, mnemon } from "../utils/mnemonic";
import { IBuilding } from "./buildings/IBuilding";

@profile
export class Building_manager implements Mnemonic {
    room_name: string;
    buildings: Record<Id<any>, any>;

    @mnemon
    spawn_id: Id<StructureSpawn>;

    @mnemon
    lvl: number;

    @mnemon
    cripple_creeps: string[];

    @mnemon
    room_tasks: Record<string, Id<any>[]>;

    @mnemon
    structure_id: string[];

    constructor(room_name: string) {
        this.room_name = room_name;
        this.buildings = {};

        const structs: Structure[] = Game.rooms[room_name].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });

        _.each(structs, (structure: Structure) => {
            this.buildings[structure.id] = this._generate(structure.structureType, structure.id, room_name);
            console.log(`new Building ${structure.id}`);
        });
    }

    public locator(): { [key: string]: any } {
        return Memory.rooms_new[this.room_name];
    }

    private _generate(structure_type: string, id: Id<any>, room_name: string): any {
        switch (structure_type) {
            case STRUCTURE_TOWER:
                return new Tower(id, room_name);
            default:
                console.log(`wrong structure type ${structure_type}`);
        }
    }

    public run(): void {
        _.each(this.buildings, (building: IBuilding) => {
            if (building) building.run();
        });
    }

    public update(): void {
        this.locator();

        _.map(this.buildings, (building: IBuilding) => {
            if (!Utils.get_by_id(building.id)) delete this.buildings[building.id];
            else if (building) building.update();
        });
    }
}
