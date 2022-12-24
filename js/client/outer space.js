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
(function (outer_space_1) {
    outer_space_1.locations = [];
    outer_space_1.center = [1, 0];
    outer_space_1.pixelMultiple = 50;
    var floats = [];
    var regions = [];
    outer_space_1.stamp = 0;
    function init() {
        setInterval(fetch, 1000);
    }
    outer_space_1.init = init;
    function statics() {
        console.log('outer space statics');
        setup();
    }
    outer_space_1.statics = statics;
    function get_float_by_id(id) {
        for (const float of floats)
            if (float.id == id)
                return float;
    }
    function fetch() {
        return __awaiter(this, void 0, void 0, function* () {
            outer_space_1.stamp++;
            let text = yield space.make_request('GET', 'celestial objects');
            let tuple = JSON.parse(text);
            const objects = tuple[1];
            for (const object of objects) {
                const [random, id, pos, type] = object;
                const bee = get_float_by_id(id);
                if (bee) {
                    bee.pos = pos;
                    bee.stamp = outer_space_1.stamp;
                    //bee.stylize();
                }
                else {
                    new float(id, type, pos);
                }
            }
            for (let float of floats) {
                float.tick();
            }
            for (let region of regions) {
                region.tick();
            }
        });
    }
    outer_space_1.fetch = fetch;
    function tick() {
        if (outer_space_1.you) {
            outer_space_1.you.pos = pts.add(outer_space_1.you.pos, [0.001, 0]);
            outer_space_1.center = outer_space_1.you.pos;
        }
        if (app.wheel == 1)
            outer_space_1.pixelMultiple += 5;
        if (app.wheel == -1)
            outer_space_1.pixelMultiple -= 5;
        outer_space_1.pixelMultiple = space.clamp(outer_space_1.pixelMultiple, 5, 120);
        for (let float of floats)
            float.tick();
        for (let region of regions)
            region.tick();
    }
    outer_space_1.tick = tick;
    function setup() {
        outer_space_1.outer_space = document.getElementById("outer-space");
        outer_space_1.mapSize = [window.innerWidth, window.innerHeight];
        outer_space_1.you = new float(-1, 'you', outer_space_1.center);
        let collision = new float(-1, 'collision', [2, 1]);
        for (let blob of space.regions) {
            console.log('new region', blob.name);
            let boob = new region(blob.name, blob.center, blob.radius);
        }
    }
    class float {
        constructor(id, name, pos) {
            this.id = id;
            this.name = name;
            this.pos = pos;
            this.stamp = 0;
            this.static = false;
            floats.push(this);
            this.element = document.createElement("div");
            this.element.classList.add('float');
            this.element.innerHTML = `<span></span><span>${name}</span>`;
            this.stylize();
            this.append();
        }
        stylize() {
            const half = pts.divide(outer_space_1.mapSize, 2);
            let relative = pts.subtract(this.pos, outer_space_1.center);
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
            this.stylize();
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
            this.stylize();
        }
    }
})(outer_space || (outer_space = {}));
export default outer_space;
