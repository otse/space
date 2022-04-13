import { write } from "fs";

var http = require('http');
var https = require('https');
var fs = require('fs');
const querystring = require('querystring');
//var format = require('date-format');

const port = 2;

const CONTENT_TYPE = 'Content-Type';

const TEXT_HTML = 'text/html';
const TEXT_JAVASCRIPT = 'text/javascript';
const APPLICATION_JSON = 'application/json';

const logo = `
S(t)ream
`;

const header = `
<wut>
`;

const indent = ``

type appId = number;

interface mcf {
	writes: number
	boo: number
}

const locations = {
	
}

function init() {

	let mcf = <mcf>JSON.parse(fs.readFileSync('mcf', 'utf8'));

	const WriteMcf = function () {
		mcf.writes++;
		fs.writeFileSync('mcf', JSON.stringify(mcf, null, 4));
	}

	/*const APICall = function (url: string) {
		// https://partner.steamgames.com/doc/webapi_overview/responses
		const options =
		{
			//agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
		};
		https.get(url, options, (resp) => {
			mcf.webApiCalls++;
			let data = '';
			resp.on('data', (chunk) => {
				data += chunk;
			});
			resp.on('end', () => {
				// JSON.parse(data).explanation
				console.log(data);
			});

		}).on("error", (err) => {
			console.log("Error: " + err.message);
		});
	}*/


	// appid 261550 m&b wb

	//apiCall('https://api.steampowered.com/ISteamApps/GetAppList/v2');

	http.createServer(function (req, res) {

		const Send = function (str: string) {
			res.write(str);
			res.end();
		}

		const SendObject = function (anything: object) {
			let str = JSON.stringify(anything);
			Send(str);
		}

		const SendTuple = function (anything: object) {
			let str = JSON.stringify(anything);
			Send(str);
		}

		function receiveOverride(input: string) {
			console.log('Msg ', input);
			let arg = input.split(' ');
			if ('featured' == input) {
				const outMsg = ['featured', 1];
				SendObject(outMsg);
			}
			else
				SendObject(['na', '']);
		}

		if (req.method !== 'GET') {
			res.end('boo');
			return;
		}

		if (false) 0;
		else if (req.url == '/') {
			let page = fs.readFileSync('page.html');
			res.writeHead(200, { CONTENT_TYPE: TEXT_HTML });
			Send(page);
		}
		else if (req.url == '/client.js') {
			let client = fs.readFileSync('client.js');
			res.writeHead(200, { CONTENT_TYPE: TEXT_JAVASCRIPT });
			Send(client);
		}
		else if (req.url == '/whereami') {
			console.log('received whereami');
			
			SendTuple([['where'], { type: 'station'}]);
		}
		else if (-1 < req.url.indexOf('/app/')) {
			let appId = req.url.split('app/')[1];
			console.log('ask app/', appId);
			Send('woo app: ' + appId);
		}
		else if (-1 < req.url.indexOf('/getobject/')) {
			let appId = req.url.split('getobject/')[1];
			SendObject({ someObject: true });
		}
		else if (req.url == '/api/server/2/booking') {

		}
		else if (req.url.substr(0, 5) == '/msg?') {
			res.writeHead(200, { CONTENT_TYPE: APPLICATION_JSON });
			const parsed = querystring.parse(req.url);
			console.log(parsed);
			receiveOverride(parsed['/msg?']);
		}
		else {
			res.end();
		}

	}).listen(port);

}

function loop() {


	//console.log('wo');
}

init();

setInterval(loop, 1000);