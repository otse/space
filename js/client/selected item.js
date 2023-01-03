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
        this.update_pos();
    }
    update_pos() {
        const obj = outer_space.obj.focus;
        if (!obj)
            return;
        const x_pos = this.toggler.content.querySelector('x-pos');
        if (x_pos) {
            x_pos.innerHTML = `pos: [ <span>${pts.to_string(obj.tuple[2], 2)}</span> ]`;
        }
    }
    build_lost() {
        const text = `~~ Lost ~~`;
        this.toggler.content.innerHTML = text;
    }
    build_once() {
        let text = '';
        const obj = outer_space.obj.focus;
        if (obj) {
            const is_minable = obj.is_type(['rock', 'debris']);
            if (obj.lost) {
                text += ` 
					~~ Lost ~~
				`;
            }
            else {
                text += `
					name: ${obj.tuple[4]}<br />
					type: ${obj.tuple[3]}<br />
					<x-pos></x-pos>
					<x-horizontal-rule></x-horizontal-rule>
					<x-buttons>
			`;
                text += `<x-button data-a="follow">Follow</x-button>`;
                if (is_minable)
                    text += `<x-button data-a="mine">Mine</x-button>`;
                text += `</x-buttons>`;
                this.toggler.content.innerHTML = text;
                //this.update_pos();
                const x_follow_button = this.toggler.content.querySelector('x-button[data-a="follow"]');
                x_follow_button.onclick = () => {
                    console.log('yeah');
                };
                if (is_minable) {
                    const x_button = this.toggler.content.querySelector('x-button[data-a="mine"]');
                    x_button.onclick = () => {
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
