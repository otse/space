import app from "./app";
import space from "./space";
import pts from "../shared/pts";

namespace outer_space {

	export var renderer, zoomLevel

	export var mapSize: vec2 = [100, 100]

	export var locations: any[] = []

	export var you: float | undefined

	export var center: vec2 = [0, -1]

	export var pixelMultiple = 50

	export var stamp = 0;

	export function project(unit: vec2) {
		const half = pts.divide(mapSize, 2);
		let pos = pts.subtract(unit, center);
		pos = pts.mult(pos, pixelMultiple);
		pos = pts.add(pos, half);
		return pos;
	}

	export function unproject(pixel: vec2) {
		const half = pts.divide(mapSize, 2);
		let pos = pts.subtract(pixel, half);
		pos = pts.divide(pos, pixelMultiple);
		pos = pts.add(pos, center);
		return pos;
	}

	export function init() {
		renderer = document.querySelector("outer-space");
		zoomLevel = document.querySelector("outer-space zoom-level");

		renderer.onclick = (event) => {
			console.log(event);

			let pixel = [event.clientX, event.clientY] as vec2;
			
			let unit = unproject(pixel);

			//relative = pts.divide(relative, window.devicePixelRatio);
			//relative = pts.add(relative, [2, -4]);
			marker.pos = unit;
		}

		document.body.addEventListener('gesturechange', function (e) {
			const ev = e as any;
			if (ev.scale < 1.0) {
				// User moved fingers closer together
				pixelMultiple -= ev.scale;
			} else if (ev.scale > 1.0) {
				// User moved fingers further apart
				pixelMultiple += ev.scale;
			}
		}, false);
	}

	var started;
	var fetcher;

	var marker: ping;

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
			you = undefined;
			started = false;
			clearTimeout(fetcher);
		}
	}

	function set_up_zoom_level() {

	}

	function statics() {
		mapSize = [window.innerWidth, window.innerHeight];

		//you = new float(-1, center, 'you', 'you');
		//you.stamp = -1;

		marker = new ping();

		let collision = new float(-1, [2, 1], 'collision', 'collision');
		collision.stamp = -1;

		for (let blob of space.regions) {
			//console.log('new region', blob.name);

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
		if (random.userId == space.sply.id) {
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
		console.log('fetched');
		fetcher = setTimeout(fetch, 2000);
	}

	export function step() {
		mapSize = [window.innerWidth, window.innerHeight];

		if (you) {
			//you.pos = pts.add(you.pos, [0.001, 0]);
			center = you.pos;
		}

		if (app.wheel == 1)
			pixelMultiple += 5;
		if (app.wheel == -1)
			pixelMultiple -= 5;

		pixelMultiple = space.clamp(pixelMultiple, 5, 120);

		zoomLevel.innerHTML = `zoom-level: ${pixelMultiple.toFixed(1)}`;

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
				console.log(` thing went out of lod ! `, this.stamp, outer_space.stamp);
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
			let proj = project(this.pos);
			this.element.style.top = proj[1];
			this.element.style.left = proj[0];
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
			let proj = project(this.pos);
			const radius = this.radius * pixelMultiple;
			this.element.style.top = proj[1] - radius;
			this.element.style.left = proj[0] - radius;
			this.element.style.width = radius * 2;
			this.element.style.height = radius * 2;
		}
	}

	class ping extends thing {
		constructor() {
			super(-1, [0, 0]);
			this.stamp = -1;
			this.element = document.createElement("div");
			this.element.classList.add('ping');
			this.element.innerHTML = `<span></span>`;
			this.stylize();
			this.append();
		}
		override stylize() {
			let proj = project(this.pos);
			this.element.style.top = proj[1];
			this.element.style.left = proj[0];
		}
	}
}

export default outer_space;