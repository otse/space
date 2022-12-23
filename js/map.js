import pts from "./pts";
var map;
(function (map) {
    map.locations = [];
    map.center = [1, 0];
    map.pixelMultiple = 100;
    var floats = [];
    function init() {
        init_renderer();
    }
    map.init = init;
    function tick() {
        map.center = pts.add(map.center, [0.1, 0]);
        for (let float of floats)
            float.tick();
    }
    map.tick = tick;
    function init_renderer() {
        map.rendererElement = document.getElementById("renderer");
        map.mapSize = [window.innerWidth, window.innerHeight];
        let you = new float({
            name: 'you',
            pos: map.center
        });
        let collision = new float({
            name: 'collision',
            pos: [2, 1]
        });
    }
    function rerender() {
    }
    class float {
        constructor(options) {
            this.options = options;
            this.element = document.createElement("div");
            this.element.classList.add('float');
            this.element.innerHTML = `<span></span><span>${options.name}</span>`;
            this.style_position();
            this.append();
        }
        style_position() {
            let half = pts.divide(map.mapSize, 2);
            let deduct = pts.subtract(this.options.pos, map.center);
            deduct = pts.mult(deduct, map.pixelMultiple);
            let add = pts.add(deduct, half);
            this.element.style.top = add[1];
            this.element.style.left = add[0];
            console.log('half', half);
        }
        append() {
            map.rendererElement.append(this.element);
        }
        tick() {
            this.style_position();
        }
    }
})(map || (map = {}));
export default map;
