import pts from "../shared/pts";
import outer_space from "./outer space";
import right_bar from "./right bar";
class selected_item extends right_bar.toggler_behavior {
    constructor(toggler) {
        super(toggler);
        selected_item.instance = this;
    }
    on_open() {
        //this.toggler.content.innerHTML = 'n/a';
    }
    on_close() {
    }
    on_step() {
        let text = '';
        const obj = outer_space.obj.focus;
        if (obj) {
            if (obj.lost) {
                text += ' ~~ Lost ~~';
            }
            else {
                text += `
                pos: [ ${pts.to_string(obj.tuple[2], 2)} ]<br />
                type: ${obj.tuple[3]}<br />
                name: ${obj.tuple[4]}
			`;
                text += `
                <br />
                <x-button>mine</x-button>
                `;
            }
        }
        else {
            text += 'N/A';
        }
        this.toggler.content.innerHTML = text;
    }
}
export default selected_item;
