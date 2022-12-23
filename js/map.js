import pts from "./pts";
var map;
(function (map) {
    map.center = [1, 0];
    map.pixelMultiple = 100;
    function init() {
        init_renderer();
    }
    map.init = init;
    function init_renderer() {
        map.rendererElement = document.getElementById("renderer");
        map.mapSize = [window.innerWidth, window.innerHeight];
        let you = new float({ name: 'you', pos: map.center });
        you.append();
        let collision = new float({ name: 'collision', pos: [2, 1] });
        collision.append();
    }
    class float {
        constructor(options) {
            this.options = options;
            this.element = document.createElement("div");
            this.element.classList.add('float');
            this.element.innerHTML = `<span></span><span>${options.name}</span>`;
            this.style_position();
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
    }
})(map || (map = {}));
export default map;
