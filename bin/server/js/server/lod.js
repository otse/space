"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pts_1 = require("../shared/pts");
var lod;
(function (lod) {
    const grid_makes_sectors = true;
    lod.ChunkSpan = 3;
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
            grid.discovery();
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
            let c = this.lookup(big);
            if (c)
                return c;
            c = this.arrays[big[1]][big[0]] = new chunk(big, this);
            return c;
        }
        static big(units) {
            return pts_1.default.floor(pts_1.default.divide(units, lod.ChunkSpan));
        }
    }
    lod.galaxy = galaxy;
    class chunk {
        constructor(big, galaxy) {
            this.big = big;
            this.galaxy = galaxy;
            this.objs = [];
            //galaxy.arrays[this.big[1]][this.big[0]] = this;
        }
        dist(grid) {
            return pts_1.default.distsimple(this.big, grid.big);
        }
        add(obj) {
            let i = this.objs.indexOf(obj);
            if (i == -1) {
                this.objs.push(obj);
                obj.chunk = this;
            }
        }
        remove(obj) {
            let i = this.objs.indexOf(obj);
            if (i > -1) {
                obj.chunk = null;
                this.objs.splice(i, 1);
            }
        }
        gather(grid) {
            let objects = [];
            for (let obj of this.objs)
                objects.push(obj.gather());
            return objects;
        }
    }
    lod.chunk = chunk;
    class grid {
        constructor(galaxy, spread) {
            this.galaxy = galaxy;
            this.spread = spread;
            this.big = [0, 0];
            this.shown = [];
        }
        visible(chunk) {
            return chunk.dist(this) < this.spread;
        }
        discovery() {
            for (let y = -this.spread; y < this.spread + 1; y++) {
                for (let x = -this.spread; x < this.spread + 1; x++) {
                    let pos = pts_1.default.add(this.big, [x, y]);
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
            let objects = [];
            for (let chunk of this.shown)
                objects = objects.concat(chunk.gather(this));
            return objects;
        }
    }
    lod.grid = grid;
    class obj {
        constructor() {
            this.id = 0;
            this.type = 'an obj';
            this.name = 'rock';
            this.pos = [0, 0];
            this.chunk = null;
            this.random = {};
            this.id = obj.ids++;
        }
        gather() {
            let sent = [this.random, this.id, this.pos, this.type, this.name];
            return sent;
        }
    }
    obj.ids = 1;
    lod.obj = obj;
})(lod || (lod = {}));
exports.default = lod;
