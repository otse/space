
namespace right_bar {

	export var togglers: toggler[] = [];

	export var nearby_ping_toggler: toggler;
	export var selected_item_toggler: toggler;

	export var element;

	export class toggler_behavior {
		constructor(public readonly toggler: toggler) {
			toggler.behavior = this;
		}
		on_open() { }
		on_close() { }
		on_fetch() { }
		on_step() { }
	}

	export class toggler {
		opened = false
		begin: HTMLElement
		title: HTMLElement
		content: HTMLElement
		behavior?: toggler_behavior
		constructor(public readonly name, index: number) {
			togglers.push(this);
			this.begin = document.querySelector(`x-right-bar x-begin:nth-of-type(${index})`)!;
			this.title = this.begin.querySelector('x-title')!;
			this.content = this.begin.querySelector('x-content')!;

			this.begin.classList.add(name);

			this.title.onclick = () => {
				this.opened = !this.opened;
				if (this.opened) {
					this.open();
				}
				else {
					this.close();
				}
			}
		}
		open() {
			this.opened = true;
			this.content.style.display = 'flex';
			this.behavior?.on_open();
		}
		close() {
			this.opened = false;
			this.content.style.display = 'none';
			this.behavior?.on_close();
		}
		fetch() {
			this.behavior?.on_fetch();
		}
		step() {
			this.behavior?.on_step();
		}
	}

	export function init() {
		element = document.querySelector('x-right-bar');

		stop();
	}

	export function start() {
		element.innerHTML = `
		<x-begin>
			<x-title>
				<span>rocket_launch</span>
				<span>Selected Item</span>
			</x-title>
			<x-content>
				nothing to see here
			</x-content>
		</x-begin>
		
		<x-begin>
			<x-title>
				<span>sort</span>
				<span>Overview</span>
			</x-title>
			<x-content>
				boo-ya
			</x-content>
		</x-begin>
		`;

		selected_item_toggler = new toggler('selected-item', 1);
		nearby_ping_toggler = new toggler('overview', 2);

		element.style.visibility = 'visible';
	}

	export function stop() {
		element.style.visibility = 'hidden';
		togglers = [];
	}

	export function step() {
		for (const toggler of togglers) {
			if (toggler.opened) {
				toggler.step();
			}
		}
	}

	export function on_fetch() {
		for (const toggler of togglers) {
			if (toggler.opened) {
				toggler.fetch();
			}
		}
	}
}

export default right_bar;