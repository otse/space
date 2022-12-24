"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pts_1 = require("../shared/pts");
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
var lod;
(function (lod) {
    const grid_makes_sectors = true;
    const chunk_size = 10;
    lod.SectorSpan = 3;
    function add(obj) {
        let chunk = lod.ggalaxy.at(lod.galaxy.big(pts_1.default.round(obj.pos)));
        chunk.add(obj);
    }
    lod.add = add;
    function remove(obj) {
        const { chunk } = obj;
        if (chunk) {
            chunk.remove(obj);
        }
    }
    lod.remove = remove;
    class galaxy {
        constructor() {
            this.arrays = [];
            lod.ggalaxy = this;
        }
        update_grid(grid, wpos) {
            grid.big = lod.galaxy.big(wpos);
            grid.ons();
            grid.offs();
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
            let chun = this.lookup(big);
            if (chun)
                return chun;
            chun = this.arrays[big[1]][big[0]] = new chunk(big, this);
            return chun;
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
            this.objs = [];
            //galaxy.arrays[this.big[1]][this.big[0]] = this;
        }
        observe(grid) {
            return;
            this.observers.push(grid);
        }
        unobserve(grid) {
            return;
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
        add(obj) {
            let i = this.objs.indexOf(obj);
            if (i == -1) {
                this.objs.push(obj);
                obj.chunk = this;
                //if (this.is_active() && !obj.is_active())
                //	obj.show();
            }
        }
        remove(obj) {
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
        gather(grid) {
            let gathers = [];
            for (let obj of this.objs) {
                gathers.push(obj.gather());
            }
            return gathers;
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
            if (this.outside < this.spread)
                this.outside = this.spread;
        }
        visible(chunk) {
            return chunk.dist(this) < this.spread;
        }
        ons() {
            for (let y = -this.spread; y < this.spread + 1; y++) {
                for (let x = -this.spread; x < this.spread + 1; x++) {
                    let pos = pts_1.default.add(this.big, [x, y]);
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
            let objects = [];
            for (let chunk of this.shown)
                objects = objects.concat(chunk.gather(this));
            return objects;
        }
    }
    lod.grid = grid;
    class obj extends toggle {
        constructor() {
            super();
            this.chunk = null;
            this.id = 0;
            this.type = 'an sobj';
            this.pos = [0, 0];
        }
        gather() {
            let sent = [{}, this.id, this.pos, this.type];
            return sent;
        }
    }
    lod.obj = obj;
})(lod || (lod = {}));
exports.default = lod;
