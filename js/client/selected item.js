import pts from "../shared/pts";
import units from "../shared/units";
import outer_space from "./outer space";
import right_bar from "./right bar";
import space from "./space";
class selected_item extends right_bar.toggler_behavior {
    constructor(toggler) {
        super(toggler);
        this.attached_onscreen = false;
        selected_item.instance = this;
        this.build_attachment();
        this.x_ui = document.createElement('x-ui');
    }
    on_open() {
        //this.toggler.content.innerHTML = 'n/a';
        this.build_once();
    }
    on_close() {
    }
    on_fetch() {
        //this.build();
    }
    build_attachment() {
        this.attachment = document.createElement('x-attachment');
        this.attachment.innerHTML = '';
        this.attachment.onmouseover = () => {
            outer_space.disableClick = true;
        };
        this.attachment.onmouseleave = () => {
            outer_space.disableClick = false;
        };
        outer_space.renderer.append(this.attachment);
    }
    on_step() {
        //this.build();
        const obj = outer_space.obj.focus;
        if (obj) {
            if (obj.lost)
                this.build_lost();
            else if (this.built_obj != obj)
                this.build_once();
        }
        this.update_teller();
        if (obj) {
            if (outer_space.is_onscreen(obj) && !this.attached_onscreen) {
                this.attached_onscreen = true;
                this.attachment.append(this.x_ui);
                this.toggler.content.innerHTML = 'Shown on HUD';
            }
            else if (!outer_space.is_onscreen(obj)) {
                this.attached_onscreen = false;
                this.x_ui.remove();
                this.toggler.content.innerHTML = '';
                this.toggler.content.append(this.x_ui);
            }
        }
        if (this.attached_onscreen && obj) {
            const proj = outer_space.project(obj.tuple[2]);
            this.attachment.style.display = 'block';
            this.attachment.style.position = 'selected';
            this.attachment.style.top = `${proj[1]}`;
            this.attachment.style.left = `${proj[0]}`;
        }
        else {
            this.attachment.style.display = 'none';
        }
    }
    update_teller() {
        const obj = outer_space.obj.focus;
        if (!obj)
            return;
        const x_onscreen = this.get_element('x-on-screen', this.x_ui);
        if (x_onscreen) {
            x_onscreen.innerHTML = `${!outer_space.is_onscreen(obj) ? 'Off-screen' : ''}`;
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
    build_lost() {
        const text = `~~ Lost ~~`;
        this.toggler.content.innerHTML = text;
    }
    build_once() {
        console.log('build once');
        let text = '';
        const obj = outer_space.obj.focus;
        this.built_obj = obj;
        if (obj) {
            const is_minable = obj.is_type(['rock', 'debris']);
            if (obj.lost) {
                text += `~~ Lost ~~`;
            }
            else {
                text += `<x-on-screen></x-on-screen>`;
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
                this.x_ui.innerHTML = text;
                //this.update_pos();
                const follow_button = this.get_element('x-button[data-a="follow"]', this.x_ui);
                if (follow_button) {
                    follow_button.onclick = () => {
                        space.action_follow_target(obj);
                    };
                }
                if (is_minable) {
                    const mine_button = this.get_element('x-button[data-a="mine"]', this.x_ui);
                    mine_button.onclick = () => {
                        console.log('yeah');
                    };
                }
            }
        }
        else {
            text += 'Nothing';
            this.x_ui.innerHTML = text;
        }
    }
}
export default selected_item;
