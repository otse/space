import outer_space from "./outer space";
import right_bar from "./right bar";
class nearby_ping extends right_bar.toggler_behavior {
    static make() {
        right_bar.nearby_ping_toggler.behavior = new nearby_ping(right_bar.nearby_ping_toggler);
    }
    constructor(toggler) {
        super(toggler);
        nearby_ping.instance = this;
    }
    on_open() {
        this.toggler.content.innerHTML = 'on open cb';
    }
    on_close() {
    }
    on_step() {
        let text = '';
        for (const thing of outer_space.things)
            text += `
				${thing.tuple[4]}<br />
			`;
        this.toggler.content.innerHTML = text;
    }
}
export default nearby_ping;
