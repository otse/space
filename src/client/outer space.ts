import app from "./app";
import space from "./space";
import pts from "./pts";

namespace outer_space {

	export var element

	export var mapSize: vec2

	export var locations: any[] = []

	export var you: float | undefined
	export var center: vec2 = [1, 0]

	export var pixelMultiple = 50

	var floats: float[] = [];
	var regions: region[] = [];

	export function init() {
	}

	export function statics() {
		console.log('outer space statics');

		setup();
	}

	export function tick() {
		if (you) {
			you.options.pos = pts.add(you.options.pos, [0.001, 0]);
			center = you.options.pos;
		}

		if (app.wheel == 1)
			pixelMultiple += 5;
		if (app.wheel == -1)
			pixelMultiple -= 5;

		pixelMultiple = space.clamp(pixelMultiple, 5, 120);

		for (let float of floats)
			float.tick();

		for (let region of regions)
			region.tick();
	}

	function setup() {
		element = document.getElementById("outer-space")!;

		mapSize = [window.innerWidth, window.innerHeight];

		you = new float({
			name: 'you',
			pos: center
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

	interface float_traits {
		name: string
		pos: vec2
	}

	class float {
		element
		constructor(public options: float_traits) {
			floats.push(this);
			this.element = document.createElement("div");
			this.element.classList.add('float');
			this.element.innerHTML = `<span></span><span>${options.name}</span>`;
			this.style_position();
			this.append();
		}
		style_position() {
			const half = pts.divide(mapSize, 2);
			let relative = pts.subtract(this.options.pos, center);
			relative = pts.mult(relative, pixelMultiple);
			relative = pts.add(relative, half);
			this.element.style.top = relative[1];
			this.element.style.left = relative[0];
			//console.log('half', half);
		}
		append() {
			element.append(this.element);
		}
		tick() {
			this.style_position();
		}
	}

	class region {
		element;
		constructor(
			public name,
			public pos,
			public radius) {
			regions.push(this);
			this.element = document.createElement("div");
			this.element.classList.add('region');
			this.element.innerHTML = `<span>${name}</span>`;
			this.style_position();
			this.append();
		}
		style_position() {
			const half = pts.divide(mapSize, 2);
			let relative = pts.subtract(this.pos, center);
			relative = pts.mult(relative, pixelMultiple);
			relative = pts.add(relative, half);
			const radius = this.radius * pixelMultiple;
			this.element.style.top = relative[1] - radius;
			this.element.style.left = relative[0] - radius;
			this.element.style.width = this.radius * 2 * pixelMultiple;
			this.element.style.height = this.radius * 2 * pixelMultiple;
		}
		append() {
			element.append(this.element);
		}
		tick() {
			this.style_position();
		}
	}
}

export default outer_space;