
namespace right_bar {

	export var togglers: toggler[] = [];

	export var nearby_ping_toggler: toggler;

	export var element;

	export class section_behavior {
		constructor(public readonly toggler: toggler) {

		}
		/* override these methods */
		on_open() {

		}
		on_close() {

		}
		step() {

		}
	}

	export class toggler {
		opened = false
		begin: HTMLElement
		title: HTMLElement
		content: HTMLElement
		behavior?: section_behavior
		constructor(public readonly name, from_top: number) {
			togglers.push(this);
			this.begin = document.querySelector(`x-right-bar x-begin:nth-last-of-type(${from_top})`)!;
			this.title = this.begin.querySelector('x-title')!;
			this.content = this.begin.querySelector('x-content')!;

			this.title.onclick = () => {
				this.opened = !this.opened;
				if (this.opened)
					console.log('boo');
				if (this.opened) {
					this.content.style.display = 'flex';
					this.behavior?.on_open();
				}
				else {
					this.content.style.display = 'none';
					this.behavior?.on_close();
				}
				//this.content.style.height = '100';
				//this.content.innerHTML = `wot up`;
			}
		}
		step() {
			this.behavior?.step();
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
				<span>info</span> <span>info</span>
			</x-title>
			<x-content>
				nothing to see here
			</x-content>
		</x-begin>
		
		<x-begin>
			<x-title>
				<span>nearby ping</span> <span>sort</span>
			</x-title>
			<x-content>
				boo-ya
			</x-content>
		</x-begin>
		`;

		nearby_ping_toggler = new toggler('nearby ping', 1);

		new toggler('info', 2);

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