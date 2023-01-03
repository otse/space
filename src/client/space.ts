//import { rename } from "fs";
import app from "./app";
import outer_space from "./outer space";
import aabb2 from "../shared/aabb2";
import pts from "../shared/pts";


namespace space {

	export function sample(a) {
		return a[Math.floor(Math.random() * a.length)];
	}

	export function clamp(val, min, max) {
		return val > max ? max : val < min ? min : val;
	}

	export var sideBar, sideBarContent, myContent, myTrivial, myLogo, menuButton;
	export var sideBarCloseButton;

	export var sply

	export var regions, locations

	export function make_request_json(method, url) {
		return new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open(method, url);
			xhr.onload = function () {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve(JSON.parse(xhr.response));
				} else {
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

	export function step() {

		outer_space.step();

	}

	export async function init() {

		outer_space.init();

		app.mouse();

		sideBar = document.querySelector("side-bar");
		sideBarContent = document.querySelector("side-bar-content");
		sideBarCloseButton = document.querySelector("side-bar close-button");
		myContent = document.querySelector("my-content");
		myTrivial = document.querySelector("my-trivial");
		menuButton = document.querySelector("menu-button");
		myLogo = document.querySelector("nav-bar my-logo");

		menuButton.onclick = function () {
			toggle_side_bar();
		}

		myLogo.onclick = function () {
			if (!sply) {
				show_landing_page();
			}
		}

		sideBarCloseButton.onclick = function () {
			toggle_side_bar();
		}

		//new aabb2([0,0],[0,0]);

		if (document.cookie) {
			document.cookie = 'a';
			//console.log('our cookie is ', document.cookie);
		}
		else {
			//console.log('logged_in');
		}

		await ask_initial();

		//outer_space.statics();
	}

	async function ask_initial() {
		regions = await make_request_json('GET', 'regions.json');
		locations = await make_request_json('GET', 'locations.json');
		let stuple = <any>await make_request_json('GET', 'ply');
		receive_sply(stuple);
		choose_layout();
		console.log('asked initials');
	}

	export function update_side_bar() {
		let text = '';
		if (sply && sply.guest)
			text += `
		<span class="button" onclick="space.show_register(); space.toggle_side_bar()">Become a regular user</span>
		<span class="button" onclick="space.purge(); space.toggle_side_bar()">Delete your guest account</span>
		`;
		if (sply && !sply.guest)
			text += `
			<span class="button" onclick="space.log_out(); space.toggle_side_bar()">Log out</span>
			`
		if (text == '')
			text += `Nothing to see here`;
		sideBarContent.innerHTML = text;
	}

	var sideBarOpen = false;
	export function toggle_side_bar() {
		sideBarOpen = !sideBarOpen;
		if (sideBarOpen) {
			sideBar.style.left = 0;

			update_side_bar();

		}
		else {
			sideBar.style.left = -300;
		}
	}

	export function choose_layout() {
		console.log('choose layout');
		myTrivial.innerHTML = ``;
		if (sply) {

		}
		else {
			show_landing_page();
		}
	}

	export async function action_follow_target(obj: outer_space.obj) {
		const res = await make_request_json('GET', 'follow?id=' + obj.tuple[1]);

	}

	export function action_begin_mine_target(obj: outer_space.obj) {

	}

	function receive_sply(stuple) {
		const [type, data] = stuple;
		if (type != 'sply')
			console.warn('not sply');
		sply = data;
		if (sply) {
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
			sply = data;
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

		let navBarRight = document.querySelector("nav-bar-right")!;
		let text = '';
		if (sply) {
			if (sply.guest)
				text += `
			Guest ${sply.username}
			<span class="material-symbols-outlined" style="font-size: 18px">no_accounts</span>
			`;
			else
				text += `
			Logged in as ${sply.username}
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

	export function start_playing() {
		play_as_guest();
	}

	function addFlightOption() {
		let textHead = document.getElementById("main")!;

		let text = '';

		text += `
		<p>
		<br />
		<span class="span-button" onclick="space.layoutFlightControls()">Flight Menu</span>
		`;

		return text;
	}

	var message_timeout;
	export function pin_message(message) {
		let element = document.querySelector("my-message") as HTMLElement;
		let span = document.querySelector("my-message span:nth-child(2)")!;
		element.style.top = '0px';
		element.style.transition = 'none';
		span.innerHTML = message;
		clearTimeout(message_timeout);
		message_timeout = setTimeout(() => { element.style.transition = 'top 1s linear 0s'; element.style.top = '-110px' }, 3000);
	}

	function returnButton() {
		return '<p><span class="span-button" onclick="space.choose_layout()">Return</span><p>';
	}

	export function show_landing_page() {
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
		myTrivial.innerHTML = text;
	}

	export function show_login() {
		let text = ``;
		if (sply && sply.guest)
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
		myTrivial.innerHTML = text;
	}

	export function show_register() {
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
		myTrivial.innerHTML = text;
	}

	export async function log_out() {
		const data = <any>await make_request_json('GET', 'logout');
		if (data[0]) {
			//alert(data[1]);
			pin_message(data[1]);
			sply = undefined;
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
	}

	export async function purge() {
		const res = await make_request_json('GET', 'purge');
		sply = undefined;
		pin_message("Purged guest account");
		outer_space.stop();
		update_user_status();
		show_landing_page();
	}

	export async function play_as_guest() {
		const guest = await make_request_json('GET', 'guest');
		const stuple = await make_request_json('GET', 'ply');
		if (guest)
			pin_message('Upgrade anytime to a full user');
		else
			pin_message('You\'re already a guest');
		receive_sply(stuple);
		choose_layout();
		update_side_bar();
		console.log('layout');
	}

	export async function xhr_login() {
		let username = (<any>document.getElementById("username")!).value;
		let password = (<any>document.getElementById("password"))!.value;

		var http = new XMLHttpRequest();
		var url = 'login';
		var params = `username=${username}&password=${password}`;

		http.open('POST', url, true);

		//Send the proper header information along with the request
		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		http.onreadystatechange = async function () {
			if (http.readyState == 4 && http.status == 200) {
				//alert(http.responseText);
				pin_message(http.responseText);
				const stuple = await make_request_json('GET', 'ply');
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
		}
		http.send(params);
	}

	export function xhr_register() {
		let username = (<any>document.getElementById("username")!).value;
		let password = (<any>document.getElementById("password"))!.value;
		let password_repeat = (<any>document.getElementById("password-repeat"))!.value;
		let keep_ship = (<any>document.getElementById("keep-ship"))!.checked;

		console.log(keep_ship);

		var http = new XMLHttpRequest();
		const url = 'register';
		var params = `username=${username}&password=${password}&password-repeat=${password_repeat}&keep-ship=${keep_ship}`;

		http.open('POST', url, true);

		//Send the proper header information along with the request
		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		http.onreadystatechange = function () {//Call a function when the state changes.
			if (http.readyState == 4 && http.status == 200) {
				pin_message(http.responseText);
				//alert(http.responseText);
				show_login();
			}
			else if (http.readyState == 4 && http.status == 400) {
				pin_message(http.responseText);
				//alert(http.responseText);
			}
		}
		http.send(params);
	}

}

function cls() {

}

export default space;

(window as any).space = space;