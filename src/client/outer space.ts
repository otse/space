import app from "./app";
import space from "./space";
import pts from "../shared/pts";
import overview from "./overview";
import right_bar from "./right bar";
import right_bar_consumer from "./right bar consumer";
import selected_item from "./selected item";

namespace outer_space {

	const deduct_nav_bar = 60 / 2;
	const zoom_min = 0.0001;
	const zoom_max = 120;

	export var renderer, zoomLevel

	export var mapSize: vec2 = [100, 100]

	export var locations: any[] = []

	export var marker: ping | undefined

	export var you: float | undefined

	export var center: vec2 = [0, -1]

	export var pixelMultiple = 50

	export var zoomLimits = [5, 120];

	export var stamp = 0

	export function project(unit: vec2) {
		const half = pts.divide(mapSize, 2);
		let pos = pts.subtract(unit, center);
		pos = pts.mult(pos, pixelMultiple);
		pos = pts.add(pos, half);
		pos = pts.add(pos, [0, deduct_nav_bar]);
		return pos;
	}

	export function unproject(pixel: vec2) {
		const half = pts.divide(mapSize, 2);
		let pos = pts.subtract(pixel, half);
		pos = pts.subtract(pos, [0, deduct_nav_bar]);
		pos = pts.divide(pos, pixelMultiple);
		pos = pts.add(pos, center);
		return pos;
	}

	export function init() {
		renderer = document.querySelector("outer-space");
		zoomLevel = document.querySelector("outer-space zoom-level");

		renderer.onclick = (event) => {
			if (!started)
				return;
			console.log(' clicked map ');

			let pixel = [event.clientX, event.clientY] as vec2;
			let unit = unproject(pixel);
			marker!.obj.tuple[2] = unit;
			marker!.enabled = true;
			marker!.sticky = undefined;
			//selected_item.instance.toggler.close();
			//overview.instance.toggler.open();
			//thing.focus = undefined;
			console.log('set marker', unit);
		}

		document.body.addEventListener('gesturechange', function (e) {
			const ev = e as any;
			const multiplier = pixelMultiple / 120;
			const zoomAmount = 2 * multiplier;
			if (ev.scale < 1.0)
				pixelMultiple -= zoomAmount;
			else if (ev.scale > 1.0)
				pixelMultiple += zoomAmount;
			overview.instance.toggler.close();
			selected_item.instance.toggler.close();
		}, false);

		right_bar.init();
		right_bar_consumer.init();
	}

	var started;
	var fetcher;

	export var objs: obj[] = []

	export function start() {
		if (!started) {
			console.log(' outer space start ');
			statics();
			fetch();
			right_bar.start();
			right_bar_consumer.start();
			started = true;
		}
	}

	export function stop() {
		if (started) {
			let i = objs.length;
			while (i--)
				objs[i].remove();
			objs = [];
			you = undefined;
			marker = undefined;
			started = false;
			clearTimeout(fetcher);
			right_bar.stop();
			right_bar_consumer.stop();
		}
	}

	function set_up_zoom_level() {

	}

	function statics() {
		mapSize = [window.innerWidth, window.innerHeight];

		//you = new float(-1, center, 'you', 'you');
		//you.stamp = -1;

		marker = new ping();
		marker.obj.networked = false;

		let collision = new float(new obj([{}, -1, [2, 1], 'collision', 'collision']));
		collision.obj.stamp = -1;

		for (let blob of space.regions) {
			let dummy = new obj([{ subtype: blob.subtype }, -1, blob.center, 'region', blob.name]);
			let reg = new region(dummy, blob.radius);
			dummy.element = reg;
			reg.obj.stamp = -1;
		}

		let star_1 = new obj([{ radius: 81100, subtype: 'Red Dwarf Star' }, -2, [-120000, 120000], 'star', 'Aroba']);
		star_1.networked = false;
		// star based on ogle tr 122 b
		new star(star_1);

		let star_2 = new obj([{ radius: 9048, subtype: 'White Dwarf Star' }, -3, [-400000, 120000], 'star', 'Tars']);
		star_2.networked = false;
		// star based on ogle tr 122 b
		new star(star_2);

		let star_3 = new obj([{ radius: 320000, subtype: 'Red Dwarf Star' }, -4, [-1000000, -300000], 'star', 'Loki']);
		star_3.networked = false;
		// star based on ogle tr 122 b
		new star(star_3);

		let star_4 = new obj([{ radius: 679000, subtype: 'Red Dwarf Star' }, -5, [2000000, -400000], 'star', 'Shor']);
		star_4.networked = false;
		// star based on ogle tr 122 b
		new star(star_4);
	}

	export function get_obj_by_id(id) {
		for (const obj of objs)
			if (id == obj.tuple[1])
				return obj;
	}

	function handle_you(object, obj: obj) {
		const [random] = object;
		if (random.userId == space.sply.id) {
			console.log(`we're us`);
			you = obj.element;
			you!.element?.classList.add('you');
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
			let bee = get_obj_by_id(id);
			if (bee) {
				//bee.tuple[2] = pos;
				bee.tween_pos = pos;
				//bee.element?.stylize();
			}
			else {
				bee = new obj(object);
				bee.choose_element();
				handle_you(object, bee);
			}
			bee.stamp = outer_space.stamp;
		}
		let i = objs.length;
		while (i--) {
			const obj = objs[i];
			if (obj.older_stamp()) {
				obj.remove();
				objs.splice(i, 1);
			}
		}
		right_bar.on_fetch();
		console.log('fetched');
		fetcher = setTimeout(fetch, 2000);
	}

	export function step() {
		if (!started)
			return;
		mapSize = [window.innerWidth, window.innerHeight];

		if (you) {
			//you.pos = pts.add(you.pos, [0.001, 0]);
			center = you.obj.tuple[2];
		}

		const multiplier = pixelMultiple / zoom_max;
		const increment = 10 * multiplier;

		if (!right_bar.toggler.hovering) {
			if (app.wheel == 1)
				pixelMultiple += increment;
			if (app.wheel == -1)
				pixelMultiple -= increment;
		}

		pixelMultiple = space.clamp(pixelMultiple, zoom_min, zoom_max);

		zoomLevel.innerHTML = `pixels / kilometer: ${pixelMultiple.toFixed(4)}`;

		obj.steps();

		right_bar.step();
	}

	export function focus_obj(target: obj) {
		obj.focus?.element?.blur();
		obj.focus = target;
		target.element?.focus();
		marker!.enabled = true;
		marker!.sticky = target.element;
		marker!.obj.tuple[2] = target.tuple[2];
		selected_item.instance.toggler.open();
		console.log('focus on obj');
		return true;
	}

	type tuple = [random: any, id: number, pos: vec2, type: string, name: string];

	export class obj {
		static focus?: obj
		element?: element
		stamp = 0
		networked = true
		tween_pos: vec2 = [0, 0]
		lost = false
		constructor(
			public tuple: tuple,
		) {
			objs.push(this);
		}
		choose_element() {
			if (this.is_type(['ply', 'rock', 'collision'])) {
				this.element = new float(this);
			}
			// else if (this.is_type(['region'])) {
			// this.element = new region(this, 10);
			// }
		}
		remove() {
			this.element?.remove();
			this.lost = true;
		}
		is_type(types: string[]) {
			for (const type of types) {
				if (type == this.tuple[3]) {
					return true;
				}
			}
		}
		older_stamp() {
			if (this.stamp != -1 && this.stamp != outer_space.stamp) {
				console.log(` obj went out of lod ! `, this.stamp, outer_space.stamp);
				return true;
			}
		}
		static steps() {
			for (const obj of objs) {
				obj.step();
			}
		}
		step() {
			if (this.networked) {
				if (obj.focus == this && marker!.sticky?.obj == this)
					marker!.obj.tuple[2] = this.tuple[2];

				if (!pts.together(this.tween_pos))
					this.tween_pos = this.tuple[2];

				const factor = app.delta / 2;
				let tween = pts.mult(pts.subtract(this.tween_pos, this.tuple[2]), factor);
				this.tuple[2] = pts.add(this.tuple[2], tween);
			}
			this.element?.stylize();
		}

	}

	export class element {
		constructor(
			readonly obj: obj) {
			this.obj.element = this;
		}
		element
		append() {
			renderer.append(this.element);
		}
		remove() {
			this.element.remove();
		}
		focus() {
			this.element.classList.add('focus');
		}
		blur() {
			this.element.classList.remove('focus');
		}
		stylize() {
		}
		step() {
		}
		attach_onclick(element) {
			element.onclick = (event) => {
				event.stopPropagation();
				focus_obj(this.obj);
				return true;
			}
		}
	}

	export class float extends element {
		constructor(obj: obj) {
			super(obj);
			this.element = document.createElement('div');
			this.element.classList.add('float');
			this.element.innerHTML = `<span></span><span>${this.obj.tuple[4]}</span>`;
			this.attach_onclick(this.element);
			this.stylize();
			this.append();
		}
		override stylize() {
			let proj = project(this.obj.tuple[2]);
			this.element.style.top = proj[1];
			this.element.style.left = proj[0];
			//console.log('half', half);
		}
	}

	export class region extends element {
		constructor(obj,
			public radius) {
			super(obj);
			this.element = document.createElement('div');
			this.element.classList.add('region');
			this.element.innerHTML = `<span>${this.obj.tuple[4]}</span>`;
			const span = this.element.querySelector('span');
			this.attach_onclick(span);
			this.stylize();
			this.append();
		}
		override stylize() {
			let proj = project(this.obj.tuple[2]);
			const radius = this.radius * pixelMultiple;
			this.element.style.top = proj[1] - radius;
			this.element.style.left = proj[0] - radius;
			this.element.style.width = radius * 2;
			this.element.style.height = radius * 2;
		}
		override step() {
			this.stylize();
		}
	}

	class ping extends element {
		sticky?: element
		enabled = false
		constructor() {
			super(new obj([{}, -1, [0, 0], 'ping', 'ping']));
			this.obj.stamp = -1;
			this.element = document.createElement('div');
			this.element.classList.add('ping');
			this.element.innerHTML = `<span></span>`;
			this.stylize();
			this.append();
		}
		override stylize() {
			// console.log('ping stylize');
			let proj = project(this.obj.tuple[2]);
			this.element.style.top = proj[1];
			this.element.style.left = proj[0];
			this.element.style.visibility = this.enabled ? 'visible' : 'hidden';
		}
		override step() {
			this.stylize();
		}
	}

	export class star extends element {
		constructor(obj) {
			super(obj);
			this.obj.stamp = -1;
			this.element = document.createElement('div');
			this.element.classList.add('star');
			this.element.innerHTML = `<span>${this.obj.tuple[4]}</span>`;
			const span = this.element.querySelector('span');
			this.attach_onclick(span);
			this.stylize();
			this.append();
		}
		override stylize() {
			let proj = project(this.obj.tuple[2]);
			const radius = this.obj.tuple[0].radius * pixelMultiple;
			this.element.style.top = proj[1] - radius;
			this.element.style.left = proj[0] - radius;
			this.element.style.width = radius * 2;
			this.element.style.height = radius * 2;
			//console.log('stylize star');
		}
		override step() {
			this.stylize();
		}
	}
}

export default outer_space;