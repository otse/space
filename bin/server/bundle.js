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
            if (!event.key)
                return;
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
            space$1.step();
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
    (function (outer_space) {
        const deduct_nav_bar = 50;
        const zoom_min = 5;
        const zoom_max = 120;
        outer_space.mapSize = [100, 100];
        outer_space.locations = [];
        outer_space.center = [0, -1];
        outer_space.pixelMultiple = 50;
        outer_space.zoomLimits = [5, 120];
        outer_space.stamp = 0;
        function project(unit) {
            const half = pts.divide(outer_space.mapSize, 2);
            let pos = pts.subtract(unit, outer_space.center);
            pos = pts.mult(pos, outer_space.pixelMultiple);
            pos = pts.add(pos, half);
            pos = pts.add(pos, [0, deduct_nav_bar / 2]);
            return pos;
        }
        outer_space.project = project;
        function unproject(pixel) {
            const half = pts.divide(outer_space.mapSize, 2);
            let pos = pts.subtract(pixel, half);
            pos = pts.subtract(pos, [0, deduct_nav_bar / 2]);
            pos = pts.divide(pos, outer_space.pixelMultiple);
            pos = pts.add(pos, outer_space.center);
            return pos;
        }
        outer_space.unproject = unproject;
        function init() {
            outer_space.renderer = document.querySelector("outer-space");
            outer_space.zoomLevel = document.querySelector("outer-space zoom-level");
            outer_space.renderer.onclick = (event) => {
                if (!started)
                    return;
                let pixel = [event.clientX, event.clientY];
                let unit = unproject(pixel);
                outer_space.marker.pos = unit;
                console.log('set marker', unit);
            };
            document.body.addEventListener('gesturechange', function (e) {
                const ev = e;
                const multiplier = outer_space.pixelMultiple / 120;
                if (ev.scale < 1.0) {
                    // User moved fingers closer together
                    outer_space.pixelMultiple -= ev.scale * multiplier;
                }
                else if (ev.scale > 1.0) {
                    // User moved fingers further apart
                    outer_space.pixelMultiple += ev.scale * multiplier;
                }
            }, false);
        }
        outer_space.init = init;
        var started;
        var fetcher;
        var things = [];
        function start() {
            if (!started) {
                console.log(' outer space start ');
                statics();
                fetch();
                started = true;
            }
        }
        outer_space.start = start;
        function stop() {
            if (started) {
                let i = things.length;
                while (i--)
                    things[i].remove();
                outer_space.you = undefined;
                outer_space.marker = undefined;
                started = false;
                clearTimeout(fetcher);
            }
        }
        outer_space.stop = stop;
        function statics() {
            outer_space.mapSize = [window.innerWidth, window.innerHeight];
            //you = new float(-1, center, 'you', 'you');
            //you.stamp = -1;
            outer_space.marker = new ping();
            let collision = new float(-1, [2, 1], 'collision', 'collision');
            collision.stamp = -1;
            for (let blob of space$1.regions) {
                let reg = new region(blob.center, blob.name, blob.radius);
                reg.stamp = -1;
            }
        }
        function get_thing_by_id(id) {
            for (const joint of things)
                if (id == joint.id)
                    return joint;
        }
        function handle_you(object, float) {
            const [random] = object;
            if (random.userId == space$1.sply.id) {
                console.log(`we're us`);
                outer_space.you = float;
            }
        }
        function fetch() {
            return __awaiter$1(this, void 0, void 0, function* () {
                let tuple = yield space$1.make_request_json('GET', 'astronomical objects');
                if (!tuple)
                    return;
                outer_space.stamp++;
                const objects = tuple[1];
                for (const object of objects) {
                    const [random, id, pos, type, name] = object;
                    let bee = get_thing_by_id(id);
                    if (bee) {
                        bee.pos = pos;
                        bee.stylize();
                    }
                    else {
                        bee = new float(id, pos, type, name);
                        handle_you(object, bee);
                    }
                    bee.stamp = outer_space.stamp;
                }
                thing.check();
                console.log('fetched');
                fetcher = setTimeout(fetch, 2000);
            });
        }
        outer_space.fetch = fetch;
        function step() {
            if (!started)
                return;
            outer_space.mapSize = [window.innerWidth, window.innerHeight];
            if (outer_space.you) {
                //you.pos = pts.add(you.pos, [0.001, 0]);
                outer_space.center = outer_space.you.pos;
            }
            const multiplier = outer_space.pixelMultiple / zoom_max;
            if (app$1.wheel == 1)
                outer_space.pixelMultiple += 5 * multiplier;
            if (app$1.wheel == -1)
                outer_space.pixelMultiple -= 5 * multiplier;
            outer_space.pixelMultiple = space$1.clamp(outer_space.pixelMultiple, zoom_min, zoom_max);
            outer_space.zoomLevel.innerHTML = `zoom-level: ${outer_space.pixelMultiple.toFixed(1)}`;
            thing.steps();
        }
        outer_space.step = step;
        class thing {
            constructor(id, pos) {
                this.id = id;
                this.pos = pos;
                this.stamp = 0;
                things.push(this);
            }
            append() {
                outer_space.renderer.append(this.element);
            }
            remove() {
                things.splice(things.indexOf(this), 1);
                this.element.remove();
            }
            has_old_stamp() {
                if (this.stamp != -1 && this.stamp != outer_space.stamp) {
                    console.log(` thing went out of lod ! `, this.stamp, outer_space.stamp);
                    return true;
                }
            }
            static check() {
                let i = things.length;
                while (i--) {
                    const joint = things[i];
                    if (joint.has_old_stamp()) {
                        joint.remove();
                    }
                }
            }
            static steps() {
                for (const thing of things)
                    thing.step();
            }
            step() {
                this.stylize();
            }
            stylize() {
            }
        }
        class float extends thing {
            constructor(id, pos, type, name) {
                super(id, pos);
                this.type = type;
                this.name = name;
                console.log('new float');
                this.element = document.createElement('div');
                this.element.classList.add('float');
                this.element.innerHTML = `<span></span><span>${name}</span>`;
                this.stylize();
                this.append();
            }
            stylize() {
                let proj = project(this.pos);
                this.element.style.top = proj[1];
                this.element.style.left = proj[0];
                //console.log('half', half);
            }
        }
        class region extends thing {
            constructor(pos, name, radius) {
                super(-1, pos);
                this.name = name;
                this.radius = radius;
                this.element = document.createElement('div');
                this.element.classList.add('region');
                this.element.innerHTML = `<span>${name}</span>`;
                this.stylize();
                this.append();
            }
            stylize() {
                let proj = project(this.pos);
                const radius = this.radius * outer_space.pixelMultiple;
                this.element.style.top = proj[1] - radius;
                this.element.style.left = proj[0] - radius;
                this.element.style.width = radius * 2;
                this.element.style.height = radius * 2;
            }
        }
        class ping extends thing {
            constructor() {
                super(-1, [0, 0]);
                this.stamp = -1;
                this.element = document.createElement('div');
                this.element.classList.add('ping');
                this.element.innerHTML = `<span></span>`;
                this.stylize();
                this.append();
            }
            stylize() {
                console.log('ping stylize');
                let proj = project(this.pos);
                this.element.style.top = proj[1];
                this.element.style.left = proj[0];
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
        function make_request_json(method, url) {
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url);
                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(JSON.parse(xhr.response));
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
        space.make_request_json = make_request_json;
        function step() {
            outer_space$1.step();
        }
        space.step = step;
        function init() {
            return __awaiter(this, void 0, void 0, function* () {
                outer_space$1.init();
                app$1.mouse();
                space.sideBar = document.querySelector("side-bar");
                space.sideBarContent = document.querySelector("side-bar-content");
                space.sideBarCloseButton = document.querySelector("side-bar close-button");
                space.myContent = document.querySelector("my-content");
                space.myTrivial = document.querySelector("my-trivial");
                space.menuButton = document.querySelector("menu-button");
                space.myLogo = document.querySelector("nav-bar my-logo");
                space.menuButton.onclick = function () {
                    toggle_side_bar();
                };
                space.myLogo.onclick = function () {
                    if (!space.sply) {
                        show_landing_page();
                    }
                };
                space.sideBarCloseButton.onclick = function () {
                    toggle_side_bar();
                };
                //new aabb2([0,0],[0,0]);
                if (document.cookie) {
                    document.cookie = 'a';
                    //console.log('our cookie is ', document.cookie);
                }
                yield ask_initial();
                //outer_space.statics();
            });
        }
        space.init = init;
        function ask_initial() {
            return __awaiter(this, void 0, void 0, function* () {
                space.regions = yield make_request_json('GET', 'regions.json');
                space.locations = yield make_request_json('GET', 'locations.json');
                let stuple = yield make_request_json('GET', 'ply');
                receive_sply(stuple);
                choose_layout();
                console.log('asked initials');
            });
        }
        function update_side_bar() {
            let text = '';
            if (space.sply && space.sply.guest)
                text += `
		<span class="button" onclick="space.show_register(); space.toggle_side_bar()">Become a regular user</span>
		<span class="button" onclick="space.purge(); space.toggle_side_bar()">Delete your guest account</span>
		`;
            if (space.sply && !space.sply.guest)
                text += `
			<span class="button" onclick="space.log_out(); space.toggle_side_bar()">Log out</span>
			`;
            if (text == '')
                text += `Nothing to see here`;
            space.sideBarContent.innerHTML = text;
        }
        space.update_side_bar = update_side_bar;
        var sideBarOpen = false;
        function toggle_side_bar() {
            sideBarOpen = !sideBarOpen;
            if (sideBarOpen) {
                space.sideBar.style.left = 0;
                update_side_bar();
            }
            else {
                space.sideBar.style.left = -300;
            }
        }
        space.toggle_side_bar = toggle_side_bar;
        function choose_layout() {
            console.log('choose layout');
            space.myTrivial.innerHTML = ``;
            if (space.sply) ;
            else {
                show_landing_page();
            }
        }
        space.choose_layout = choose_layout;
        function receive_sply(stuple) {
            const [type, data] = stuple;
            if (type != 'sply')
                console.warn('not sply');
            space.sply = data;
            if (space.sply) {
                outer_space$1.start();
            }
            else {
                outer_space$1.stop();
            }
            update_user_status();
        }
        function update_user_status() {
            console.log('post login notice');
            let navBarRight = document.querySelector("nav-bar-right");
            let text = '';
            if (space.sply) {
                if (space.sply.guest)
                    text += `
			Guest ${space.sply.username}
			<span class="material-symbols-outlined" style="font-size: 18px">no_accounts</span>
			`;
                else
                    text += `
			Logged in as ${space.sply.username}
			<span class="material-symbols-outlined" style="font-size: 18px">how_to_reg</span>
			`;
            }
            else {
                text += `
			<span onclick="space.start_playing()" class="start-playing">Jump In</span>
			<!--or
			<span onclick="space.show_login()" class="start-playing">Login</span>-->
			`;
            }
            navBarRight.innerHTML = text;
        }
        function start_playing() {
            play_as_guest();
        }
        space.start_playing = start_playing;
        var message_timeout;
        function pin_message(message) {
            let element = document.querySelector("my-message");
            let span = document.querySelector("my-message span:nth-child(2)");
            element.style.top = '0px';
            element.style.transition = 'none';
            span.innerHTML = message;
            clearTimeout(message_timeout);
            message_timeout = setTimeout(() => { element.style.transition = 'top 1s linear 0s'; element.style.top = '-110px'; }, 3000);
        }
        space.pin_message = pin_message;
        function show_landing_page() {
            let text = `
		<my-intro>
		<my-welcome>
		<!--<h1>spAce</h1>-->
		Web space sim that combines <span>real-time</span> with <span>text-based</span>.
		<br />
		<br />
		<span class="colorful-button" onclick="space.play_as_guest()">Play as a guest</span>,
		<span class="colorful-button" onclick="space.show_register()">sign up</span>
		<span class="colorful-button" onclick="space.show_login()">or log in</span>
		</my-welcome>
		<p>
		</p>
		</my-intro>
		`;
            space.myTrivial.innerHTML = text;
        }
        space.show_landing_page = show_landing_page;
        function show_login() {
            let text = ``;
            if (space.sply && space.sply.guest)
                text += `
		<p>
		You're currently playing as a guest. Here you can login to an actual account.
		</p>
		`;
            text += `
		<div id="forms">
		<form action="login" method="post">
		<table>
		<tr>
		<td>
		<label for="username">Username</label>
		</td>
		<td>
		<input id="username" type="text" placeholder="username" name="username" required>
		</td>
		</tr>
		<tr>
		<td>
		<label for="psw">Password</label>
		</td>
		<td>
		<input id="password" type="password" placeholder="password" name="psw" required>
		</td>
		</tr>
		<tr>
		<td>
		</td>
		<td>
		<button class="login-button" type="button" onclick="space.xhr_login()">Login</button>
		</td>
		</tr>
		</table>
		
		</form>
		<p>
		<span class="smallish">You will remain logged in until you logout.</span>
		</div>
		`;
            space.myTrivial.innerHTML = text;
        }
        space.show_login = show_login;
        function show_register() {
            let text = `
		<div id="forms">
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
		
		<label for="keep-ship" title="Keep your progress of your guest account">
		<input type="checkbox" checked="checked" name="remember" id="keep-ship"> Keep current guest ship progress
		</label>
		<p>
		you can link your mail later
		<br />
		<br />

		<button type="button" onclick="space.xhr_register()">Register</button>
		
		</form>
		</div>
		`;
            space.myTrivial.innerHTML = text;
        }
        space.show_register = show_register;
        function log_out() {
            return __awaiter(this, void 0, void 0, function* () {
                const data = yield make_request_json('GET', 'logout');
                if (data[0]) {
                    //alert(data[1]);
                    pin_message(data[1]);
                    space.sply = undefined;
                    outer_space$1.stop();
                    update_user_status();
                    pin_message('You logged out');
                    show_landing_page();
                }
                else {
                    pin_message(data[1]);
                    //alert(data[1]);
                }
                //const three = <string>await make_request('GET', 'ply');
                //receive_stuple(three);
            });
        }
        space.log_out = log_out;
        function purge() {
            return __awaiter(this, void 0, void 0, function* () {
                yield make_request_json('GET', 'purge');
                space.sply = undefined;
                pin_message("Purged guest account");
                outer_space$1.stop();
                update_user_status();
                show_landing_page();
            });
        }
        space.purge = purge;
        function play_as_guest() {
            return __awaiter(this, void 0, void 0, function* () {
                const guest = yield make_request_json('GET', 'guest');
                const stuple = yield make_request_json('GET', 'ply');
                if (guest)
                    pin_message('Upgrade anytime to a full user');
                else
                    pin_message('You\'re already a guest');
                receive_sply(stuple);
                choose_layout();
                update_side_bar();
                console.log('layout');
            });
        }
        space.play_as_guest = play_as_guest;
        function xhr_login() {
            return __awaiter(this, void 0, void 0, function* () {
                let username = document.getElementById("username").value;
                let password = document.getElementById("password").value;
                var http = new XMLHttpRequest();
                var url = 'login';
                var params = `username=${username}&password=${password}`;
                http.open('POST', url, true);
                //Send the proper header information along with the request
                http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                http.onreadystatechange = function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (http.readyState == 4 && http.status == 200) {
                            //alert(http.responseText);
                            pin_message(http.responseText);
                            const stuple = yield make_request_json('GET', 'ply');
                            receive_sply(stuple);
                            choose_layout();
                            //.then(function (res: any) {
                            //	receiveStuple(res);
                            //});
                        }
                        else if (http.readyState == 4 && http.status == 400) {
                            pin_message(http.responseText);
                            //alert(http.responseText);
                        }
                    });
                };
                http.send(params);
            });
        }
        space.xhr_login = xhr_login;
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
                    pin_message(http.responseText);
                    //alert(http.responseText);
                    show_login();
                }
                else if (http.readyState == 4 && http.status == 400) {
                    pin_message(http.responseText);
                    //alert(http.responseText);
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
