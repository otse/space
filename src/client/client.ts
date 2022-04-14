import aabb2 from "./aabb2";
import pts from "./pts";

namespace space {

	// comment
	pts
	aabb2

	export var sectors, locations

	export var currentSector, currentLocation;

	function getLocationByName(name) {
		for (let location of locations)
			if (location.name == name)
				return location;
		//console.warn("location doesnt exist");
	}

	function getSectorByName(name) {
		for (let sector of sectors)
			if (sector.name == name)
				return sector;
		//console.warn("sector doesnt exist");
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

	export function init() {

		//new aabb2([0,0],[0,0]);

		makeRequest('GET', 'sectors.json')
			.then(function (res: any) {
				console.log('got sectors');
				sectors = JSON.parse(res);
				return makeRequest('GET', 'locations.json');
			})
			.then(function (res: any) {
				console.log('got locations');
				locations = JSON.parse(res);
				return makeRequest('GET', 'whereami');
			})
			.then(function (res: any) {
				console.log('got whereami');
				receiveAnswer(res);
			}).catch(function (err) {
				console.error('Augh, there was an error!', err.statusText);
			});

		//askServer('sectors.json', (res) => sectors = JSON.parse(res));


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
		askServer(input.value, receiveAnswer);
		return false;
	}

	function receiveAnswer(res) {
		console.log('receiveAnswer');
		if (!res)
			return;
		let answer: ServerAnswer = JSON.parse(res);
		const type = answer[0];
		if (type == 'where') {
			const location = getLocationByName(answer[1].location);
			if (answer[1].sublocation == 'Refuel') {
				layoutRefuel(answer);
				console.log(answer[1]);
				
			}
			else if (location.type == 'Station')
				layoutStation(answer);
		}
	}

	function BuildLargeTile(tile: any) {
		console.log('build large tile from', tile);
		let gameBox = document.createElement('div');
		gameBox.classList.toggle('gameBox');
	}


	function layoutStation(answer: ServerAnswer) {
		let textHead = document.getElementById("textHead")!;

		const sector = getSectorByName(answer[1].sector);
		const location = getLocationByName(answer[1].location);

		let text = `
			You are in the <span class="sector">${sector.name}</span>
			/ <span class="location" style="colors: ${location.color || "inherit"} ">${location.name}
			(${location.type})</span>
			`;
		text += `<p>`
		text += `<span class="facilities">`

		if (location.facilities) {
			if (location.facilities.indexOf("Refuel") > -1)
				text += 'You can <span class="spanButton" onclick="space.transportSublocation("Refuel")">refuel</span> here <br />';
		}
		text += `</span>`;

		textHead.innerHTML = text;
	}

	function layoutRefuel(answer: ServerAnswer) {
		let textHead = document.getElementById("textHead")!;

		let text = `

		`;
		text += '<span class="spanButton" onclick="space.returnSublocation()">Go back to Station?</span>';

		textHead.innerHTML = text;
	}

	export function returnSublocation() {
		
		makeRequest('GET', 'returnSublocation')
		.then(function (res: any) {
			console.log('returned from sublocation');
			
			receiveAnswer(res);

		});
	}

	export function transportSublocation(facility) {
		
		makeRequest('GET', 'transportSublocation?xx')
		.then(function (res: any) {
			console.log('returned from sublocation');
			
			receiveAnswer(res);

		});
	}

}

function cls() {

}

(window as any).space = space;