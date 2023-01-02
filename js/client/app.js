var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import space from "./space";
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
        if (!event.key)
            return;
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
        return __awaiter(this, void 0, void 0, function* () {
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
            yield space.init();
            loop(0);
        });
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
    var last, current;
    function loop(timestamp) {
        requestAnimationFrame(loop);
        current = performance.now();
        if (!last)
            last = current;
        app.delta = (current - last) / 1000;
        if (app.delta > 1 / 30)
            app.delta = 1 / 30;
        last = current;
        space.step();
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
