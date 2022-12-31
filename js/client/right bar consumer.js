import nearby_ping from "./nearby ping";
import right_bar from "./right bar";
/*
we had a circular dependency so we made a special consumer namespace
*/
right_bar;
nearby_ping;
var right_bar_consumer;
(function (right_bar_consumer) {
    function init() {
    }
    right_bar_consumer.init = init;
    function start() {
        new nearby_ping(right_bar.nearby_ping_toggler);
    }
    right_bar_consumer.start = start;
    function stop() {
    }
    right_bar_consumer.stop = stop;
})(right_bar_consumer || (right_bar_consumer = {}));
export default right_bar_consumer;
