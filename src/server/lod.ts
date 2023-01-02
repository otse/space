import hooks from "../shared/hooks";
import pts from "../shared/pts";

class toggle {
	protected active = false;
	isActive() { return this.active };
	on() {
		if (this.active)
			return true;
		this.active = true;
		return false;
	}
	off() {
		if (!this.active)
			return true;
		this.active = false;
		return false;
	}
}

namespace lod {

	const chunk_span = 3;

	const chunk_minimum_lifetime = 10;
	
	const obj_default_lifetime = 16;

	const grid_makes_sectors = true;

	export const tick_rate = 1;

	export var guniverse: universe

	export function add(obj: obj): chunk {
		let chunk = guniverse.chart(lod.universe.big(obj.pos));
		chunk.add(obj);
		return chunk;
	}

	export function remove(obj: obj) {
		const { chunk } = obj;
		if (chunk) {
			chunk.remove(obj);
		}
	}

	export class universe {
		readonly arrays: chunk[][] = []
		constructor() {
			guniverse = this;
		}
		update_observer(observer: observer, pos: vec2) {
			observer.big = lod.universe.big(pos);
			observer.observe();
		}
		lookup(big: vec2): chunk | undefined {
			if (this.arrays[big[1]] == undefined)
				this.arrays[big[1]] = [];
			return this.arrays[big[1]][big[0]];
		}
		chart(big: vec2): chunk {
			return this.lookup(big) || this.make(big);
		}
		protected make(big): chunk {
			let hunk = this.lookup(big);
			if (hunk)
				return hunk;
			hunk = this.arrays[big[1]][big[0]] = new chunk(big, this);
			return hunk;
		}
		static big(units: vec2): vec2 {
			return pts.floor(pts.divide(units, chunk_span));
		}
		/*
		tick() {
			let i = this.chunks.length;
			while (i--) {
				const chunk = this.chunks[i];
				chunk.tick();
				if (chunk.decay <= 0) {
					chunk.expire();
					const { big } = chunk;
					this.chunks.splice(i, 1);
				}
			}
		}
		*/
	}

	export class chunk extends toggle {
		static actives: chunk[] = []
		static list: obj[] = []
		readonly objs: obj[] = []
		decay = chunk_minimum_lifetime
		constructor(
			readonly big: vec2,
			readonly galaxy: universe
		) {
			super();
		}
		dist(grid: observer) {
			return pts.distsimple(this.big, grid.big);
		}
		static swap(obj: obj) {
			let oldChunk = obj.chunk!;
			let newChunk = oldChunk.galaxy.chart(lod.universe.big(obj.pos));
			if (oldChunk != newChunk) {
				oldChunk.remove(obj);
				newChunk.add(obj);
				newChunk.renew(obj);
			}
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
		gather(grid: observer) {
			let objects: object[] = [];
			for (let obj of this.objs) {
				objects.push(obj.gather());
			}
			return objects;
		}
		observe() {
			for (const obj of this.objs) {
				obj.observe();
			}
		}
		renew(obj: obj | null) {
			const chunk_decay_padding = 2;
			if (obj)
				this.decay = Math.max(obj.decay + chunk_decay_padding, chunk_minimum_lifetime);
			else
				this.decay = chunk_minimum_lifetime;
			if (this.on())
				return;
			chunk.actives.push(this);
			// hooks.call('chunkRenew', this);
		}
		expire() {
			if (this.off())
				return;
			hooks.call('chunkExpire', this);
			console.log('chunk expire');
			
		}
		tick() {
			hooks.call('chunkTick', this);
			//for (const obj of this.objs)
			//	obj.tick();
			this.decay -= tick_rate;
		}
		static tick() {
			hooks.call('lodTick', this);
			// todo move this to universe ?
			chunk.decays();
			this.list = [];
			for (const chunk of this.actives) {
				this.list = this.list.concat(chunk.objs);
			}
			// todo sort visibles
			for (const obj of this.list) {
				obj.tick();
			}
		}
		static decays() {
			let i = this.actives.length;
			while (i--) {
				const chunk = this.actives[i];
				chunk.tick();
				if (chunk.decay <= 0) {
					this.actives.splice(i, 1);
					chunk.expire();
				}
			}
		}
	}

	export class observer {
		public big: vec2 = [0, 0]
		public grid: chunk[] = []
		constructor(
			public galaxy: universe,
			public spread: number
		) {
		}
		visible(chunk: chunk) {
			return chunk.dist(this) < this.spread;
		}
		observe() {
			for (let y = -this.spread; y < this.spread + 1; y++) {
				for (let x = -this.spread; x < this.spread + 1; x++) {
					let pos = pts.add(this.big, [x, y]);
					let chunk = grid_makes_sectors ? this.galaxy.chart(pos) : this.galaxy.lookup(pos);
					if (!chunk)
						continue;
					if (this.grid.indexOf(chunk) == -1)
						this.grid.push(chunk);
					chunk.renew(null);
					chunk.observe();
				}
			}
		}
		gather() {
			let objects: object[] = [];
			for (let chunk of this.grid) {
				objects = objects.concat(chunk.gather(this));
			}
			return objects;
		}
	}

	export class obj {
		static ids = 1
		id = 0
		type = 'an obj'
		name = 'some obj'
		pos: vec2 = [0, 0]
		chunk: chunk | null = null
		random: any = {}
		decay = 0
		lifetime = obj_default_lifetime
		constructor() {
			this.id = obj.ids++;
			this.observe();
		}
		gather() {
			let sent = [this.random, this.id, this.pos, this.type, this.name];
			return sent;
		}
		observe() {
			this.decay = this.lifetime;
		}
		pretick() {
			if (this.decay <= 0) {
				lod.remove(this);
				console.log(` ${this.type} expired into intergalactic space `);
				return true;
			}
			return false;
		}
		tick() {
			/// override
			this.decay -= tick_rate;
		}
	}
}

export default lod;