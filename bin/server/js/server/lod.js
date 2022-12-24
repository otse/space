"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pts_1 = require("../shared/pts");
var lod;
(function (lod) {
    const grid_crawl_makes_sectors = true;
    const chunk_size = 10;
    lod.SectorSpan = 3;
    class toggle {
        constructor() {
            this.active = false;
        }
        is_active() { return this.active; }
        ;
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
    class galaxy {
        constructor() {
            this.arrays = [];
            lod.ggalaxy = this;
        }
        update_grid(grid, wpos) {
            grid.big = lod.galaxy.big(wpos);
            grid.offs();
            grid.ons();
        }
        lookup(big) {
            if (this.arrays[big[1]] == undefined)
                this.arrays[big[1]] = [];
            return this.arrays[big[1]][big[0]];
        }
        at(big) {
            return this.lookup(big) || this.make(big);
        }
        make(big) {
            let s = this.lookup(big);
            if (s)
                return s;
            s = this.arrays[big[1]][big[0]] = new chunk(big, this);
            return s;
        }
        static big(units) {
            return pts_1.default.floor(pts_1.default.divide(units, lod.SectorSpan));
        }
    }
    lod.galaxy = galaxy;
    class chunk extends toggle {
        constructor(big, galaxy) {
            super();
            this.big = big;
            this.galaxy = galaxy;
            this.observers = [];
            galaxy.arrays[this.big[1]][this.big[0]] = this;
        }
        observe(grid) {
            this.observers.push(grid);
        }
        unobserve(grid) {
            for (let i = this.observers.length - 1; i >= 0; i--) {
                const observer = this.observers[i];
                if (observer == grid) {
                    this.observers.splice(i, 1);
                    break;
                }
            }
        }
        dist(grid) {
            return pts_1.default.distsimple(this.big, grid.big);
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
    lod.chunk = chunk;
    class grid {
        constructor(galaxy, spread, outside) {
            this.galaxy = galaxy;
            this.spread = spread;
            this.outside = outside;
            this.big = [0, 0];
            this.shown = [];
            if (this.outside < this.spread) {
                console.warn(' outside less than spread ', this.spread, this.outside);
                this.outside = this.spread;
            }
        }
        visible(chunk) {
            return chunk.dist(this) < this.spread;
        }
        ons() {
            for (let y = -this.spread; y < this.spread + 1; y++) {
                for (let x = -this.spread; x < this.spread + 1; x++) {
                    let pos = pts_1.default.add(this.big, [x, y]);
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
            let packages = [];
            for (let sector of this.shown) {
                //packages = packages.concat(
                //	sector.gather(this));
                // packages = packages.concat(sector.gather(this));
            }
            return packages;
        }
    }
    lod.grid = grid;
})(lod || (lod = {}));
exports.default = lod;
