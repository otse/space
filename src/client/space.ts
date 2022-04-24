import lod from "./lod";
import testing_chamber from "./testing_chamber";
import view from "./view";

export namespace space {
	export var gview: view;

	export const size = 100;

	export function init() {
		starts();
	}

	export function tick() {
		gview?.tick();
		testing_chamber.tick();

	}

	function starts() {
		lod.register();

		gview = view.make();
		//if (window.location.href.indexOf("#testingchamber") != -1) {
			testing_chamber.start();
			//tests.start();
		//}
		//else {
		//}
	}
}

export default space;