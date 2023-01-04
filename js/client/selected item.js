import pts from "../shared/pts";
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
        const x_pos = this.toggler.content.querySelector('x-pos');
        if (x_pos) {
            x_pos.innerHTML = `Pos: [ <span>${pts.to_string(obj.tuple[2], 2)}</span> ]`;
        }
        const x_dist = this.toggler.content.querySelector('x-dist');
        if (x_dist) {
            x_dist.innerHTML = `Dist: <span>${pts.dist(outer_space.center, obj.tuple[2]).toFixed(2)} Km</span>`;
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
                this.toggler.content.innerHTML = text;
                //this.update_pos();
                const follow_button = this.toggler.content.querySelector('x-button[data-a="follow"]');
                follow_button.onclick = () => {
                    space.action_follow_target(obj);
                };
                if (is_minable) {
                    const mine_button = this.toggler.content.querySelector('x-button[data-a="mine"]');
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
