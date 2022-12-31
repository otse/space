
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
		on_step() { }
	}

	export class toggler {
		opened = false
		begin: HTMLElement
		title: HTMLElement
		content: HTMLElement
		behavior?: toggler_behavior
		constructor(public readonly name, from_top: number) {
			togglers.push(this);
			this.begin = document.querySelector(`x-right-bar x-begin:nth-last-of-type(${from_top})`)!;
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
				<span>Ping List</span>
			</x-title>
			<x-content>
				boo-ya
			</x-content>
		</x-begin>
		`;

		nearby_ping_toggler = new toggler('nearby-ping', 1);
		selected_item_toggler = new toggler('selected-item', 2);

		element.style.visibility = 'visible';
	}

	export function stop() {
		element.style.visibility = 'hidden';
		togglers = [];
	}

	export function step() {
		for (const toggler of togglers) {
			toggler.step();
		}
	}
}

export default right_bar;