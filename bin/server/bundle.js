var space = (function () {
    'use strict';

    var __awaiter$2 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
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
            return __awaiter$2(this, void 0, void 0, function* () {
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
                yield space$1.init();
                loop();
            });
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
        var last, current;
        function loop(timestamp) {
            requestAnimationFrame(loop);
            current = performance.now();
            if (!last)
                last = current;
            app.delta = (current - last) / 1000;
            last = current;
            space$1.tick();
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

    var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var outer_space;
    (function (outer_space_1) {
        outer_space_1.locations = [];
        outer_space_1.center = [1, 0];
        outer_space_1.pixelMultiple = 50;
        var floats = [];
        var regions = [];
        function init() {
            setInterval(fetch, 1000);
        }
        outer_space_1.init = init;
        function statics() {
            console.log('outer space statics');
            setup();
        }
        outer_space_1.statics = statics;
        function fetch() {
            return __awaiter$1(this, void 0, void 0, function* () {
                let text = yield space$1.make_request('GET', 'celestial objects');
                let tuple = JSON.parse(text);
                const objects = tuple[1];
                for (const object of objects) {
                    const [random, id, pos, type] = object;
                    new float({
                        name: type,
                        pos: pos
                    });
                }
                for (let float of floats)
                    float.tick();
                for (let region of regions)
                    region.tick();
            });
        }
        outer_space_1.fetch = fetch;
        function tick() {
            if (outer_space_1.you) {
                outer_space_1.you.options.pos = pts.add(outer_space_1.you.options.pos, [0.001, 0]);
                outer_space_1.center = outer_space_1.you.options.pos;
            }
            if (app$1.wheel == 1)
                outer_space_1.pixelMultiple += 5;
            if (app$1.wheel == -1)
                outer_space_1.pixelMultiple -= 5;
            outer_space_1.pixelMultiple = space$1.clamp(outer_space_1.pixelMultiple, 5, 120);
            for (let float of floats)
                float.tick();
            for (let region of regions)
                region.tick();
        }
        outer_space_1.tick = tick;
        function setup() {
            outer_space_1.outer_space = document.getElementById("outer-space");
            outer_space_1.mapSize = [window.innerWidth, window.innerHeight];
            outer_space_1.you = new float({
                name: 'you',
                pos: outer_space_1.center
            });
            new float({
                name: 'collision',
                pos: [2, 1]
            });
            for (let blob of space$1.regions) {
                console.log('new region', blob.name);
                new region(blob.name, blob.center, blob.radius);
            }
        }
        class float {
            constructor(options) {
                this.options = options;
                this.static = false;
                floats.push(this);
                this.element = document.createElement("div");
                this.element.classList.add('float');
                this.element.innerHTML = `<span></span><span>${options.name}</span>`;
                this.style_position();
                this.append();
            }
            style_position() {
                const half = pts.divide(outer_space_1.mapSize, 2);
                let relative = pts.subtract(this.options.pos, outer_space_1.center);
                relative = pts.mult(relative, outer_space_1.pixelMultiple);
                relative = pts.add(relative, half);
                this.element.style.top = relative[1];
                this.element.style.left = relative[0];
                //console.log('half', half);
            }
            append() {
                outer_space_1.outer_space.append(this.element);
            }
            remove() {
                this.element.remove();
            }
            tick() {
                this.style_position();
            }
        }
        class region {
            constructor(name, pos, radius) {
                this.name = name;
                this.pos = pos;
                this.radius = radius;
                this.static = false;
                regions.push(this);
                this.element = document.createElement("div");
                this.element.classList.add('region');
                this.element.innerHTML = `<span>${name}</span>`;
                this.style_position();
                this.append();
            }
            style_position() {
                const half = pts.divide(outer_space_1.mapSize, 2);
                let relative = pts.subtract(this.pos, outer_space_1.center);
                relative = pts.mult(relative, outer_space_1.pixelMultiple);
                relative = pts.add(relative, half);
                const radius = this.radius * outer_space_1.pixelMultiple;
                this.element.style.top = relative[1] - radius;
                this.element.style.left = relative[0] - radius;
                this.element.style.width = this.radius * 2 * outer_space_1.pixelMultiple;
                this.element.style.height = this.radius * 2 * outer_space_1.pixelMultiple;
            }
            append() {
                outer_space_1.outer_space.append(this.element);
            }
            remove() {
                this.element.remove();
            }
            tick() {
                this.style_position();
            }
        }
    })(outer_space || (outer_space = {}));
    var outer_space$1 = outer_space;

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var space;
    (function (space) {
        function sample(a) {
            return a[Math.floor(Math.random() * a.length)];
        }
        space.sample = sample;
        function clamp(val, min, max) {
            return val > max ? max : val < min ? min : val;
        }
        space.clamp = clamp;
        function get_location_by_name(name) {
            for (let location of space.locations)
                if (location.name == name)
                    return location;
            console.warn(`location ${space.location} doesnt exist`);
        }
        function get_region_by_name(name) {
            for (let region of space.regions)
                if (region.name == name)
                    return region;
        }
        function make_request(method, url) {
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
        space.make_request = make_request;
        function tick() {
            outer_space$1.tick();
        }
        space.tick = tick;
        function init() {
            return __awaiter(this, void 0, void 0, function* () {
                outer_space$1.init();
                app$1.mouse();
                let menuButton = document.getElementById("menu_button");
                menuButton.onclick = function () {
                    show_account_bubbles();
                };
                //new aabb2([0,0],[0,0]);
                if (document.cookie) {
                    document.cookie = 'a';
                    console.log('our cookie is ', document.cookie);
                }
                else {
                    console.log('logged_in');
                }
                yield ask_initial();
                outer_space$1.statics();
            });
        }
        space.init = init;
        function handle_sply() {
            console.log('handle-sply', space.sply);
            document.querySelector(".logo .text");
            space.region = get_region_by_name(space.sply.sector);
            //if (sply.unregistered)
            //	logo.innerHTML = `space`
            //else
            //	logo.innerHTML = `space - ${sply.username}`
        }
        space.handle_sply = handle_sply;
        function show_account_bubbles() {
            let textHead = document.getElementById("mainDiv");
            space.sply && space.sply.username;
            let text = '';
            text += username_header();
            text += addReturnOption();
            text += `
		<span class="spanButton" onclick="space.showLogin()">login</span>,
		<span class="spanButton" onclick="space.logout()">logout</span>,
		or
		<span class="spanButton" onclick="space.show_register()">register</span>

		`;
            textHead.innerHTML = text;
        }
        function ask_initial() {
            return __awaiter(this, void 0, void 0, function* () {
                const one = yield make_request('GET', 'regions.json');
                const two = yield make_request('GET', 'locations.json');
                const three = yield make_request('GET', 'ply');
                space.regions = JSON.parse(one);
                space.locations = JSON.parse(two);
                receive_stuple(three);
                console.log('asked initials');
            });
        }
        function chooseLayout() {
            if (space.sply.flight) {
                layoutFlight();
            }
            else if (space.sply.sublocation == 'Refuel') {
                layoutRefuel();
            }
            else if (space.sply.scanning) {
                layoutScanning();
            }
            else if (space.location) {
                if (space.location.type == 'Station') {
                    layoutStation();
                }
                else if (space.location.type == 'Junk') {
                    layoutJunk();
                }
                else if (space.location.type == 'Contested') ;
                layoutContested();
            }
            else {
                layout_default();
            }
        }
        space.chooseLayout = chooseLayout;
        function receive_stuple(res) {
            if (res.length == 0) {
                console.warn('expected a stuple but received nothing');
                return;
            }
            let stuple = JSON.parse(res);
            const type = stuple[0];
            const payload = stuple[1];
            console.log('received stuple type', type);
            if (type == 'sply') {
                console.log('sply!');
                space.sply = payload;
                space.region = get_region_by_name(space.sply.sector);
                space.location = get_location_by_name(space.sply.location);
                handle_sply();
                chooseLayout();
            }
            else if (type == 'message') {
                layoutMessage(payload);
            }
            else if (type == 'senemies') {
                space.senemies = payload;
            }
        }
        function username_header() {
            let text = '';
            text += `
		<p class="smallish reminder">`;
            if (space.sply)
                console.log('sply is', space.sply);
            if (space.sply.unreg)
                text += `
			Playing unregistered (by ip)
			<span class="material-icons" style="font-size: 18px">
			no_accounts
			</span>`;
            else
                text += `
			Logged in as ${space.sply.username} <!-- #${space.sply.id} -->
			<span class="material-icons" style="font-size: 18px">
			how_to_reg
			</span>
			`;
            text += `<p>`;
            return text;
        }
        function addFlightOption() {
            document.getElementById("mainDiv");
            let text = '';
            text += `
		<p>
		<br />
		<span class="spanButton" onclick="space.layoutFlightControls()">Flight Menu</span>
		`;
            return text;
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
		<span>${space.sply.position[0].toFixed(1)}</span>,
		<span>${space.sply.position[1].toFixed(1)}</span>
		</span>`;
            text += `
		<div class="positionMeter">position: ${position} km in ${space.sply.location}</div>
		<p>
		<br />
		`;
            return text;
        }
        function makeWhereabouts() {
            for (let region of space.regions) {
                let dist = pts.dist([1, 0], region.center);
                if (dist < region.radius) {
                    console.log(`were in region ${region.name} dist ${dist}`);
                }
            }
            let text = '';
            text += `
		<div id="whereabouts">
		
		<span class="sector">belt</span> ~>
		<br />
		
		<span class="location" style="colors: inherit} ">
		&nbsp;boop
		<!--(crash)--></span>
		</div>
		`;
            return text;
        }
        function layout_default() {
            let textHead = document.getElementById("mainDiv");
            let text = username_header();
            text += makeWhereabouts();
            text += addFlightOption();
            textHead.innerHTML = text;
        }
        function layoutStation() {
            let textHead = document.getElementById("mainDiv");
            let text = username_header();
            //text += drawSpaceship();
            text += makeWhereabouts();
            text += `<p>`;
            text += `<span class="facilities">`;
            if (space.location.facilities) {
                if (space.location.facilities.indexOf("Refuel") > -1)
                    text += 'You can <span class="spanButton" onclick="space.transportSublocation(`refuel`)">refuel</span> here.';
            }
            text += `</span>`;
            textHead.innerHTML = text;
            addFlightOption();
            //layoutFlightControls();
        }
        function layoutJunk() {
            let textHead = document.getElementById("mainDiv");
            let text = username_header();
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
            let text = username_header();
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
            text += username_header();
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
            for (let enemy of space.senemies) {
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
			<td>${pts.dist(space.sply.position, enemy.position).toFixed(1)} km</td>
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
            let text = username_header();
            text += 'You are at a refuelling bay.';
            text += ' <span class="spanButton" onclick="space.returnSublocation()">Back to Station</span>';
            textHead.innerHTML = text;
            //layoutFlightControls();
        }
        function layoutScanning() {
            let textHead = document.getElementById("mainDiv");
            let text = username_header();
            text += `You\'re scanning the junk at ${space.location.name || ''}.`;
            if (!space.sply.scanCompleted)
                text += ' <span class="spanButton" onclick="space.stopScanning()">Cancel?</span>';
            console.log(space.sply);
            //if (!sply.scanCompleted) {
            function updateBar() {
                let now = Date.now();
                if (now > space.sply.scanEnd)
                    now = space.sply.scanEnd;
                const duration = space.sply.scanEnd - space.sply.scanStart;
                const time = now - space.sply.scanStart;
                const width = time / duration;
                const minutesPast = Math.floor(time / 1000 / 60).toFixed(0);
                const minutesRemain = Math.round(duration / 1000 / 60).toFixed(0);
                const over = space.sply.scanEnd - Date.now();
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
                if (space.sply.scanning) {
                    const time = space.sply.scanEnd - Date.now();
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
            let text = username_header();
            //text += addTabs();
            const loc = get_location_by_name(space.sply.flightLocation);
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
            console.log('wot up');
            let text = username_header();
            text += addReturnOption();
            if (space.region) {
                text += `
		Flight menu
		<p>
		${space.region.name} ~>
		<select name="flights" id="flights" >`;
                for (let location of space.region.locations) {
                    text += `<option>${location}</option>`;
                }
                text += `<option>Non-existing option</option>`;
                text += `</select>
		<span class="spanButton" onclick="space.submitFlight()">Flight</span>
		</form>`;
            }
            textHead.innerHTML = text;
        }
        space.layoutFlightControls = layoutFlightControls;
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
        space.showLogin = showLogin;
        function show_register() {
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
		you can link your mail later
		<br />
		<br />

		<button type="button" onclick="space.xhr_register()">Register</button>
		
		</form>`;
            textHead.innerHTML = text;
        }
        space.show_register = show_register;
        function submitFlight() {
            var e = document.getElementById("flights");
            var strUser = e.options[e.selectedIndex].text;
            console.log(strUser);
            make_request('GET', 'submitFlight=' + strUser)
                .then(function (res) {
                console.log('submitted flight');
                receive_stuple(res);
            });
        }
        space.submitFlight = submitFlight;
        function scanJunk() {
            make_request('GET', 'scan')
                .then(function (res) {
                receive_stuple(res);
            });
        }
        space.scanJunk = scanJunk;
        function completeScan() {
            make_request('GET', 'completeScan')
                .then(function (res) {
                receive_stuple(res);
            });
        }
        space.completeScan = completeScan;
        function stopScanning() {
            make_request('GET', 'stopScanning')
                .then(function (res) {
                receive_stuple(res);
            });
        }
        space.stopScanning = stopScanning;
        function seeEnemies() {
            make_request('GET', 'seeEnemies')
                .then(function (res) {
                receive_stuple(res);
                layoutEnemies();
            });
        }
        space.seeEnemies = seeEnemies;
        function tryDock() {
            make_request('GET', 'dock')
                .then(function (res) {
                console.log('asking server if we can dock');
                receive_stuple(res);
            });
        }
        space.tryDock = tryDock;
        function returnSublocation() {
            make_request('GET', 'returnSublocation')
                .then(function (res) {
                console.log('returned from sublocation');
                receive_stuple(res);
            });
        }
        space.returnSublocation = returnSublocation;
        function transportSublocation(facility) {
            make_request('GET', 'knock&sublocation=refuel')
                .then(function (res) {
                console.log('returned from sublocation');
                receive_stuple(res);
            });
        }
        space.transportSublocation = transportSublocation;
        function logout() {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield make_request('GET', 'logout');
                alert(res);
                space.sply.unreg = true;
                handle_sply();
            });
        }
        space.logout = logout;
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
                    make_request('GET', 'ply')
                        .then(function (res) {
                        receive_stuple(res);
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
        space.xhrLogin = xhrLogin;
        function xhr_register() {
            let username = document.getElementById("username").value;
            let password = document.getElementById("password").value;
            let password_repeat = document.getElementById("password-repeat").value;
            let keep_ship = document.getElementById("keep-ship").checked;
            console.log(keep_ship);
            var http = new XMLHttpRequest();
            const url = 'register';
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
        space.xhr_register = xhr_register;
    })(space || (space = {}));
    var space$1 = space;
    window.space = space;

    return space$1;

})();
