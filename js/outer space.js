import app from "./app";
import pts from "./pts";
var outer_space;
(function (outer_space) {
    outer_space.locations = [];
    outer_space.center = [1, 0];
    outer_space.pixelMultiple = 50;
    var floats = [];
    var regions = [];
    function init() {
        setup();
    }
    outer_space.init = init;
    function tick() {
        outer_space.you.options.pos = pts.add(outer_space.you.options.pos, [0.001, 0]);
        //console.log('center', center);
        if (app.wheel == 1)
            outer_space.pixelMultiple += 2;
        if (app.wheel == -1)
            outer_space.pixelMultiple -= 2;
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
        let boob = new region('Great Suldani Belt', [0, 0], 10);
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
        constructor(name, pos, size) {
            this.name = name;
            this.pos = pos;
            this.size = size;
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
            this.element.style.top = relative[1];
            this.element.style.left = relative[0];
            this.element.style.width = this.size * outer_space.pixelMultiple;
            this.element.style.height = this.size * outer_space.pixelMultiple;
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
