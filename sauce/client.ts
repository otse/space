namespace steam_days {

	export function init() {
		Get('featured');
	}

	export function Get(msg) {
		console.log('steam_days Get', msg);
		var xhr = new XMLHttpRequest();
		xhr.open("GET", 'msg?=' + msg, true);
		xhr.onload = function (e) {
			if (xhr.readyState === 4) {
				if (xhr.status === 200)
					ReceiveMsg(xhr.responseText);
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
		Get(input.value);
		return false;
	}

	function ReceiveMsg(res) {
		console.log('unpack res', res);
		if (!res)
			return;
		let outMsg: Msg = JSON.parse(res);
		const type = outMsg[0];
		if (type == 'featured') {
			for (let tile of outMsg[1]) {
				console.log('show featured tiles');
				//document.querySelectorAll('.my #awesome selector');
				BuildLargeTile(tile);
			}
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

(window as any).steam_days = steam_days;