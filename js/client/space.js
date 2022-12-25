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
import pts from "../shared/pts";
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
    space.loggedIn = false;
    function get_region_by_name(name) {
        for (let region of space.regions)
            if (region.name == name)
                return region;
    }
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
            let menuButton = document.getElementById("menu_button");
            menuButton.onclick = function () {
                show_account_bubbles();
            };
            //new aabb2([0,0],[0,0]);
            if (document.cookie) {
                document.cookie = 'a';
                //console.log('our cookie is ', document.cookie);
            }
            else {
                //console.log('logged_in');
            }
            console.log('pre ask initial');
            yield ask_initial();
            console.log('post ask initial');
            outer_space.statics();
        });
    }
    space.init = init;
    function ask_initial() {
        return __awaiter(this, void 0, void 0, function* () {
            space.regions = yield make_request_json('GET', 'regions.json');
            space.locations = yield make_request_json('GET', 'locations.json');
            space.loggedIn = (yield make_request_json('GET', 'loggedIn'));
            let stuple = yield make_request_json('GET', 'ply');
            receive_stuple(stuple);
            choose_layout();
            console.log('asked initials');
        });
    }
    var showingAccountBubbles = false;
    function show_account_bubbles() {
        showingAccountBubbles = true;
        let username = space.sply && space.sply.username;
        let text = '';
        let main = document.getElementById("main");
        if (space.sply) {
            text += username_header();
            text += addReturnOption();
            //<div class="amenities">
            text += `
			`;
            if (!space.sply || space.sply.guest)
                text += `
			Do you wish to
			<span class="span-button" onclick="space.show_register()">register</span>
			
			<span class="span-button" onclick="space.show_login()">or login</span>
			<p>
			`;
            if (!space.sply.guest)
                text += `
			Do you want to <span class="span-button" onclick="space.logout()">logout</span> ?
			`;
            if (space.sply.guest)
                text += `
			(Perhaps you want to
			<span class="span-button" onclick="space.purge()">delete your guest account</span>)
			`;
            //</div>
            main.innerHTML = text;
        }
        else {
            show_guest_choice();
        }
    }
    function choose_layout() {
        console.log('choose layout', space.loggedIn);
        if (space.loggedIn) {
            layout_default();
        }
        else {
            show_guest_choice();
        }
    }
    space.choose_layout = choose_layout;
    function receive_stuple(stuple) {
        console.log('received stuple', stuple);
        if (stuple == false)
            return;
        const [type, data] = stuple;
        if (type == 'sply') {
            space.sply = data;
            //choose_layout();
        }
        else if (type == 'message') {
            layout_message(data);
        }
        //else if (type == 'senemies') {
        //	senemies = data;
        //}
    }
    function username_header() {
        let text = '';
        text += `<p class="logged">`;
        if (space.sply.guest)
            text += `
			[ Playing as unregistered ${space.sply.username}
			<span class="material-icons" style="font-size: 18px">no_accounts</span>
			]`;
        else
            text += `
			[ Logged in as ${space.sply.username}
			<span class="material-icons" style="font-size: 18px">how_to_reg</span>
			]
			`;
        text += `<p>`;
        return text;
    }
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
    function addReturnOption() {
        let text = '';
        text += `
		<p>
		<span class="span-button" onclick="space.choose_layout()"><</span>
		<p>
		`;
        return text;
    }
    var activeTab = 'action';
    function addTabs() {
        let text = '';
        text += `
		<p>
		<div class="tabbar">
		<span class="tabbutton" onclick="space.chooseTabOne()">action</span>
		<span class="tabbutton" onclick="space.chooseTabOne()">ship</span>
		</div>
		<div class="tabcontent">
		<p>
		`;
        return text;
    }
    function endTabs() {
        return "</div>";
    }
    function addLocationMeter() {
        let text = '';
        let position = `<span class="positionArray">
		<span>${space.sply.position[0].toFixed(1)}</span>,
		<span>${space.sply.position[1].toFixed(1)}</span>
		</span>`;
        text += `
		<div class="positionMeter">position: ${position} km in ${space.sply.location}</div>
		<p>
		<br />
		`;
        return text;
    }
    function makeWhereabouts() {
        for (let region of space.regions) {
            let dist = pts.dist([1, 0], region.center);
            if (dist < region.radius) {
                console.log(`were in region ${region.name} dist ${dist}`);
            }
        }
        let text = '';
        text += `
		<div id="whereabouts">
		
		<span class="sector">belt</span> ~>
		<br />
		
		<span class="location" style="colors: inherit} ">
		&nbsp;boop
		<!--(crash)--></span>
		</div>
		`;
        return text;
    }
    function layout_default() {
        console.log('layout default');
        let main = document.getElementById("main");
        let text = username_header();
        text += makeWhereabouts();
        text += addFlightOption();
        main.innerHTML = text;
    }
    function layout_message(message) {
        let textHead = document.getElementById("main");
        let text = `<span class="message">${message}</span>`;
        textHead.innerHTML += text;
    }
    function returnButton() {
        return '<p><span class="span-button" onclick="space.choose_layout()">Return</span><p>';
    }
    function layoutFlightControls() {
        let textHead = document.getElementById("main");
        console.log('wot up');
        let text = username_header();
        text += addReturnOption();
        if (space.region) {
            text += `
		Flight menu
		<p>
		${space.region.name} ~>
		<select name="flights" id="flights" >`;
            for (let location of space.region.locations) {
                text += `<option>${location}</option>`;
            }
            text += `<option>Non-existing option</option>`;
            text += `</select>
		<span class="span-button" onclick="space.submitFlight()">Flight</span>
		</form>`;
        }
        textHead.innerHTML = text;
    }
    space.layoutFlightControls = layoutFlightControls;
    function show_logout_message() {
        let main = document.getElementById("main");
        let text = `You logged out`;
        main.innerHTML = text;
    }
    space.show_logout_message = show_logout_message;
    function show_guest_choice() {
        let main = document.getElementById("main");
        let text = `
		Welcome, space farer.
		<p>
		<span class="span-button" onclick="space.play_as_guest()">Play as a guest</span>,
		<span class="span-button" onclick="space.show_register()">register</span>
		<span class="span-button" onclick="space.show_login()">or login</span>
		</p>
		`;
        main.innerHTML = text;
    }
    space.show_guest_choice = show_guest_choice;
    function show_login() {
        let textHead = document.getElementById("main");
        let text = ``;
        if (space.sply && space.sply.guest)
            text += `
		<p>
		You're currently playing as a guest. Here you can login to an actual account.
		</p>
		`;
        text += `
		<form action="login" method="post">
		<label for="username">Username</label><br />
		<input id="username" type="text" placeholder="" name="username" required><br /><br />
		
		<label for="psw">Password</label><br />
		<input id="password" type="password" placeholder="" name="psw" required><br /><br />
		
		<button type="button" onclick="space.xhr_login()">Login</button>
		
		</form>
		<p>
		<span class="smallish">You will remain logged in until you logout.</span>
		`;
        textHead.innerHTML = text;
    }
    space.show_login = show_login;
    function show_register() {
        let textHead = document.getElementById("main");
        let text = `
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
		
		</form>`;
        textHead.innerHTML = text;
    }
    space.show_register = show_register;
    function submitFlight() {
        return __awaiter(this, void 0, void 0, function* () {
            var e = document.getElementById("flights");
            var strUser = e.options[e.selectedIndex].text;
            console.log(strUser);
            let res = yield make_request_json('GET', 'submitFlight=' + strUser);
            receive_stuple(res);
        });
    }
    space.submitFlight = submitFlight;
    function logout() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield make_request_json('GET', 'logout');
            if (data[0]) {
                alert(data[1]);
                space.loggedIn = false;
                space.sply = undefined;
                show_logout_message();
            }
            else {
                alert(data[1]);
            }
            //const three = <string>await make_request('GET', 'ply');
            //receive_stuple(three);
        });
    }
    space.logout = logout;
    function purge() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield make_request_json('GET', 'purge');
            space.loggedIn = false;
            space.sply = undefined;
            show_guest_choice();
        });
    }
    space.purge = purge;
    function play_as_guest() {
        return __awaiter(this, void 0, void 0, function* () {
            yield make_request_json('GET', 'guest');
            const res2 = yield make_request_json('GET', 'ply');
            space.loggedIn = (yield make_request_json('GET', 'loggedIn'));
            receive_stuple(res2);
            choose_layout();
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
                        alert(http.responseText);
                        space.loggedIn = (yield make_request_json('GET', 'loggedIn'));
                        const stuple = yield make_request_json('GET', 'ply');
                        receive_stuple(stuple);
                        choose_layout();
                        //.then(function (res: any) {
                        //	receiveStuple(res);
                        //});
                    }
                    else if (http.readyState == 4 && http.status == 400) {
                        alert(http.responseText);
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
                alert(http.responseText);
                show_login();
            }
            else if (http.readyState == 4 && http.status == 400) {
                alert(http.responseText);
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
