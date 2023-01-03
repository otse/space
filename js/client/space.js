var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//import { rename } from "fs";
import app from "./app";
import outer_space from "./outer space";
var space;
(function (space) {
    function sample(a) {
        return a[Math.floor(Math.random() * a.length)];
    }
    space.sample = sample;
    function clamp(val, min, max) {
        return val > max ? max : val < min ? min : val;
    }
    space.clamp = clamp;
    function make_request_json(method, url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.response));
                }
                else {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
    }
    space.make_request_json = make_request_json;
    // Example:
    function deleteAllCookies() {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
    function step() {
        outer_space.step();
    }
    space.step = step;
    function init() {
        return __awaiter(this, void 0, void 0, function* () {
            outer_space.init();
            app.mouse();
            space.sideBar = document.querySelector("side-bar");
            space.sideBarContent = document.querySelector("side-bar-content");
            space.sideBarCloseButton = document.querySelector("side-bar close-button");
            space.myContent = document.querySelector("my-content");
            space.myTrivial = document.querySelector("my-trivial");
            space.menuButton = document.querySelector("menu-button");
            space.myLogo = document.querySelector("nav-bar my-logo");
            space.menuButton.onclick = function () {
                toggle_side_bar();
            };
            space.myLogo.onclick = function () {
                if (!space.sply) {
                    show_landing_page();
                }
            };
            space.sideBarCloseButton.onclick = function () {
                toggle_side_bar();
            };
            //new aabb2([0,0],[0,0]);
            if (document.cookie) {
                document.cookie = 'a';
                //console.log('our cookie is ', document.cookie);
            }
            else {
                //console.log('logged_in');
            }
            yield ask_initial();
            //outer_space.statics();
        });
    }
    space.init = init;
    function ask_initial() {
        return __awaiter(this, void 0, void 0, function* () {
            space.regions = yield make_request_json('GET', 'regions.json');
            space.locations = yield make_request_json('GET', 'locations.json');
            let stuple = yield make_request_json('GET', 'ply');
            receive_sply(stuple);
            choose_layout();
            console.log('asked initials');
        });
    }
    function update_side_bar() {
        let text = '';
        if (space.sply && space.sply.guest)
            text += `
		<span class="button" onclick="space.show_register(); space.toggle_side_bar()">Become a regular user</span>
		<span class="button" onclick="space.purge(); space.toggle_side_bar()">Delete your guest account</span>
		`;
        if (space.sply && !space.sply.guest)
            text += `
			<span class="button" onclick="space.log_out(); space.toggle_side_bar()">Log out</span>
			`;
        if (text == '')
            text += `Nothing to see here`;
        space.sideBarContent.innerHTML = text;
    }
    space.update_side_bar = update_side_bar;
    var sideBarOpen = false;
    function toggle_side_bar() {
        sideBarOpen = !sideBarOpen;
        if (sideBarOpen) {
            space.sideBar.style.left = 0;
            update_side_bar();
        }
        else {
            space.sideBar.style.left = -300;
        }
    }
    space.toggle_side_bar = toggle_side_bar;
    function choose_layout() {
        console.log('choose layout');
        space.myTrivial.innerHTML = ``;
        if (space.sply) {
        }
        else {
            show_landing_page();
        }
    }
    space.choose_layout = choose_layout;
    function action_follow_target(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield make_request_json('GET', 'follow?id=' + obj.tuple[1]);
        });
    }
    space.action_follow_target = action_follow_target;
    function action_begin_mine_target(obj) {
    }
    space.action_begin_mine_target = action_begin_mine_target;
    function receive_sply(stuple) {
        const [type, data] = stuple;
        if (type != 'sply')
            console.warn('not sply');
        space.sply = data;
        if (space.sply) {
            outer_space.start();
        }
        else {
            outer_space.stop();
        }
        update_user_status();
    }
    function receive_stuple(stuple) {
        console.log('received stuple', stuple);
        if (stuple == false)
            return;
        const [type, data] = stuple;
        if (type == 'sply') {
            space.sply = data;
            outer_space.start();
            //choose_layout();
        }
        else if (type == 'message') {
            pin_message(data);
        }
        //else if (type == 'senemies') {
        //	senemies = data;
        //}
    }
    function update_user_status() {
        console.log('post login notice');
        let navBarRight = document.querySelector("nav-bar-right");
        let text = '';
        if (space.sply) {
            if (space.sply.guest)
                text += `
			Guest ${space.sply.username}
			<span class="material-symbols-outlined" style="font-size: 18px">no_accounts</span>
			`;
            else
                text += `
			Logged in as ${space.sply.username}
			<span class="material-symbols-outlined" style="font-size: 18px">how_to_reg</span>
			`;
        }
        else {
            text += `
			<span onclick="space.start_playing()" class="start-playing">
				<!--Let's Sci-fi!-->
				Play Now
			</span>
			<!--or
			<span onclick="space.show_login()" class="start-playing">Login</span>-->
			`;
        }
        navBarRight.innerHTML = text;
    }
    function start_playing() {
        play_as_guest();
    }
    space.start_playing = start_playing;
    function addFlightOption() {
        let textHead = document.getElementById("main");
        let text = '';
        text += `
		<p>
		<br />
		<span class="span-button" onclick="space.layoutFlightControls()">Flight Menu</span>
		`;
        return text;
    }
    var message_timeout;
    function pin_message(message) {
        let element = document.querySelector("my-message");
        let span = document.querySelector("my-message span:nth-child(2)");
        element.style.top = '0px';
        element.style.transition = 'none';
        span.innerHTML = message;
        clearTimeout(message_timeout);
        message_timeout = setTimeout(() => { element.style.transition = 'top 1s linear 0s'; element.style.top = '-110px'; }, 3000);
    }
    space.pin_message = pin_message;
    function returnButton() {
        return '<p><span class="span-button" onclick="space.choose_layout()">Return</span><p>';
    }
    function show_landing_page() {
        let text = `
		<my-intro>
		<my-welcome>
		<!--<h1>spAce</h1>-->
		Web space sim that combines <span>real-time</span> with <span>text-based</span>.
		<p>
		Optimized for mobile.
		</p>
		<p>
		<span class="colorful-button" onclick="space.play_as_guest()">Play as a guest</span>,
		<span class="colorful-button" onclick="space.show_register()">sign up</span>
		<span class="colorful-button" onclick="space.show_login()">or log in</span>
		</p>
		</my-welcome>
		</my-intro>
		`;
        space.myTrivial.innerHTML = text;
    }
    space.show_landing_page = show_landing_page;
    function show_login() {
        let text = ``;
        if (space.sply && space.sply.guest)
            text += `
		<p>
		You're currently playing as a guest. Here you can login to an actual account.
		</p>
		`;
        text += `
		<div id="forms">
		<form action="login" method="post">
		<table>
		<tr>
		<td>
		<label for="username">Username</label>
		</td>
		<td>
		<input id="username" type="text" placeholder="username" name="username" required>
		</td>
		</tr>
		<tr>
		<td>
		<label for="psw">Password</label>
		</td>
		<td>
		<input id="password" type="password" placeholder="password" name="psw" required>
		</td>
		</tr>
		<tr>
		<td>
		</td>
		<td>
		<button class="login-button" type="button" onclick="space.xhr_login()">Login</button>
		</td>
		</tr>
		</table>
		
		</form>
		<p>
		<span class="smallish">You will remain logged in until you logout.</span>
		</div>
		`;
        space.myTrivial.innerHTML = text;
    }
    space.show_login = show_login;
    function show_register() {
        let text = `
		<div id="forms">
		<form action="register" method="post">

		<label for="username">Username</label><br />
		<input class="wrong" type="text" name="username" id="username" minlength="4" maxlength="15"  required pattern="[a-zA-Z0-9]+">
		<br /><br />
	
		<label for="password">Password</label><br />
		<input class="wrong" type="password" autocomplete="new-password" name="password" id="password" minlength="4" maxlength="20" required>
		<br /><br />
	
		<label for="password-repeat">Repeat Password</label><br />
		<input class="wrong" type="password" autocomplete="new-password" name="password-repeat" id="password-repeat" maxlength="20" minlength="4" required>
		<br /><br />
		
		<label for="keep-ship" title="Keep your progress of your guest account">
		<input type="checkbox" checked="checked" name="remember" id="keep-ship"> Keep current guest ship progress
		</label>
		<p>
		you can link your mail later
		<br />
		<br />

		<button type="button" onclick="space.xhr_register()">Register</button>
		
		</form>
		</div>
		`;
        space.myTrivial.innerHTML = text;
    }
    space.show_register = show_register;
    function log_out() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield make_request_json('GET', 'logout');
            if (data[0]) {
                //alert(data[1]);
                pin_message(data[1]);
                space.sply = undefined;
                outer_space.stop();
                update_user_status();
                pin_message('You logged out');
                show_landing_page();
            }
            else {
                pin_message(data[1]);
                //alert(data[1]);
            }
            //const three = <string>await make_request('GET', 'ply');
            //receive_stuple(three);
        });
    }
    space.log_out = log_out;
    function purge() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield make_request_json('GET', 'purge');
            space.sply = undefined;
            pin_message("Purged guest account");
            outer_space.stop();
            update_user_status();
            show_landing_page();
        });
    }
    space.purge = purge;
    function play_as_guest() {
        return __awaiter(this, void 0, void 0, function* () {
            const guest = yield make_request_json('GET', 'guest');
            const stuple = yield make_request_json('GET', 'ply');
            if (guest)
                pin_message('Upgrade anytime to a full user');
            else
                pin_message('You\'re already a guest');
            receive_sply(stuple);
            choose_layout();
            update_side_bar();
            console.log('layout');
        });
    }
    space.play_as_guest = play_as_guest;
    function xhr_login() {
        return __awaiter(this, void 0, void 0, function* () {
            let username = document.getElementById("username").value;
            let password = document.getElementById("password").value;
            var http = new XMLHttpRequest();
            var url = 'login';
            var params = `username=${username}&password=${password}`;
            http.open('POST', url, true);
            //Send the proper header information along with the request
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            http.onreadystatechange = function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (http.readyState == 4 && http.status == 200) {
                        //alert(http.responseText);
                        pin_message(http.responseText);
                        const stuple = yield make_request_json('GET', 'ply');
                        receive_sply(stuple);
                        choose_layout();
                        //.then(function (res: any) {
                        //	receiveStuple(res);
                        //});
                    }
                    else if (http.readyState == 4 && http.status == 400) {
                        pin_message(http.responseText);
                        //alert(http.responseText);
                    }
                });
            };
            http.send(params);
        });
    }
    space.xhr_login = xhr_login;
    function xhr_register() {
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        let password_repeat = document.getElementById("password-repeat").value;
        let keep_ship = document.getElementById("keep-ship").checked;
        console.log(keep_ship);
        var http = new XMLHttpRequest();
        const url = 'register';
        var params = `username=${username}&password=${password}&password-repeat=${password_repeat}&keep-ship=${keep_ship}`;
        http.open('POST', url, true);
        //Send the proper header information along with the request
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == 200) {
                pin_message(http.responseText);
                //alert(http.responseText);
                show_login();
            }
            else if (http.readyState == 4 && http.status == 400) {
                pin_message(http.responseText);
                //alert(http.responseText);
            }
        };
        http.send(params);
    }
    space.xhr_register = xhr_register;
})(space || (space = {}));
function cls() {
}
export default space;
window.space = space;
