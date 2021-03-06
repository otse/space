import ren from "./renderer";
import space from "./space";
import client from "./client";
var app;
(function (app) {
    let KEY;
    (function (KEY) {
        KEY[KEY["OFF"] = 0] = "OFF";
        KEY[KEY["PRESS"] = 1] = "PRESS";
        KEY[KEY["WAIT"] = 2] = "WAIT";
        KEY[KEY["AGAIN"] = 3] = "AGAIN";
        KEY[KEY["UP"] = 4] = "UP";
    })(KEY = app.KEY || (app.KEY = {}));
    ;
    let MOUSE;
    (function (MOUSE) {
        MOUSE[MOUSE["UP"] = -1] = "UP";
        MOUSE[MOUSE["OFF"] = 0] = "OFF";
        MOUSE[MOUSE["DOWN"] = 1] = "DOWN";
        MOUSE[MOUSE["STILL"] = 2] = "STILL";
    })(MOUSE = app.MOUSE || (app.MOUSE = {}));
    ;
    var keys = {};
    var buttons = {};
    var pos = [0, 0];
    app.salt = 'x';
    app.wheel = 0;
    function onkeys(event) {
        const key = event.key.toLowerCase();
        if ('keydown' == event.type)
            keys[key] = keys[key] ? KEY.AGAIN : KEY.PRESS;
        else if ('keyup' == event.type)
            keys[key] = KEY.UP;
        if (event.keyCode == 114)
            event.preventDefault();
    }
    app.onkeys = onkeys;
    function key(k) {
        return keys[k];
    }
    app.key = key;
    function button(b) {
        return buttons[b];
    }
    app.button = button;
    function mouse() {
        return [...pos];
    }
    app.mouse = mouse;
    function boot(version) {
        console.log('boot');
        app.salt = version;
        function onmousemove(e) { pos[0] = e.clientX; pos[1] = e.clientY; }
        function onmousedown(e) { buttons[e.button] = 1; if (e.button == 1)
            return false; }
        function onmouseup(e) { buttons[e.button] = MOUSE.UP; }
        function onwheel(e) { app.wheel = e.deltaY < 0 ? 1 : -1; }
        function onerror(message) { document.querySelectorAll('.stats')[0].innerHTML = message; }
        document.onkeydown = document.onkeyup = onkeys;
        document.onmousemove = onmousemove;
        document.onmousedown = onmousedown;
        document.onmouseup = onmouseup;
        document.onwheel = onwheel;
        window.onerror = onerror;
        ren.init();
        client.init();
        space.init();
        loop(0);
    }
    app.boot = boot;
    function process_keys() {
        for (let i in keys) {
            if (keys[i] == KEY.PRESS)
                keys[i] = KEY.WAIT;
            else if (keys[i] == KEY.UP)
                keys[i] = KEY.OFF;
        }
    }
    function process_mouse_buttons() {
        for (let b of [0, 1, 2])
            if (buttons[b] == MOUSE.DOWN)
                buttons[b] = MOUSE.STILL;
            else if (buttons[b] == MOUSE.UP)
                buttons[b] = MOUSE.OFF;
    }
    function loop(timestamp) {
        requestAnimationFrame(loop);
        ren.update();
        client.tick();
        space.tick();
        ren.render();
        app.wheel = 0;
        process_keys();
        process_mouse_buttons();
    }
    app.loop = loop;
    function sethtml(selector, html) {
        let element = document.querySelectorAll(selector)[0];
        element.innerHTML = html;
    }
    app.sethtml = sethtml;
})(app || (app = {}));
window['App'] = app;
export default app;
