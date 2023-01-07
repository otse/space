import hooks from "../shared/hooks";
import pts from "../shared/pts";
import lod from "./lod"

export namespace small_objects {

	export var ply_ships = {};

	export var grid: lod.grid

	export function init() {

		grid = new lod.grid(3000);

		hooks.register('userMinted', (user) => {
			when_user_minted(user);
			return false;
		});

		hooks.register('userPurged', (user) => {
			when_user_purged(user);
			return false;
		});
	}

	export function tick() {
		grid.tick();
	}

	export function when_user_minted(user) {
		console.log('userMinted', user.id);
		user.pos = [Math.random() * 10 - 5, Math.random() * 10 - 5];
		let ship = new small_objects.ply_ship;
		ship.userId = user.id;
		ship.name = user.username;
		ship.pos = user.pos;
		ship.set();
		lod.add(grid, ship);
	}

	export function when_user_purged(user) {
		let ship = ply_ships[user.id];
		if (ship)
			lod.remove(ship);
	}

	export class obj_lifetime extends lod.obj {
		lifetime = 100
		constructor() {
			super();
		}
		timed_out() {
			if (this.lifetime <= 0) {
				lod.remove(this);
				return true;
			}
			this.lifetime -= lod.tick_rate;
			return false;
		}
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
			lod.chunk.swap(this);
		}
	}

	export class tp_rock extends obj_lifetime {
		angle = 0
		constructor() {
			super();
			this.name = 'rock';
			this.type = 'rock';
			this.angle = Math.random() * Math.PI * 2;
			this.lifetime = 60 * 3;
		}
		override tick() {
			if (this.timed_out())
				return;
			super.tick();
			const speed = 0.3 * lod.tick_rate; // 0.3km per second
			let x = speed * Math.sin(this.angle);
			let y = speed * Math.cos(this.angle);
			this.pos = pts.add(this.pos, [x, y]);
			lod.chunk.swap(this);
			//console.log('tickk');
		}
	}

}

export default small_objects;