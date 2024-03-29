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

	const chunk_unobserved_lifetime = 10;

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
		decay = chunk_unobserved_lifetime
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
			const chunkNew = chunk.grid.chart(chunk.grid.big(obj.pos));
			if (chunk != chunkNew) {
				chunk.remove(obj);
				chunkNew.add(obj);
				chunkNew.observe();
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
			this.decay = chunk_unobserved_lifetime;
			if (this.on())
				return;
			this.grid.chunks.push(this);
		}
		expire() {
			if (this.off())
				return;
			hooks.call('chunkExpire', this);
		}
		tick() {
			hooks.call('chunkTick', this);
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
					chunk.observe();
				}
			}
		}
		reset() {
			this.chunks = [];
		}
		gather() {
			let objects: object[] = [];
			for (let chunk of this.chunks) {
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
		constructor() {
			this.id = obj.ids++;
		}
		gather() {
			let sent = [
				this.random,
				this.id,
				this.pos,
				this.type,
				this.name,
			] as obj_tuple;
			return sent;
		}
		tick() {

		}
	}
}

export default lod;