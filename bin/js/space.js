import lod from "./lod";
import testing_chamber from "./testing_chamber";
import view from "./view";
export var space;
(function (space) {
    space.size = 100;
    function init() {
        starts();
    }
    space.init = init;
    function tick() {
        space.gview === null || space.gview === void 0 ? void 0 : space.gview.tick();
        testing_chamber.tick();
    }
    space.tick = tick;
    function starts() {
        lod.register();
        space.gview = view.make();
        //if (window.location.href.indexOf("#testingchamber") != -1) {
        testing_chamber.start();
        //tests.start();
        //}
        //else {
        //}
    }
})(space || (space = {}));
export default space;
