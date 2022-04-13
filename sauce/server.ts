import { write } from "fs";

var http = require('http');
var https = require('https');
var fs = require('fs');
const querystring = require('querystring');
var format = require('date-format');

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

interface MainComputerFile {
	writes: number;
	webApiCalls: number;
	tasksCompleted: number;
	apps: App[];
	//bills: Bill[];
}

interface App {
	appId: number;
	snapshots: Snapshot[];
}

interface Snapshot {
	appId: number;
	timeN: number;
}

function init() {

	let mcf = <MainComputerFile>JSON.parse(fs.readFileSync('mcf', 'utf8'));

	const WriteMcf = function () {
		mcf.writes++;
		fs.writeFileSync('mcf', JSON.stringify(mcf, null, 4));
	}

	const APICall = function (url: string) {
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
	}

	function packGame() {

	}

	// appid 261550 m&b wb

	function GetApp(appId: number): App {
		let found;
		for (let app of mcf.apps) {
			if (app.appId == appId) {
				found = app;
				console.log('found existing entry');
			}
		}
		return found;
	}

	APICall('https://store.steampowered.com/appreviews/261550?json=1');
	//apiCall('https://api.steampowered.com/ISteamApps/GetAppList/v2');

	http.createServer(function (req, res) {

		const Send = function (str: string) {
			res.write(str);
			res.end();
		}

		const SendObject = function (anything: any) {
			let str = JSON.stringify(anything);
			Send(str);
		}

		function IncomingMsg(input: string) {
			console.log('Msg ', input);
			let arg = input.split(' ');
			if ('featured' == input) {
				let value = [{ appId: 261550, days: { mon: 123, tue: 125, wed: 100, thu: 201, fri: 90, sat: 120, sun: 200 } }];
				const outMsg: Msg = ['featured', value];
				SendObject(outMsg);
			}
			else
				SendObject(['na', '']);
		}

		function Transmit() {

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
		else if (-1 < req.url.indexOf('/app/')) {
			let appId = req.url.split('app/')[1];
			console.log('ask app/', appId);
			const app = GetApp(appId);
			Send('woo app: ' + appId);
		}
		else if (req.url == '/api/server/2/booking') {

		}
		else if (req.url.substr(0, 5) == '/msg?') {
			res.writeHead(200, { CONTENT_TYPE: APPLICATION_JSON });
			const parsed = querystring.parse(req.url);
			console.log(parsed);
			IncomingMsg(parsed['/msg?']);
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