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

	const chunk_default_decay = 8;

	const obj_default_decay = 16;

	const grid_makes_sectors = true;

	export const tick_rate = 1;

	export var guniverse: universe

	export function add(obj: obj) {
		let chunk = guniverse.at(lod.universe.big(obj.pos));
		chunk.add(obj);
	}

	export function remove(obj: obj) {
		const { chunk } = obj;
		if (chunk) {
			chunk.remove(obj);
		}
	}

	export class universe {
		readonly arrays: chunk[][] = []
		readonly chunks: chunk[] = []
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
		at(big: vec2): chunk {
			return this.lookup(big) || this.make(big);
		}
		protected make(big): chunk {
			let hun = this.lookup(big);
			if (hun)
				return hun;
			hun = this.arrays[big[1]][big[0]] = new chunk(big, this);
			this.chunks.push(hun);
			return hun;
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
		decay = chunk_default_decay
		constructor(
			public readonly big: vec2,
			readonly galaxy: universe
		) {
			super();
			//galaxy.arrays[this.big[1]][this.big[0]] = this;
		}
		dist(grid: observer) {
			return pts.distsimple(this.big, grid.big);
		}
		static swap(obj: obj) {
			let oldChunk = obj.chunk!;
			let newChunk = oldChunk.galaxy.at(lod.universe.big(obj.pos));
			if (oldChunk != newChunk) {
				oldChunk.remove(obj);
				newChunk.add(obj);
				newChunk.renew();
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
			for (let obj of this.objs)
				objects.push(obj.gather());
			return objects;
		}
		renew() {
			this.decay = chunk_default_decay;
			if (this.on())
				return;
			chunk.actives.push(this);
			hooks.call('chunkRenew', this);
		}
		expire() {
			if (this.off())
				return;
			hooks.call('chunkExpire', this);
			console.log('expire');
		}
		tick() {
			hooks.call('chunkTick', this);
			//for (const obj of this.objs)
			//	obj.tick();
			this.decay -= tick_rate;
		}
		static tick() {
			// todo move this to universe
			this.list = [];
			for (const chunk of this.actives)
				this.list = this.list.concat(chunk.objs);
			// todo sort visibles
			for (const obj of this.list)
				obj.tick();
			let i = chunk.actives.length;
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
					let chunk = grid_makes_sectors ? this.galaxy.at(pos) : this.galaxy.lookup(pos);
					if (!chunk)
						continue;
					if (this.grid.indexOf(chunk) == -1)
						this.grid.push(chunk);
					chunk.renew();
				}
			}
		}
		gather() {
			let objects: object[] = [];
			for (let chunk of this.grid)
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
		decay = obj_default_decay
		constructor() {
			this.id = obj.ids++;
		}
		gather() {
			let sent = [this.random, this.id, this.pos, this.type, this.name];
			return sent;
		}
		tick() {
			// override me
			this.decay -= tick_rate;
		}
	}
}

export default lod;