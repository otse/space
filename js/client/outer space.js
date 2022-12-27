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
    outer_space.locations = [];
    outer_space.center = [0, -1];
    outer_space.pixelMultiple = 50;
    var floats = [];
    var regions = [];
    outer_space.stamp = 0;
    function init() {
        outer_space.renderer = document.querySelector("outer-space");
    }
    outer_space.init = init;
    var started;
    var fetcher;
    function start() {
        if (!started) {
            fetch();
            fetcher = setInterval(fetch, 2000);
            started = true;
        }
    }
    outer_space.start = start;
    function stop() {
        if (started) {
            wipe();
            clearInterval(fetcher);
            started = false;
        }
    }
    outer_space.stop = stop;
    function statics() {
        console.log(' outer space statics ');
        setup();
    }
    outer_space.statics = statics;
    function wipe() {
        let i;
        i = floats.length;
        while (i--) {
            let float = floats[i];
            float.remove();
        }
        i = regions.length;
        while (i--) {
            let region = regions[i];
            if (!region.static)
                region.remove();
        }
    }
    outer_space.wipe = wipe;
    function get_float_by_id(id) {
        for (const float of floats)
            if (id == float.id)
                return float;
    }
    function handle_you(object, float) {
        const [random] = object;
        if (random.plyId == space.sply.id) {
            console.log(`we're us`);
            outer_space.you = float;
        }
    }
    function fetch() {
        return __awaiter(this, void 0, void 0, function* () {
            let tuple = yield space.make_request_json('GET', 'astronomical objects');
            outer_space.stamp++;
            const objects = tuple[1];
            for (const object of objects) {
                const [random, id, pos, type, name] = object;
                let bee = get_float_by_id(id);
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
        });
    }
    outer_space.fetch = fetch;
    function step() {
        if (outer_space.you) {
            outer_space.you.pos = pts.add(outer_space.you.pos, [0.001, 0]);
            outer_space.center = outer_space.you.pos;
        }
        if (app.wheel == 1)
            outer_space.pixelMultiple += 5;
        if (app.wheel == -1)
            outer_space.pixelMultiple -= 5;
        outer_space.pixelMultiple = space.clamp(outer_space.pixelMultiple, 5, 120);
        let i = floats.length;
        while (i--) {
            let float = floats[i];
            float.step();
        }
        for (let region of regions)
            region.step();
    }
    outer_space.step = step;
    function setup() {
        outer_space.mapSize = [window.innerWidth, window.innerHeight];
        //you = new float(-1, center, 'you', 'you');
        //you.stamp = -1;
        let collision = new float(-1, [2, 1], 'collision', 'collision');
        collision.stamp = -1;
        for (let blob of space.regions) {
            console.log('new region', blob.name);
            let reg = new region(blob.name, blob.center, blob.radius);
            reg.static = true;
        }
    }
    class float {
        constructor(id, pos, type, name) {
            this.id = id;
            this.pos = pos;
            this.type = type;
            this.name = name;
            this.stamp = 0;
            this.static = false;
            floats.push(this);
            console.log('new float');
            this.element = document.createElement("div");
            this.element.classList.add('float');
            this.element.innerHTML = `<span></span><span>${name}</span>`;
            this.stylize();
            this.append();
        }
        stylize() {
            const half = pts.divide(outer_space.mapSize, 2);
            let relative = pts.subtract(this.pos, outer_space.center);
            relative = pts.mult(relative, outer_space.pixelMultiple);
            relative = pts.add(relative, half);
            this.element.style.top = relative[1];
            this.element.style.left = relative[0];
            //console.log('half', half);
        }
        append() {
            outer_space.renderer.append(this.element);
        }
        remove() {
            floats.splice(floats.indexOf(this), 1);
            this.element.remove();
            console.log('removed', this.name);
        }
        step() {
            if (this.stamp != -1 && this.stamp != outer_space.stamp) {
                this.remove();
                console.log(` ${this.name} went out of lod ! `, this.stamp, outer_space.stamp);
            }
            else {
                this.stylize();
            }
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
            this.stylize();
            this.append();
        }
        stylize() {
            const half = pts.divide(outer_space.mapSize, 2);
            let relative = pts.subtract(this.pos, outer_space.center);
            relative = pts.mult(relative, outer_space.pixelMultiple);
            relative = pts.add(relative, half);
            const radius = this.radius * outer_space.pixelMultiple;
            this.element.style.top = relative[1] - radius;
            this.element.style.left = relative[0] - radius;
            this.element.style.width = radius * 2;
            this.element.style.height = radius * 2;
        }
        append() {
            outer_space.renderer.append(this.element);
        }
        remove() {
            // todo regions are generally static and wont be removed
            regions.splice(regions.indexOf(this), 1);
            this.element.remove();
        }
        step() {
            this.stylize();
        }
    }
})(outer_space || (outer_space = {}));
export default outer_space;
