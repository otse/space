import pts from "../shared/pts";

class toggle {
	protected active = false;
	is_active() { return this.active };
	on() {
		if (this.active) {
			console.warn(' (toggle) already on ');
			return true;
			// it was on before
		}
		this.active = true;
		return false;
		// it wasn't on before
	}
	off() {
		if (!this.active) {
			console.warn(' (toggle) already off ');
			return true;
		}
		this.active = false;
		return false;
	}
}

namespace lod {
	const grid_makes_sectors = true;

	const chunk_size = 10;

	export var SectorSpan = 3;

	export var ggalaxy: galaxy

	export function add(obj: obj) {
		let chunk = ggalaxy.at(lod.galaxy.big(pts.round(obj.pos)));
		chunk.add(obj);
	}

	export function remove(obj: obj) {
		const { chunk } = obj;
		if (chunk) {
			chunk.remove(obj);
		}
	}

	export class galaxy {
		readonly arrays: chunk[][] = []
		constructor() {
			ggalaxy = this;
		}
		update_grid(grid: grid, wpos: vec2) {
			grid.big = lod.galaxy.big(wpos);
			grid.ons();
			grid.offs();
		}
		lookup(big: vec2): chunk | undefined {
			if (this.arrays[big[1]] == undefined)
				this.arrays[big[1]] = [];
			return this.arrays[big[1]][big[0]];
		}
		at(big: vec2): chunk {
			return this.lookup(big) || this.make(big);
		}
		protected make(big): chunk {
			let chun = this.lookup(big);
			if (chun)
				return chun;
			chun = this.arrays[big[1]][big[0]] = new chunk(big, this);
			return chun;
		}
		static big(units: vec2): vec2 {
			return pts.floor(pts.divide(units, SectorSpan));
		}
	}

	export class chunk extends toggle {
		public observers: grid[] = []
		readonly objs: obj[] = [];
		constructor(
			public readonly big: vec2,
			readonly galaxy: galaxy
		) {
			super();
			//galaxy.arrays[this.big[1]][this.big[0]] = this;
		}
		observe(grid: grid) {
			return;
			this.observers.push(grid);
		}
		unobserve(grid: grid) {
			return;
			for (let i = this.observers.length - 1; i >= 0; i--) {
				const observer = this.observers[i];
				if (observer == grid) {
					this.observers.splice(i, 1);
					break;
				}
			}
		}
		dist(grid: grid) {
			return pts.distsimple(this.big, grid.big);
		}
		add(obj: obj) {
			let i = this.objs.indexOf(obj);
			if (i == -1) {
				this.objs.push(obj);
				obj.chunk = this;
				//if (this.is_active() && !obj.is_active())
				//	obj.show();
			}
		}
		remove(obj: obj) {
			let i = this.objs.indexOf(obj);
			if (i > -1) {
				obj.chunk = null;
				this.objs.splice(i, 1).length;
			}
		}
		show() {
			if (this.on())
				return;
		}
		hide() {
			if (this.observers.length >= 1)
				return;
			if (this.off())
				return;
		}
		gather(grid: grid) {
			let gathers: object[] = [];
			for (let obj of this.objs) {
				gathers.push(obj.gather());
			}
			return gathers;
		}
	}

	export class grid {
		big: vec2 = [0, 0]
		public shown: chunk[] = []
		constructor(
			public galaxy: galaxy,
			public spread: number,
			public outside: number
		) {
			if (this.outside < this.spread)
				this.outside = this.spread;
		}
		visible(chunk: chunk) {
			return chunk.dist(this) < this.spread;
		}
		ons() {
			for (let y = -this.spread; y < this.spread + 1; y++) {
				for (let x = -this.spread; x < this.spread + 1; x++) {
					let pos = pts.add(this.big, [x, y]);
					let chunk = grid_makes_sectors ? this.galaxy.at(pos) : this.galaxy.lookup(pos);
					if (!chunk)
						continue;
					if (this.shown.indexOf(chunk) == -1) {
						this.shown.push(chunk);
						//chunk.observe(this);
						//if (!chunk.is_active())
						//	chunk.show();
					}
				}
			}
		}
		offs() {
			let i = this.shown.length;
			while (i--) {
				const sector = this.shown[i];
				if (sector.dist(this) > this.outside) {
					//sector.unobserve(this);
					//sector.hide();
					this.shown.splice(i, 1);
				}
			}
		}
		gather() {
			let objects: object[] = [];
			for (let chunk of this.shown)
				objects = objects.concat(chunk.gather(this));
			return objects;
		}
	}
	export class obj extends toggle {
		chunk: chunk | null = null
		id = 0
		type = 'an sobj'
		pos: vec2 = [0, 0]
		constructor() {
			super();
		}
		gather() {
			let sent = [{}, this.id, this.pos, this.type];
			return sent;
		}
	}
}

export default lod;