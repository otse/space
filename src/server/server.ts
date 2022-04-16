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
	username: string
	password: string
	ip: string
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
var remembrance_table = {}
var logged_in: {} = {}
var players: Ply[]


interface MainComputerFile {
	players: number
	writes: number
	boo: number
}

export function writeMcf() {
	main_computer_file.writes++;
	const payload = JSON.stringify(main_computer_file, null, 4);
	fs.writeFileSync('mcf.json', payload);
}

export function write_ips_logged_in() {
	const payload = JSON.stringify(logged_in, null, 4);
	fs.writeFileSync('ips_logged_in.json', payload);
}

export function writePly(ply: Ply) {
	console.log('writing ply ', ply.id);

	let payload = JSON.stringify(ply, null, 4);

	if (ply.unregistered)
		fs.writeFileSync(unregisteredPath(ply.ip), payload);
	else {
		const path = `players/${ply.username}.json`;

		fs.writeFileSync(path, payload);
	}
}

export function sanitizeIp(ip: string) {
	ip = ip.replace('::', '');
	ip = ip.replace(':', '');
	return ip;
}

export function unregisteredPath(ip) {
	return `players/ip/${ip}.json`;
}

export function plyPath(username) {
	return `players/${username}.json`;
}

var unregisteredPlys = {};

export function plyTempl() {
	main_computer_file.players++;
	writeMcf();
	return <Ply>{
		id: main_computer_file.players,
		ip: 'N/A',
		username: 'Captain',
		password: 'N/A',
		speed: 1,
		unregistered: false,
		flight: false,
		flightLocation: '',
		position: [0, 0],
		sector: 'Great Suldani Belt',
		location: 'Dartwing',
		sublocation: 'None',
	};
}

export function getPly(ip) {

	let cleanIp = sanitizeIp(ip);

	let ply: Ply;

	if (logged_in[`${cleanIp}`]) {
		//console.log('this ip is remembered to be logged in');

		const username = logged_in[`${cleanIp}`];

		if (remembrance_table[username]) {
			//console.log('we have remembrance this server session');

			ply = remembrance_table[username];
		}
		else {
			console.log('we dont have a remembrance this server session');

			const path = `players/${username}.json`;

			ply = JSON.parse(fs.readFileSync(path, 'utf8'));

			remembrance_table[username] = ply;
		}
	}
	else if (unregisteredPlys[`${cleanIp}`]) {
		ply = unregisteredPlys[`${cleanIp}`];
		console.log('got ply safely from unregistered table');
	}
	else {
		if (fs.existsSync(unregisteredPath(cleanIp)))
			ply = unregisteredPlys[`${cleanIp}`] = JSON.parse(fs.readFileSync(unregisteredPath(cleanIp), 'utf8'));
		else {
			ply = plyTempl();
			ply.unregistered = true;
			ply.ip = cleanIp;

			fs.writeFileSync(unregisteredPath(cleanIp), JSON.stringify(ply, null, 4));
		}
	}
	return ply;
}

function init() {

	main_computer_file = <MainComputerFile>JSON.parse(fs.readFileSync('mcf.json', 'utf8'));

	sectors = <any>JSON.parse(fs.readFileSync('sectors.json', 'utf8'));
	locations = <any>JSON.parse(fs.readFileSync('locations.json', 'utf8'));
	logged_in = <any>JSON.parse(fs.readFileSync('ips_logged_in.json', 'utf8'));

	//apiCall('https://api.steampowered.com/ISteamApps/GetAppList/v2');

	http.createServer(function (req, res) {

		// console.log('request from ', req.socket.remoteAddress, req.socket.remotePort);

		const ip = sanitizeIp(req.socket.remoteAddress);

		let ply = getPly(req.socket.remoteAddress);

		const sendSply = function () {
			sendStuple([['sply'], {
				id: ply.id,
				username: ply.username,
				unregistered: ply.unregistered
			}]);
		}

		const sendSwhere = function () {
			if (ply.flight) {
				sendStuple([['flight'], {
					position: ply.position
				}]);
			}
			else {
				sendStuple([['swhere'],
				{
					sectorName: ply.sector,
					locationName: ply.location,
					sublocation: ply.sublocation
				}
				]);
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

		if (req.url == '/login' && req.method == 'POST') {
			let body = '';

			req.on('data', function (chunk) {
				body += chunk;
			});

			req.on('end', function () {
				const parsed = qs.parse(body);

				console.log(parsed);

				const username = parsed.username;
				const password = parsed.password;

				// if (parsed['username'] == 'asdf')
				//	console.log('this is not your windows frend');

				const path = `players/${username}.json`;

				if (fs.existsSync(path)) {

					ply = JSON.parse(fs.readFileSync(path, 'utf8'));

					remembrance_table[`${username}`] = ply;

					if (ply.password == password) {
						res.writeHead(200);
						res.end('success');
						console.log(`ips_logged_in[${ip}] = ${ply.username}`);

						logged_in[`${ip}`] = ply.username;
						write_ips_logged_in();
					}
					else {
						res.writeHead(400);
						res.end('wrong pw');
					}
				}
				else {
					res.writeHead(400);
					res.end('user not found');
				}

			});

			return;
		}

		if (req.url == '/register' && req.method == 'POST') {
			let body = '';
			req.on('data', function (chunk) {
				body += chunk;
			});

			req.on('end', function () {
				const parsed = qs.parse(body);

				console.log(body);

				const regex = /[a-zA-Z]/;

				const doesItHaveLetter = regex.test(parsed['username']);

				var letterNumber = /^[0-9a-zA-Z]+$/;

				if (!parsed['username'].match(letterNumber)) {
					res.writeHead(400);
					res.end('username not alpha numeric');
				}
				else if (!doesItHaveLetter) {
					res.writeHead(400);
					res.end('need at least one letter');
				}
				else if (parsed['username'].length < 4) {
					res.writeHead(400);
					res.end('username too short (4 letters or more please)');
				}
				else if (parsed['password'].length < 4 || parsed['password'].length > 20) {
					res.writeHead(400);
					res.end('password length (4 - 20)');
				}
				else if (parsed['password'] != parsed['password-repeat']) {
					res.writeHead(400);
					res.end('your passwords arent the same');
				}
				else {

					const username = parsed.username;
					const password = parsed.password;

					const path = `players/${username}.json`;

					if (fs.existsSync(path)) {
						res.writeHead(400);
						res.end(`a player already exists with username ${username}. try logging in`);
					}
					else {
						let ply = plyTempl();
						ply.unregistered = false;
						ply.ip = 'N/A';
						ply.username = parsed['username'];
						ply.password = parsed['password'];

						res.writeHead(200);
						res.end(`you're registered as ${username}. now login`);

						const payload = JSON.stringify(ply, null, 4);
						fs.writeFileSync(`players/${username}.json`, payload);
					}
				}
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

		else if (req.url == '/where') {
			console.log('got where');

			sendSwhere();
		}
		else if (req.url == '/ply') {
			console.log('get ply');

			sendSply();
		}
		else if (req.url == '/logout') {
			console.log('going to log you out');
			if (logged_in[`${ip}`]) {
				const username = logged_in[`${ip}`];
				delete logged_in[`${ip}`];
				write_ips_logged_in();
				res.end(`logging out ${username}`);
			}
			else {
				res.end(`you're not in the logged in table`);
			}

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