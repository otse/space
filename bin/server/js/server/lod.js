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
    const chunk_span = 3;
    const chunk_minimum_lifetime = 10;
    const obj_default_lifetime = 16;
    const grid_makes_sectors = true;
    lod.tick_rate = 1;
    function add(obj) {
        let chunk = lod.guniverse.chart(lod.universe.big(obj.pos));
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
    class universe {
        constructor() {
            this.arrays = [];
            lod.guniverse = this;
        }
        update_observer(observer, pos) {
            observer.big = lod.universe.big(pos);
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
            let hunk = this.lookup(big);
            if (hunk)
                return hunk;
            hunk = this.arrays[big[1]][big[0]] = new chunk(big, this);
            return hunk;
        }
        static big(units) {
            return pts_1.default.floor(pts_1.default.divide(units, chunk_span));
        }
    }
    lod.universe = universe;
    class chunk extends toggle {
        constructor(big, galaxy) {
            super();
            this.big = big;
            this.galaxy = galaxy;
            this.objs = [];
            this.decay = chunk_minimum_lifetime;
        }
        dist(grid) {
            return pts_1.default.distsimple(this.big, grid.big);
        }
        static swap(obj) {
            let oldChunk = obj.chunk;
            let newChunk = oldChunk.galaxy.chart(lod.universe.big(obj.pos));
            if (oldChunk != newChunk) {
                oldChunk.remove(obj);
                newChunk.add(obj);
                newChunk.renew(obj);
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
        gather(grid) {
            let objects = [];
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
        renew(obj) {
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
            hooks_1.default.call('chunkExpire', this);
            console.log('chunk expire');
        }
        tick() {
            hooks_1.default.call('chunkTick', this);
            //for (const obj of this.objs)
            //	obj.tick();
            this.decay -= lod.tick_rate;
        }
        static tick() {
            hooks_1.default.call('lodTick', this);
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
    chunk.actives = [];
    chunk.list = [];
    lod.chunk = chunk;
    class observer {
        constructor(galaxy, spread) {
            this.galaxy = galaxy;
            this.spread = spread;
            this.big = [0, 0];
            this.grid = [];
        }
        visible(chunk) {
            return chunk.dist(this) < this.spread;
        }
        observe() {
            for (let y = -this.spread; y < this.spread + 1; y++) {
                for (let x = -this.spread; x < this.spread + 1; x++) {
                    let pos = pts_1.default.add(this.big, [x, y]);
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
            let objects = [];
            for (let chunk of this.grid) {
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
            this.decay = 0;
            this.lifetime = obj_default_lifetime;
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
            this.decay -= lod.tick_rate;
        }
    }
    obj.ids = 1;
    lod.obj = obj;
})(lod || (lod = {}));
exports.default = lod;
