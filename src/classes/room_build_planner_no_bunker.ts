// export enum SHAPE {
//     CROSS = 0,
//     SQUARE,
//     SQUARE_OUTER,
//     CIRCLE,
//     DIAMOND,
//     ANGLE_CROSS,
// }

// function _get_shape_offset(shape: SHAPE): number[][] {
//     return match(shape)
//         .with(SHAPE.CROSS, () => {
//             return [
//                 [0, 0],
//                 [1, 0],
//                 [0, 1],
//                 [-1, 0],
//                 [0, -1],
//             ];
//         })
//         .with(SHAPE.SQUARE, () => {
//             return [
//                 [-1, -1],
//                 [0, -1],
//                 [+1, -1],
//                 [-1, 0],
//                 [0, 0],
//                 [+1, 0],
//                 [-1, +1],
//                 [0, +1],
//                 [+1, +1],
//             ];
//         })
//         .with(SHAPE.SQUARE_OUTER, () => {
//             return [
//                 [-1, -1],
//                 [0, -1],
//                 [+1, -1],
//                 [-1, 0],
//                 [+1, 0],
//                 [-1, +1],
//                 [0, +1],
//                 [+1, +1],
//             ];
//         })
//         .with(SHAPE.CIRCLE, () => {
//             return [
//                 [0, -1],
//                 [-1, 0],
//                 [+1, 0],
//                 [0, +1],
//             ];
//         })
//         .with(SHAPE.DIAMOND, () => {
//             return [
//                 [-1, 0],
//                 [+1, 0],
//                 [0, -1],
//                 [0, +1],
//             ];
//         })
//         .with(SHAPE.ANGLE_CROSS, () => {
//             return [
//                 [0, 0],
//                 [-1, -1],
//                 [+1, -1],
//                 [-1, +1],
//                 [+1, +1],
//             ];
//         })
//         .with(__, () => {
//             console.log(`shape is wrong ${shape}`);
//             return [];
//         })
//         .exhaustive();
// }

// function get_position_with_offset(x: number, y: number, shape: SHAPE, depth: number = 1): any[][] {
//     let offsets: any[] = [];
//     while (depth !== 0) {
//         offsets = _.flatten([offsets, _get_shape_offset(shape)]);
//         depth -= 1;
//     }
//     // const offsets = _get_shape_offset(shape, depth);
//     console.log(offsets + " its offset");
//     return _.map(offsets, ([a, b]) => [a + x, b + y]);
// }

// function _apply_offset(x, y) {
//     deltas.map(([a, b]) => [a + position[0], b + position[1]]);
// }

// private square_road_around_spawn(size: number = 2) {
//     const spawn = Game.getObjectById(this.spawn_id) as StructureSpawn;
//     const room = Game.rooms[this.room_name];

//     let positions: number[] = [];
//     while (size !== 0) {
//         positions = _.flatten([positions, this._get_all_position_in_square(spawn.pos.x, spawn.pos.y, size)]);
//         size -= 1;
//     }
//     _.map(positions, (pos) => {
//         if (room.lookAt(pos[0], pos[1]).length === 1) Utils._C("[BUILD]", room.createConstructionSite(pos[0], pos[1], STRUCTURE_ROAD));
//     });
// }
// //* If amount_to_create is undefined then it will create the maximum possible.
// private create_from_shape(
//     original_pos: RoomPosition,
//     structure: BuildableStructureConstant,
//     shape: SHAPE,
//     size: number = 1,
//     amount_to_create: number = 1000,
// ): void {
//     let room = Game.rooms[this.room_name];
//     const positions = get_position_with_offset(original_pos.x, original_pos.y, shape, size);
//     _.map(positions, (pos) => {
//         if (room.lookAt(pos[0], pos[1]).length === 1) Utils._C("[BUILD]", room.createConstructionSite(pos[0], pos[1], structure));
//     });
// }

// private __get_corners(x: number, y: number, depth: number) {
//     return [
//         [x - depth, y - depth],
//         [x + depth, y - depth],
//         [x - depth, y + depth],
//         [x + depth, y + depth],
//     ];
// }

// private __coords_between(a: number, b: number, c: number, d: number): number[][] {
//     let all_pos = [];
//     while (a < c || b < d) {
//         if (a < c) a += 1;
//         else if (b < d) b += 1;
//         all_pos.push([a, b]);
//     }
//     return all_pos;
// }

// // 0 -> 1 / 0 -> 2/ 1 -> 3 / 2 -> 3
// private _get_all_position_in_square(x: number, y: number, depth: number) {
//     let all_pos = [];
//     const corners = this.__get_corners(x, y, depth);
//     all_pos.push([corners[0]]);
//     all_pos.push(this.__coords_between(corners[0][0], corners[0][1], corners[1][0], corners[1][1]));
//     all_pos.push(this.__coords_between(corners[0][0], corners[0][1], corners[2][0], corners[2][1]));
//     all_pos.push(this.__coords_between(corners[1][0], corners[1][1], corners[3][0], corners[3][1]));
//     all_pos.push(this.__coords_between(corners[2][0], corners[2][1], corners[3][0], corners[3][1]));
//     return Utils.flatten(all_pos);
// }
