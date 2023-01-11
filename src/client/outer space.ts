import app from "./app";
import space from "./space";
import pts from "../shared/pts";
import overview from "./overview";
import right_bar from "./right bar";
import right_bar_consumer from "./right bar consumer";
import selected_item from "./selected item";
import aabb2 from "../shared/aabb2";

namespace outer_space {

	const deduct_nav_bar = 60;
	const zoom_min = 0.0001;
	const zoom_max = 200;

	export const tick_rate = 2;

	export var renderer, zoomLevel

	export var mapSize: vec2 = [100, 100]

	export var locations: any[] = []

	export var marker: ping | undefined

	export var you: float | undefined

	export var center: vec2 = [0, -1]

	export var pixelMultiple = 50

	export var zoomLimits = [5, 120];

	export var stamp = 0

	export var disableClick = false;

	export function project(unit: vec2) {
		const half = pts.divide(mapSize, 2);
		let pos = pts.subtract(unit, center);
		pos = pts.mult(pos, pixelMultiple);
		pos = pts.add(pos, half);
		pos = pts.add(pos, [0, deduct_nav_bar / 2]);
		return pos;
	}

	export function unproject(pixel: vec2) {
		const half = pts.divide(mapSize, 2);
		let pos = pts.subtract(pixel, half);
		pos = pts.subtract(pos, [0, deduct_nav_bar / 2]);
		pos = pts.divide(pos, pixelMultiple);
		pos = pts.add(pos, center);
		return pos;
	}

	export function is_onscreen(obj: obj) {
		let proj = project(obj.tuple[2]);
		let aabb = new aabb2([0, deduct_nav_bar], [mapSize[0], mapSize[1]]);
		return aabb.test(new aabb2(proj, proj));
	}

	export function element_is_onscreen(obj: obj, element: HTMLElement) {
		let proj = project(obj.tuple[2]);
		//const rect = element.getBoundingClientRect();
		//console.log(rect.top);
		//proj = [rect.left, rect.top];		
		let size: vec2 = [element.clientWidth, element.clientHeight];
		let aabb = new aabb2([0, deduct_nav_bar], [mapSize[0], mapSize[1]]);
		return aabb.test(new aabb2(proj, pts.add(proj, size)));
	}

	export function init() {
		renderer = document.querySelector("outer-space");
		zoomLevel = document.querySelector("outer-space zoom-level");

		renderer.onclick = (event) => {
			if (!started)
				return;
			if (disableClick)
				return;
			console.log(' clicked o/s ');

			let pixel = [event.clientX, event.clientY] as vec2;
			let unit = unproject(pixel);
			marker!.obj.tuple[2] = unit;
			marker!.enabled = true;
			marker!.sticky = undefined;

			obj.focus?.element?.blur();
			obj.focus = undefined;

			//selected_item.instance.toggler.close();
			//overview.instance.toggler.open();
			//thing.focus = undefined;
			console.log('set marker', unit);
		}

		document.body.addEventListener('gesturechange', function (e) {
			const ev = e as any;
			const multiplier = pixelMultiple / zoom_max;
			const zoomAmount = 2 * multiplier;
			if (ev.scale < 1.0)
				pixelMultiple -= zoomAmount;
			else if (ev.scale > 1.0)
				pixelMultiple += zoomAmount;
			overview.instance.toggler.close();
			//selected_item.instance.toggler.close();
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
			you = obj.element as float;
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
				bee.old_pos = bee.tuple[2];
				bee.new_pos = pos;
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
		fetcher = setTimeout(fetch, tick_rate * 1000);
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
		if (!selected_item.instance.toggler.opened)
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
		old_pos: vec2 = [0, 0]
		new_pos: vec2 = [0, 0]
		lost = false
		icon = 'radio_button_unchecked'
		constructor(
			public tuple: tuple,
		) {
			objs.push(this);
			this.set_icon();
		}
		set_icon() {
			if (this.is_type(['ply'])) {
				this.icon = 'rocket';
			}
			else if (this.is_type(['rock'])) {
				this.icon = 'landscape';
			}
			else if (this.is_type(['star'])) {
				this.icon = 'radio_button_unchecked';
			}

		}
		choose_element() {
			if (this.is_type(['ply'])) {
				this.element = new spaceship(this);
			}
			else if (this.is_type(['rock'])) {
				this.element = new rock(this);
			}
			else {
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

				if (!pts.together(this.new_pos))
					this.new_pos = this.tuple[2];

				if (!pts.together(this.old_pos))
					this.old_pos = this.tuple[2];

				const factor = app.delta / tick_rate;
				const dif = pts.subtract(this.new_pos, this.old_pos);
				const tween = pts.mult(dif, factor);
				this.tuple[2] = pts.add(this.tuple[2], tween);
			}
			this.element?.step();
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
		neg: vec2 = [0, 0]
		constructor(obj: obj) {
			super(obj);
			this.element = document.createElement('x-float');
			//this.element.classList.add('float');
			this.element.innerHTML = `<x-triangle></x-triangle><x-label>${this.obj.tuple[4]}</x-label>`;
			this.attach_onclick(this.element);
			this.stylize();
			this.append();
		}
		override step() {
			this.stylize();
		}
		override stylize() {
			let proj = project(this.obj.tuple[2]);
			//this.element.style.top = proj[1] - this.neg[1];
			//this.element.style.left = proj[0] - this.neg[0];
			let x = proj[0] - this.neg[0];
			let y = proj[1] - this.neg[1];
			this.element.style.transform = `translate(${x}px, ${y}px)`;
		}
	}

	export class spaceship extends float {
		showing_actual_spaceship = false
		x_spaceship
		rotation = Math.random() * 360
		constructor(obj: obj) {
			super(obj);
		}
		override step() {
			if (pixelMultiple >= 1 && !this.showing_actual_spaceship) {
				this.showing_actual_spaceship = true;
				this.element.innerHTML = `<x-spaceship></x-spaceship>`;
				this.x_spaceship = this.element.querySelector('x-spaceship');
			}
			else if (pixelMultiple < 1 && this.showing_actual_spaceship) {
				this.showing_actual_spaceship = false;
				this.element.innerHTML = `<x-triangle></x-triangle><x-label>${this.obj.tuple[4]}</x-label>`;
			}
			super.step();
		}
		override stylize() {
			//console.log('stylize spaceship');
			if (this.showing_actual_spaceship) {
				
				let proj = project(this.obj.tuple[2]);
				const size = 4 * pixelMultiple;
				const width = 499 / 500 * pixelMultiple;
				const height = 124 / 500 * pixelMultiple;
				this.x_spaceship.style.width = width;
				this.x_spaceship.style.height = height;
				let x = proj[0] - this.neg[0] - width / 2;
				let y = proj[1] - this.neg[1] - height / 2;
				this.element.style.transform = `translate(${x}px, ${y}px) rotateZ(${this.rotation}deg)`;
			}
			else {
				super.stylize();
			}
		}
	}

	export class rock extends float {
		showing_actual_rock = false
		x_rock
		diameter_in_km = 0.5 + Math.random() * 0.5
		rotation = Math.random() * 360
		constructor(obj: obj) {
			super(obj);
		}
		override step() {
			if (pixelMultiple >= 1 && !this.showing_actual_rock) {
				this.showing_actual_rock = true;
				this.element.innerHTML = `<x-rock></x-rock>`;
				this.x_rock = this.element.querySelector('x-rock');

			} else if (pixelMultiple < 1 && this.showing_actual_rock) {
				this.showing_actual_rock = false;
				this.element.innerHTML = `<x-triangle></x-triangle><x-label>${this.obj.tuple[4]}</x-label>`;
			}
			this.rotation += 0.1;
			if (this.rotation > 360)
				this.rotation -= 360;
			super.step();
		}
		override stylize() {
			if (this.showing_actual_rock) {
				let proj = project(this.obj.tuple[2]);
				const size = this.diameter_in_km * pixelMultiple;
				this.x_rock.style.width = size;
				this.x_rock.style.height = size;
				let x = proj[0] - this.neg[0] - size / 2;
				let y = proj[1] - this.neg[1] - size / 2;
				this.element.style.transform = `translate(${x}px, ${y}px) rotateZ(${this.rotation}deg)`;
			}
			else {
				super.stylize();
			}
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