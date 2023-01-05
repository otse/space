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
        const x_pos = this.get_element('x-pos');
        if (x_pos) {
            x_pos.innerHTML = `Pos: [ <span>${pts.to_string(obj.tuple[2], 2)}</span> ]`;
        }
        const x_dist = this.get_element('x-dist');
        if (x_dist) {
            const unit = units.express_number_with_unit(pts.dist(outer_space.center, obj.tuple[2]));
            x_dist.innerHTML = `Dist: <span>${unit}</span>`;
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
                if (obj.is_type(['region'])) {
                    text += `
					Name: ${obj.tuple[4]}<br />
					Type: ${obj.tuple[3]}<br />
					Subtype: ${obj.tuple[0].subtype || 'generic'}<br />
					Center: ${pts.to_string(obj.tuple[2], 2)}
					
					`;
                }
                else if (obj.is_type(['star'])) {
                    text += `
					Name: ${obj.tuple[4]}<br />
					Type: ${obj.tuple[0].subtype || 'Unknown'}<br />
					Center: ${pts.to_string(obj.tuple[2], 2)}
					`;
                }
                else {
                    text += `
					Name: ${obj.tuple[4]}<br />
					Type: ${obj.tuple[3]}<br />
					<x-pos></x-pos>
					<x-dist></x-dist>
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
            text += 'N/A';
            this.toggler.content.innerHTML = text;
        }
    }
}
export default selected_item;
