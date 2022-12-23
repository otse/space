import pts from "./pts";

namespace map {

	export var rendererElement;

	export var mapSize: vec2;
	export var center: vec2 = [1, 0];
	export var pixelMultiple = 100;

	export function init() {
		init_renderer();
	}

	function init_renderer() {
		rendererElement = document.getElementById("renderer")!;

		mapSize = [window.innerWidth, window.innerHeight];

		let you = new float({ name:'you', pos: center });
		you.append();

		let collision = new float( {name: 'collision', pos: [2, 1] })
		collision.append();
	}

	interface float_traits {
		name: string
		pos: vec2
	}

	class float {
		element
		constructor(
			public options: float_traits) {
			this.element = document.createElement("div");
			this.element.classList.add('float');
			this.element.innerHTML = `<span></span><span>${options.name}</span>`;
			this.style_position();
		}
		style_position() {
			let half = pts.divide(mapSize, 2);
			let deduct = pts.subtract(this.options.pos, center);
			deduct = pts.mult(deduct, pixelMultiple);
			let add = pts.add(deduct, half);
			this.element.style.top = add[1];
			this.element.style.left = add[0];
			console.log('half', half);
			
		}
		append() {
			rendererElement.append(this.element);
		}
	}
}

export default map;