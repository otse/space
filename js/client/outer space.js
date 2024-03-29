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
    const zoom_max = 600;
    const zoom_divider = 100;
    outer_space.tick_rate = 2;
    outer_space.mapSize = [100, 100];
    outer_space.locations = [];
    outer_space.pixelMultiple = 50;
    outer_space.zoomLimits = [5, 120];
    outer_space.stamp = 0;
    outer_space.disableClick = false;
    function project(unit) {
        const half = pts.divide(outer_space.mapSize, 2);
        let pos = pts.subtract(unit, outer_space.center.pos);
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
        pos = pts.add(pos, outer_space.center.pos);
        return pos;
    }
    outer_space.unproject = unproject;
    function is_onscreen(obj) {
        let proj = project(obj.pos);
        let aabb = new aabb2([0, deduct_nav_bar], [outer_space.mapSize[0], outer_space.mapSize[1]]);
        return aabb.test(new aabb2(proj, proj));
    }
    outer_space.is_onscreen = is_onscreen;
    function element_is_onscreen(obj, element) {
        let proj = project(obj.pos);
        //const rect = element.getBoundingClientRect();
        //console.log(rect.top);
        //proj = [rect.left, rect.top];		
        let size = [element.clientWidth || 100, element.clientHeight || 100];
        let aabb = new aabb2([0, deduct_nav_bar], [outer_space.mapSize[0], outer_space.mapSize[1]]);
        return aabb.test(new aabb2(proj, pts.add(proj, size)));
    }
    outer_space.element_is_onscreen = element_is_onscreen;
    function init() {
        outer_space.renderer = document.querySelector("outer-space");
        outer_space.zoomLevel = document.querySelector("outer-space zoom-level");
        outer_space.center = new obj([{}, -1, [0, 0], 'center', 'center']);
        outer_space.marker = new ping();
        outer_space.marker.obj.networked = false;
        outer_space.renderer.onclick = (event) => {
            var _a;
            if (!started)
                return;
            if (outer_space.disableClick)
                return;
            console.log(' clicked o/s ');
            let pixel = [event.clientX, event.clientY];
            let unit = unproject(pixel);
            outer_space.marker.obj.pos = unit;
            outer_space.marker.enabled = true;
            outer_space.marker.sticky = undefined;
            if (!selected_item.instance.toggler.opened)
                selected_item.instance.toggler.open();
            (_a = outer_space.focusObj === null || outer_space.focusObj === void 0 ? void 0 : outer_space.focusObj.element) === null || _a === void 0 ? void 0 : _a.blur();
            outer_space.focusObj = undefined;
            //selected_item.instance.toggler.close();
            //overview.instance.toggler.open();
            //thing.focus = undefined;
            console.log('set marker', unit);
        };
        document.body.addEventListener('gesturechange', function (e) {
            const ev = e;
            const multiplier = outer_space.pixelMultiple / zoom_divider;
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
            outer_space.youObj = undefined;
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
        outer_space.marker.obj.pos = [0, 0];
        //you = new float(-1, center, 'you', 'you');
        //you.stamp = -1;
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
        var _a, _b;
        const [random] = object;
        if (random.userId == space.sply.id) {
            console.log(`we're us`);
            outer_space.center = obj;
            outer_space.youObj = obj;
            (_b = (_a = outer_space.youObj.element) === null || _a === void 0 ? void 0 : _a.element) === null || _b === void 0 ? void 0 : _b.classList.add('you');
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
                    bee.tuple = object;
                    bee.old_pos = bee.pos;
                    bee.new_pos = pos;
                }
                else {
                    bee = new obj(object);
                    bee.new_element();
                    handle_you(object, bee);
                }
                bee.stamp = outer_space.stamp;
                if (outer_space.youObj)
                    outer_space.youObj.stamp = -1;
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
        const multiplier = outer_space.pixelMultiple / zoom_divider;
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
        obj.element_steps();
        right_bar.step();
    }
    outer_space.step = step;
    function focus_obj(target) {
        var _a, _b;
        (_a = outer_space.focusObj === null || outer_space.focusObj === void 0 ? void 0 : outer_space.focusObj.element) === null || _a === void 0 ? void 0 : _a.blur();
        outer_space.focusObj = target;
        (_b = target.element) === null || _b === void 0 ? void 0 : _b.focus();
        outer_space.marker.enabled = true;
        outer_space.marker.sticky = target.element;
        outer_space.marker.obj.pos = target.pos;
        if (!selected_item.instance.toggler.opened)
            selected_item.instance.toggler.open();
        console.log('focus on obj');
        return true;
    }
    outer_space.focus_obj = focus_obj;
    outer_space.objs = [];
    class obj {
        constructor(tuple) {
            this.tuple = tuple;
            this.stamp = 0;
            this.networked = true;
            this.pos = [0, 0];
            this.old_pos = [0, 0];
            this.new_pos = [0, 0];
            this.velocity = 0;
            this.lost = false;
            this.icon = 'radio_button_unchecked';
            outer_space.objs.push(this);
            this.set_icon();
            this.pos = tuple[2];
        }
        set_icon() {
            this.icon = (() => {
                switch (this.tuple[3]) {
                    case 'ply':
                    case 'pirate':
                        return 'rocket';
                    case 'rock':
                        return 'landscape';
                    case 'star':
                        return 'radio_button_unchecked';
                    default:
                        return 'rocket';
                }
            })();
        }
        new_element() {
            switch (this.tuple[3]) {
                case 'ply':
                    new spaceship(this);
                    break;
                case 'rock':
                    new rock(this);
                    break;
                case 'star':
                    new star(this);
                    break;
                default:
                    new float(this);
            }
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
        static element_steps() {
            var _a;
            for (const obj of outer_space.objs) {
                (_a = obj.element) === null || _a === void 0 ? void 0 : _a.step();
            }
        }
        step() {
            var _a;
            if (this.networked) {
                if (!pts.together(this.new_pos))
                    this.new_pos = this.tuple[2];
                if (!pts.together(this.old_pos))
                    this.old_pos = this.tuple[2];
                if (app.delta > outer_space.tick_rate) {
                    this.old_pos = this.new_pos;
                    this.pos = this.new_pos;
                }
                else {
                    const factor = app.delta / outer_space.tick_rate;
                    const dif = pts.subtract(this.new_pos, this.old_pos);
                    const keep_up_vector = pts.mult(dif, factor);
                    this.pos = pts.add(this.pos, keep_up_vector);
                }
                if (outer_space.focusObj == this && ((_a = outer_space.marker.sticky) === null || _a === void 0 ? void 0 : _a.obj) == this)
                    outer_space.marker.obj.pos = this.pos;
                /*const fps = 1 / app.delta;
                const keep_up_per_second = pts.divide(keep_up_vector, 1);
                const tween_km_per_second = pts.mult(keep_up_per_second, fps);
                const km_per_second = pts.length_((tween_km_per_second));
                const km_per_hour = Math.round(km_per_second * 3600);
                this.velocity = km_per_hour;*/
            }
            //this.element?.step();
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
            let proj = project(this.obj.pos);
            //this.element.style.top = proj[1] - this.neg[1];
            //this.element.style.left = proj[0] - this.neg[0];
            let x = proj[0] - this.neg[0];
            let y = proj[1] - this.neg[1];
            this.element.style.transform = `translate(${x}px, ${y}px)`;
        }
    }
    outer_space.float = float;
    class spaceship extends float {
        constructor(obj) {
            super(obj);
            this.showing_actual_spaceship = false;
            this.rotation = Math.random() * 360;
        }
        step() {
            const angle = this.obj.tuple[0].ang || 0;
            this.rotation = angle * (180 / Math.PI) + 90;
            if (outer_space.pixelMultiple >= 3 && !this.showing_actual_spaceship) {
                this.showing_actual_spaceship = true;
                this.element.innerHTML = `<x-spaceship></x-spaceship>`;
                this.x_spaceship = this.element.querySelector('x-spaceship');
            }
            else if (outer_space.pixelMultiple < 3 && this.showing_actual_spaceship) {
                this.showing_actual_spaceship = false;
                this.element.innerHTML = `<x-triangle></x-triangle><x-label>${this.obj.tuple[4]}</x-label>`;
            }
            super.step();
        }
        stylize() {
            //console.log('stylize spaceship');
            if (this.showing_actual_spaceship) {
                let proj = project(this.obj.pos);
                const size = 4 * outer_space.pixelMultiple;
                // every spaceship pixel is 2 meter
                const width = 499 / 500 * outer_space.pixelMultiple;
                const height = 128 / 500 * outer_space.pixelMultiple;
                this.x_spaceship.style.width = width;
                this.x_spaceship.style.height = height;
                let x = proj[0] - this.neg[0] - width / 2;
                let y = proj[1] - this.neg[1] - height / 2;
                this.element.style.transform = `translate(${x}px, ${y}px) rotateZ(${-this.rotation}deg)`;
            }
            else {
                super.stylize();
            }
        }
    }
    outer_space.spaceship = spaceship;
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
                let proj = project(this.obj.pos);
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
            let proj = project(this.obj.pos);
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
            let proj = project(this.obj.pos);
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
            let proj = project(this.obj.pos);
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
