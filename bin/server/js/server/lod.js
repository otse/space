"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hooks_1 = require("../shared/hooks");
const pts_1 = require("../shared/pts");
class toggle {
    constructor() {
        this.active = false;
    }
    isActive() { return this.active; }
    ;
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
var lod;
(function (lod) {
    const chunk_unobserved_lifetime = 10;
    const observer_makes_sectors = true;
    lod.tick_rate = 1;
    // useful for new objects, use chunk.swap otherwise
    function add(grid, obj) {
        let chunk = grid.chart(grid.big(obj.pos));
        chunk.add(obj);
        return chunk;
    }
    lod.add = add;
    function remove(obj) {
        const { chunk } = obj;
        if (chunk) {
            chunk.remove(obj);
        }
    }
    lod.remove = remove;
    class grid {
        constructor(chunk_span) {
            this.chunk_span = chunk_span;
            this.list = [];
            this.chunks = [];
            this.arrays = [];
        }
        update_observer(observer, pos) {
            observer.big = this.big(pos);
            observer.observe();
        }
        lookup(big) {
            if (this.arrays[big[1]] == undefined)
                this.arrays[big[1]] = [];
            return this.arrays[big[1]][big[0]];
        }
        chart(big) {
            return this.lookup(big) || this.make(big);
        }
        make(big) {
            let chuck = this.lookup(big);
            if (chuck)
                return chuck;
            chuck = this.arrays[big[1]][big[0]] = new chunk(big, this);
            return chuck;
        }
        big(units) {
            return pts_1.default.floor(pts_1.default.divide(units, this.chunk_span));
        }
        tick() {
            this.decays();
            hooks_1.default.call('lodTick', this);
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
                chunk.decay -= lod.tick_rate;
            }
        }
    }
    lod.grid = grid;
    class chunk extends toggle {
        constructor(big, grid) {
            super();
            this.big = big;
            this.grid = grid;
            this.objs = [];
            this.decay = chunk_unobserved_lifetime;
        }
        dist(observer) {
            return pts_1.default.distsimple(this.big, observer.big);
        }
        static swap(obj) {
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
        gather(observer) {
            let objects = [];
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
            hooks_1.default.call('chunkExpire', this);
        }
        tick() {
            hooks_1.default.call('chunkTick', this);
        }
    }
    lod.chunk = chunk;
    class observer {
        constructor(galaxy, spread) {
            this.galaxy = galaxy;
            this.spread = spread;
            this.big = [0, 0];
            this.chunks = [];
        }
        visible(chunk) {
            return chunk.dist(this) < this.spread;
        }
        observe() {
            for (let y = -this.spread; y < this.spread + 1; y++) {
                for (let x = -this.spread; x < this.spread + 1; x++) {
                    let pos = pts_1.default.add(this.big, [x, y]);
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
            let objects = [];
            for (let chunk of this.chunks) {
                objects = objects.concat(chunk.gather(this));
            }
            return objects;
        }
    }
    lod.observer = observer;
    class obj {
        constructor() {
            this.id = 0;
            this.type = 'an obj';
            this.name = 'some obj';
            this.pos = [0, 0];
            this.chunk = null;
            this.random = {};
            this.id = obj.ids++;
        }
        gather() {
            let sent = [
                this.random,
                this.id,
                this.pos,
                this.type,
                this.name,
            ];
            return sent;
        }
        tick() {
        }
    }
    obj.ids = 1;
    lod.obj = obj;
})(lod || (lod = {}));
exports.default = lod;
