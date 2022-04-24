import { Group } from "three";
import aabb2 from "./aabb2";
import pts from "./pts";
import space from "./space";
import ren from "./renderer";
import hooks from "./hooks";
export var numbers;
(function (numbers) {
    numbers.sectors = [0, 0];
    numbers.sprites = [0, 0];
    numbers.objs = [0, 0];
})(numbers || (numbers = {}));
;
class toggle {
    constructor() {
        this.active = false;
    }
    isActive() { return this.active; }
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
    const chunk_coloration = false;
    const grid_crawl_makes_sectors = true;
    lod.SectorSpan = 6;
    function register() {
        // hooks.create('sectorCreate')
        // hooks.create('sectorShow')
        // hooks.create('sectorHide')
        // hooks.register('sectorHide', () => { console.log('~'); return false; } );
    }
    lod.register = register;
    function project(unit) {
        return pts.mult(unit, space.size);
    }
    lod.project = project;
    function unproject(pixel) {
        return pts.divide(pixel, space.size);
    }
    lod.unproject = unproject;
    function add(obj) {
        let sector = lod.ggalaxy.at(lod.ggalaxy.big(obj.wpos));
        sector.add(obj);
    }
    lod.add = add;
    class galaxy {
        constructor(span) {
            this.arrays = [];
            lod.ggalaxy = this;
            new grid(2, 2);
        }
        update(wpos) {
            lod.ggrid.big = this.big(wpos);
            lod.ggrid.offs();
            lod.ggrid.crawl();
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
            s = this.arrays[big[1]][big[0]] = new sector(big, this);
            return s;
        }
        big(units) {
            return pts.floor(pts.divide(units, lod.SectorSpan));
        }
    }
    lod.galaxy = galaxy;
    class sector extends toggle {
        constructor(big, galaxy) {
            super();
            this.big = big;
            this.galaxy = galaxy;
            this.objs = [];
            if (chunk_coloration)
                this.color = (['red', 'blue', 'yellow', 'orange'])[Math.floor(Math.random() * 4)];
            let min = pts.mult(this.big, lod.SectorSpan);
            min = pts.add(min, [-1, -1]);
            let max = pts.add(min, [lod.SectorSpan, lod.SectorSpan]);
            this.small = new aabb2(max, min);
            this.group = new Group;
            this.group.frustumCulled = false;
            this.group.matrixAutoUpdate = false;
            numbers.sectors[1]++;
            galaxy.arrays[this.big[1]][this.big[0]] = this;
            //console.log('sector');
            hooks.call('sectorCreate', this);
        }
        objsro() {
            return this.objs;
        }
        add(obj) {
            let i = this.objs.indexOf(obj);
            if (i == -1) {
                this.objs.push(obj);
                obj.sector = this;
                if (this.isActive())
                    obj.show();
            }
        }
        stacked(wpos) {
            let stack = [];
            for (let obj of this.objs)
                if (pts.equals(wpos, pts.round(obj.wpos)))
                    stack.push(obj);
            return stack;
        }
        remove(obj) {
            let i = this.objs.indexOf(obj);
            if (i > -1) {
                obj.sector = null;
                return !!this.objs.splice(i, 1).length;
            }
        }
        swap(obj) {
            var _a;
            let newSector = this.galaxy.at(this.galaxy.big(pts.round(obj.wpos)));
            if (obj.sector != newSector) {
                (_a = obj.sector) === null || _a === void 0 ? void 0 : _a.remove(obj);
                newSector.add(obj);
                if (!newSector.isActive())
                    obj.hide();
            }
        }
        tick() {
            hooks.call('sectorTick', this);
            //for (let obj of this.objs)
            //	obj.tick();
        }
        show() {
            if (this.on())
                return;
            numbers.sectors[0]++;
            for (let obj of this.objs)
                obj.show();
            ren.scene.add(this.group);
            hooks.call('sectorShow', this);
        }
        hide() {
            if (this.off())
                return;
            numbers.sectors[0]--;
            for (let obj of this.objs)
                obj.hide();
            ren.scene.remove(this.group);
            hooks.call('sectorHide', this);
        }
        dist() {
            return pts.distsimple(this.big, lod.ggrid.big);
        }
    }
    lod.sector = sector;
    class grid {
        constructor(spread, outside) {
            this.spread = spread;
            this.outside = outside;
            this.big = [0, 0];
            this.shown = [];
            lod.ggrid = this;
            if (this.outside < this.spread) {
                console.warn(' outside less than spread ', this.spread, this.outside);
                this.outside = this.spread;
            }
        }
        visible(sector) {
            return sector.dist() < this.spread;
        }
        crawl() {
            // spread = -2; < 2
            for (let y = -this.spread; y < this.spread + 1; y++) {
                for (let x = -this.spread; x < this.spread + 1; x++) {
                    let pos = pts.add(this.big, [x, y]);
                    let sector = grid_crawl_makes_sectors ? lod.ggalaxy.at(pos) : lod.ggalaxy.lookup(pos);
                    if (!sector)
                        continue;
                    if (!sector.isActive()) {
                        this.shown.push(sector);
                        sector.show();
                    }
                }
            }
        }
        offs() {
            const noConcat = false;
            let allObjs = [];
            let i = this.shown.length;
            while (i--) {
                let sector;
                sector = this.shown[i];
                if (!noConcat)
                    allObjs = allObjs.concat(sector.objsro());
                sector.tick();
                if (sector.dist() > this.outside) {
                    sector.hide();
                    this.shown.splice(i, 1);
                }
            }
            for (let obj of allObjs)
                obj.tick();
        }
    }
    lod.grid = grid;
    ;
    class obj extends toggle {
        constructor(counts = numbers.objs) {
            super();
            this.counts = counts;
            this.type = 'an obj';
            this.wpos = [0, 0];
            this.rpos = [0, 0];
            this.size = [100, 100];
            this.ro = 0;
            this.z = 0; // z is only used by tiles
            this.height = 0;
            this.heightAdd = 0;
            this.counts[1]++;
        }
        finalize() {
            this.hide();
            this.counts[1]--;
        }
        show() {
            var _a;
            if (this.on())
                return;
            this.counts[0]++;
            this.create();
            this.update();
            (_a = this.shape) === null || _a === void 0 ? void 0 : _a.show();
        }
        hide() {
            var _a;
            if (this.off())
                return;
            this.counts[0]--;
            this.delete();
            (_a = this.shape) === null || _a === void 0 ? void 0 : _a.hide();
            // console.log(' obj.hide ');
        }
        wtorpos() {
            this.rpos = lod.project(this.wpos);
        }
        rtospos() {
            this.wtorpos();
            return pts.clone(this.rpos);
        }
        tick() {
        }
        create() {
            console.warn(' (lod) obj.create ');
        }
        delete() {
            // console.warn(' (lod) obj.delete ');
        }
        update() {
            var _a;
            this.wtorpos();
            this.bound();
            (_a = this.shape) === null || _a === void 0 ? void 0 : _a.update();
        }
        bound() {
            this.aabbScreen = new aabb2([0, 0], this.size);
            this.aabbScreen.translate(this.rpos);
        }
        mousedSquare(mouse) {
            var _a;
            if ((_a = this.aabbScreen) === null || _a === void 0 ? void 0 : _a.test(new aabb2(mouse, mouse)))
                return true;
        }
    }
    lod.obj = obj;
    ;
    class shape extends toggle {
        constructor(bindObj, counts) {
            super();
            this.bindObj = bindObj;
            this.counts = counts;
            this.bindObj.shape = this;
            this.counts[1]++;
        }
        update() {
        }
        create() {
        }
        dispose() {
        }
        finalize() {
            this.hide();
            this.counts[1]--;
        }
        show() {
            if (this.on())
                return;
            this.create();
            this.counts[0]++;
        }
        hide() {
            if (this.off())
                return;
            this.dispose();
            this.counts[0]--;
        }
    }
    lod.shape = shape;
})(lod || (lod = {}));
export default lod;
