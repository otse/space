namespace space {

	export var sectors, locations

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

		makeRequest('GET', 'sectors.json')
		.then(function (res: any) {
			console.log('got sectors');
			sectors = JSON.parse(res);
			return makeRequest('GET', 'locations.json');
		})
		.then(function (res: any) {
			console.log('got locations');
			locations = JSON.parse(res);
			
		}).catch(function (err) {
			console.error('Augh, there was an error!', err.statusText);
		});

		askServer('sectors.json', (res) => sectors = JSON.parse(res));

		askServer('whereami', receiveAnswer);

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
		console.log('unpack res', res);
		if (!res)
			return;
		let answer: ServerAnswer = JSON.parse(res);
		const type = answer[0];
		if (type == 'where') {
			if (answer[1].type == 'station')
				layoutStation(answer);
			else
				console.warn(' unrecognized whereabout ');

		}
		/*let output = document.getElementById(object["dest"]);
		if (output == null)
			return;
		output.innerHTML = object["payload"];
		console.log('boo');*/
	}

	function BuildLargeTile(tile: any) {
		console.log('build large tile from', tile);
		let gameBox = document.createElement('div');
		gameBox.classList.toggle('gameBox');
	}

	function layoutStation(answer) {
		let textHead = document.getElementById("textHead")!;

		textHead.innerHTML = `You are at ${answer[1].type} ${answer[1].name}`;
	}

}

function cls() {

}

(window as any).space = space;