import app from "./app";
import space from "./space";
import pts from "./pts";
var outer_space;
(function (outer_space) {
    outer_space.locations = [];
    outer_space.center = [1, 0];
    outer_space.pixelMultiple = 50;
    var floats = [];
    var regions = [];
    function init() {
    }
    outer_space.init = init;
    function statics() {
        console.log('outer space statics');
        setup();
    }
    outer_space.statics = statics;
    function tick() {
        if (outer_space.you) {
            outer_space.you.options.pos = pts.add(outer_space.you.options.pos, [0.001, 0]);
            outer_space.center = outer_space.you.options.pos;
        }
        if (app.wheel == 1)
            outer_space.pixelMultiple += 5;
        if (app.wheel == -1)
            outer_space.pixelMultiple -= 5;
        outer_space.pixelMultiple = space.clamp(outer_space.pixelMultiple, 5, 120);
        for (let float of floats)
            float.tick();
        for (let region of regions)
            region.tick();
    }
    outer_space.tick = tick;
    function setup() {
        outer_space.element = document.getElementById("outer-space");
        outer_space.mapSize = [window.innerWidth, window.innerHeight];
        outer_space.you = new float({
            name: 'you',
            pos: outer_space.center
        });
        let collision = new float({
            name: 'collision',
            pos: [2, 1]
        });
        for (let blob of space.regions) {
            console.log('new region', blob.name);
            let boob = new region(blob.name, blob.center, blob.radius);
        }
    }
    function rerender() {
    }
    class float {
        constructor(options) {
            this.options = options;
            floats.push(this);
            this.element = document.createElement("div");
            this.element.classList.add('float');
            this.element.innerHTML = `<span></span><span>${options.name}</span>`;
            this.style_position();
            this.append();
        }
        style_position() {
            const half = pts.divide(outer_space.mapSize, 2);
            let relative = pts.subtract(this.options.pos, outer_space.center);
            relative = pts.mult(relative, outer_space.pixelMultiple);
            relative = pts.add(relative, half);
            this.element.style.top = relative[1];
            this.element.style.left = relative[0];
            //console.log('half', half);
        }
        append() {
            outer_space.element.append(this.element);
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
            regions.push(this);
            this.element = document.createElement("div");
            this.element.classList.add('region');
            this.element.innerHTML = `<span>${name}</span>`;
            this.style_position();
            this.append();
        }
        style_position() {
            const half = pts.divide(outer_space.mapSize, 2);
            let relative = pts.subtract(this.pos, outer_space.center);
            relative = pts.mult(relative, outer_space.pixelMultiple);
            relative = pts.add(relative, half);
            const radius = this.radius * outer_space.pixelMultiple;
            this.element.style.top = relative[1] - radius;
            this.element.style.left = relative[0] - radius;
            this.element.style.width = this.radius * 2 * outer_space.pixelMultiple;
            this.element.style.height = this.radius * 2 * outer_space.pixelMultiple;
        }
        append() {
            outer_space.element.append(this.element);
        }
        tick() {
            this.style_position();
        }
    }
})(outer_space || (outer_space = {}));
export default outer_space;
