import pts from "../shared/pts";

namespace lod {
	const grid_makes_sectors = true;

	export const ChunkSpan = 3;

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
			grid.discovery();
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
			let c = this.lookup(big);
			if (c)
				return c;
			c = this.arrays[big[1]][big[0]] = new chunk(big, this);
			return c;
		}
		static big(units: vec2): vec2 {
			return pts.floor(pts.divide(units, ChunkSpan));
		}
	}

	export class chunk {
		readonly objs: obj[] = [];
		constructor(
			public readonly big: vec2,
			readonly galaxy: galaxy
		) {
			//galaxy.arrays[this.big[1]][this.big[0]] = this;
		}
		dist(grid: grid) {
			return pts.distsimple(this.big, grid.big);
		}
		add(obj: obj) {
			let i = this.objs.indexOf(obj);
			if (i == -1) {
				this.objs.push(obj);
				obj.chunk = this;
			}
		}
		remove(obj: obj) {
			let i = this.objs.indexOf(obj);
			if (i > -1) {
				obj.chunk = null;
				this.objs.splice(i, 1);
			}
		}
		gather(grid: grid) {
			let objects: object[] = [];
			for (let obj of this.objs)
				objects.push(obj.gather());
			return objects;
		}
	}

	export class grid {
		big: vec2 = [0, 0]
		public shown: chunk[] = []
		constructor(
			public galaxy: galaxy,
			public spread: number
		) {
		}
		visible(chunk: chunk) {
			return chunk.dist(this) < this.spread;
		}
		discovery() {
			for (let y = -this.spread; y < this.spread + 1; y++) {
				for (let x = -this.spread; x < this.spread + 1; x++) {
					let pos = pts.add(this.big, [x, y]);
					let chunk = grid_makes_sectors ? this.galaxy.at(pos) : this.galaxy.lookup(pos);
					if (!chunk)
						continue;
					if (this.shown.indexOf(chunk) == -1) {
						this.shown.push(chunk);
					}
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

	export class obj {
		static ids = 1
		id = 0
		type = 'an obj'
		name = 'rock'
		pos: vec2 = [0, 0]
		chunk: chunk | null = null
		random: any = {}
		constructor() {
			this.id = obj.ids++;
		}
		gather() {
			let sent = [this.random, this.id, this.pos, this.type, this.name];
			return sent;
		}
	}
}

export default lod;