import hooks from "../shared/hooks";
import pts from "../shared/pts";
import lod from "./lod"

export namespace stellar_objects {

	export var ply_ships = {};

	export function init() {
		hooks.register('userMinted', (user) => {
			when_user_minted(user);
			return false;
		});

		hooks.register('userPurged', (user) => {
			when_user_purged(user);
			return false;
		});
	}

	export function when_user_minted(user) {
		console.log('userMinted', user.id);
		user.pos = [Math.random() * 10 - 5, Math.random() * 10 - 5];
		let ship = new stellar_objects.ply_ship;
		ship.userId = user.id;
		ship.name = user.username;
		ship.pos = user.pos;
		ship.set();
		lod.add(ship);
	}

	export function when_user_purged(user) {
		let ship = ply_ships[user.id];
		if (ship)
			lod.remove(ship);
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
		override tick() {
			super.tick();
			//this.pos = [Math.random() * 10 - 5, Math.random() * 10 - 5];
			this.decay = 10;
			lod.chunk.swap(this);
		}
	}

	export class tp_rock extends lod.obj {
		angle = 0
		constructor() {
			super();
			this.name = 'rock';
			this.type = 'rock';
			this.angle = Math.random() * Math.PI;
		}
		override tick() {
			super.tick();
			if (this.expired())
				return;
			const speed = 0.3;
			let x = speed * Math.sin(this.angle);
			let y = speed * Math.cos(this.angle);
			this.pos = pts.add(this.pos, [x, y]);
			lod.chunk.swap(this);
			//console.log('tickk');
		}
	}

}

export default stellar_objects;