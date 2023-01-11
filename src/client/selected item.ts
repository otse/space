import pts from "../shared/pts";
import units from "../shared/units";
import outer_space from "./outer space";
import right_bar from "./right bar";
import space from "./space";

class selected_item extends right_bar.toggler_behavior {
	static instance: selected_item;

	built_obj?: outer_space.obj
	docked_obj?: outer_space.obj
	built_void = false
	x_ui
	attachment
	floating = false

	constructor(toggler: right_bar.toggler) {
		super(toggler);
		selected_item.instance = this;
		this.build_attachment();
		this.x_ui = document.createElement('x-ui');
	}
	override on_open() {
		//this.toggler.content.innerHTML = 'n/a';
		//this.build_once();
	}
	override on_close() {

	}
	override on_fetch() {
		//this.build();

	}
	build_attachment() {
		this.attachment = document.createElement('x-attachment');
		this.attachment.innerHTML = '';
		this.attachment.onmouseover = () => {
			outer_space.disableClick = true;
		}
		this.attachment.onmouseleave = () => {
			outer_space.disableClick = false;
		}
		outer_space.renderer.append(this.attachment);
	}
	attach_onscreen() {
		this.floating = true;
		this.attachment.append(this.x_ui);
		this.attachment.style.display = 'block';
		this.toggler.content.innerHTML = `
			<x-ui>
			Shown on HUD
			<x-buttons>
			<x-button data-a="dock">Dock</x-button>
			</x-buttons>
			</x-ui>
		`;
		const dock_button = this.get_element('x-button[data-a="dock"]', this.toggler.content);
		if (dock_button) {
			dock_button.onclick = () => {
				console.log('dock!');
				
				this.docked_obj = this.built_obj;
				this.attach_solid();
			}
		}
		
	}
	attach_solid() {
		this.floating = false;
		this.attachment.style.display = 'none';
		this.x_ui.remove();
		this.toggler.content.innerHTML = '';
		this.toggler.content.append(this.x_ui);
	}
	override on_step() {
		//this.build();
		const obj = outer_space.obj.focus;
		if (obj && !obj.lost && obj != this.built_obj) {
			console.log('lets build once');
			this.docked_obj = undefined;
			this.built_void = false;
			this.build_once();
		}
		if (obj && !this.docked_obj) {
			// this section attaches and detaches the ui based on onscreen-ness
			const onscreen = outer_space.element_is_onscreen(obj, this.x_ui) == 1;
			if (onscreen && !this.floating) {
				this.attach_onscreen();
			}
			else if (!onscreen && this.floating) {
				this.attach_solid();
			}
		}
		if (!obj && !this.built_void) {
			this.built_obj = undefined;
			this.docked_obj = undefined;
			this.attach_solid();
			this.x_ui.innerHTML = `Void`;
		}
		if (obj && obj.lost && this.built_obj) {
			this.built_obj = undefined;
			this.docked_obj = undefined;
			this.x_ui.innerHTML = `
				Object lost
				<x-name-value-pair data-a="offscreen">
				</x-name-value-pair>
			`;
		}
		if (this.floating && obj) {
			const proj = outer_space.project(obj.tuple[2]);
			//this.attachment.style.position = 'selected';
			this.attachment.style.transform = `translate(${proj[0]}px, ${proj[1]}px)`;
			//this.attachment.style.top = `${proj[1]}`;
			//this.attachment.style.left = `${proj[0]}`;
		}
		this.update_teller();
	}
	update_teller() {
		const obj = outer_space.obj.focus;
		if (!obj)
			return;
		//console.log("x-ui onscreen:", );
		const x_offscreen = this.get_element('x-name-value-pair[data-a="offscreen"]', this.x_ui);
		if (x_offscreen) {
			x_offscreen.innerHTML = `${!outer_space.is_onscreen(obj) ? 'Off-screen' : ''}`;
		}
		const x_pos = this.get_element('x-pos', this.x_ui);
		if (x_pos) {
			x_pos.innerHTML = `Pos: [ <span>${pts.to_string(obj.tuple[2], 2)}</span> ]`;
		}
		const x_dist = this.get_element('x-dist', this.x_ui);
		if (x_dist) {
			const unit = units.very_pretty_dist_format(pts.dist(outer_space.center, obj.tuple[2]));
			x_dist.innerHTML = `${unit}`;
		}
	}
	build_once() {
		console.log('build once');
		let text = '';
		const obj = outer_space.obj.focus;
		this.built_obj = obj;
		if (!obj)
			return;
		const is_minable = obj.is_type(['rock', 'debris']);
		
		if (obj.is_type(['region'])) {
			text += `
					<x-name-value-pair>
						<x-name>Name:</x-name>
						<x-value>${obj.tuple[4]}</x-value>
					</x-name-value-pair>
					<x-name-value-pair>
						<x-name>Type:</x-name>
						<x-value>${obj.tuple[3]}</x-value>
					</x-name-value-pair>
					<x-name-value-pair>
						<x-name>Dist:</x-name>
						<x-value><x-dist></x-dist></x-value>
					</x-name-value-pair>
					
					`;
		}
		else if (obj.is_type(['star'])) {
			text += `
					<x-name-value-pair>
						<x-name>Name:</x-name>
						<x-value>${obj.tuple[4]}</x-value>
					</x-name-value-pair>
					<x-name-value-pair>
						<x-name>Type:</x-name>
						<x-value>${obj.tuple[0].subtype || 'Unknown'}</x-value>
					</x-name-value-pair>
					<x-name-value-pair>
						<x-name>Radius:</x-name>
						<x-value>${units.very_pretty_dist_format(obj.tuple[0].radius)}</x-value>
					</x-name-value-pair>
					<x-name-value-pair>
						<x-name>Dist:</x-name>
						<x-value><x-dist></x-dist></x-value>
					</x-name-value-pair>
					`;
			//<!--Center: ${pts.to_string(obj.tuple[2], 2)}-->
		}
		else {
			text += `
					<x-name-value-pair>
						<x-name>Name:</x-name>
						<x-value>${obj.tuple[4]}</x-value>
					</x-name-value-pair>
					<x-name-value-pair>
						<x-name>Type:</x-name>
						<x-value>${obj.tuple[3]}</x-value>
					</x-name-value-pair>
					<x-name-value-pair>
						<x-name>Dist:</x-name>
						<x-value><x-dist></x-dist></x-value>
					</x-name-value-pair>
					<x-horizontal-rule></x-horizontal-rule>
					<x-buttons>
					`;
			text += `<x-button data-a="follow">Follow</x-button>`;
			if (is_minable)
				text += `<x-button data-a="mine">Mine</x-button>`;
			text += `</x-buttons>`;
		}
		text += `
				<x-name-value-pair data-a="offscreen">
				</x-name-value-pair>
				`;
		this.x_ui.innerHTML = text;

		//this.update_pos();

		const follow_button = this.get_element('x-button[data-a="follow"]', this.x_ui);
		if (follow_button) {
			follow_button.onclick = () => {
				console.log('woo');

				space.action_follow_target(obj);
			}
		}

		const mine_button = this.get_element('x-button[data-a="mine"]', this.x_ui);
		if (mine_button) {
			mine_button.onclick = () => {
				console.log('yeah');
			}
		}

	}

}

export default selected_item;