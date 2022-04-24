import { Matrix3 } from "three";
import pts from "./pts";

export namespace sprites {

	export type tuple = [totalSize: vec2, singleSize: vec2, padding: number, path: string]

	export function start() {

	}

	export const test100: tuple = [[100, 100], [100, 100], 0, 'tex/test100']
	export const asteroid: tuple = [[512, 512], [512, 512], 0, 'tex/pngwing.com']

	export function get_uv_transform(cell: vec2, tuple: tuple) {
		let divide = pts.divides(tuple[1], tuple[0]);
		let offset = pts.mults(divide, cell);
		let repeat = divide;
		let center = [0, 1];
		let mat = new Matrix3;
		mat.setUvTransform(offset[0], offset[1], repeat[0], repeat[1], 0, center[0], center[1]);
		return mat;
	};
};

export default sprites;