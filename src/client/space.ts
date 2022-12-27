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

	export var sply

	export var regions, locations

	function get_region_by_name(name) {
		for (let region of regions)
			if (region.name == name)
				return region;
	}

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

		let menuButton = document.getElementById("menu-button")!;
		menuButton.onclick = function () {
			show_account_bubbles();
		}

		let logo = document.querySelector("nav-bar logo") as HTMLElement;
		logo.onclick = function () {
			show_landing_page();
		}

		//new aabb2([0,0],[0,0]);

		if (document.cookie) {
			document.cookie = 'a';
			//console.log('our cookie is ', document.cookie);
		}
		else {
			//console.log('logged_in');
		}

		console.log('pre ask initial');

		await ask_initial();

		console.log('post ask initial');

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

	function show_account_bubbles() {
		let text = '';

		let main = document.getElementById("main")!;

		if (sply) {
			//text += post_login_notice();
			text += addReturnOption();

			//<div class="amenities">
			text += `
			`;
			if (!sply || sply.guest)
				text += `
			Do you wish to
			<span class="span-button" onclick="space.show_register()">register</span>
			
			<span class="span-button" onclick="space.show_login()">or login</span>
			<p>
			`;
			if (!sply.guest)
				text += `
			Do you want to <span class="span-button" onclick="space.logout()">logout</span> ?
			`;
			if (sply.guest)
				text += `
			(Perhaps you want to
			<span class="span-button" onclick="space.purge()">delete guest</span>)
			`;
			//</div>
			main.innerHTML = text;
		}
		else {
			show_landing_page();
		}
	}

	export function choose_layout() {
		console.log('choose layout');

		if (sply) {
			layout_default();
		}
		else {
			show_landing_page();
		}
	}

	function receive_sply(stuple) {
		const [type, data] = stuple;
		if (type != 'sply')
			console.warn('not sply');
		sply = data;
		if (sply) {
			update_user_status();
			outer_space.start();
		}
		else {
			outer_space.stop();
		}
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
		navBarRight.innerHTML = text;
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
		<span>${sply.position[0].toFixed(1)}</span>,
		<span>${sply.position[1].toFixed(1)}</span>
		</span>`;

		text += `
		<div class="positionMeter">position: ${position} km in ${sply.location}</div>
		<p>
		<br />
		`;

		return text;

	}

	function makeWhereabouts() {
		for (let region of regions) {
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

		let main = document.getElementById("main")!;
		let text = ``;//post_login_notice();
		text += makeWhereabouts();
		text += addFlightOption();
		main.innerHTML = text;
	}

	var message_timeout;
	function pin_message(message) {
		let element = document.querySelector("my-message") as HTMLElement;
		let span = document.querySelector("my-message span:nth-child(2)")!;
		console.log(span);
		element.style.top = '0px'
		element.style.transition = 'none'
		span.innerHTML = message;
		clearTimeout(message_timeout);
		message_timeout = setTimeout(() => { element.style.transition = 'top 2s linear 0s'; element.style.top = '-110px' }, 3000);
	}

	function returnButton() {
		return '<p><span class="span-button" onclick="space.choose_layout()">Return</span><p>';
	}

	export function show_logout_message() {
		//let main = document.getElementById("main")!;

		pin_message('You logged out');
		//let text = `You logged out`;

		//main.innerHTML = text;
	}

	export function show_landing_page() {
		let main = document.getElementById("main")!;
		let text = `
		<intro>
		<div id="welcome">
		<!--<h1>spAce</h1>-->
		Web space sim that combines <span>real-time</span> with <span>text-based</span>.
		<br />
		<br />
		<span class="colorful-button" onclick="space.play_as_guest()">Play as a guest</span>,
		<span class="colorful-button" onclick="space.show_register()">register</span>
		<span class="colorful-button" onclick="space.show_login()">or login</span>
		</div>
		<p>
		</p>
		</intro>
		`;
		main.innerHTML = text;
	}

	export function show_login() {
		let textHead = document.getElementById("main")!;

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

		textHead.innerHTML = text;
	}

	export function show_register() {
		let textHead = document.getElementById("main")!;

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

		textHead.innerHTML = text;
	}

	export async function logout() {
		const data = <any>await make_request_json('GET', 'logout');
		if (data[0]) {
			//alert(data[1]);
			pin_message(data[1]);
			sply = undefined;
			outer_space.stop();
			update_user_status();
			show_logout_message();
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
			pin_message('Guest users have no limits, enjoy');
		else
			pin_message('You\'re already a guest');
		receive_sply(stuple);
		choose_layout();
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