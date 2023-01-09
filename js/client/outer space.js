var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import app from "./app";
import space from "./space";
import pts from "../shared/pts";
import overview from "./overview";
import right_bar from "./right bar";
import right_bar_consumer from "./right bar consumer";
import selected_item from "./selected item";
import aabb2 from "../shared/aabb2";
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
        right_bar.init();
        right_bar_consumer.init();
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
            right_bar.start();
            right_bar_consumer.start();
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
            right_bar.stop();
            right_bar_consumer.stop();
        }
    }
    outer_space.stop = stop;
    function set_up_zoom_level() {
    }
    function statics() {
        outer_space.mapSize = [window.innerWidth, window.innerHeight];
        //you = new float(-1, center, 'you', 'you');
        //you.stamp = -1;
        outer_space.marker = new ping();
        outer_space.marker.obj.networked = false;
        let collision = new float(new obj([{}, -1, [2, 1], 'collision', 'collision']));
        collision.obj.stamp = -1;
        for (let blob of space.regions) {
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
        if (random.userId == space.sply.id) {
            console.log(`we're us`);
            outer_space.you = obj.element;
            (_a = outer_space.you.element) === null || _a === void 0 ? void 0 : _a.classList.add('you');
        }
    }
    function fetch() {
        return __awaiter(this, void 0, void 0, function* () {
            let tuple = yield space.make_request_json('GET', 'astronomical objects');
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
            right_bar.on_fetch();
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
        if (!right_bar.toggler.hovering) {
            if (app.wheel == 1)
                outer_space.pixelMultiple += increment;
            if (app.wheel == -1)
                outer_space.pixelMultiple -= increment;
        }
        outer_space.pixelMultiple = space.clamp(outer_space.pixelMultiple, zoom_min, zoom_max);
        outer_space.zoomLevel.innerHTML = `pixels / kilometer: ${outer_space.pixelMultiple.toFixed(4)}`;
        obj.steps();
        right_bar.step();
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
                const factor = app.delta / outer_space.tick_rate;
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
            this.element.style.top = proj[1] - this.neg[1];
            this.element.style.left = proj[0] - this.neg[0];
            //console.log('half', half);
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
                const size = this.diameter_in_km * outer_space.pixelMultiple;
                this.x_rock.style.width = size;
                this.x_rock.style.height = size;
                this.x_rock.style.margin = `${-size / 2}px`;
                this.x_rock.style.transform = `rotateZ(${this.rotation}deg)`;
            }
            super.stylize();
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
export default outer_space;
