import hooks from "../shared/hooks";
import pts from "../shared/pts";
import lod from "./lod"

export namespace small_objects {

	export var ply_ships: { [index: number]: ply_ship } = {};

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

	export class timed_obj extends lod.obj {
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
		target: vec2 = [0, 0]
		speed = 2.0
		userId = -1
		flyTowardsTarget = false
		static get(userId: number) {
			return ply_ships[userId];
		}
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

			if (this.flyTowardsTarget) {				
				const speed = this.speed * lod.tick_rate;
				let angle = pts.angle(this.pos, this.target);
				this.random.vel = this.speed;
				this.random.angle = angle;				

				let x = speed * Math.sin(angle);
				let y = speed * Math.cos(angle);
				this.pos = pts.subtract(this.pos, [x, y]);

				if (pts.dist(this.pos, this.target) <= this.speed) {
					this.flyTowardsTarget = false;
					console.log('arrived at target');
					
				}
			}
			lod.chunk.swap(this);
		}
	}

	export class tp_rock extends timed_obj {
		angle = 0
		speed = 0.3 // 0.3 km per second
		constructor() {
			super();
			this.name = 'rock';
			this.type = 'rock';
			this.angle = Math.random() * Math.PI * 2;
			this.lifetime = 60 * 3;
			this.speed = 0.3 + Math.random() * 0.3;
		}
		override tick() {
			if (this.timed_out())
				return;
			super.tick();
			const speed = this.speed * lod.tick_rate;
			this.random.vel = this.speed;
			let x = speed * Math.sin(this.angle);
			let y = speed * Math.cos(this.angle);
			let add: vec2 = [x, y];
			this.pos = pts.add(this.pos, add);
			lod.chunk.swap(this);
			//console.log('tickk');
		}
	}

}

export default small_objects;