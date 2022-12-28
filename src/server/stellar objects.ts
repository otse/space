import lod from "./lod"

export namespace stellar_objects {

	export var ply_ships = {};

	export function get_ply_ship_by_user_id(user) {
		return ply_ships[user.id];
	}

	export class ply_ship extends lod.obj {
		userId = -1
		constructor() {
			super();
			this.type = 'ply';
		}
		set() {
			this.random.userId = this.userId;
			ply_ships[this.userId] = this;
		}
	}

}

export default stellar_objects;