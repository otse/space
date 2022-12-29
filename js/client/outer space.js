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
    function set_up_zoom_level() {
    }
    function statics() {
        outer_space.mapSize = [window.innerWidth, window.innerHeight];
        //you = new float(-1, center, 'you', 'you');
        //you.stamp = -1;
        outer_space.marker = new ping();
        let collision = new float(-1, [2, 1], 'collision', 'collision');
        collision.stamp = -1;
        for (let blob of space.regions) {
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
        if (random.userId == space.sply.id) {
            console.log(`we're us`);
            outer_space.you = float;
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
        if (app.wheel == 1)
            outer_space.pixelMultiple += 5 * multiplier;
        if (app.wheel == -1)
            outer_space.pixelMultiple -= 5 * multiplier;
        outer_space.pixelMultiple = space.clamp(outer_space.pixelMultiple, zoom_min, zoom_max);
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
export default outer_space;
