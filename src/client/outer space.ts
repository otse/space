import app from "./app";
import space from "./space";
import pts from "../shared/pts";

namespace outer_space {

	export var renderer

	export var mapSize: vec2 = [100, 100]

	export var locations: any[] = []

	export var you: float | undefined

	export var center: vec2 = [0, -1]

	export var pixelMultiple = 50

	export var stamp = 0;

	export function init() {
		renderer = document.querySelector("outer-space");
	}

	var started;
	var fetcher;

	var things: thing[] = []

	export function start() {
		if (!started) {
			console.log(' outer space start ');
			statics();
			fetch();
			started = true;
		}
	}

	export function stop() {
		if (started) {
			let i = things.length;
			while (i--)
				things[i].remove();
			started = false;
		}
	}

	function statics() {
		mapSize = [window.innerWidth, window.innerHeight];

		//you = new float(-1, center, 'you', 'you');
		//you.stamp = -1;

		let collision = new float(-1, [2, 1], 'collision', 'collision');
		collision.stamp = -1;

		for (let blob of space.regions) {
			console.log('new region', blob.name);

			let reg = new region(blob.center, blob.name, blob.radius);
			reg.stamp = -1
		}
	}
	
	function get_thing_by_id(id) {
		for (const joint of things)
			if (id == joint.id)
				return joint;
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
		if (!tuple)
			return;
		outer_space.stamp++;
		const objects = tuple[1];
		for (const object of objects) {
			const [random, id, pos, type, name] = object;
			let bee = get_thing_by_id(id);
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
		thing.check();
		setTimeout(fetch, 2000);
	}

	export function step() {
		mapSize = [window.innerWidth, window.innerHeight];

		if (you) {
			you.pos = pts.add(you.pos, [0.001, 0]);
			center = you.pos;
		}

		if (app.wheel == 1)
			pixelMultiple += 5;
		if (app.wheel == -1)
			pixelMultiple -= 5;

		pixelMultiple = space.clamp(pixelMultiple, 5, 120);

		thing.steps();
	}

	class thing {
		stamp = 0
		element
		constructor(
			public id: number,
			public pos: vec2,
		) {
			things.push(this);
		}
		append() {
			renderer.append(this.element);
		}
		remove() {
			things.splice(things.indexOf(this), 1);
			this.element.remove();
		}
		has_old_stamp() {
			if (this.stamp != -1 && this.stamp != outer_space.stamp) {
				console.log(` joint went out of lod ! `, this.stamp, outer_space.stamp);
				return true;
			}
		}
		static check() {
			let i = things.length;
			while (i--) {
				const joint = things[i];
				if (joint.has_old_stamp()) {
					joint.remove();
				}
			}
		}
		static steps() {
			for (const joint of things)
				joint.step();
		}
		step() {
			this.stylize();
		}
		stylize() {
		}
	}

	class float extends thing {
		constructor(
			id: number,
			pos: vec2,
			public type: string,
			public name: string,
		) {
			super(id, pos);
			console.log('new float');
			this.element = document.createElement("div");
			this.element.classList.add('float');
			this.element.innerHTML = `<span></span><span>${name}</span>`;
			this.stylize();
			this.append();
		}
		override stylize() {
			const half = pts.divide(mapSize, 2);
			let relative = pts.subtract(this.pos, center);
			relative = pts.mult(relative, pixelMultiple);
			relative = pts.add(relative, half);
			this.element.style.top = relative[1];
			this.element.style.left = relative[0];
			//console.log('half', half);
		}
	}

	class region extends thing {
		constructor(
			pos,
			public name,
			public radius) {
			super(-1, pos);
			this.element = document.createElement("div");
			this.element.classList.add('region');
			this.element.innerHTML = `<span>${name}</span>`;
			this.stylize();
			this.append();
		}
		override stylize() {
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
	}
}

export default outer_space;