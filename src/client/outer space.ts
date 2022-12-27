import app from "./app";
import space from "./space";
import pts from "../shared/pts";

namespace outer_space {

	export var renderer

	export var mapSize: vec2

	export var locations: any[] = []

	export var you: float | undefined

	export var center: vec2 = [0, -1]

	export var pixelMultiple = 50

	var floats: float[] = []
	var regions: region[] = []

	export var stamp = 0;

	export function init() {
		renderer = document.querySelector("outer-space");
	}

	var started;
	var fetcher;
	export function start() {
		if (!started) {
			fetch();
			fetcher = setInterval(fetch, 2000);
			started = true;
		}
	}

	export function stop() {
		if (started) {
			wipe();
			clearInterval(fetcher);
			started = false;
		}
	}

	export function statics() {
		console.log(' outer space statics ');

		setup();
	}

	export function wipe() {
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

	function get_float_by_id(id) {
		for (const float of floats)
			if (id == float.id)
				return float;
	}

	function handle_you(object, float) {
		const [random] = object;
		if (random.plyId == space.sply.id) {
			console.log(`we're us`);
			you = float;
		}
	}

	export async function fetch() {
		let tuple = <any>await space.make_request_json('GET', 'astronomical objects');
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
	}

	export function step() {
		if (you) {
			you.pos = pts.add(you.pos, [0.001, 0]);
			center = you.pos;
		}

		if (app.wheel == 1)
			pixelMultiple += 5;
		if (app.wheel == -1)
			pixelMultiple -= 5;

		pixelMultiple = space.clamp(pixelMultiple, 5, 120);

		let i = floats.length;
		while (i--) {
			let float = floats[i];
			float.step();
		}

		for (let region of regions)
			region.step();

	}

	function setup() {
		mapSize = [window.innerWidth, window.innerHeight];

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
		stamp = 0
		static = false
		element
		constructor(
			public id: number,
			public pos: vec2,
			public type: string,
			public name: string,
		) {
			floats.push(this);
			console.log('new float');
			this.element = document.createElement("div");
			this.element.classList.add('float');
			this.element.innerHTML = `<span></span><span>${name}</span>`;
			this.stylize();
			this.append();
		}
		stylize() {
			const half = pts.divide(mapSize, 2);
			let relative = pts.subtract(this.pos, center);
			relative = pts.mult(relative, pixelMultiple);
			relative = pts.add(relative, half);
			this.element.style.top = relative[1];
			this.element.style.left = relative[0];
			//console.log('half', half);
		}
		append() {
			renderer.append(this.element);
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
		static = false
		element;
		constructor(
			public name,
			public pos,
			public radius) {
			regions.push(this);
			this.element = document.createElement("div");
			this.element.classList.add('region');
			this.element.innerHTML = `<span>${name}</span>`;
			this.stylize();
			this.append();
		}
		stylize() {
			const half = pts.divide(mapSize, 2);
			let relative = pts.subtract(this.pos, center);
			relative = pts.mult(relative, pixelMultiple);
			relative = pts.add(relative, half);
			const radius = this.radius * pixelMultiple;
			this.element.style.top = relative[1] - radius;
			this.element.style.left = relative[0] - radius;
			this.element.style.width = radius * 2;
			this.element.style.height = radius * 2;
		}
		append() {
			renderer.append(this.element);
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
}

export default outer_space;