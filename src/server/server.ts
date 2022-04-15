import { write } from "fs";

var http = require('http');
var https = require('https');
var fs = require('fs');
const qs = require('querystring');
//var format = require('date-format');

const port = 2;

const CONTENT_TYPE = 'Content-Type';

const TEXT_HTML = 'text/html';
const TEXT_JAVASCRIPT = 'application/javascript';
const APPLICATION_JSON = 'application/json';

const logo = `
S(t)ream
`;

const header = `
<wut>
`;

function exitHandler(options, exitCode) {
	console.log('exitHandler');

	if (options.cleanup) console.log('clean');
	if (exitCode || exitCode === 0) console.log(exitCode);
	if (options.exit) process.exit();
}

process.on('SIGINT', exitHandler.bind(null, { exit: true }));

const indent = ``

type appId = number;

interface Ply {
	id: number
	ip: number
	unregistered: boolean
	speed: number
	flight: boolean
	flightLocation
	position
	sector
	location
	sublocation
}

var main_computer_file
var sectors
var locations
var players: Ply[]


interface MainComputerFile {
	players: number
	writes: number
	boo: number
}

export function writeMcf() {
	main_computer_file.writes++;
	fs.writeFileSync('mcf.json', JSON.stringify(main_computer_file, null, 4));
}

export function writePly(ply: Ply) {
	console.log('writing ply ', ply.id);

	let payload = JSON.stringify(ply, null, 4);

	if (ply.unregistered)
		fs.writeFileSync(unregisteredPath(ply.ip), payload);
	else
		fs.writeFileSync('players/' + ply.id + '.json', payload);
}

export function sanitizeIp(ip: string) {
	ip = ip.replace('::', '');
	ip = ip.replace(':', '');
	return ip;
}

export function unregisteredPath(ip) {
	return `players/ip/${ip}.json`;
}

var ipPlys = {};

export function getPly(ip) {

	ip = sanitizeIp(ip);

	let ply: Ply;

	if (ipPlys[ip]) {
		ply = ipPlys[ip];
		console.log('got ply safely from table');
	}
	else {
		if (fs.existsSync(unregisteredPath(ip)))
			ply = ipPlys[ip] = JSON.parse(fs.readFileSync(unregisteredPath(ip), 'utf8'));
		else {
			main_computer_file.players++;
			writeMcf();
			ply = {
				id: main_computer_file.players,
				ip: ip,
				speed: 1,
				unregistered: true,
				flight: false,
				flightLocation: '',
				position: [0, 0],
				sector: 'Great Suldani Belt',
				location: 'Dartwing',
				sublocation: 'None',
			};
			fs.writeFileSync(unregisteredPath(ip), JSON.stringify(ply, null, 4));
		}
	}
	return ply;
}

function init() {

	main_computer_file = <MainComputerFile>JSON.parse(fs.readFileSync('mcf.json', 'utf8'));

	sectors = <any>JSON.parse(fs.readFileSync('sectors.json', 'utf8'));
	locations = <any>JSON.parse(fs.readFileSync('locations.json', 'utf8'));

	//apiCall('https://api.steampowered.com/ISteamApps/GetAppList/v2');

	http.createServer(function (req, res) {

		// console.log('request from ', req.socket.remoteAddress, req.socket.remotePort);

		let ply = getPly(req.socket.remoteAddress);

		const sendSwhere = function () {
			if (ply.flight) {
				sendStuple([['flight'], {
					position: ply.position
				}]);
			}
			else {
				sendStuple([['swhere'], {
					swhere: {
						sectorName: ply.sector,
						locationName: ply.location,
						sublocation: ply.sublocation
					}
				}]);
			}
		}

		const transportSublocation = function (where) {
			if (where == 'Refuel')
				console.log('requesting refuel sublocation');
		}

		const sendGeneric = function (str: string) {
			res.write(str);
			res.end();
		}

		const sendObject = function (anything: object) {
			let str = JSON.stringify(anything);
			sendGeneric(str);
		}

		const sendStuple = function (anything: object) {
			let str = JSON.stringify(anything);
			sendGeneric(str);
		}

		function receivedKnock(inputs: any) {
			//console.log('Knock ', inputs);

			const sublocation = inputs.sublocation;
			if (sublocation == 'refuel') {
				ply.sublocation = 'Refuel';
				writePly(ply);
				sendSwhere();
			}

			//let arg = input.split(' ');
		}

		if (req.method == 'POST' && req.url == '/login') {
			//console.log('received POST tokensignin', req);
			let body = '';
			req.on('data', function (chunk) {
				body += chunk;
			});
			req.on('end', function () {
				console.log('POSTed: ' + body);
			});
		}

		if (req.url == '/register' && req.method == 'POST') {
			res.writeHead(200, { CONTENT_TYPE: TEXT_HTML });
			
			let body = '';
			req.on('data', function (chunk) {
				body += chunk;
			});
			req.on('end', function () {
				const parsed = qs.parse(body);
				// email=as&psw=as&psw-repeat=as
				console.log(body);

				if (parsed['username'].length < 4)
				{
					res.end('username too short (4 letters or more please)');
				}
				else if (parsed['password'].length < 4 || parsed['password'].length > 20)
				{
					res.end('password length (4 - 20)');
				}
				else if (parsed['password'] != parsed['password-repeat']) {
					res.end('your passwords arent the same');
					return;
				}
				
				res.end()
			});
			return;
		}
		else if (req.method !== 'GET') {
			res.end('boo');
			return;
		}

		if (false) 0;
		else if (req.url == '/') {
			let page = fs.readFileSync('page.html');
			res.writeHead(200, { CONTENT_TYPE: TEXT_HTML });
			sendGeneric(page);
		}
		else if (req.url == '/style.css') {
			let client = fs.readFileSync('style.css');
			res.writeHead(200, { CONTENT_TYPE: "text/css" });
			sendGeneric(client);
		}
		else if (req.url == '/bundle.js') {
			let client = fs.readFileSync('bundle.js');
			res.writeHead(200, { CONTENT_TYPE: TEXT_JAVASCRIPT });
			sendGeneric(client);
		}
		else if (req.url == '/sectors.json') {
			res.writeHead(200, { CONTENT_TYPE: APPLICATION_JSON });
			sendObject(sectors);
		}
		else if (req.url == '/locations.json') {
			res.writeHead(200, { CONTENT_TYPE: APPLICATION_JSON });
			sendObject(locations);
		}
		else if (req.url == '/getwhere') {
			console.log('got getwhere');

			sendSwhere();
		}
		else if (req.url.search('/submitFlight') == 0) {
			console.log('received flight');

			let val;
			val = req.url.split('=')[1];
			val = val.replace(/%20/g, " ");

			console.log(val);

			sendSwhere();
		}
		else if (req.url == '/returnSublocation') {
			//console.log('return from sublocation');
			ply.sublocation = 'None';
			writePly(ply);
			sendSwhere();
		}
		else if (-1 < req.url.indexOf('/app/')) {
			let appId = req.url.split('app/')[1];
			console.log('ask app/', appId);
			sendGeneric('woo app: ' + appId);
		}
		else if (-1 < req.url.indexOf('/getobject/')) {
			let appId = req.url.split('getobject/')[1];
			sendObject({ someObject: true });
		}
		else if (req.url == '/api/server/2/booking') {

		}
		else if (req.url.search("/knock") == 0) {
			res.writeHead(200, { CONTENT_TYPE: APPLICATION_JSON });
			const parsed = qs.parse(req.url);
			// msg&boo&shu '/knock': '', boo: '', shu: ''
			//console.log(parsed);
			receivedKnock(parsed);
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