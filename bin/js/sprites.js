import { Matrix3 } from "three";
import pts from "./pts";
export var sprites;
(function (sprites) {
    function start() {
    }
    sprites.start = start;
    sprites.test100 = [[100, 100], [100, 100], 0, 'tex/test100'];
    sprites.asteroid = [[512, 512], [512, 512], 0, 'tex/pngwing.com'];
    function get_uv_transform(cell, tuple) {
        let divide = pts.divides(tuple[1], tuple[0]);
        let offset = pts.mults(divide, cell);
        let repeat = divide;
        let center = [0, 1];
        let mat = new Matrix3;
        mat.setUvTransform(offset[0], offset[1], repeat[0], repeat[1], 0, center[0], center[1]);
        return mat;
    }
    sprites.get_uv_transform = get_uv_transform;
    ;
})(sprites || (sprites = {}));
;
export default sprites;
