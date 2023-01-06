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

	const chunk_minimum_lifetime = 10;

	const obj_default_lifetime = 30;

	const observer_makes_sectors = true;

	export const tick_rate = 1;

	// useful for new objects, use chunk.swap otherwise
	export function add(grid: grid, obj: obj): chunk {
		let chunk = grid.chart(grid.big(obj.pos));
		chunk.add(obj);
		return chunk;
	}

	export function remove(obj: obj) {
		const { chunk } = obj;
		if (chunk) {
			chunk.remove(obj);
		}
	}

	export class grid {
		list: obj[] = []
		chunks: chunk[] = []

		readonly arrays: chunk[][] = []
		constructor(readonly chunk_span) {
			
		}
		update_observer(observer: observer, pos: vec2) {
			observer.big = this.big(pos);
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
			let chuck = this.lookup(big);
			if (chuck)
				return chuck;
			chuck = this.arrays[big[1]][big[0]] = new chunk(big, this);
			return chuck;
		}
		big(units: vec2): vec2 {
			return pts.floor(pts.divide(units, this.chunk_span));
		}
		tick() {
			this.decays();
			hooks.call('lodTick', this);
			this.list = [];
			for (const chunk of this.chunks) {
				chunk.tick();
				this.list = this.list.concat(chunk.objs);
			}
			// todo sort rocks to go before spaceships
			for (const obj of this.list) {
				obj.tick();
			}
		}
		decays() {
			let i = this.chunks.length;
			while (i--) {
				const chunk = this.chunks[i];
				if (chunk.decay <= 0) {
					this.chunks.splice(i, 1);
					chunk.expire();
				}
				chunk.decay -= tick_rate;
			}
		}
	}

	export class chunk extends toggle {
		readonly objs: obj[] = []
		decay = chunk_minimum_lifetime
		constructor(
			readonly big: vec2,
			readonly grid: grid
		) {
			super();
		}
		dist(observer: observer) {
			return pts.distsimple(this.big, observer.big);
		}
		static swap(obj: obj) {
			const { chunk } = obj;
			if (!chunk)
				return;
			let chunkNew = chunk.grid.chart(chunk.grid.big(obj.pos));
			if (chunk != chunkNew) {
				chunk.remove(obj);
				chunkNew.add(obj);
				chunkNew.renew(obj);
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
		gather(observer: observer) {
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
			this.grid.chunks.push(this);
			// hooks.call('chunkRenew', this);
		}
		expire() {
			if (this.off())
				return;
			hooks.call('chunkExpire', this);
			//console.log('chunk expire');
		}
		tick() {
			hooks.call('chunkTick', this);
			//for (const obj of this.objs)
			//	obj.tick();
		}
	}

	export class observer {
		public big: vec2 = [0, 0]
		public chunks: chunk[] = []
		constructor(
			public galaxy: grid,
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
					let chunk = observer_makes_sectors ? this.galaxy.chart(pos) : this.galaxy.lookup(pos);
					if (!chunk)
						continue;
					if (this.chunks.indexOf(chunk) == -1)
						this.chunks.push(chunk);
					chunk.renew(null);
					chunk.observe();
				}
			}
		}
		gather() {
			let objects: object[] = [];
			for (let chunk of this.chunks) {
				objects = objects.concat(chunk.gather(this));
			}
			return objects;
		}
	}

	/*
	todo obj decay is not a good system.
	it extends obj lifetime by observation.
	meaning if the lod is unobserved for 16 seconds,
	then the obj decays and is removed.
	this doesnt imitate reality very well.

	the goal is to keep the lod cleaned up.
	if nobody sees obj x for 16 seconds, then presumably nobody
	would care beyond that time-span,
	and it is safe to destroy to unclutter the lod.
	*/
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
		decayed() {
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