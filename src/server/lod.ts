import pts from "../shared/pts";

namespace lod {
	const grid_crawl_makes_sectors = true;

	const chunk_size = 10;

	export var SectorSpan = 3;

	export var ggalaxy: galaxy

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

	export class galaxy {
		readonly arrays: chunk[][] = []
		constructor() {
			ggalaxy = this;
		}
		update_grid(grid: grid, wpos: vec2) {
			grid.big = lod.galaxy.big(wpos);
			grid.offs();
			grid.ons();
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
			let s = this.lookup(big);
			if (s)
				return s;
			s = this.arrays[big[1]][big[0]] = new chunk(big, this);
			return s;
		}
		static big(units: vec2): vec2 {
			return pts.floor(pts.divide(units, SectorSpan));
		}
	}

	export class chunk extends toggle {
		public observers: grid[] = []
		constructor(
			public readonly big: vec2,
			readonly galaxy: galaxy
		) {
			super();
			galaxy.arrays[this.big[1]][this.big[0]] = this;
		}
		observe(grid: grid) {
			this.observers.push(grid);
		}
		unobserve(grid: grid) {
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
	}

	export class grid {
		big: vec2 = [0, 0]
		public shown: chunk[] = []
		constructor(
			public galaxy: galaxy,
			public spread: number,
			public outside: number
		) {
			if (this.outside < this.spread) {
				console.warn(' outside less than spread ', this.spread, this.outside);
				this.outside = this.spread;
			}
		}
		visible(chunk: chunk) {
			return chunk.dist(this) < this.spread;
		}
		ons() {
			for (let y = -this.spread; y < this.spread + 1; y++) {
				for (let x = -this.spread; x < this.spread + 1; x++) {
					let pos = pts.add(this.big, [x, y]);
					let chunk = grid_crawl_makes_sectors ? this.galaxy.at(pos) : this.galaxy.lookup(pos);
					if (!chunk)
						continue;
					if (this.shown.indexOf(chunk) == -1) {
						this.shown.push(chunk);
						chunk.observe(this);
						chunk.show();
					}
				}
			}
		}
		offs() {
			let i = this.shown.length;
			while (i--) {
				const sector = this.shown[i];
				if (sector.dist(this) > this.outside) {
					sector.unobserve(this);
					sector.hide();
					this.shown.splice(i, 1);
				}
			}
		}
		gather() {
			let packages: object[] = [];
			for (let sector of this.shown) {
				//packages = packages.concat(
				//	sector.gather(this));
				// packages = packages.concat(sector.gather(this));
			}
			return packages;
		}
	}
}

export default lod;