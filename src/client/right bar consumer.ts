import nearby_ping from "./nearby ping";
import right_bar from "./right bar";
import selected_item from "./selected item";

/*
i had a circular dependency so i made a special consumer file
*/

right_bar;
nearby_ping;

namespace right_bar_consumer {
	export function init() {

	}
	export function start() {
		new nearby_ping(right_bar.nearby_ping_toggler);
		new selected_item(right_bar.selected_item_toggler);
	}
	export function stop() {

	}
}

export default right_bar_consumer;