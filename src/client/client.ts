import aabb2 from "./aabb2";
import pts from "./pts";

namespace space {

	// comment
	pts
	aabb2


	export var sply;

	export var sector, location;

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
		console.log('handlesply', sply);

		let logo = document.querySelector(".logo .text")!;

		sector = getSectorByName(sply.sector);

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
				//return makeRequest('GET', 'where');
			})
		//.then(function (res: any) {
		//	receiveStuple(res);
		//})
		/*.catch(function (err) {
			console.error('Augh, there was an error!', err.statusText);
		});*/

	}

	export function chooseLayout() {
		if (sply.flight) {
			layoutFlight();
		}
		else if (sply.sublocation == 'Refuel') {
			layoutRefuel();
		}
		else if (sply.scanning) {
			layoutScanning();
		}
		else if (location.type == 'Station') {
			layoutStation();
		}
		else if (location.type == 'Junk') {
			layoutJunk();
		}
	}


	function receiveStuple(res) {

		let stuple: Stuple = JSON.parse(res);

		const type = stuple[0];
		const payload = stuple[1];

		console.log('received stuple type', type);

		if (type == 'sply') {
			sply = payload;

			sector = getSectorByName(sply.sector);
			location = getLocationByName(sply.location);

			handleSply();

			chooseLayout();
		}

		else if (type == 'message') {
			layoutMessage(payload);
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
			text += `[ Logged in as ${sply.username} (#${sply.id}) ]`;

		text += `<p>`;

		return text;
	}

	function addFlightOption() {
		let textHead = document.getElementById("mainDiv")!;

		let text = '';

		text += `
		<p>
		<br />
		<span class="spanButton" onclick="space.layoutFlightControls()">Flight Menu</span>
		`;

		textHead.innerHTML += text;

	}

	function addReturnOption() {
		let text = '';

		text += `
		<p>
		<span class="spanButton" onclick="space.chooseLayout()"><</span>
		<p>
		<br />
		`;

		return text;

	}

	function layoutStation() {
		let textHead = document.getElementById("mainDiv")!;

		let text = breadcrumbs();

		text += `
		You are in the <span class="sector">${sector.name}</span>
		/ <span class="location" style="colors: ${location.color || "inherit"} ">${location.name}
		(${location.type})</span>
		`;

		text += `<p>`
		text += `<span class="facilities">`

		if (location.facilities) {
			if (location.facilities.indexOf("Refuel") > -1)
				text += 'You can <span class="spanButton" onclick="space.transportSublocation(`refuel`)">refuel</span> here.';
		}
		text += `</span>`;

		textHead.innerHTML = text;

		addFlightOption();

		//layoutFlightControls();
	}

	function layoutJunk() {
		let textHead = document.getElementById("mainDiv")!;

		let text = breadcrumbs();

		text += `
		You are in the <span class="sector">${sector.name}</span>
		/ <span class="location" style="colors: ${location.color || "inherit"} ">${location.name}
		(${location.type})</span>
		`;

		text += `<p>`

		text += `
		It's a junk field.
		You can <span class="spanButton" onclick="space.scanJunk()">scan</span> the debris.
		`;

		textHead.innerHTML = text;

		addFlightOption();

		//layoutFlightControls();
	}

	function layoutRefuel() {
		let textHead = document.getElementById("mainDiv")!;

		let text = breadcrumbs();

		text += 'You are at a refuelling bay.';

		text += ' <span class="spanButton" onclick="space.returnSublocation()">Back to Station</span>';

		textHead.innerHTML = text;

		//layoutFlightControls();
	}

	function layoutScanning() {
		let textHead = document.getElementById("mainDiv")!;

		let text = breadcrumbs();

		text += 'You are scanning the junk. This may take a moment.';

		text += ' <span class="spanButton" onclick="space.stopScanning()">Cancel</span>';

		console.log(sply);

		if (!sply.scanCompleted) {
			let started = Date.now() - sply.scanStart;
			started /= 1000;

			if (started < 60.0) {
				started = <any>`${started.toFixed(0)} seconds ago`
			}
			else if (started < 60 * 60) {
				started = <any>`${Math.floor(started / 60).toFixed(0)} minutes ago`
			}

			started
			text += `<p>Start time: ${started}`

			let ending = sply.scanEnd - Date.now();

			ending /= 1000;

			if (ending < 0)
				ending = <any>'[ Completed ]';
			else if (ending < 60.0) {
				ending = <any>`${ending.toFixed(0)} seconds`
			}
			else if (ending < 60 * 60) {
				ending = <any>`${Math.ceil(ending / 60).toFixed(0)} minutes`
			}

			text += `<p>Scan complete in ${ending}`

			const duration = sply.scanEnd - sply.scanStart;
			const time = Date.now() - sply.scanStart;

			const width = time / duration;
			console.log('width', width);
			console.log('scanEnd', sply.scanEnd, 'scanStart', sply.scanStart);
			
			text += `<div class="scanBar"><div class="inside" style="width: ${(<number>width * 100).toFixed(0)}%"></div></div>`
		}
		else {
			text += '<p><br /><span class="spanButton" onclick="space.completeScan()">Complete scan</span>';
		}

		textHead.innerHTML = text;

		//layoutFlightControls();
	}

	function layoutMessage(message) {
		let textHead = document.getElementById("mainDiv")!;

		let text = `<span class="message">${message}</span>`;

		textHead.innerHTML += text;

	}

	function returnButton() {
		return '<p><span class="spanButton" onclick="space.chooseLayout()">Return</span><p>';
	}

	function layoutFlight() {
		let textHead = document.getElementById("mainDiv")!;

		let text = breadcrumbs();

		const loc = getLocationByName(sply.flightLocation);

		text += `You\'re flying towards <span class="location" style="colors: ${loc.color || "inherit"} ">${loc.name}
		(${loc.type})</span>.`;

		text += '';

		text += ' Attempt to <span class="spanButton" onclick="space.tryDock()">dock</span>';


		textHead.innerHTML = text;

		addFlightOption();

		//layoutFlightControls();

	}

	export function layoutFlightControls() {
		let textHead = document.getElementById("mainDiv")!;

		let text = breadcrumbs();

		text += addReturnOption();

		text += 'Flight menu'
		text += '<p>'
		text += ``;
		text += `<select name="flights" id="flights" >`;

		for (let location of sector.locations) {
			text += `<option>${location}</option>`
		}
		text += `<option>Non-existing option</option>`
		text += `</select>
		<span class="spanButton" onclick="space.submitFlight()">Flight</span>
		</form>`;

		textHead.innerHTML = text;


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

	export function scanJunk() {

		makeRequest('GET', 'scan')
			.then(function (res: any) {
				receiveStuple(res);
			});
	}

	export function completeScan() {

		makeRequest('GET', 'completeScan')
			.then(function (res: any) {
				receiveStuple(res);
			});
	}

	export function stopScanning() {

		makeRequest('GET', 'stopScanning')
			.then(function (res: any) {
				receiveStuple(res);
			});
	}

	export function tryDock() {

		makeRequest('GET', 'dock')
			.then(function (res: any) {
				console.log('asking server if we can dock');
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
						//return makeRequest('GET', 'where');
					})
				//.then(function (res: any) {
				//	receiveStuple(res);
				//});
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