namespace space {

	export function init() {
		askServer('whereami');

	}

	export function askServer(url) {
		console.log('space askServer', url);
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onload = function (e) {
			if (xhr.readyState === 4) {
				if (xhr.status === 200)
					receiveAnswer(xhr.responseText);
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
		askServer(input.value);
		return false;
	}

	function receiveAnswer(res) {
		console.log('unpack res', res);
		if (!res)
			return;
		type ServerAnswer = [string, any]
		let answer: ServerAnswer = JSON.parse(res);
		const type = answer[0];
		if (type == 'where') {
			let textHead = document.getElementById("textHead")!;
			textHead.innerHTML = 'You are at '+answer[1].type;
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

}

function cls() {

}

(window as any).space = space;