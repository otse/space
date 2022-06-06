var space = (function (THREE) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var THREE__default = /*#__PURE__*/_interopDefaultLegacy(THREE);

    class pts {
        static pt(a) {
            return { x: a[0], y: a[1] };
        }
        static clone(zx) {
            return [zx[0], zx[1]];
        }
        static make(n, m) {
            return [n, m];
        }
        static to_string(a) {
            const pr = (b) => b != undefined ? `, ${b}` : '';
            return `${a[0]}, ${a[1]}` + pr(a[2]) + pr(a[3]);
        }
        static fixed(a) {
            return [a[0]];
        }
        static func(bb, callback) {
            let y = bb.min[1];
            for (; y <= bb.max[1]; y++) {
                let x = bb.max[0];
                for (; x >= bb.min[0]; x--) {
                    callback([x, y]);
                }
            }
        }
        static project(a) {
            return [a[0] / 2 + a[1] / 2, a[1] / 4 - a[0] / 4];
        }
        static unproject(a) {
            return [a[0] - a[1] * 2, a[1] * 2 + a[0]];
        }
        static equals(a, b) {
            return a[0] == b[0] && a[1] == b[1];
        }
        //static range(a: vec2, b: vec2): boolean {
        //	return true 
        //}
        /*
        static clamp(a: vec2, min: vec2, max: vec2): vec2 {
            const clamp = (val, min, max) =>
                val > max ? max : val < min ? min : val;
            return [clamp(a[0], min[0], max[0]), clamp(a[1], min[1], max[1])];
        }
        */
        static floor(a) {
            return [Math.floor(a[0]), Math.floor(a[1])];
        }
        static ceil(a) {
            return [Math.ceil(a[0]), Math.ceil(a[1])];
        }
        static round(a) {
            return [Math.round(a[0]), Math.round(a[1])];
        }
        static inv(a) {
            return [-a[0], -a[1]];
        }
        static mult(a, n, m) {
            return [a[0] * n, a[1] * (m || n)];
        }
        static mults(a, b) {
            return [a[0] * b[0], a[1] * b[1]];
        }
        static divide(a, n, m) {
            return [a[0] / n, a[1] / (m || n)];
        }
        static divides(a, b) {
            return [a[0] / b[0], a[1] / b[1]];
        }
        static subtract(a, b) {
            return [a[0] - b[0], a[1] - b[1]];
        }
        static add(a, b) {
            return [a[0] + b[0], a[1] + b[1]];
        }
        static addn(a, b) {
            return [a[0] + b, a[1] + b];
        }
        static abs(a) {
            return [Math.abs(a[0]), Math.abs(a[1])];
        }
        static min(a, b) {
            return [Math.min(a[0], b[0]), Math.min(a[1], b[1])];
        }
        static max(a, b) {
            return [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
        }
        static together(zx) {
            return zx[0] + zx[1];
        }
        static uneven(a, n = -1) {
            let b = pts.clone(a);
            if (b[0] % 2 != 1) {
                b[0] += n;
            }
            if (b[1] % 2 != 1) {
                b[1] += n;
            }
            return b;
        }
        static even(a, n = -1) {
            let b = pts.clone(a);
            if (b[0] % 2 != 0) {
                b[0] += n;
            }
            if (b[1] % 2 != 0) {
                b[1] += n;
            }
            return b;
        }
        static angle(a, b) {
            return -Math.atan2(a[0] - b[0], a[1] - b[1]);
        }
        // https://vorg.github.io/pex/docs/pex-geom/Vec2.html
        static dist(a, b) {
            let dx = b[0] - a[0];
            let dy = b[1] - a[1];
            return Math.sqrt(dx * dx + dy * dy);
        }
        static distsimple(a, b) {
            let c = pts.abs(pts.subtract(a, b));
            return Math.max(c[0], c[1]);
        }
        ;
    }

    var TEST;
    (function (TEST) {
        TEST[TEST["Outside"] = 0] = "Outside";
        TEST[TEST["Inside"] = 1] = "Inside";
        TEST[TEST["Overlap"] = 2] = "Overlap";
    })(TEST || (TEST = {}));
    class aabb2 {
        constructor(a, b) {
            this.min = this.max = [...a];
            if (b) {
                this.extend(b);
            }
        }
        static dupe(bb) {
            return new aabb2(bb.min, bb.max);
        }
        extend(v) {
            this.min = pts.min(this.min, v);
            this.max = pts.max(this.max, v);
        }
        diagonal() {
            return pts.subtract(this.max, this.min);
        }
        center() {
            return pts.add(this.min, pts.mult(this.diagonal(), 0.5));
        }
        translate(v) {
            this.min = pts.add(this.min, v);
            this.max = pts.add(this.max, v);
        }
        test(b) {
            if (this.max[0] < b.min[0] || this.min[0] > b.max[0] ||
                this.max[1] < b.min[1] || this.min[1] > b.max[1])
                return 0;
            if (this.min[0] <= b.min[0] && this.max[0] >= b.max[0] &&
                this.min[1] <= b.min[1] && this.max[1] >= b.max[1])
                return 1;
            return 2;
        }
    }
    aabb2.TEST = TEST;

    var ren;
    (function (ren) {
        ren.DPI_UPSCALED_RT = true;
        ren.ndpi = 1;
        ren.delta = 0;
        ren.screen = [0, 0];
        ren.screenCorrected = [0, 0];
        function render() {
            ren.renderer.setRenderTarget(null);
            ren.renderer.clear();
            ren.renderer.render(ren.scene, ren.camera);
        }
        ren.render = render;
        function update() {
            ren.delta = ren.clock.getDelta();
            if (ren.delta > 2)
                ren.delta = 0.016;
            ren.delta *= 60.0;
        }
        ren.update = update;
        function init() {
            console.log('ren init');
            ren.clock = new THREE.Clock();
            ren.scene = new THREE.Scene();
            //scene.background = new Color('#333');
            ren.group = new THREE.Group;
            ren.scene.add(ren.group);
            ren.ambientLight = new THREE.AmbientLight(0xffffff);
            ren.scene.add(ren.ambientLight);
            if (ren.DPI_UPSCALED_RT)
                ren.ndpi = window.devicePixelRatio;
            ren.renderer = new THREE.WebGLRenderer({ antialias: false });
            ren.renderer.setPixelRatio(ren.ndpi);
            ren.renderer.setSize(100, 100);
            ren.renderer.autoClear = true;
            ren.renderer.setClearColor(0xffffff, 0);
            window.addEventListener('resize', onWindowResize, false);
            document.body.appendChild(ren.renderer.domElement);
            onWindowResize();
            window.ren = ren;
        }
        ren.init = init;
        function onWindowResize() {
            ren.screen = [window.innerWidth, window.innerHeight];
            //screen = pts.divide(screen, 2);
            ren.screen = pts.floor(ren.screen);
            //screen = pts.even(screen, -1);
            //screen = [800, 600];
            ren.screenCorrected = pts.clone(ren.screen);
            if (ren.DPI_UPSCALED_RT) {
                //screen = pts.floor(screen);
                ren.screenCorrected = pts.mult(ren.screen, ren.ndpi);
                ren.screenCorrected = pts.floor(ren.screenCorrected);
                ren.screenCorrected = pts.even(ren.screenCorrected, -1);
            }
            console.log(`
		window inner ${pts.to_string(ren.screen)}\n
		      new is ${pts.to_string(ren.screenCorrected)}`);
            ren.camera = ortographic_camera(ren.screenCorrected[0], ren.screenCorrected[1]);
            ren.camera = ortographic_camera(ren.screenCorrected[0], ren.screenCorrected[1]);
            ren.camera.updateProjectionMatrix();
            ren.renderer.setSize(ren.screen[0], ren.screen[1]);
        }
        function ortographic_camera(w, h) {
            let camera = new THREE.OrthographicCamera(w / -2, w / 2, h / 2, h / -2, -10000, 10000);
            camera.updateProjectionMatrix();
            return camera;
        }
        ren.ortographic_camera = ortographic_camera;
        let mem = [];
        function load_texture(file, mode = 1, cb, key) {
            if (mem[key || file])
                return mem[key || file];
            let texture = new THREE.TextureLoader().load(file + `?v=${app$1.salt}`, cb);
            texture.generateMipmaps = false;
            texture.center.set(0, 1);
            texture.wrapS = texture.wrapT = THREE__default["default"].RepeatWrapping;
            if (mode) {
                texture.magFilter = THREE__default["default"].LinearFilter;
                texture.minFilter = THREE__default["default"].LinearFilter;
            }
            else {
                texture.magFilter = THREE__default["default"].NearestFilter;
                texture.minFilter = THREE__default["default"].NearestFilter;
            }
            mem[key || file] = texture;
            return texture;
        }
        ren.load_texture = load_texture;
    })(ren || (ren = {}));
    var ren$1 = ren;

    // inspired by gmod lua !
    class hooks {
        //static readonly table: { [name: string]: func[] } = {}
        //list: func[] = []
        static register(name, f) {
            if (!hooks[name])
                hooks[name] = [];
            hooks[name].push(f);
        }
        static unregister(name, f) {
            hooks[name] = hooks[name].filter(e => e != f);
        }
        static call(name, x) {
            if (!hooks[name])
                return;
            for (let i = hooks[name].length; i--;)
                if (hooks[name][i](x))
                    return;
        }
    }

    var numbers;
    (function (numbers) {
        numbers.sectors = [0, 0];
        numbers.sprites = [0, 0];
        numbers.objs = [0, 0];
    })(numbers || (numbers = {}));
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
        lod.chunk_coloration = false;
        lod.grid_crawl_makes_sectors = true;
        lod.SectorSpan = 8;
        function register() {
            // hooks.create('sectorCreate')
            // hooks.create('sectorShow')
            // hooks.create('sectorHide')
            // hooks.register('sectorHide', () => { console.log('~'); return false; } );
        }
        lod.register = register;
        function project(unit) {
            return pts.mult(unit, space$1.size);
        }
        lod.project = project;
        function unproject(pixel) {
            return pts.divide(pixel, space$1.size);
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
                new grid(3, 3);
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
                if (lod.chunk_coloration)
                    this.color = (['red', 'blue', 'yellow', 'orange'])[Math.floor(Math.random() * 4)];
                let min = pts.mult(this.big, lod.SectorSpan);
                min = pts.add(min, [-1, -1]);
                let max = pts.add(min, [lod.SectorSpan, lod.SectorSpan]);
                this.small = new aabb2(max, min);
                this.group = new THREE.Group;
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
                ren$1.scene.add(this.group);
                hooks.call('sectorShow', this);
            }
            hide() {
                if (this.off())
                    return;
                numbers.sectors[0]--;
                for (let obj of this.objs)
                    obj.hide();
                ren$1.scene.remove(this.group);
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
                        let sector = lod.grid_crawl_makes_sectors ? lod.ggalaxy.at(pos) : lod.ggalaxy.lookup(pos);
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
                let allObjs = [];
                let i = this.shown.length;
                while (i--) {
                    let sector;
                    sector = this.shown[i];
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
    var lod$1 = lod;

    var sprites;
    (function (sprites) {
        function start() {
        }
        sprites.start = start;
        sprites.test100 = [[100, 100], [100, 100], 0, 'tex/test100'];
        sprites.asteroid = [[512, 512], [512, 512], 0, 'tex/pngwing.com'];
        function get_uv_transform(cell, tuple) {
            let divide = pts.divides(tuple[1], tuple[0]);
            let offset = pts.mults(divide, cell);
            let repeat = divide;
            let center = [0, 1];
            let mat = new THREE.Matrix3;
            mat.setUvTransform(offset[0], offset[1], repeat[0], repeat[1], 0, center[0], center[1]);
            return mat;
        }
        sprites.get_uv_transform = get_uv_transform;
    })(sprites || (sprites = {}));
    var sprites$1 = sprites;

    class sprite extends lod$1.shape {
        constructor(vars) {
            super(vars.binded, numbers.sprites);
            this.vars = vars;
            this.dime = true;
            this.rup = 0;
            this.rleft = 0;
            this.roffset = [0, 0];
            if (!this.vars.cell)
                this.vars.cell = [0, 0];
            if (!this.vars.order)
                this.vars.order = 0;
            if (!this.vars.opacity)
                this.vars.opacity = 1;
            this.myUvTransform = new THREE.Matrix3;
            this.myUvTransform.setUvTransform(0, 0, 1, 1, 0, 0, 1);
        }
        update() {
            if (!this.mesh)
                return;
            const obj = this.vars.binded;
            let calc = obj.rpos;
            //if (this.dime)
            // move bottom left corner
            calc = pts.add(obj.rpos, pts.divide(obj.size, 2));
            //else
            //	calc = pts.add(obj.rpos, [0, obj.size[1]]);
            pts.round(obj.wpos);
            calc = pts.add(calc, [this.rleft, this.rup]);
            if (this.mesh) {
                this.retransform();
                this.mesh.position.fromArray([...calc, 0]);
                this.mesh.updateMatrix();
                //this.mesh.renderOrder = -pos[1] + pos[0] + this.vars.order!;
                this.mesh.rotation.z = this.vars.binded.ro;
            }
        }
        retransform() {
            this.myUvTransform.copy(sprites$1.get_uv_transform(this.vars.cell, this.vars.tuple));
        }
        dispose() {
            var _a, _b, _c;
            if (!this.mesh)
                return;
            (_a = this.geometry) === null || _a === void 0 ? void 0 : _a.dispose();
            (_b = this.material) === null || _b === void 0 ? void 0 : _b.dispose();
            (_c = this.mesh.parent) === null || _c === void 0 ? void 0 : _c.remove(this.mesh);
        }
        create() {
            var _a;
            this.vars.binded;
            this.retransform();
            this.geometry = new THREE.PlaneBufferGeometry(this.vars.binded.size[0], this.vars.binded.size[1]);
            let color;
            if (lod$1.chunk_coloration) {
                color = this.vars.binded.sector.color;
            }
            this.material = SpriteMaterial({
                map: ren$1.load_texture(`${this.vars.tuple[3]}.png`, 0),
                transparent: true,
                color: color || '#ffffff',
                opacity: this.vars.opacity
                //wireframe: true
            }, {
                myUvTransform: this.myUvTransform
            });
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.frustumCulled = false;
            this.mesh.matrixAutoUpdate = false;
            this.update();
            (_a = this.vars.binded.sector) === null || _a === void 0 ? void 0 : _a.group.add(this.mesh);
            ren$1.group.add(this.mesh);
        }
    }
    function SpriteMaterial(parameters, uniforms) {
        let material = new THREE.MeshBasicMaterial(parameters);
        material.customProgramCacheKey = function () {
            return 'spritemat';
        };
        material.name = "spritemat";
        material.onBeforeCompile = function (shader) {
            shader.defines = {};
            shader.uniforms.myUvTransform = { value: uniforms.myUvTransform };
            shader.vertexShader = shader.vertexShader.replace(`#include <common>`, `#include <common>
			uniform mat3 myUvTransform;
			`);
            shader.vertexShader = shader.vertexShader.replace(`#include <uv_vertex>`, `
			#ifdef USE_UV
			vUv = ( myUvTransform * vec3( uv, 1 ) ).xy;
			#endif
			`);
        };
        return material;
    }

    var testing_chamber;
    (function (testing_chamber) {
        testing_chamber.started = false;
        function start() {
            console.log(' start testing chamber ');
            console.log('placing squares on game area that should take up 1:1 pixels on screen...');
            console.log('...regardless of your os or browsers dpi setting');
            // document.title = 'testing chamber';
            space$1.gview.zoom = 1;
            space$1.gview.wpos = [0, 0];
            space$1.gview.rpos = lod$1.unproject([0, 0]);
            hooks.register('sectorCreate', (x) => {
                console.log('(testing chamber) create sector');
                let rock = new Asteroid;
                let dif = pts.subtract(x.small.max, x.small.min);
                let pos = [dif[0] * Math.random(), dif[1] * Math.random()];
                pos = pts.add(pos, x.small.min);
                pos = pts.add(pos, [-1, -1]);
                rock.wpos = pos;
                lod$1.add(rock);
                return false;
            });
            hooks.register('viewClick', (view) => {
                console.log(' asteorid! ');
                let rock = new Asteroid;
                rock.wpos = space$1.gview.mwpos;
                //rock.wpos = pts.add(space.gview.mwpos, [-1, -1]);
                //lod.add(rock);
                return false;
            });
            // lod.SectorSpan = 8;
            // new lod.grid(3, 3);
            for (let y = 0; y < 20; y++) {
                for (let x = 0; x < 20; x++) {
                    let square = Square.make();
                    square.wpos = [x, y];
                    //lod.add(square);
                }
            }
            testing_chamber.started = true;
        }
        testing_chamber.start = start;
        function tick() {
        }
        testing_chamber.tick = tick;
        class Asteroid extends lod$1.obj {
            constructor() {
                super(undefined);
                this.float = pts.make((Math.random() - 0.5) / Asteroid.slowness, (Math.random() - 0.5) / Asteroid.slowness);
                this.rate = (Math.random() - 0.5) / (Asteroid.slowness * 6);
            }
            create() {
                this.size = [100, 100];
                this.size = pts.mult(this.size, 1 + (Math.random() * 4));
                new sprite({
                    binded: this,
                    tuple: sprites$1.asteroid
                });
            }
            tick() {
                var _a;
                this.wpos[0] += this.float[0];
                this.wpos[1] -= this.float[1];
                this.ro += this.rate;
                super.update();
                (_a = this.sector) === null || _a === void 0 ? void 0 : _a.swap(this);
            }
        }
        Asteroid.slowness = 40;
        testing_chamber.Asteroid = Asteroid;
        class Square extends lod$1.obj {
            static make() {
                return new Square;
            }
            constructor() {
                super(undefined);
                console.log('square');
            }
            create() {
                console.log('create');
                this.size = [100, 100];
                new sprite({
                    binded: this,
                    tuple: sprites$1.test100
                });
            }
            tick() {
                this.shape;
                //if (this.mousedSquare(space.gview.mrpos))
                //	shape.mesh.material.color.set('white');
                //else
                //	shape.material.color.set('white');
            }
        }
        testing_chamber.Square = Square;
    })(testing_chamber || (testing_chamber = {}));
    var testing_chamber$1 = testing_chamber;

    // the view manages what it sees
    class view {
        constructor() {
            this.zoom = 1;
            this.zoomIndex = 0;
            this.zooms = [1, 0.5, 0.33, 0.2, 0.1];
            this.wpos = [0, 0];
            this.rpos = [0, 0];
            this.mpos = [0, 0];
            this.mwpos = [0, 0];
            this.mrpos = [0, 0];
            this.begin = [0, 0];
            this.before = [0, 0];
            this.show = false;
            new lod$1.galaxy(10);
            this.rpos = lod$1.project(this.wpos);
        }
        static make() {
            return new view;
        }
        chart(big) {
        }
        remove(obj) {
            var _a;
            (_a = obj.sector) === null || _a === void 0 ? void 0 : _a.remove(obj);
        }
        tick() {
            this.move();
            this.mouse();
            this.pan();
            this.float();
            this.chase();
            this.stats();
            this.wpos = lod$1.unproject(this.rpos);
            lod$1.ggalaxy.update(this.wpos);
            const zoom = space$1.gview.zoom;
            ren$1.camera.scale.set(zoom, zoom, zoom);
            ren$1.camera.updateProjectionMatrix();
        }
        pan() {
        }
        float() {
            const factor = 1.5;
            let float = [factor, factor];
            float = pts.mult(float, ren$1.delta);
            this.rpos = pts.add(this.rpos, float);
        }
        chase() {
            // let inv = pts.inv(this.rpos);
            // ren.groups.axisSwap.position.set(inv[0], inv[1], 0);
            ren$1.camera.position.set(this.rpos[0], this.rpos[1], 0);
        }
        mouse() {
            let mouse = app$1.mouse();
            mouse = pts.subtract(mouse, pts.divide([ren$1.screen[0], ren$1.screen[1]], 2));
            mouse = pts.mult(mouse, ren$1.ndpi);
            mouse = pts.mult(mouse, this.zoom);
            mouse[1] = -mouse[1];
            this.mrpos = pts.add(mouse, this.rpos);
            //this.mrpos = pts.add(this.mrpos, lod.project([.5, -.5])); // correction
            this.mwpos = lod$1.unproject(this.mrpos);
            //this.mwpos = pts.add(this.mwpos, [.5, -.5])
            // now..
            if (app$1.button(2) == 1) {
                hooks.call('viewClick', this);
            }
        }
        move() {
            let pan = 10;
            if (app$1.key('x'))
                pan *= 2;
            let add = [0, 0];
            if (app$1.key('w'))
                add = pts.add(add, [0, pan]);
            if (app$1.key('s'))
                add = pts.add(add, [0, -pan]);
            if (app$1.key('a'))
                add = pts.add(add, [-pan, 0]);
            if (app$1.key('d'))
                add = pts.add(add, [pan, 0]);
            if ((app$1.key('f') == 1 || app$1.wheel == -1) && this.zoomIndex > 0)
                this.zoomIndex -= 1;
            if ((app$1.key('r') == 1 || app$1.wheel == 1) && this.zoomIndex < this.zooms.length - 1)
                this.zoomIndex += 1;
            this.zoom = this.zooms[this.zoomIndex];
            add = pts.mult(add, this.zoom);
            add = pts.floor(add);
            this.rpos = pts.add(this.rpos, add);
        }
        stats() {
            if (app$1.key('h') == 1)
                this.show = !this.show;
            let crunch = ``;
            //crunch += `DPI_UPSCALED_RT: ${ren.DPI_UPSCALED_RT}<br />`;
            crunch += '<br />';
            //crunch += `dpi: ${ren.ndpi}<br />`;
            //crunch += `fps: ${ren.fps}<br />`;
            crunch += `delta: ${ren$1.delta.toPrecision(6)}<br />`;
            crunch += '<br />';
            crunch += `textures: ${ren$1.renderer.info.memory.textures}<br />`;
            crunch += `programs: ${ren$1.renderer.info.programs.length}<br />`;
            //crunch += `memory: ${Math.floor(ren.memory.usedJSHeapSize / 1000000)} / ${Math.floor(ren.memory.totalJSHeapSize / 1000000)}<br />`;
            crunch += '<br />';
            //crunch += `mouse: ${pts.to_string(App.mouse())}<br />`;
            //crunch += `mpos: ${pts.to_string(pts.floor(this.mpos))}<br />`;
            crunch += `mwpos: ${pts.to_string(pts.floor(this.mwpos))}<br />`;
            crunch += `mrpos: ${pts.to_string(pts.floor(this.mrpos))}<br />`;
            crunch += `mbpos: ${pts.to_string(lod$1.ggalaxy.big(this.mwpos))}<br />`;
            crunch += '<br />';
            crunch += `lod grid size: ${lod$1.ggrid.spread * 2 + 1} / ${lod$1.ggrid.outside * 2 + 1}<br />`;
            crunch += `view bigpos: ${pts.to_string(lod$1.ggalaxy.big(this.wpos))}<br />`;
            crunch += `view zoom: ${this.zoom}<br />`;
            crunch += '<br />';
            //crunch += `world wpos: ${pts.to_string(this.pos)}<br /><br />`;
            crunch += `sectors: ${numbers.sectors[0]} / ${numbers.sectors[1]}<br />`;
            crunch += `game objs: ${numbers.objs[0]} / ${numbers.objs[1]}<br />`;
            crunch += `sprites: ${numbers.sprites[0]} / ${numbers.sprites[1]}<br />`;
            crunch += '<br />';
            let element = document.querySelectorAll('.stats')[0];
            element.innerHTML = crunch;
            element.style.visibility = this.show ? 'visible' : 'hidden';
        }
    }

    var space;
    (function (space) {
        space.size = 100;
        function init() {
            starts();
        }
        space.init = init;
        function tick() {
            space.gview === null || space.gview === void 0 ? void 0 : space.gview.tick();
            testing_chamber$1.tick();
        }
        space.tick = tick;
        function starts() {
            lod$1.register();
            space.gview = view.make();
            //if (window.location.href.indexOf("#testingchamber") != -1) {
            testing_chamber$1.start();
            //tests.start();
            //}
            //else {
            //}
        }
    })(space || (space = {}));
    var space$1 = space;

    var app;
    (function (app) {
        let KEY;
        (function (KEY) {
            KEY[KEY["OFF"] = 0] = "OFF";
            KEY[KEY["PRESS"] = 1] = "PRESS";
            KEY[KEY["WAIT"] = 2] = "WAIT";
            KEY[KEY["AGAIN"] = 3] = "AGAIN";
            KEY[KEY["UP"] = 4] = "UP";
        })(KEY = app.KEY || (app.KEY = {}));
        let MOUSE;
        (function (MOUSE) {
            MOUSE[MOUSE["UP"] = -1] = "UP";
            MOUSE[MOUSE["OFF"] = 0] = "OFF";
            MOUSE[MOUSE["DOWN"] = 1] = "DOWN";
            MOUSE[MOUSE["STILL"] = 2] = "STILL";
        })(MOUSE = app.MOUSE || (app.MOUSE = {}));
        var keys = {};
        var buttons = {};
        var pos = [0, 0];
        app.salt = 'x';
        app.wheel = 0;
        function onkeys(event) {
            const key = event.key.toLowerCase();
            if ('keydown' == event.type)
                keys[key] = keys[key] ? KEY.AGAIN : KEY.PRESS;
            else if ('keyup' == event.type)
                keys[key] = KEY.UP;
            if (event.keyCode == 114)
                event.preventDefault();
        }
        app.onkeys = onkeys;
        function key(k) {
            return keys[k];
        }
        app.key = key;
        function button(b) {
            return buttons[b];
        }
        app.button = button;
        function mouse() {
            return [...pos];
        }
        app.mouse = mouse;
        function boot(version) {
            console.log('boot');
            app.salt = version;
            function onmousemove(e) { pos[0] = e.clientX; pos[1] = e.clientY; }
            function onmousedown(e) { buttons[e.button] = 1; if (e.button == 1)
                return false; }
            function onmouseup(e) { buttons[e.button] = MOUSE.UP; }
            function onwheel(e) { app.wheel = e.deltaY < 0 ? 1 : -1; }
            function onerror(message) { document.querySelectorAll('.stats')[0].innerHTML = message; }
            document.onkeydown = document.onkeyup = onkeys;
            document.onmousemove = onmousemove;
            document.onmousedown = onmousedown;
            document.onmouseup = onmouseup;
            document.onwheel = onwheel;
            window.onerror = onerror;
            ren$1.init();
            client$1.init();
            space$1.init();
            loop();
        }
        app.boot = boot;
        function process_keys() {
            for (let i in keys) {
                if (keys[i] == KEY.PRESS)
                    keys[i] = KEY.WAIT;
                else if (keys[i] == KEY.UP)
                    keys[i] = KEY.OFF;
            }
        }
        function process_mouse_buttons() {
            for (let b of [0, 1, 2])
                if (buttons[b] == MOUSE.DOWN)
                    buttons[b] = MOUSE.STILL;
                else if (buttons[b] == MOUSE.UP)
                    buttons[b] = MOUSE.OFF;
        }
        function loop(timestamp) {
            requestAnimationFrame(loop);
            ren$1.update();
            client$1.tick();
            space$1.tick();
            ren$1.render();
            app.wheel = 0;
            process_keys();
            process_mouse_buttons();
        }
        app.loop = loop;
        function sethtml(selector, html) {
            let element = document.querySelectorAll(selector)[0];
            element.innerHTML = html;
        }
        app.sethtml = sethtml;
    })(app || (app = {}));
    window['App'] = app;
    var app$1 = app;

    var client;
    (function (client) {
        function getLocationByName(name) {
            for (let location of client.locations)
                if (location.name == name)
                    return location;
            console.warn("location doesnt exist");
        }
        function getSectorByName(name) {
            for (let sector of client.sectors)
                if (sector.name == name)
                    return sector;
            console.warn("sector doesnt exist");
        }
        function makeRequest(method, url) {
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url);
                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                    }
                    else {
                        reject({
                            status: xhr.status,
                            statusText: xhr.statusText
                        });
                    }
                };
                xhr.onerror = function () {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                };
                xhr.send();
            });
        }
        function tick() {
        }
        client.tick = tick;
        function init() {
            app$1.mouse();
            let menu_button = document.getElementById("menu_button");
            menu_button.onclick = function () {
                showAccountBubbles();
            };
            //new aabb2([0,0],[0,0]);
            if (document.cookie) {
                document.cookie = 'a';
                console.log('our cookie is ', document.cookie);
            }
            else {
                console.log('logged_in');
            }
            getInitTrios();
        }
        client.init = init;
        function handleSply() {
            console.log('handlesply', client.sply);
            document.querySelector(".logo .text");
            client.sector = getSectorByName(client.sply.sector);
            //if (sply.unregistered)
            //	logo.innerHTML = `space`
            //else
            //	logo.innerHTML = `space - ${sply.username}`
        }
        client.handleSply = handleSply;
        function showAccountBubbles() {
            let textHead = document.getElementById("mainDiv");
            client.sply && client.sply.username;
            let text = '';
            text += usernameReminder();
            text += addReturnOption();
            text += `
		<span class="spanButton" onclick="space.showLogin()">login</span>,
		<span class="spanButton" onclick="space.logout()">logout</span>,
		or
		<span class="spanButton" onclick="space.showRegister()">register</span>

		`;
            textHead.innerHTML = text;
        }
        function getInitTrios() {
            makeRequest('GET', 'sectors.json')
                .then(function (res) {
                console.log('got sectors');
                client.sectors = JSON.parse(res);
                return makeRequest('GET', 'locations.json');
            })
                .then(function (res) {
                console.log('got locations');
                client.locations = JSON.parse(res);
                return makeRequest('GET', 'ply');
            })
                .then(function (res) {
                receiveStuple(res);
                //return makeRequest('GET', 'where');
            });
            //.then(function (res: any) {
            //	receiveStuple(res);
            //})
            /*.catch(function (err) {
                console.error('Augh, there was an error!', err.statusText);
            });*/
        }
        function chooseLayout() {
            if (client.sply.flight) {
                layoutFlight();
            }
            else if (client.sply.sublocation == 'Refuel') {
                layoutRefuel();
            }
            else if (client.sply.scanning) {
                layoutScanning();
            }
            else if (client.location.type == 'Station') {
                layoutStation();
            }
            else if (client.location.type == 'Junk') {
                layoutJunk();
            }
            else if (client.location.type == 'Contested') {
                layoutContested();
            }
        }
        client.chooseLayout = chooseLayout;
        function receiveStuple(res) {
            if (res.length == 0) {
                console.warn('expected a stuple but received nothing');
                return;
            }
            let stuple = JSON.parse(res);
            const type = stuple[0];
            const payload = stuple[1];
            console.log('received stuple type', type);
            if (type == 'sply') {
                client.sply = payload;
                client.sector = getSectorByName(client.sply.sector);
                client.location = getLocationByName(client.sply.location);
                handleSply();
                chooseLayout();
            }
            else if (type == 'message') {
                layoutMessage(payload);
            }
            else if (type == 'senemies') {
                client.senemies = payload;
            }
        }
        function usernameReminder() {
            let text = '';
            text += `
		<p class="smallish reminder">`;
            if (client.sply.unregistered)
                text += `
			Playing unregistered
			<span class="material-icons" style="font-size: 18px">
			no_accounts
			</span>`;
            else
                text += `
			Logged in as ${client.sply.username} <!-- #${client.sply.id} -->
			<span class="material-icons" style="font-size: 18px">
			how_to_reg
			</span>
			`;
            text += `<p>`;
            return text;
        }
        function addFlightOption() {
            let textHead = document.getElementById("mainDiv");
            let text = '';
            text += `
		<p>
		<br />
		<span class="spanButton" onclick="space.layoutFlightControls()">Flight Menu</span>
		`;
            textHead.innerHTML += text;
        }
        function addReturnOption() {
            let text = '';
            text += `
		<p>
		<span class="spanButton" onclick="space.chooseLayout()"><</span>
		<p>
		`;
            return text;
        }
        function addLocationMeter() {
            let text = '';
            let position = `<span class="positionArray">
		<span>${client.sply.position[0].toFixed(1)}</span>,
		<span>${client.sply.position[1].toFixed(1)}</span>
		</span>`;
            text += `
		<div class="positionMeter">position: ${position} km in ${client.sply.location}</div>
		<p>
		<br />
		`;
            return text;
        }
        function makeWhereabouts() {
            let text = '';
            text += `
		<div id="whereabouts">
		<div></div>
		<span class="sector">${client.sector.name}</span> ~>
		<br />
		
		<span class="location" style="colors: ${client.location.color || "inherit"} ">
		&nbsp;${client.location.name}
		<!--(${client.location.type})--></span>
		</div>
		`;
            return text;
        }
        function layoutStation() {
            let textHead = document.getElementById("mainDiv");
            let text = usernameReminder();
            text += makeWhereabouts();
            text += `<p>`;
            text += `<span class="facilities">`;
            if (client.location.facilities) {
                if (client.location.facilities.indexOf("Refuel") > -1)
                    text += 'You can <span class="spanButton" onclick="space.transportSublocation(`refuel`)">refuel</span> here.';
            }
            text += `</span>`;
            textHead.innerHTML = text;
            addFlightOption();
            //layoutFlightControls();
        }
        function layoutJunk() {
            let textHead = document.getElementById("mainDiv");
            let text = usernameReminder();
            text += makeWhereabouts();
            text += `<p>`;
            text += `
		It's a junk field.
		You can <span class="spanButton" onclick="space.scanJunk()">scan</span> the debris.
		`;
            textHead.innerHTML = text;
            addFlightOption();
            //layoutFlightControls();
        }
        function layoutContested() {
            let textHead = document.getElementById("mainDiv");
            let text = usernameReminder();
            text += makeWhereabouts();
            text += addLocationMeter();
            text += `<p>`;
            text += `
		This regional blob of space is unmonitored by law.
		<p>
		You can <span class="spanButton" onclick="space.seeEnemies()">see nearby enemies.</span>
		`;
            textHead.innerHTML = text;
            addFlightOption();
            //layoutFlightControls();
        }
        function layoutEnemies() {
            let textHead = document.getElementById("mainDiv");
            let text = '';
            text += usernameReminder();
            text += addReturnOption();
            text += addLocationMeter();
            /*let t;
            t = setInterval(() => {
                makeRequest('GET', 'ply')
                .then(function (res: any) {
                    //receiveStuple(res);
                    console.log('got');
                    
                })
            }, 2000);*/
            //text += makeWhereabouts();
            text += `<p>`;
            text += `
		These are pirates and exiles that you can engage.
		<p>
		<div class="enemies">
		<table>
		<thead>
		<tr>
		<td></td>
		<td>type</td>
		<!--<td>hp</td>
		<!--<td>dmg</td>-->
		<td>pos</td>
		<td>dist</td>
		</tr>
		</thead>
		<tbody id="list">
		`;
            for (let enemy of client.senemies) {
                let position = [
                    enemy.position[0].toFixed(1),
                    enemy.position[1].toFixed(1)
                ];
                text += `
			<tr>
			<td class="sel">&nbsp;</td>
			<td>${enemy.name}</td>
			<!--<td>%${enemy.health}</td>
			<td>${enemy.damage}</td>-->
			<td>${position[0]}, ${position[1]}</td>
			<td>${pts.dist(client.sply.position, enemy.position).toFixed(1)} km</td>
			</tr>
			`;
                //
            }
            text += `
		</tbody>
		</table>
		</div>
		`;
            textHead.innerHTML = text;
            let list = document.getElementById("list");
            console.log(list.childElementCount);
            let active;
            for (let i = 0; i < list.children.length; i++) {
                let child = list.children[i];
                child.onclick = function () {
                    let dom = this;
                    console.log('woo', this);
                    if (active != this) {
                        if (active) {
                            active.classList.remove('selected');
                        }
                        dom.classList.add('selected');
                        active = this;
                    }
                };
                console.log(child);
            }
            //addFlightOption();
            //layoutFlightControls();
        }
        function layoutRefuel() {
            let textHead = document.getElementById("mainDiv");
            let text = usernameReminder();
            text += 'You are at a refuelling bay.';
            text += ' <span class="spanButton" onclick="space.returnSublocation()">Back to Station</span>';
            textHead.innerHTML = text;
            //layoutFlightControls();
        }
        function layoutScanning() {
            let textHead = document.getElementById("mainDiv");
            let text = usernameReminder();
            text += `You\'re scanning the junk at ${client.location.name || ''}.`;
            if (!client.sply.scanCompleted)
                text += ' <span class="spanButton" onclick="space.stopScanning()">Cancel?</span>';
            console.log(client.sply);
            //if (!sply.scanCompleted) {
            function updateBar() {
                let now = Date.now();
                if (now > client.sply.scanEnd)
                    now = client.sply.scanEnd;
                const duration = client.sply.scanEnd - client.sply.scanStart;
                const time = now - client.sply.scanStart;
                const width = time / duration;
                const minutesPast = Math.floor(time / 1000 / 60).toFixed(0);
                const minutesRemain = Math.round(duration / 1000 / 60).toFixed(0);
                const over = client.sply.scanEnd - Date.now();
                let bar = document.getElementById("barProgress");
                let text = document.getElementById("barText");
                if (!bar || !text)
                    return;
                bar.style.width = `${(width * 100).toFixed(0)}%`;
                if (over > 0)
                    text.innerHTML = `${minutesPast} / ${minutesRemain} minutes`;
                else
                    text.innerHTML = '<span onclick="space.completeScan()">Ok</span>';
            }
            text += `
		<div class="bar">
		<div id="barProgress"></div>
		<span id="barText"></span>
		</div>`;
            //if (sply.scanCompleted)
            //	text += '<p><br /><span class="spanButton" onclick="space.completeScan()">See scan results</span>';
            textHead.innerHTML = text;
            updateBar();
            const t = setInterval(function () {
                if (client.sply.scanning) {
                    const time = client.sply.scanEnd - Date.now();
                    if (time <= 0) {
                        clearInterval(t);
                        console.log('clear the interval');
                    }
                    updateBar();
                }
                else {
                    clearInterval(t);
                }
            }, 1000);
            //layoutFlightControls();
        }
        function layoutMessage(message) {
            let textHead = document.getElementById("mainDiv");
            let text = `<span class="message">${message}</span>`;
            textHead.innerHTML += text;
        }
        function layoutFlight() {
            let textHead = document.getElementById("mainDiv");
            let text = usernameReminder();
            //text += addTabs();
            const loc = getLocationByName(client.sply.flightLocation);
            text += `You\'re flying towards <span style="colors: ${loc.color || "inherit"} ">${loc.name}
		(${loc.type})</span>.`;
            /*text += `
            <div class="bar">
            <div id="barProgress"></div>
            <span id="barText">x</span>
            </div>`*/
            text += '';
            text += ' Attempt to <span class="spanButton" onclick="space.tryDock()">arrive / dock</span>';
            textHead.innerHTML = text;
            addFlightOption();
            //text += endTabs();
            //layoutFlightControls();
        }
        function layoutFlightControls() {
            let textHead = document.getElementById("mainDiv");
            let text = usernameReminder();
            text += addReturnOption();
            text += `
		Flight menu
		<p>
		${client.sector.name} ~>
		<select name="flights" id="flights" >`;
            for (let location of client.sector.locations) {
                text += `<option>${location}</option>`;
            }
            text += `<option>Non-existing option</option>`;
            text += `</select>
		<span class="spanButton" onclick="space.submitFlight()">Flight</span>
		</form>`;
            textHead.innerHTML = text;
        }
        client.layoutFlightControls = layoutFlightControls;
        function showLogin() {
            let textHead = document.getElementById("mainDiv");
            let text = `
		<form action="login" method="post">
		<label for="username">Username</label><br />
		<input id="username" type="text" placeholder="" name="username" required><br /><br />
		
		<label for="psw">Password</label><br />
		<input id="password" type="password" placeholder="" name="psw" required><br /><br />
		
		<button type="button" onclick="space.xhrLogin()">Login</button>
		
		</form>
		<p>
		<span class="smallish">You will remain logged in until you logout.</span>
		`;
            textHead.innerHTML = text;
        }
        client.showLogin = showLogin;
        function showRegister() {
            let textHead = document.getElementById("mainDiv");
            let text = `
		<form action="register" method="post">

		<label for="username">Username</label><br />
		<input class="wrong" type="text" name="username" id="username" minlength="4" maxlength="15"  required pattern="[a-zA-Z0-9]+">
		<br /><br />
	
		<label for="password">Password</label><br />
		<input class="wrong" type="password" autocomplete="new-password" name="password" id="password" minlength="4" maxlength="20" required>
		<br /><br />
	
		<label for="password-repeat">Repeat Password</label><br />
		<input class="wrong" type="password" autocomplete="new-password" name="password-repeat" id="password-repeat" maxlength="20" minlength="4" required>
		<br /><br />
		
		<label for="keep-ship" title="Start fresh or keep your play-via-ip, unregistered ship">
		<input type="checkbox" checked="checked" name="remember" id="keep-ship"> Keep current progress
		</label>
		<p>
		recommended you use your browsers password manager and generator
		<br />
		<br />

		<button type="button" onclick="space.xhrRegister()">Register</button>
		
		</form>`;
            textHead.innerHTML = text;
        }
        client.showRegister = showRegister;
        function submitFlight() {
            var e = document.getElementById("flights");
            var strUser = e.options[e.selectedIndex].text;
            console.log(strUser);
            makeRequest('GET', 'submitFlight=' + strUser)
                .then(function (res) {
                console.log('submitted flight');
                receiveStuple(res);
            });
        }
        client.submitFlight = submitFlight;
        function scanJunk() {
            makeRequest('GET', 'scan')
                .then(function (res) {
                receiveStuple(res);
            });
        }
        client.scanJunk = scanJunk;
        function completeScan() {
            makeRequest('GET', 'completeScan')
                .then(function (res) {
                receiveStuple(res);
            });
        }
        client.completeScan = completeScan;
        function stopScanning() {
            makeRequest('GET', 'stopScanning')
                .then(function (res) {
                receiveStuple(res);
            });
        }
        client.stopScanning = stopScanning;
        function seeEnemies() {
            makeRequest('GET', 'seeEnemies')
                .then(function (res) {
                receiveStuple(res);
                layoutEnemies();
            });
        }
        client.seeEnemies = seeEnemies;
        function tryDock() {
            makeRequest('GET', 'dock')
                .then(function (res) {
                console.log('asking server if we can dock');
                receiveStuple(res);
            });
        }
        client.tryDock = tryDock;
        function returnSublocation() {
            makeRequest('GET', 'returnSublocation')
                .then(function (res) {
                console.log('returned from sublocation');
                receiveStuple(res);
            });
        }
        client.returnSublocation = returnSublocation;
        function transportSublocation(facility) {
            makeRequest('GET', 'knock&sublocation=refuel')
                .then(function (res) {
                console.log('returned from sublocation');
                receiveStuple(res);
            });
        }
        client.transportSublocation = transportSublocation;
        function logout() {
            makeRequest('GET', 'logout')
                .then(function (res) {
                alert(res);
                client.sply.unregistered = true;
                handleSply();
                //chooseLayout();
            });
        }
        client.logout = logout;
        function xhrLogin() {
            let username = document.getElementById("username").value;
            let password = document.getElementById("password").value;
            var http = new XMLHttpRequest();
            var url = 'login';
            var params = `username=${username}&password=${password}`;
            http.open('POST', url, true);
            //Send the proper header information along with the request
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            http.onreadystatechange = function () {
                if (http.readyState == 4 && http.status == 200) {
                    alert(http.responseText);
                    makeRequest('GET', 'ply')
                        .then(function (res) {
                        receiveStuple(res);
                        //return makeRequest('GET', 'where');
                    });
                    //.then(function (res: any) {
                    //	receiveStuple(res);
                    //});
                }
                else if (http.readyState == 4 && http.status == 400) {
                    alert(http.responseText);
                }
            };
            http.send(params);
        }
        client.xhrLogin = xhrLogin;
        function xhrRegister() {
            let username = document.getElementById("username").value;
            let password = document.getElementById("password").value;
            let password_repeat = document.getElementById("password-repeat").value;
            let keep_ship = document.getElementById("keep-ship").checked;
            console.log(keep_ship);
            var http = new XMLHttpRequest();
            var url = 'register';
            var params = `username=${username}&password=${password}&password-repeat=${password_repeat}&keep-ship=${keep_ship}`;
            http.open('POST', url, true);
            //Send the proper header information along with the request
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            http.onreadystatechange = function () {
                if (http.readyState == 4 && http.status == 200) {
                    alert(http.responseText);
                    showLogin();
                }
                else if (http.readyState == 4 && http.status == 400) {
                    alert(http.responseText);
                }
            };
            http.send(params);
        }
        client.xhrRegister = xhrRegister;
    })(client || (client = {}));
    var client$1 = client;
    window.client = client;

    return client$1;

})(THREE);
