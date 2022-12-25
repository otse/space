import lod from "./lod"

export namespace stellar_objects {

	export var ply_ships_by_ply_id = {};

	export class ply_ship extends lod.obj {
		plyId = -1
		constructor() {
			super();
			this.type = 'ply';
		}
		set() {
			this.random.plyId = this.plyId;
			ply_ships_by_ply_id[this.plyId] = this;
		}
	}

}

export default stellar_objects;