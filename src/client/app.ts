import space from "./space";

namespace app {
	export enum KEY {
		OFF = 0,
		PRESS,
		WAIT,
		AGAIN,
		UP
	};
	export enum MOUSE {
		UP = - 1,
		OFF = 0,
		DOWN,
		STILL
	};
	export var error;
	var keys = {};
	var buttons = {};
	var pos: vec2 = [0, 0];
	export var delta;
	export var salt = 'x';
	export var wheel = 0;
	export function onkeys(event) {
		if (!event.key)
			return;
		const key = event.key.toLowerCase();
		if ('keydown' == event.type)
			keys[key] = keys[key] ? KEY.AGAIN : KEY.PRESS;
		else if ('keyup' == event.type)
			keys[key] = KEY.UP;
		if (event.keyCode == 114)
			event.preventDefault();
	}
	export function key(k: string) {
		return keys[k];
	}
	export function button(b: number) {
		return buttons[b];
	}
	export function mouse(): vec2 {
		return [...pos];
	}
	export async function boot(version: string) {
		console.log('boot');

		salt = version;
		function onmousemove(e) { pos[0] = e.clientX; pos[1] = e.clientY; }
		function onmousedown(e) { buttons[e.button] = 1; if (e.button == 1) return false }
		function onmouseup(e) { buttons[e.button] = MOUSE.UP; }
		function onwheel(e) { wheel = e.deltaY < 0 ? 1 : -1; }
		function onerror(message) { document.querySelectorAll('.stats')[0].innerHTML = message; }
		document.onkeydown = document.onkeyup = onkeys;
		document.onmousemove = onmousemove;
		document.onmousedown = onmousedown;
		document.onmouseup = onmouseup;
		document.onwheel = onwheel;
		window.onerror = onerror;
		await space.init();
		loop(0);
	}
	function process_keys() {
		for (let i in keys) {
			if (keys[i] == KEY.PRESS)
				keys[i] = KEY.WAIT;
			else if (keys[i] == KEY.UP)
				keys[i] = KEY.OFF;
		}
	}
	function process_mouse_buttons() {
		for (let b of [0, 1, 2])
			if (buttons[b] == MOUSE.DOWN)
				buttons[b] = MOUSE.STILL;
			else if (buttons[b] == MOUSE.UP)
				buttons[b] = MOUSE.OFF;
	}
	var last, current
	export function loop(timestamp) {
		requestAnimationFrame(loop);
		current = performance.now();
		if (!last)
			last = current;
		delta = (current - last) / 1000;
		//if (delta > 1 / 10)
		//	delta = 1 / 10;
		last = current;
		space.step();
		wheel = 0;
		process_keys();
		process_mouse_buttons();
	}
	export function sethtml(selector, html) {
		let element = document.querySelectorAll(selector)[0];
		element.innerHTML = html;
	}
}

window['App'] = app;

export default app;