import * as Config from "../config";
import * as Utils from "../utils/utils";
import { Memory_manager } from "./memory_manager";
import { Creep_factory } from "./creep_factory";
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
    flags: string[];

    @mnemon
    classes_in_room: Record<string, any>;

    possible_flags: string[];

    info_flags: RoomPosition;

    constructor(room_name: string) {
        this.room_name = room_name;
        this._visual = Game.rooms[room_name].visual;
        this.possible_flags = ["BUNKER"];
        this._set_info_pos();

        // this.room_tasks = this.locator().room_tasks;
    }

    private _set_info_pos() {
        if (this.flags && this.flags.includes("info"))
            this.info_flags = new RoomPosition(Game.flags["info"].pos.x, Game.flags["info"].pos.y + 1, Game.flags["info"].pos.roomName);
        else this.info_flags = new RoomPosition(5, 5, this.room_name);
    }

    locator() {
        return Memory.rooms_new[this.room_name];
    }

    public update() {
        this._set_info_pos();
    }

    public run() {
        this.draw_tasks();
        this.draw_room_info();
        this.draw_creeps_info();
        if (this.flags.includes("BUNKER")) this.show_blueprint(Game.flags["BUNKER"].pos);
        this.locator();
    }

    private draw_room_info() {
        let to_print = [];
        to_print.push(" ");
        to_print.push(` RCL              ${Game.rooms[this.room_name].controller?.level}   `);
        to_print.push(` LVL              ${this.lvl}   `);
        to_print.push(` Room Name  ${this.room_name}    `);
        to_print.push(" ");
        this._visual.infoBox(_.flatten(to_print), this.info_flags.x, this.info_flags.y, { color: "white" });
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
        to_print.push(" ");
        this._visual.infoBox(_.flatten(to_print), this.info_flags.x, this.info_flags.y + 3, { color: "white" });
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
        this._visual.infoBox(_.flatten(to_print), this.info_flags.x, this.info_flags.y + 6, { color: "white" });
    }

    public show_blueprint(original_pos: RoomPosition): void {
        let x = original_pos.x;
        let y = original_pos.y;
        _.each(Config.blueprint, (structure: string) => {
            _.each(structure, (line: string) => {
                this._visual.structure(x, y, Config.letter_to_structure[line]);
                x += 1;
            });
            x = original_pos.x;
            y += 1;
        });
    }
}
