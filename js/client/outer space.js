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
import right_bar from "./right bar";
import right_bar_consumer from "./right bar consumer";
import selected_item from "./selected item";
var outer_space;
(function (outer_space) {
    const deduct_nav_bar = 50 / 2;
    const zoom_min = 0.1;
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
        pos = pts.add(pos, [0, deduct_nav_bar]);
        return pos;
    }
    outer_space.project = project;
    function unproject(pixel) {
        const half = pts.divide(outer_space.mapSize, 2);
        let pos = pts.subtract(pixel, half);
        pos = pts.subtract(pos, [0, deduct_nav_bar]);
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
            console.log(' clicked map ');
            let pixel = [event.clientX, event.clientY];
            let unit = unproject(pixel);
            outer_space.marker.tuple[2] = unit;
            outer_space.marker.enabled = true;
            outer_space.marker.sticky = undefined;
            //selected_item.instance.toggler.close();
            //overview.instance.toggler.open();
            //thing.focus = undefined;
            console.log('set marker', unit);
        };
        document.body.addEventListener('gesturechange', function (e) {
            const ev = e;
            const multiplier = outer_space.pixelMultiple / 120;
            const zoomAmount = 2 * multiplier;
            if (ev.scale < 1.0)
                outer_space.pixelMultiple -= zoomAmount;
            else if (ev.scale > 1.0)
                outer_space.pixelMultiple += zoomAmount;
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
        let collision = new float([{}, -1, [2, 1], 'collision', 'collision']);
        collision.stamp = -1;
        for (let blob of space.regions) {
            let reg = new region([{}, -1, blob.center, 'region', blob.name], blob.radius);
            reg.stamp = -1;
        }
    }
    function get_obj_by_id(id) {
        for (const obj of outer_space.objs)
            if (id == obj.tuple[1])
                return obj;
    }
    function handle_you(object, float) {
        const [random] = object;
        if (random.userId == space.sply.id) {
            console.log(`we're us`);
            outer_space.you = float;
            outer_space.you.element.classList.add('you');
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
                    bee.tween_pos = pos;
                    bee.stylize();
                }
                else {
                    bee = new float(object);
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
            outer_space.center = outer_space.you.tuple[2];
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
        outer_space.zoomLevel.innerHTML = `zoom-level: ${outer_space.pixelMultiple.toFixed(1)}`;
        obj.steps();
        right_bar.step();
    }
    outer_space.step = step;
    class element {
        constructor() {
        }
        append() {
            outer_space.renderer.append(this.element);
        }
        remove() {
            this.element.remove();
        }
        stylize() {
        }
        focus() {
            this.element.classList.add('focus');
        }
        blur() {
            this.element.classList.remove('focus');
        }
    }
    outer_space.element = element;
    class obj extends element {
        constructor(tuple) {
            super();
            this.tuple = tuple;
            this.stamp = 0;
            this.tween_pos = [0, 0];
            this.lost = false;
            outer_space.objs.push(this);
        }
        remove() {
            super.remove();
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
            for (const obj of outer_space.objs)
                obj.step();
        }
        step() {
            if (obj.focus == this && outer_space.marker.sticky == this)
                outer_space.marker.tuple[2] = this.tuple[2];
            if (!pts.together(this.tween_pos))
                this.tween_pos = this.tuple[2];
            const factor = app.delta / 2;
            let tween = pts.mult(pts.subtract(this.tween_pos, this.tuple[2]), factor);
            this.tuple[2] = pts.add(this.tuple[2], tween);
            this.stylize();
        }
        attach_onclick() {
            this.element.onclick = (event) => {
                var _a;
                event.stopPropagation();
                (_a = obj.focus) === null || _a === void 0 ? void 0 : _a.blur();
                obj.focus = this;
                this.focus();
                outer_space.marker.enabled = true;
                outer_space.marker.sticky = this;
                outer_space.marker.tuple[2] = this.tuple[2];
                selected_item.instance.toggler.open();
                //overview.instance.toggler.close();
                //marker!.enabled = false;
                console.log('clicked obj');
                //this.element.innerHTML = 'clicked';
                return true;
            };
        }
    }
    outer_space.obj = obj;
    class float extends obj {
        constructor(tuple) {
            super(tuple);
            //console.log('new float');
            this.element = document.createElement('div');
            this.element.classList.add('float');
            this.element.innerHTML = `<span></span><span>${this.tuple[4]}</span>`;
            this.attach_onclick();
            this.stylize();
            this.append();
        }
        stylize() {
            let proj = project(this.tuple[2]);
            this.element.style.top = proj[1];
            this.element.style.left = proj[0];
            //console.log('half', half);
        }
    }
    outer_space.float = float;
    class region extends obj {
        constructor(tuple, radius) {
            super(tuple);
            this.radius = radius;
            this.element = document.createElement('div');
            this.element.classList.add('region');
            this.element.innerHTML = `<span>${this.tuple[4]}</span>`;
            this.stylize();
            this.append();
        }
        stylize() {
            let proj = project(this.tuple[2]);
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
    class ping extends obj {
        constructor() {
            super([{}, -1, [0, 0], 'ping', 'ping']);
            this.enabled = false;
            this.stamp = -1;
            this.element = document.createElement('div');
            this.element.classList.add('ping');
            this.element.innerHTML = `<span></span>`;
            this.stylize();
            this.append();
        }
        stylize() {
            // console.log('ping stylize');
            let proj = project(this.tuple[2]);
            this.element.style.top = proj[1];
            this.element.style.left = proj[0];
            this.element.style.visibility = this.enabled ? 'visible' : 'hidden';
        }
        step() {
            this.stylize();
        }
    }
})(outer_space || (outer_space = {}));
export default outer_space;
