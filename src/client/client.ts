import aabb2 from "./aabb2";
import pts from "./pts";

namespace space {

	// comment
	pts
	aabb2


	var sply, swhere;


	export var sectors, locations

	export var currentSector, currentLocation;

	function getLocationByName(name) {
		for (let location of locations)
			if (location.name == name)
				return location;
		console.warn("location doesnt exist");
	}

	function getSectorByName(name) {
		for (let sector of sectors)
			if (sector.name == name)
				return sector;
		console.warn("sector doesnt exist");
	}

	function getSublocationDescription(sublocation) {

		if (sublocation == 'Refuel')
			return 'You are at a refuelling bay.';
	}

	function makeRequest(method, url) {
		return new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open(method, url);
			xhr.onload = function () {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve(xhr.response);
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

	export function init() {

		let menu_button = document.getElementById("menu_button")!;

		menu_button.onclick = function () {
			showAccountBubbles();
		}

		//new aabb2([0,0],[0,0]);

		if (document.cookie) {
			document.cookie = 'a';
			console.log('our cookie is ', document.cookie);
		}
		else {
			console.log('logged_in');
		}
		getInitTrios();

	}

	export function handleSply() {
		let logo = document.querySelector(".logo .text")!;

		if (sply.unregistered)
			logo.innerHTML = `space`
		else
			logo.innerHTML = `space - ${sply.username}`
	}

	function showAccountBubbles() {
		let textHead = document.getElementById("mainDiv")!;

		let username = sply && sply.username;

		let text = `
		<span class="spanButton" onclick="space.showLogin()">login</span>,
		<span class="spanButton" onclick="space.logout()">logout</span>,
		or
		<span class="spanButton" onclick="space.showRegister()">register</span>

		`;
		textHead.innerHTML = text;
	}

	function getInitTrios() {
		makeRequest('GET', 'sectors.json')
			.then(function (res: any) {
				console.log('got sectors');
				sectors = JSON.parse(res);
				return makeRequest('GET', 'locations.json');
			})
			.then(function (res: any) {
				console.log('got locations');
				locations = JSON.parse(res);
				return makeRequest('GET', 'ply');
			})
			.then(function (res: any) {
				receiveStuple(res);
				return makeRequest('GET', 'where');
			})
			.then(function (res: any) {
				receiveStuple(res);
			})
		/*.catch(function (err) {
			console.error('Augh, there was an error!', err.statusText);
		});*/

	}

	var sector, location;

	function receiveStuple(res) {

		let stuple: Stuple = JSON.parse(res);

		const type = stuple[0];
		const payload = stuple[1];

		console.log('received stuple type', type);

		if (type == 'sply') {
			sply = payload;
			handleSply();
		}

		else if (type == 'message') {
			layoutMessage(payload);
		}

		else if (type == 'flight') {
			// we are nowhere, in flight
			layoutFlight(stuple);
		}

		else if (type == 'swhere') {
			swhere = payload;

			console.log(swhere);
			console.log(swhere.sublocation);
			
			sector = getSectorByName(payload.sectorName);
			location = getLocationByName(payload.locationName);

			if (swhere.sublocation == 'Refuel') {
				console.log('refueling');
				
				layoutRefuel(stuple);
				//console.log(answer[1]);
			}
			else if (location.type == 'Station')
				layoutStation(stuple);
		}
	}

	function BuildLargeTile(tile: any) {
		console.log('build large tile from', tile);
		let gameBox = document.createElement('div');
		gameBox.classList.toggle('gameBox');
	}

	function breadcrumbs() {

		let text = '';

		text += `
		<p class="smallish">`;

		if (sply.unregistered)
			text += `[ Playing via this ip (unregistered). ]`;
		else
			text += `[ Welcome back, ${sply.username} (#${sply.id}) ]`;

		text += `<p>`;

		text += `
		You are in the <span class="sector">${sector.name}</span>
		/ <span class="location" style="colors: ${location.color || "inherit"} ">${location.name}
		(${location.type})</span>
		`;


		if (swhere.sublocation != 'None') {
			text += '<p>'
			//text +=`/ <span class="sublocation">${where.sublocation}</span>`;
			text += getSublocationDescription(swhere.sublocation);
		}

		return text;
	}

	function layoutStation(answer: Stuple) {
		let textHead = document.getElementById("mainDiv")!;

		let text = breadcrumbs();
		text += `<p>`
		text += `<span class="facilities">`

		if (location.facilities) {
			if (location.facilities.indexOf("Refuel") > -1)
				text += 'You can <span class="spanButton" onclick="space.transportSublocation(`refuel`)">refuel</span> here.';
		}
		text += `</span>`;

		textHead.innerHTML = text;

		layoutFlightControls();
	}

	function layoutRefuel(answer: Stuple) {
		let textHead = document.getElementById("mainDiv")!;

		let text = breadcrumbs();

		console.log('layout refuel');
		

		//text += '<p>'

		text += ' <span class="spanButton" onclick="space.returnSublocation()">Back to Station</span>';

		textHead.innerHTML = text;

		//layoutFlightControls();
	}
	
	function layoutMessage(msg) {
		let textHead = document.getElementById("mainDiv")!;

		let text = msg;

		textHead.innerHTML += text;

	}

	function layoutFlight(answer: Stuple) {
		let textHead = document.getElementById("mainDiv")!;

		let text = '';

		text += 'boo';

		textHead.innerHTML += text;

	}

	function layoutFlightControls() {
		let textHead = document.getElementById("mainDiv")!;

		if (!swhere || !sector)
			return;
			
		let text = '<p>';
		text += '<br>'
		text += `Other locations within this sector.`;
		text += `<select name="flights" id="flights" >`;
		
		for (let location of sector.locations) {
			text += `<option value="volvo">${location}</option>`
		}
		text += `</select>
		<span class="spanButton" onclick="space.submitFlight()">Flight</span>
		</form>`;

		textHead.innerHTML += text;

	}

	export function showLogin() {
		let textHead = document.getElementById("mainDiv")!;

		let text = `
		<form action="login" method="post">
		<label for="username">Username</label><br />
		<input id="username" type="text" placeholder="" name="username" required><br /><br />
	
		<label for="psw">Password</label><br />
		<input id="password" type="password" placeholder="" name="psw" required><br /><br />
	
		<button type="button" onclick="space.xhrLogin()">Login</button>

		</form>`;

		textHead.innerHTML = text;
	}

	export function showRegister() {
		let textHead = document.getElementById("mainDiv")!;

		let text = `
		<form action="register" method="post">

		<label for="username">Username</label><br />
		<input class="wrong" type="text" placeholder="" name="username" id="username" minlength="4" maxlength="15"  required pattern="[a-zA-Z0-9]+">
		<br /><br />
	
		<label for="password">Password</label><br />
		<input class="wrong" type="password" placeholder="" name="password" id="password" minlength="4" maxlength="20" required>
		<br /><br />
	
		<label for="password-repeat">Repeat Password</label><br />
		<input class="wrong" type="password" placeholder="" name="password-repeat" id="password-repeat" maxlength="20" minlength="4" required>
		<br /><br />
		
		<label for="keep-ship" title="Start fresh or keep your play-via-ip, unregistered ship">
		<input type="checkbox" checked="checked" name="remember" id="keep-ship"> Keep current progress
		</label>
		<br />
		<br />

		<button type="button" onclick="space.xhrRegister()">Register</button>
		
		</form>`;

		textHead.innerHTML = text;
	}

	export function submitFlight() {

		var e = document.getElementById("flights")! as any;
		var strUser = e.options[e.selectedIndex].text;

		console.log(strUser);


		makeRequest('GET', 'submitFlight=' + strUser)
			.then(function (res: any) {
				console.log('submitted flight');
				receiveStuple(res);
			});
	}

	export function returnSublocation() {

		makeRequest('GET', 'returnSublocation')
			.then(function (res: any) {
				console.log('returned from sublocation');

				receiveStuple(res);

			});
	}

	export function transportSublocation(facility) {

		makeRequest('GET', 'knock&sublocation=refuel')
			.then(function (res: any) {
				console.log('returned from sublocation');

				receiveStuple(res);

			});
	}

	export function logout() {
		makeRequest('GET', 'logout')
			.then(function (res: any) {
				alert(res);
				sply.unregistered = true;
				handleSply();
			})
	}

	export function xhrLogin() {
		let username = (<any>document.getElementById("username")!).value;
		let password = (<any>document.getElementById("password"))!.value;

		var http = new XMLHttpRequest();
		var url = 'login';
		var params = `username=${username}&password=${password}`;

		http.open('POST', url, true);

		//Send the proper header information along with the request
		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		http.onreadystatechange = function () {//Call a function when the state changes.
			if (http.readyState == 4 && http.status == 200) {
				alert(http.responseText);

				makeRequest('GET', 'ply')
					.then(function (res: any) {
						receiveStuple(res);
						return makeRequest('GET', 'where');
					})
					.then(function (res: any) {
						receiveStuple(res);
					});
			}
			else if (http.readyState == 4 && http.status == 400) {
				alert(http.responseText);
			}
		}
		http.send(params);
	}

	export function xhrRegister() {
		let username = (<any>document.getElementById("username")!).value;
		let password = (<any>document.getElementById("password"))!.value;
		let password_repeat = (<any>document.getElementById("password-repeat"))!.value;
		let keep_ship = (<any>document.getElementById("keep-ship"))!.checked;

		console.log(keep_ship);
		

		var http = new XMLHttpRequest();
		var url = 'register';
		var params = `username=${username}&password=${password}&password-repeat=${password_repeat}&keep-ship=${keep_ship}`;

		http.open('POST', url, true);

		//Send the proper header information along with the request
		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		http.onreadystatechange = function () {//Call a function when the state changes.
			if (http.readyState == 4 && http.status == 200) {
				alert(http.responseText);
				showLogin();
			}
			else if (http.readyState == 4 && http.status == 400) {
				alert(http.responseText);
			}
		}
		http.send(params);
	}

}

function cls() {

}

(window as any).space = space;