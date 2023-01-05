import overview from "./overview";
import right_bar from "./right bar";
import selected_item from "./selected item";
import zoom_controls from "./zoom controls";

/*
i had a circular dependency so i made a special consumer file
*/

right_bar;
overview;

namespace right_bar_consumer {
	export function init() {

	}
	export function start() {
		new overview(right_bar.nearby_ping_toggler);
		new selected_item(right_bar.selected_item_toggler);
		new zoom_controls(right_bar.zoom_controls_toggler);
	}
	export function stop() {

	}
}

export default right_bar_consumer;