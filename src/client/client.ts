import aabb2 from "./aabb2";
import pts from "./pts";

namespace space {

	// comment
	pts
	aabb2

	interface Where {
		sector?: JSector
		location?: JLocation
		sublocation?: string
	}

	interface Player {
		id: number
		unregistered: boolean
		where: Where
	}

	export var cplayer: Player = {
		id: 0,
		unregistered: true,
		where: {
		}
	}
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
			showLoginOrRegister();
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

	function showLoginOrRegister() {
		let textHead = document.getElementById("mainDiv")!;

		let text = `
		<span class="spanButton">login</span> or <span class="spanButton">register</span>?

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
				return makeRequest('GET', 'getwhere');
			})
			.then(function (res: any) {
				//console.log('got whereami');
				receiveStuple(res);
			}).catch(function (err) {
				console.error('Augh, there was an error!', err.statusText);
			});

		makeRequest('GET', 'sectors.json')
			.then(function (res: any) {
				console.log('got sectors');
				sectors = JSON.parse(res);
				return makeRequest('GET', 'locations.json');
			})
	}

	export function askServer(url, callback: (res) => any) {
		console.log('space askServer', url);
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onload = function (e) {
			if (xhr.readyState === 4) {
				if (xhr.status === 200)
					callback(xhr.responseText);
				else
					console.error(xhr.statusText);
			}
		};
		xhr.onerror = function (e) {
			let output = document.getElementById("output1");
			if (output == null)
				return;
			output.innerHTML = xhr.statusText;
		};
		xhr.send(null);
	}

	export function submit(event) {
		let input = <HTMLInputElement>document.getElementById('cli');
		if (input == null)
			return;
		askServer(input.value, receiveStuple);
		return false;
	}

	function receiveStuple(res) {
		console.log('receiveStuple');
		if (!res)
			return;

		let stuple: Stuple = JSON.parse(res);

		const type = stuple[0];

		if (type == 'flight') {
			// we are nowhere, in flight
			layoutFlight(stuple);
		}

		if (type == 'swhere') {
			const sector = getSectorByName(stuple[1].swhere.sectorName);
			const location = getLocationByName(stuple[1].swhere.locationName);

			if (stuple[1].swhere.sublocation == 'Refuel') {
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

	function breadcrumbs(where) {

		const sector = getSectorByName(where.sectorName);
		const location = getLocationByName(where.locationName);

		let text = '';

		let reg = ``;
		text += `
		<p class="smallish">`;

		if (cplayer.unregistered)
			text += `[Playing via ip.]`;
		else
			text += `[You are player #${cplayer.id}]`;

		text += `<p>`;

		text += `
		You are in the <span class="sector">${sector.name}</span>
		/ <span class="location" style="colors: ${location.color || "inherit"} ">${location.name}
		(${location.type})</span>
		`;


		if (where.sublocation != 'None') {
			text += '<p>'
			//text +=`/ <span class="sublocation">${where.sublocation}</span>`;
			text += getSublocationDescription(where.sublocation);
		}

		return text;
	}

	function layoutStation(answer: Stuple) {
		let textHead = document.getElementById("mainDiv")!;

		const swhere = answer[1].swhere;

		const sector = getSectorByName(swhere.sectorName);
		const location = getLocationByName(swhere.locationName);

		let text = breadcrumbs(swhere);
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

		const swhere = answer[1].swhere;

		let text = breadcrumbs(swhere);

		//text += '<p>'

		text += ' <span class="spanButton" onclick="space.returnSublocation()">Back to Station</span>';

		textHead.innerHTML = text;

		//layoutFlightControls();
	}

	function layoutFlight(answer: Stuple) {
		let textHead = document.getElementById("mainDiv")!;

		let text = '';

		text += 'boo';

		textHead.innerHTML += text;

	}

	function layoutFlightControls() {
		let textHead = document.getElementById("mainDiv")!;

		let text = '<p>';
		text += '<br>'
		text += `Other locations within this sector.`;
		text += `<select name="cars" id = "cars" >`;
		if (!cplayer.where.sector)
			return;
		console.log(cplayer.where.sector);
		return;

		//for (let location of cplayer.where.sector.locations) {
		text += `<option vvalue="volvo" > ${location} < /option>`
		//}
		text += `</select>
		<span class="spanButton" onclick="space.submitFlight()">Flight</span>
		</form>`;

		textHead.innerHTML += text;

	}

	export function submitFlight() {

		var e = document.getElementById("cars")! as any;
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

}

function cls() {

}

(window as any).space = space;