import pts from "../shared/pts";
import outer_space from "./outer space";
import right_bar from "./right bar";
class selected_item extends right_bar.toggler_behavior {
    constructor(toggler) {
        super(toggler);
        selected_item.instance = this;
    }
    on_open() {
        this.toggler.content.innerHTML = 'on open cb';
    }
    on_close() {
    }
    on_step() {
        let text = '';
        if (outer_space.thing.focus) {
            text += `
                pos: ${pts.to_string(outer_space.thing.focus.tuple[2], 2)}<br />
                type: ${outer_space.thing.focus.tuple[3]}<br />
                name: ${outer_space.thing.focus.tuple[4]}
			`;
        }
        this.toggler.content.innerHTML = text;
    }
}
export default selected_item;
