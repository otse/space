import pts from "../shared/pts";
import units from "../shared/units";
import outer_space from "./outer space";
import right_bar from "./right bar";
import space from "./space";
class selected_item extends right_bar.toggler_behavior {
    constructor(toggler) {
        super(toggler);
        this.built = false;
        selected_item.instance = this;
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
    on_step() {
        //this.build();
        const obj = outer_space.obj.focus;
        if (obj && obj.lost)
            this.build_lost();
        else if (this.built_obj != obj)
            this.build_once();
        this.update_teller();
    }
    update_teller() {
        const obj = outer_space.obj.focus;
        if (!obj)
            return;
        const x_onscreen = this.get_element('x-on-screen');
        if (x_onscreen) {
            x_onscreen.innerHTML = `On-screen: ${outer_space.is_onscreen(obj)}`;
        }
        const x_pos = this.get_element('x-pos');
        if (x_pos) {
            x_pos.innerHTML = `Pos: [ <span>${pts.to_string(obj.tuple[2], 2)}</span> ]`;
        }
        const x_dist = this.get_element('x-dist');
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
                this.toggler.content.innerHTML = text;
                //this.update_pos();
                const follow_button = this.get_element('x-button[data-a="follow"]');
                if (follow_button) {
                    follow_button.onclick = () => {
                        space.action_follow_target(obj);
                    };
                }
                if (is_minable) {
                    const mine_button = this.get_element('x-button[data-a="mine"]');
                    mine_button.onclick = () => {
                        console.log('yeah');
                    };
                }
            }
        }
        else {
            text += 'Nothing';
            this.toggler.content.innerHTML = text;
        }
    }
}
export default selected_item;
