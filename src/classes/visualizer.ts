import * as Config from "../config";
import * as Utils from "../utils/utils";
import { Memory_manager } from "./memory_manager";
import { Creep_factory } from "./creep_factory";
import { Room_build_planner } from "./room_build_planner";
import { Creep_manager } from "./creep_manager";

import * as packRat from "../utils/packrat";
import { Mnemonic, mnemon } from "../utils/mnemonic";
import { packId } from "../utils/packrat";

export class Visualizer implements Mnemonic {
    room_name: string;
    _visual: RoomVisual;

    @mnemon
    room_tasks: Record<string, any>;

    @mnemon
    lvl: number;

    @mnemon
    classes_in_room: Record<string, any>;

    constructor(room_name: string) {
        this.room_name = room_name;
        this._visual = Game.rooms[room_name].visual;
        // this.room_tasks = this.locator().room_tasks;
    }

    locator() {
        return Memory.rooms_new[this.room_name];
    }

    public update() {
        this.locator();
    }

    public run() {
        this.draw_tasks();
        this.draw_room_info();
        this.draw_creeps_info();
    }

    private draw_room_info() {
        let to_print = [];
        to_print.push(" ");
        to_print.push(` RCL             ${Game.rooms[this.room_name].controller?.level}  `);
        to_print.push(` LVL              ${this.lvl}  `);
        to_print.push(` Room Name  ${this.room_name}   `);
        to_print.push(" ");
        // to_print.push(" ");
        this._visual.infoBox(_.flatten(to_print), 5, 2, { color: "white" });
    }

    public draw_tasks() {
        let to_print = [];
        to_print.push(" ");
        _.each(Object.keys(this.room_tasks), (task_name: string) => {
            if (task_name !== "updater") {
                const size = _.size(this.room_tasks[task_name]);
                size > 10 ? to_print.push([` ${size}  ${task_name}           `]) : to_print.push([` ${size}    ${task_name}          `]);
            }
        });
        // to_print.push(" ");
        to_print.push(" ");
        this._visual.infoBox(_.flatten(to_print), 5, 5, { color: "white" });
    }
    private draw_creeps_info() {
        let to_print = [];
        to_print.push(" ");
        _.each(Object.keys(this.classes_in_room), (role_name: string) => {
            this.classes_in_room[role_name] > 10
                ? to_print.push([` ${this.classes_in_room[role_name]}   ${role_name}          `])
                : to_print.push([` ${this.classes_in_room[role_name]}    ${role_name}         `]);
        });
        to_print.push(" ");
        this._visual.infoBox(_.flatten(to_print), 5, 8, { color: "white" });
    }

    public show_blueprint(x: number, y: number) {
        const letter_to_structure = {
            E: STRUCTURE_EXTENSION,
            T: STRUCTURE_TOWER,
            S: STRUCTURE_SPAWN,
            K: STRUCTURE_LINK,
            A: STRUCTURE_TERMINAL,
            L: STRUCTURE_LAB,
            R: STRUCTURE_RAMPART,
            O: STRUCTURE_OBSERVER,
            N: STRUCTURE_NUKER,
            C: STRUCTURE_CONTAINER,
            ".": STRUCTURE_ROAD,
        };
        let pos = [x, y];
        let i = 0;
        _.each(Config.blueprint, (structure: string) => {
            _.each(structure, (line: string) => {
                this._visual.structure(pos[0], pos[1], letter_to_structure[line]);
                pos[0] += 1;
                i += 1;
            });
            pos[0] = x;
            pos[1] += 1;
            i = 0;
        });
    }
}
