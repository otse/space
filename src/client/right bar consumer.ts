import nearby_ping from "./nearby ping";
import right_bar from "./right bar";

/*
we had a circular dependency so we made a special consumer namespace
*/

right_bar;
nearby_ping;

namespace right_bar_consumer {
	export function init() {

	}
	export function start() {
		new nearby_ping(right_bar.nearby_ping_toggler);
	}
	export function stop() {

	}
}

export default right_bar_consumer;