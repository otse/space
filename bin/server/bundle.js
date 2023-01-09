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
            if (app.delta > 1 / 30)
                app.delta = 1 / 30;
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
        static to_string(a, p) {
            const e = (i) => a[i].toFixed(p);
            return `${e(0)}, ${e(1)}`;
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

    // https://stackoverflow.com/questions/307179/what-is-javascripts-highest-integer-value-that-a-number-can-go-to-without-losin
    var units;
    (function (units) {
        units.astronomical_unit = 150000000; // 149597871
        function is_astronomical_unit(km) {
        }
        units.is_astronomical_unit = is_astronomical_unit;
        function very_pretty_dist_format(km) {
            const func = (n) => n.toLocaleString("en-US");
            let text = `${func(Math.round(km))} km`;
            if (km <= 10)
                text = `${func(Math.round(km * 1000))} m`;
            else if (km >= units.astronomical_unit / 10)
                text = `${func((km / units.astronomical_unit).toFixed(1))} au`;
            return text;
        }
        units.very_pretty_dist_format = very_pretty_dist_format;
    })(units || (units = {}));
    var units$1 = units;

    var right_bar;
    (function (right_bar) {
        right_bar.togglers = [];
        class toggler_behavior {
            constructor(toggler) {
                this.toggler = toggler;
                toggler.behavior = this;
            }
            get_element(selector, element) {
                if (!element)
                    element = this.toggler.content;
                return element.querySelector(selector);
            }
            on_open() { }
            on_close() { }
            on_fetch() { }
            on_step() { }
        }
        right_bar.toggler_behavior = toggler_behavior;
        class toggler {
            constructor(name, index) {
                this.name = name;
                this.opened = false;
                right_bar.togglers.push(this);
                this.begin = document.querySelector(`x-right-bar x-begin:nth-of-type(${index})`);
                this.title = this.begin.querySelector('x-title');
                this.content = this.begin.querySelector('x-content');
                this.begin.onmouseover = () => {
                    toggler.hovering = true;
                };
                this.begin.onmouseleave = () => {
                    toggler.hovering = false;
                };
                this.begin.classList.add(name);
                this.title.onclick = () => {
                    this.opened = !this.opened;
                    if (this.opened) {
                        this.open();
                    }
                    else {
                        this.close();
                    }
                };
            }
            open() {
                var _a;
                this.opened = true;
                this.content.style.display = 'flex';
                (_a = this.behavior) === null || _a === void 0 ? void 0 : _a.on_open();
            }
            close() {
                var _a;
                this.opened = false;
                this.content.style.display = 'none';
                (_a = this.behavior) === null || _a === void 0 ? void 0 : _a.on_close();
            }
            fetch() {
                var _a;
                (_a = this.behavior) === null || _a === void 0 ? void 0 : _a.on_fetch();
            }
            step() {
                var _a;
                (_a = this.behavior) === null || _a === void 0 ? void 0 : _a.on_step();
            }
        }
        toggler.hovering = false;
        right_bar.toggler = toggler;
        function init() {
            right_bar.element = document.querySelector('x-right-bar');
            stop();
        }
        right_bar.init = init;
        function start() {
            right_bar.element.innerHTML = `

		<x-begin>
			<x-title>
				<span>rocket_launch</span>
				<span>Selected</span>
			</x-title>
			<x-content>
			</x-content>
		</x-begin>
		
		<x-begin>
			<x-title>
				<span>sort</span>
				<span>Objects</span>
			</x-title>
			<x-content>
				boo-ya
			</x-content>
		</x-begin>

		<x-begin>
			<x-title>
				<span>zoom_in</span>
				<span>Scale</span>
			</x-title>
			<x-content>
				boo-ya
			</x-content>
		</x-begin>
		`;
            right_bar.selected_item_toggler = new toggler('selected-item', 1);
            right_bar.nearby_ping_toggler = new toggler('overview', 2);
            right_bar.zoom_controls_toggler = new toggler('scale', 3);
            right_bar.element.style.visibility = 'visible';
        }
        right_bar.start = start;
        function stop() {
            right_bar.element.style.visibility = 'hidden';
            right_bar.togglers = [];
        }
        right_bar.stop = stop;
        function step() {
            for (const toggler of right_bar.togglers) {
                toggler.step();
            }
        }
        right_bar.step = step;
        function on_fetch() {
            for (const toggler of right_bar.togglers) {
                toggler.fetch();
            }
        }
        right_bar.on_fetch = on_fetch;
    })(right_bar || (right_bar = {}));
    var right_bar$1 = right_bar;

    class item {
        constructor(thing) {
            this.thing = thing;
            this.faded = false;
        }
    }
    // from SO
    function is_overflown(element) {
        return element.scrollHeight > element.clientHeight; // || element.scrollWidth > element.clientWidth;
    }
    function truncate(string, limit) {
        if (string.length <= limit)
            return string;
        return string.slice(0, limit) + '...';
    }
    class tab {
        constructor(parent, name, index) {
            this.parent = parent;
            this.name = name;
            tab.tabs.push(this);
            this.element = this.parent.get_element(`x-tab:nth-of-type(${index})`);
            this.element.onclick = () => {
                tab.select(this);
                overview.instance.build_table();
            };
        }
        static select(which) {
            var _a;
            (_a = tab.active) === null || _a === void 0 ? void 0 : _a.element.classList.remove('selected');
            tab.active = which;
            tab.active.element.classList.add('selected');
        }
    }
    tab.tabs = [];
    class overview extends right_bar$1.toggler_behavior {
        constructor(toggler) {
            super(toggler);
            this.items = [];
            overview.instance = this;
            let text = '';
            text += `
			<x-ui>
			<x-tabs>
			<x-tab>
				General
			</x-tab>
			<x-tab>
				Mining
			</x-tab>
			<x-tab>
				Big
			</x-tab>
			<x-scrollable>arrow_downward</x-scrollable>
			</x-tabs>
			<x-outer-content>
			<x-inner-content>
			<x-amount>showing 10 rows</x-amount>
			<table>
			<thead>
			<tr>
			<td></td>
			<td><x-sorter data-a="dist">Dist <span>arrow_drop_up</span></x-sorter></td>
			<td>Name</td>
			<td>Type</td>
			</tr>
			</thead>
			<tbody>
			</tbody>
			</table>
			</x-inner-content>
			</x-outer-content>
			</x-ui>
		`;
            this.toggler.content.innerHTML = text;
            this.x_inner_content = this.get_element('x-inner-content');
            this.tbody = this.get_element('tbody');
            this.scrollable = this.get_element('x-scrollable');
            this.amount = this.get_element('x-amount');
            new tab(this, 'General', 1);
            new tab(this, 'Mining', 2);
            new tab(this, 'Big', 3);
            tab.select(tab.tabs[0]);
            console.log('x-inner-content', this.x_inner_content);
        }
        on_open() {
            //this.on_fetch();
            this.build_table();
        }
        on_close() {
            this.items = [];
        }
        on_step() {
        }
        on_fetch() {
            this.build_table();
        }
        build_table() {
            var _a, _b, _c, _d;
            let table = '';
            let copy = outer_space$1.objs.slice();
            const dist = (obj) => pts.dist(outer_space$1.center, obj.tuple[2]);
            copy.sort((a, b) => dist(a) > dist(b) ? 1 : -1);
            if (((_a = tab.active) === null || _a === void 0 ? void 0 : _a.name) == 'General') {
                copy = copy.filter(a => a.is_type(['ply']));
            }
            else if (((_b = tab.active) === null || _b === void 0 ? void 0 : _b.name) == 'Mining') {
                copy = copy.filter(a => a.is_type(['rock']));
            }
            else if (((_c = tab.active) === null || _c === void 0 ? void 0 : _c.name) == 'Big') {
                copy = copy.filter(a => a.is_type(['star']));
            }
            for (const obj of copy) {
                obj.tuple[3];
                const dist = pts.dist(outer_space$1.center, obj.tuple[2]);
                table += `
				<tr data-a="${obj.tuple[1]}">
				<td><x-icon>${obj.icon}</x-icon></td>
				<td>${units$1.very_pretty_dist_format(dist)}</td>
				<td>${truncate(obj.tuple[4], 10)}</td>
				<td>${obj.tuple[3]}</td>
				</tr>
			`;
                //console.log('woo', thing.tuple[4]);
                //this.do_once = false;
            }
            this.amount.innerHTML = `showing ${copy.length} items`;
            this.tbody.innerHTML = table;
            if (is_overflown(this.x_inner_content)) {
                this.scrollable.style.display = 'block';
            }
            else {
                this.scrollable.style.display = 'none';
            }
            for (const obj of copy) {
                const tr = this.tbody.querySelector(`tr[data-a="${obj.tuple[1]}"]`);
                if (!tr)
                    continue;
                const select = () => {
                    var _a;
                    (_a = this.selected_tr) === null || _a === void 0 ? void 0 : _a.classList.remove('selected');
                    this.selected_tr = tr;
                    tr.classList.add('selected');
                };
                if (tr.dataset.a == ((_d = outer_space$1.obj.focus) === null || _d === void 0 ? void 0 : _d.tuple[1])) {
                    select();
                }
                tr.onclick = () => {
                    outer_space$1.focus_obj(obj);
                    select();
                };
            }
        }
        produce_items() {
            for (const obj of outer_space$1.objs) {
                let ite = new item(obj);
                this.items.push(ite);
            }
        }
    }

    class selected_item extends right_bar$1.toggler_behavior {
        constructor(toggler) {
            super(toggler);
            this.built_void = false;
            this.floating = false;
            selected_item.instance = this;
            this.build_attachment();
            this.x_ui = document.createElement('x-ui');
        }
        on_open() {
            //this.toggler.content.innerHTML = 'n/a';
            this.build_once();
        }
        on_close() {
        }
        on_fetch() {
            //this.build();
        }
        build_attachment() {
            this.attachment = document.createElement('x-attachment');
            this.attachment.innerHTML = '';
            this.attachment.onmouseover = () => {
                outer_space$1.disableClick = true;
            };
            this.attachment.onmouseleave = () => {
                outer_space$1.disableClick = false;
            };
            outer_space$1.renderer.append(this.attachment);
        }
        attach_onscreen() {
            this.floating = true;
            this.attachment.append(this.x_ui);
            this.toggler.content.innerHTML = 'Shown on HUD';
        }
        attach_solid() {
            this.floating = false;
            this.x_ui.remove();
            this.toggler.content.innerHTML = '';
            this.toggler.content.append(this.x_ui);
        }
        on_step() {
            //this.build();
            const obj = outer_space$1.obj.focus;
            if (obj && !obj.lost && obj != this.built_obj) {
                this.build_once();
            }
            if (obj) {
                this.built_void = false;
                const onscreen = outer_space$1.element_is_onscreen(obj, this.x_ui) == 1;
                if (onscreen && !this.floating) {
                    this.attach_onscreen();
                }
                else if (!onscreen && this.floating) {
                    this.attach_solid();
                }
            }
            if (!obj && !this.built_void) {
                this.built_void = true;
                this.attachment.style.display = 'none';
                this.attach_solid();
                this.x_ui.innerHTML = `Void`;
            }
            if ((obj === null || obj === void 0 ? void 0 : obj.lost) && this.built_obj) {
                this.built_obj = undefined;
                this.x_ui.innerHTML = `
			<x-name-value-pair data-a="offscreen">
				<x-name></x-name>
				<x-value></x-value>
			</x-name-value-pair>
			Object lost
			`;
            }
            if (this.floating && obj) {
                const proj = outer_space$1.project(obj.tuple[2]);
                this.attachment.style.display = 'block';
                this.attachment.style.position = 'selected';
                this.attachment.style.transform = `translate(${proj[0]}px, ${proj[1]}px)`;
                //this.attachment.style.top = `${proj[1]}`;
                //this.attachment.style.left = `${proj[0]}`;
            }
            this.update_teller();
        }
        update_teller() {
            const obj = outer_space$1.obj.focus;
            if (!obj)
                return;
            //console.log("x-ui onscreen:", );
            const x_offscreen = this.get_element('x-name-value-pair[data-a="offscreen"]', this.x_ui);
            if (x_offscreen) {
                x_offscreen.innerHTML = `${!outer_space$1.is_onscreen(obj) ? 'Off-screen' : ''}`;
            }
            const x_pos = this.get_element('x-pos', this.x_ui);
            if (x_pos) {
                x_pos.innerHTML = `Pos: [ <span>${pts.to_string(obj.tuple[2], 2)}</span> ]`;
            }
            const x_dist = this.get_element('x-dist', this.x_ui);
            if (x_dist) {
                const unit = units$1.very_pretty_dist_format(pts.dist(outer_space$1.center, obj.tuple[2]));
                x_dist.innerHTML = `${unit}`;
            }
        }
        build_once() {
            console.log('build once');
            let text = '';
            const obj = outer_space$1.obj.focus;
            this.built_obj = obj;
            if (!obj)
                return;
            const is_minable = obj.is_type(['rock', 'debris']);
            text += `
				<x-name-value-pair data-a="offscreen">
					<x-name></x-name>
					<x-value></x-value>
				</x-name-value-pair>
				`;
            if (obj.is_type(['region'])) {
                text += `
					<x-name-value-pair>
						<x-name>Name:</x-name>
						<x-value>${obj.tuple[4]}</x-value>
					</x-name-value-pair>
					<x-name-value-pair>
						<x-name>Type:</x-name>
						<x-value>${obj.tuple[3]}</x-value>
					</x-name-value-pair>
					<x-name-value-pair>
						<x-name>Dist:</x-name>
						<x-value><x-dist></x-dist></x-value>
					</x-name-value-pair>
					
					`;
            }
            else if (obj.is_type(['star'])) {
                text += `
					<x-name-value-pair>
						<x-name>Name:</x-name>
						<x-value>${obj.tuple[4]}</x-value>
					</x-name-value-pair>
					<x-name-value-pair>
						<x-name>Type:</x-name>
						<x-value>${obj.tuple[0].subtype || 'Unknown'}</x-value>
					</x-name-value-pair>
					<x-name-value-pair>
						<x-name>Radius:</x-name>
						<x-value>${units$1.very_pretty_dist_format(obj.tuple[0].radius)}</x-value>
					</x-name-value-pair>
					<x-name-value-pair>
						<x-name>Dist:</x-name>
						<x-value><x-dist></x-dist></x-value>
					</x-name-value-pair>
					`;
                //<!--Center: ${pts.to_string(obj.tuple[2], 2)}-->
            }
            else {
                text += `
					<x-name-value-pair>
						<x-name>Name:</x-name>
						<x-value>${obj.tuple[4]}</x-value>
					</x-name-value-pair>
					<x-name-value-pair>
						<x-name>Type:</x-name>
						<x-value>${obj.tuple[3]}</x-value>
					</x-name-value-pair>
					<x-name-value-pair>
						<x-name>Dist:</x-name>
						<x-value><x-dist></x-dist></x-value>
					</x-name-value-pair>
					<x-horizontal-rule></x-horizontal-rule>
					<x-buttons>
					`;
                text += `<x-button data-a="follow">Follow</x-button>`;
                if (is_minable)
                    text += `<x-button data-a="mine">Mine</x-button>`;
                text += `</x-buttons>`;
            }
            this.x_ui.innerHTML = text;
            //this.update_pos();
            const follow_button = this.get_element('x-button[data-a="follow"]', this.x_ui);
            if (follow_button) {
                follow_button.onclick = () => {
                    console.log('woo');
                    space$1.action_follow_target(obj);
                };
            }
            const mine_button = this.get_element('x-button[data-a="mine"]', this.x_ui);
            if (mine_button) {
                mine_button.onclick = () => {
                    console.log('yeah');
                };
            }
        }
    }

    class zoom_controls extends right_bar$1.toggler_behavior {
        constructor(toggler) {
            super(toggler);
            this.built = false;
            zoom_controls.instance = this;
        }
        on_open() {
            //this.toggler.content.innerHTML = 'n/a';
            this.build_once();
        }
        on_close() {
        }
        on_fetch() {
            //this.build();
        }
        on_step() {
        }
        build_once() {
            let text = '';
            text += `
			<x-buttons>
			<x-button data-a="stellar">Stellar</x-button>
			<x-button data-a="local">Local</x-button>
			</x-buttons>
		`;
            this.toggler.content.innerHTML = text;
            const stellar_button = this.get_element('x-button[data-a="stellar"]');
            const local_button = this.get_element('x-button[data-a="local"]');
            stellar_button.onclick = () => {
                outer_space$1.pixelMultiple = 0.0004;
            };
            local_button.onclick = () => {
                outer_space$1.pixelMultiple = 10.0;
            };
        }
    }

    var right_bar_consumer;
    (function (right_bar_consumer) {
        function init() {
        }
        right_bar_consumer.init = init;
        function start() {
            new overview(right_bar$1.nearby_ping_toggler);
            new selected_item(right_bar$1.selected_item_toggler);
            new zoom_controls(right_bar$1.zoom_controls_toggler);
        }
        right_bar_consumer.start = start;
        function stop() {
        }
        right_bar_consumer.stop = stop;
    })(right_bar_consumer || (right_bar_consumer = {}));
    var right_bar_consumer$1 = right_bar_consumer;

    var TEST;
    (function (TEST) {
        TEST[TEST["Outside"] = 0] = "Outside";
        TEST[TEST["Inside"] = 1] = "Inside";
        TEST[TEST["Overlap"] = 2] = "Overlap";
    })(TEST || (TEST = {}));
    class aabb2 {
        static dupe(bb) {
            return new aabb2(bb.min, bb.max);
        }
        constructor(a, b) {
            this.min = this.max = [...a];
            if (b) {
                this.extend(b);
            }
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
        const deduct_nav_bar = 60;
        const zoom_min = 0.0001;
        const zoom_max = 120;
        outer_space.tick_rate = 2;
        outer_space.mapSize = [100, 100];
        outer_space.locations = [];
        outer_space.center = [0, -1];
        outer_space.pixelMultiple = 50;
        outer_space.zoomLimits = [5, 120];
        outer_space.stamp = 0;
        outer_space.disableClick = false;
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
        function is_onscreen(obj) {
            let proj = project(obj.tuple[2]);
            let aabb = new aabb2([0, deduct_nav_bar], [outer_space.mapSize[0], outer_space.mapSize[1]]);
            return aabb.test(new aabb2(proj, proj));
        }
        outer_space.is_onscreen = is_onscreen;
        function element_is_onscreen(obj, element) {
            let proj = project(obj.tuple[2]);
            let size = [element.clientWidth, element.clientHeight];
            let aabb = new aabb2([0, deduct_nav_bar], [outer_space.mapSize[0], outer_space.mapSize[1]]);
            return aabb.test(new aabb2(proj, pts.add(proj, size)));
        }
        outer_space.element_is_onscreen = element_is_onscreen;
        function init() {
            outer_space.renderer = document.querySelector("outer-space");
            outer_space.zoomLevel = document.querySelector("outer-space zoom-level");
            outer_space.renderer.onclick = (event) => {
                var _a, _b;
                if (!started)
                    return;
                if (outer_space.disableClick)
                    return;
                console.log(' clicked o/s ');
                let pixel = [event.clientX, event.clientY];
                let unit = unproject(pixel);
                outer_space.marker.obj.tuple[2] = unit;
                outer_space.marker.enabled = true;
                outer_space.marker.sticky = undefined;
                (_b = (_a = obj.focus) === null || _a === void 0 ? void 0 : _a.element) === null || _b === void 0 ? void 0 : _b.blur();
                obj.focus = undefined;
                //selected_item.instance.toggler.close();
                //overview.instance.toggler.open();
                //thing.focus = undefined;
                console.log('set marker', unit);
            };
            document.body.addEventListener('gesturechange', function (e) {
                const ev = e;
                const multiplier = outer_space.pixelMultiple / zoom_max;
                const zoomAmount = 2 * multiplier;
                if (ev.scale < 1.0)
                    outer_space.pixelMultiple -= zoomAmount;
                else if (ev.scale > 1.0)
                    outer_space.pixelMultiple += zoomAmount;
                overview.instance.toggler.close();
                //selected_item.instance.toggler.close();
            }, false);
            right_bar$1.init();
            right_bar_consumer$1.init();
        }
        outer_space.init = init;
        var started;
        var fetcher;
        outer_space.objs = [];
        function start() {
            if (!started) {
                console.log(' outer space start ');
                statics();
                fetch();
                right_bar$1.start();
                right_bar_consumer$1.start();
                started = true;
            }
        }
        outer_space.start = start;
        function stop() {
            if (started) {
                let i = outer_space.objs.length;
                while (i--)
                    outer_space.objs[i].remove();
                outer_space.objs = [];
                outer_space.you = undefined;
                outer_space.marker = undefined;
                started = false;
                clearTimeout(fetcher);
                right_bar$1.stop();
                right_bar_consumer$1.stop();
            }
        }
        outer_space.stop = stop;
        function statics() {
            outer_space.mapSize = [window.innerWidth, window.innerHeight];
            //you = new float(-1, center, 'you', 'you');
            //you.stamp = -1;
            outer_space.marker = new ping();
            outer_space.marker.obj.networked = false;
            let collision = new float(new obj([{}, -1, [2, 1], 'collision', 'collision']));
            collision.obj.stamp = -1;
            for (let blob of space$1.regions) {
                let dummy = new obj([{ subtype: blob.subtype }, -1, blob.center, 'region', blob.name]);
                let reg = new region(dummy, blob.radius);
                dummy.element = reg;
                reg.obj.stamp = -1;
            }
            let star_1 = new obj([{ radius: 81100, subtype: 'Red Dwarf Star' }, -2, [-120000, 120000], 'star', 'Aroba']);
            star_1.networked = false;
            // star based on ogle tr 122 b
            new star(star_1);
            let star_2 = new obj([{ radius: 9048, subtype: 'White Dwarf Star' }, -3, [-400000, 120000], 'star', 'Tars']);
            star_2.networked = false;
            // star based on ogle tr 122 b
            new star(star_2);
            let star_3 = new obj([{ radius: 320000, subtype: 'Red Dwarf Star' }, -4, [-1000000, -300000], 'star', 'Loki']);
            star_3.networked = false;
            // star based on ogle tr 122 b
            new star(star_3);
            let star_4 = new obj([{ radius: 679000, subtype: 'Red Dwarf Star' }, -5, [2000000, -400000], 'star', 'Shor']);
            star_4.networked = false;
            // star based on ogle tr 122 b
            new star(star_4);
        }
        function get_obj_by_id(id) {
            for (const obj of outer_space.objs)
                if (id == obj.tuple[1])
                    return obj;
        }
        outer_space.get_obj_by_id = get_obj_by_id;
        function handle_you(object, obj) {
            var _a;
            const [random] = object;
            if (random.userId == space$1.sply.id) {
                console.log(`we're us`);
                outer_space.you = obj.element;
                (_a = outer_space.you.element) === null || _a === void 0 ? void 0 : _a.classList.add('you');
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
                    let bee = get_obj_by_id(id);
                    if (bee) {
                        //bee.tuple[2] = pos;
                        bee.old_pos = bee.tuple[2];
                        bee.new_pos = pos;
                        //bee.element?.stylize();
                    }
                    else {
                        bee = new obj(object);
                        bee.choose_element();
                        handle_you(object, bee);
                    }
                    bee.stamp = outer_space.stamp;
                }
                let i = outer_space.objs.length;
                while (i--) {
                    const obj = outer_space.objs[i];
                    if (obj.older_stamp()) {
                        obj.remove();
                        outer_space.objs.splice(i, 1);
                    }
                }
                right_bar$1.on_fetch();
                console.log('fetched');
                fetcher = setTimeout(fetch, outer_space.tick_rate * 1000);
            });
        }
        outer_space.fetch = fetch;
        function step() {
            if (!started)
                return;
            outer_space.mapSize = [window.innerWidth, window.innerHeight];
            if (outer_space.you) {
                //you.pos = pts.add(you.pos, [0.001, 0]);
                outer_space.center = outer_space.you.obj.tuple[2];
            }
            const multiplier = outer_space.pixelMultiple / zoom_max;
            const increment = 10 * multiplier;
            if (!right_bar$1.toggler.hovering) {
                if (app$1.wheel == 1)
                    outer_space.pixelMultiple += increment;
                if (app$1.wheel == -1)
                    outer_space.pixelMultiple -= increment;
            }
            outer_space.pixelMultiple = space$1.clamp(outer_space.pixelMultiple, zoom_min, zoom_max);
            outer_space.zoomLevel.innerHTML = `pixels / kilometer: ${outer_space.pixelMultiple.toFixed(4)}`;
            obj.steps();
            right_bar$1.step();
        }
        outer_space.step = step;
        function focus_obj(target) {
            var _a, _b, _c;
            (_b = (_a = obj.focus) === null || _a === void 0 ? void 0 : _a.element) === null || _b === void 0 ? void 0 : _b.blur();
            obj.focus = target;
            (_c = target.element) === null || _c === void 0 ? void 0 : _c.focus();
            outer_space.marker.enabled = true;
            outer_space.marker.sticky = target.element;
            outer_space.marker.obj.tuple[2] = target.tuple[2];
            selected_item.instance.toggler.open();
            console.log('focus on obj');
            return true;
        }
        outer_space.focus_obj = focus_obj;
        class obj {
            constructor(tuple) {
                this.tuple = tuple;
                this.stamp = 0;
                this.networked = true;
                this.old_pos = [0, 0];
                this.new_pos = [0, 0];
                this.lost = false;
                this.icon = 'radio_button_unchecked';
                outer_space.objs.push(this);
                this.set_icon();
            }
            set_icon() {
                if (this.is_type(['ply'])) {
                    this.icon = 'rocket';
                }
                else if (this.is_type(['rock'])) {
                    this.icon = 'landscape';
                }
                else if (this.is_type(['star'])) {
                    this.icon = 'radio_button_unchecked';
                }
            }
            choose_element() {
                if (this.is_type(['ply', 'collision'])) {
                    this.element = new float(this);
                }
                else if (this.is_type(['rock'])) {
                    this.element = new rock(this);
                }
                // else if (this.is_type(['region'])) {
                // this.element = new region(this, 10);
                // }
            }
            remove() {
                var _a;
                (_a = this.element) === null || _a === void 0 ? void 0 : _a.remove();
                this.lost = true;
            }
            is_type(types) {
                for (const type of types) {
                    if (type == this.tuple[3]) {
                        return true;
                    }
                }
            }
            older_stamp() {
                if (this.stamp != -1 && this.stamp != outer_space.stamp) {
                    console.log(` obj went out of lod ! `, this.stamp, outer_space.stamp);
                    return true;
                }
            }
            static steps() {
                for (const obj of outer_space.objs) {
                    obj.step();
                }
            }
            step() {
                var _a, _b;
                if (this.networked) {
                    if (obj.focus == this && ((_a = outer_space.marker.sticky) === null || _a === void 0 ? void 0 : _a.obj) == this)
                        outer_space.marker.obj.tuple[2] = this.tuple[2];
                    if (!pts.together(this.new_pos))
                        this.new_pos = this.tuple[2];
                    if (!pts.together(this.old_pos))
                        this.old_pos = this.tuple[2];
                    const factor = app$1.delta / outer_space.tick_rate;
                    const dif = pts.subtract(this.new_pos, this.old_pos);
                    const tween = pts.mult(dif, factor);
                    this.tuple[2] = pts.add(this.tuple[2], tween);
                }
                (_b = this.element) === null || _b === void 0 ? void 0 : _b.step();
            }
        }
        outer_space.obj = obj;
        class element {
            constructor(obj) {
                this.obj = obj;
                this.obj.element = this;
            }
            append() {
                outer_space.renderer.append(this.element);
            }
            remove() {
                this.element.remove();
            }
            focus() {
                this.element.classList.add('focus');
            }
            blur() {
                this.element.classList.remove('focus');
            }
            stylize() {
            }
            step() {
            }
            attach_onclick(element) {
                element.onclick = (event) => {
                    event.stopPropagation();
                    focus_obj(this.obj);
                    return true;
                };
            }
        }
        outer_space.element = element;
        class float extends element {
            constructor(obj) {
                super(obj);
                this.neg = [0, 0];
                this.element = document.createElement('x-float');
                //this.element.classList.add('float');
                this.element.innerHTML = `<x-triangle></x-triangle><x-label>${this.obj.tuple[4]}</x-label>`;
                this.attach_onclick(this.element);
                this.stylize();
                this.append();
            }
            step() {
                this.stylize();
            }
            stylize() {
                let proj = project(this.obj.tuple[2]);
                //this.element.style.top = proj[1] - this.neg[1];
                //this.element.style.left = proj[0] - this.neg[0];
                let x = proj[0] - this.neg[0];
                let y = proj[1] - this.neg[1];
                this.element.style.transform = `translate(${x}px, ${y}px)`;
            }
        }
        outer_space.float = float;
        class rock extends float {
            constructor(obj) {
                super(obj);
                this.showing_actual_rock = false;
                this.diameter_in_km = 0.5 + Math.random() * 0.5;
                this.rotation = Math.random() * 360;
            }
            step() {
                if (outer_space.pixelMultiple >= 1 && !this.showing_actual_rock) {
                    this.showing_actual_rock = true;
                    this.element.innerHTML = `<x-rock></x-rock>`;
                    this.x_rock = this.element.querySelector('x-rock');
                }
                else if (outer_space.pixelMultiple < 1 && this.showing_actual_rock) {
                    this.showing_actual_rock = false;
                    this.element.innerHTML = `<x-triangle></x-triangle><x-label>${this.obj.tuple[4]}</x-label>`;
                }
                this.rotation += 0.1;
                if (this.rotation > 360)
                    this.rotation -= 360;
                super.step();
            }
            stylize() {
                if (this.showing_actual_rock) {
                    let proj = project(this.obj.tuple[2]);
                    const size = this.diameter_in_km * outer_space.pixelMultiple;
                    this.x_rock.style.width = size;
                    this.x_rock.style.height = size;
                    let x = proj[0] - this.neg[0] - size / 2;
                    let y = proj[1] - this.neg[1] - size / 2;
                    this.element.style.transform = `translate(${x}px, ${y}px) rotateZ(${this.rotation}deg)`;
                }
                else {
                    super.stylize();
                }
            }
        }
        outer_space.rock = rock;
        class region extends element {
            constructor(obj, radius) {
                super(obj);
                this.radius = radius;
                this.element = document.createElement('div');
                this.element.classList.add('region');
                this.element.innerHTML = `<span>${this.obj.tuple[4]}</span>`;
                const span = this.element.querySelector('span');
                this.attach_onclick(span);
                this.stylize();
                this.append();
            }
            stylize() {
                let proj = project(this.obj.tuple[2]);
                const radius = this.radius * outer_space.pixelMultiple;
                this.element.style.top = proj[1] - radius;
                this.element.style.left = proj[0] - radius;
                this.element.style.width = radius * 2;
                this.element.style.height = radius * 2;
            }
            step() {
                this.stylize();
            }
        }
        outer_space.region = region;
        class ping extends element {
            constructor() {
                super(new obj([{}, -1, [0, 0], 'ping', 'ping']));
                this.enabled = false;
                this.obj.stamp = -1;
                this.element = document.createElement('div');
                this.element.classList.add('ping');
                this.element.innerHTML = `<span></span>`;
                this.stylize();
                this.append();
            }
            stylize() {
                // console.log('ping stylize');
                let proj = project(this.obj.tuple[2]);
                this.element.style.top = proj[1];
                this.element.style.left = proj[0];
                this.element.style.visibility = this.enabled ? 'visible' : 'hidden';
            }
            step() {
                this.stylize();
            }
        }
        class star extends element {
            constructor(obj) {
                super(obj);
                this.obj.stamp = -1;
                this.element = document.createElement('div');
                this.element.classList.add('star');
                this.element.innerHTML = `<span>${this.obj.tuple[4]}</span>`;
                const span = this.element.querySelector('span');
                this.attach_onclick(span);
                this.stylize();
                this.append();
            }
            stylize() {
                let proj = project(this.obj.tuple[2]);
                const radius = this.obj.tuple[0].radius * outer_space.pixelMultiple;
                this.element.style.top = proj[1] - radius;
                this.element.style.left = proj[0] - radius;
                this.element.style.width = radius * 2;
                this.element.style.height = radius * 2;
                //console.log('stylize star');
            }
            step() {
                this.stylize();
            }
        }
        outer_space.star = star;
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
        function action_follow_target(obj) {
            return __awaiter(this, void 0, void 0, function* () {
                yield make_request_json('GET', 'follow?id=' + obj.tuple[1]);
            });
        }
        space.action_follow_target = action_follow_target;
        function action_begin_mine_target(obj) {
        }
        space.action_begin_mine_target = action_begin_mine_target;
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
			<span onclick="space.start_playing()" class="start-playing">
				<!--Let's Sci-fi!-->
				Play Now
			</span>
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
		<p>
		Optimized for mobile.
		</p>
		<p>
		<span class="colorful-button" onclick="space.play_as_guest()">Play as a guest</span>,
		<span class="colorful-button" onclick="space.show_register()">sign up</span>
		<span class="colorful-button" onclick="space.show_login()">or log in</span>
		</p>
		</my-welcome>
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
