import pts from "../shared/pts";
import outer_space from "./outer space";
import right_bar from "./right bar";
import space from "./space";

class zoom_controls extends right_bar.toggler_behavior {
	static instance: zoom_controls;

	built = false

	constructor(toggler: right_bar.toggler) {
		super(toggler);
		zoom_controls.instance = this;
	}
	override on_open() {
		//this.toggler.content.innerHTML = 'n/a';
		this.build_once();
	}
	override on_close() {

	}
	override on_fetch() {
		//this.build();

	}
	override on_step() {
	}
	build_once() {
		let text = '';
		text += `
			<x-buttons>
			<x-button data-a="stellar">Stellar</x-button>
			<x-button data-a="local">Local</x-button>
			</x-buttons>
		`;
		this.toggler.content.innerHTML = text;

		const stellar_button = this.get_element('x-button[data-a="stellar"]');
		const local_button = this.get_element('x-button[data-a="local"]');

		stellar_button.onclick = () => {
			outer_space.pixelMultiple = 0.0004;
		}

		local_button.onclick = () => {
			outer_space.pixelMultiple = 10.0;
		}

	}

}

export default zoom_controls;