import { write } from "fs";
import { locations } from "./locations";

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

const header = `
<wut>
`;

function exit(options, exitCode) {
	console.log('exit', exitCode);
	process.exit();
}

process.on('SIGINT', exit);

const indent = ``

type appId = number;

interface Ply {
	id: number
	ip: string
	username: string
	password: string
	health: number
	unregistered: boolean
	speed: number
	flight: boolean
	flightLocation: string
	scanning?: boolean
	scanStart?: number
	scanEnd?: number
	scanCompleted?: boolean
	engaging?: boolean
	position
	sector
	location
	sublocation
}

var sessions = {};
var logins = {};

var lost_minor_planet;
var regions;

var unregs = {};
var all_plys: Ply[]

interface LostMinorPlanet {
	players: number
	writes: number
	boo: number
}

export function object_to_file(path, object) {
	const stringified = JSON.stringify(object, null, 4);
	fs.writeFileSync(path, stringified);
	return 1;
}

export function object_from_file(path) {
	return JSON.parse(fs.readFileSync(path, 'utf8'));
}

export function object_exists(path) {
	return fs.existsSync(path);
}

export function write_lost_minor_planet() {
	lost_minor_planet.writes++;
	object_to_file('lost minor planet.json', lost_minor_planet);
}

export function write_logins() {
	object_to_file('logins.json', logins);
}

export function write_ply(ply: Ply) {
	console.log('writing ply ', ply.id);

	if (ply.unregistered)
		object_to_file(unreg_path(ply.ip), ply);
	else
		object_to_file(reg_path(ply.username), ply);
}

export function sanitize_ip(ip: string) {
	ip = ip.replace('::', '');
	ip = ip.replace(':', '');
	return ip;
}

export function unreg_path(ip) {
	return `players/ip/${ip}.json`;
}

export function reg_path(username) {
	return `players/${username}.json`;
}

export function new_ply() {
	lost_minor_planet.players++;
	write_lost_minor_planet();
	let ply: Ply = {
		id: lost_minor_planet.players,
		ip: 'N/A',
		username: 'Captain',
		password: 'N/A',
		speed: 1,
		health: 100,
		unregistered: false,
		flight: false,
		flightLocation: '',
		scanning: false,
		position: [0, 0],
		sector: 'Great Suldani Belt',
		location: 'Dartwing',
		sublocation: 'None'
	};
	return ply;
}

export function get_region(name) {
	for (let region of regions)
		if (regions.name == name)
			return region;
}

export function tick() {

}

export function get_ply(ip) {

	let cleanIp = sanitize_ip(ip);

	let ply: Ply;

	if (logins[`${cleanIp}`]) {
		//console.log('this ip is remembered to be logged in');

		const username = logins[`${cleanIp}`];

		if (sessions[username]) {
			//console.log('we have remembrance this server session');

			ply = sessions[username];
		}
		else {
			console.log('we dont have a remembrance this server session');

			ply = object_from_file(reg_path(username));

			sessions[username] = ply;
		}
	}
	else if (unregs[`${cleanIp}`]) {
		ply = unregs[`${cleanIp}`];
		//console.log('got ply safely from unregistered table');
	}
	else {
		if (object_exists(unreg_path(cleanIp)))
			ply = unregs[`${cleanIp}`] = object_from_file(unreg_path(cleanIp));
		else {
			ply = new_ply();
			ply.unregistered = true;
			ply.ip = cleanIp;

			object_to_file(unreg_path(cleanIp), ply);
		}
	}
	return ply;
}

function init() {

	setInterval(tick, 1000);

	lost_minor_planet = object_from_file('lost minor planet.json');

	locations.init();

	regions = object_from_file('regions.json');
	logins = object_from_file('logins.json');

	//createLocationPersistence();

	//apiCall('https://api.steampowered.com/ISteamApps/GetAppList/v2');

	http.createServer(function (req, res) {

		// console.log('request from ', req.socket.remoteAddress, req.socket.remotePort);

		const ip = sanitize_ip(req.socket.remoteAddress);

		let ply = get_ply(req.socket.remoteAddress);

		const send_sply = function () {
			let object: any = {
				id: ply.id,
				username: ply.username,
				unregistered: ply.unregistered,
				sector: ply.sector,
				location: ply.location,
				sublocation: ply.sublocation,
				position: ply.position,
				flight: ply.flight,
				flightLocation: ply.flightLocation,
			};

			if (ply.scanning) {
				console.log('were scanning');

				object.scanning = true;
				object.scanStart = ply.scanStart || 0;
				object.scanEnd = ply.scanEnd || 0;
				object.scanCompleted = ply.scanCompleted;
			}

			if (ply.engaging) {
				object.engaging = true;
			}

			sendStuple([['sply'], object]);
		}

		const sendSmessage = function (message) {
			sendStuple([['message'], message]);
		}

		const transportSublocation = function (where) {
			if (where == 'Refuel')
				console.log('requesting refuel sublocation');
		}

		const sendObject = function (anything: object) {
			let str = JSON.stringify(anything);
			res.end(str);
		}

		const sendStuple = function (anything: object) {
			let str = JSON.stringify(anything);
			res.end(str);
		}

		function receivedKnock(inputs: any) {
			//console.log('Knock ', inputs);

			const sublocation = inputs.sublocation;
			if (sublocation == 'refuel') {
				ply.sublocation = 'Refuel';
				write_ply(ply);
				send_sply();
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

				const path = reg_path(username);

				if (object_exists(path)) {

					ply = object_from_file(path);

					sessions[username] = ply;

					let logged_in_elsewhere = false;
					let ip2;
					for (ip2 in logins) {
						let username2 = logins[ip2];
						if (username == username2 && ip != ip2) {
							logged_in_elsewhere = true;
							break;
						}
					}
					if (logins[`${ip}`] == username) {
						res.writeHead(400);
						res.end('already logged in here');
					}
					else if (ply.password == password) {
						res.writeHead(200);
						let msg = 'logging you in';

						if (logged_in_elsewhere) {
							msg += '. you\'ve been logged out of your other device';
							delete logins[ip2];
						}
						res.end(msg);

						logins[`${ip}`] = ply.username;
						write_logins();

						res.end();
					}
					else if (ply.password != password) {
						res.writeHead(400);
						res.end('wrong pw');
					}
					else {
						res.writeHead(400);
						res.end('generic error');
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

					const path = reg_path(username);

					if (fs.existsSync(path)) {
						res.writeHead(400);
						res.end(`a player already exists with username ${username}. try logging in`);
					}
					else {
						let ply = new_ply();
						ply.unregistered = false;
						ply.ip = 'N/A';
						ply.username = parsed['username'];
						ply.password = parsed['password'];

						res.writeHead(200);
						res.end(`you're registered as ${username}. now login`);

						const payload = JSON.stringify(ply, null, 4);
						fs.writeFileSync(reg_path(username), payload);
					}
				}
			});

			return;
		}
		else if (req.method !== 'GET') {
			res.end('boo');
			return;
		}

		if (ply.scanning) {
			const scanRemaining = ply.scanEnd! - Date.now();

			if (scanRemaining < 0) {
				ply.scanCompleted = true;
			}

		}

		console.log(req.url);


		if (req.url == '/') {
			let page = fs.readFileSync('page.html');
			res.writeHead(200, { CONTENT_TYPE: TEXT_HTML });
			res.end(page);
			//sendGeneric(page);
		}
		else if (req.url == '/style.css') {
			let style = fs.readFileSync('style.css');
			res.writeHead(200, { CONTENT_TYPE: "text/css" });
			res.end(style);
		}
		else if (req.url == '/outer%20space.css') {
			let style = fs.readFileSync('outer space.css');
			res.writeHead(200, { CONTENT_TYPE: "text/css" });
			res.end(style);
		}
		else if (req.url == '/bundle.js') {
			let client = fs.readFileSync('bundle.js');
			res.writeHead(200, { CONTENT_TYPE: TEXT_JAVASCRIPT });
			res.end(client);
		}
		else if (req.url == '/regions.json') {
			res.writeHead(200, { CONTENT_TYPE: APPLICATION_JSON });
			let str = JSON.stringify(regions);
			res.end(str);
		}
		else if (req.url == '/locations.json') {
			res.writeHead(200, { CONTENT_TYPE: APPLICATION_JSON });
			let str = JSON.stringify(locations.file);
			res.end(str);
		}
		/*else if (req.url == '/where') {
			console.log('got where');

			sendSwhere();
		}*/
		else if (req.url == '/ply') {
			console.log('get ply');

			send_sply();
		}
		else if (req.url == '/logout') {
			console.log('going to log you out');
			if (logins[`${ip}`]) {
				const username = logins[`${ip}`];
				delete logins[`${ip}`];
				write_logins();
				res.end(`logging out ${username}`);
			}
			else {
				res.end(`not logged in, playing as unregistered`);
			}

		}
		else if (req.url == '/askTick') {

		}
		else if (req.url == '/engagePirate') {
			ply.engaging = true;
			send_sply();

		}
		else if (req.url == '/seeEnemies') {
			console.log('seeEnemies');

			const location = locations.instance(ply.location)!;

			//ply.engaging = true;

			const cast = location as locations.contested_location_instance;

			const enemies = cast.get_enemies();

			//locations.locations

			ply.position = [Math.random() * 10, Math.random() * 10]

			sendStuple([['senemies'], enemies]);
		}
		else if (req.url == '/scan') {
			const location = locations.get(ply.location)!;

			if (location.type == 'Junk') {
				const durationMinutes = 2;
				ply.scanning = true;
				ply.scanCompleted = false;
				ply.scanStart = Date.now();
				ply.scanEnd = Date.now() + (1000 * 60 * durationMinutes);
				write_ply(ply);
				send_sply();
			}
			else {
				sendSmessage("Can only scan junk.");
			}
		}
		else if (req.url == '/stopScanning') {
			const location = locations.get(ply.location);
			ply.scanning = false;
			write_ply(ply);
			send_sply();
		}
		else if (req.url == '/completeScan') {
			//const location = locations.get(ply.location);
			ply.scanning = false;
			write_ply(ply);
			send_sply();
		}
		else if (req.url == '/dock') {

			if (ply.flight) {
				ply.flight = false;
				ply.location = ply.flightLocation;

				write_ply(ply);
				send_sply();
			}
			//sendStuple([['message'], `Can\'t dock. Not nearby ${ply.flightLocation}.`]);
		}
		else if (req.url.search('/submitFlight') == 0) {
			console.log('received flight');

			let val;
			val = req.url.split('=')[1];
			val = val.replace(/%20/g, " ");

			console.log(val);
			if (!locations.get(val)) {
				sendSmessage("Location doesn't exist");
			}
			else {
				ply.flight = true;
				ply.flightLocation = val;

				write_ply(ply);

				send_sply();
			}
		}
		else if (req.url == '/returnSublocation') {
			//console.log('return from sublocation');
			ply.sublocation = 'None';
			write_ply(ply);
			send_sply();
		}
		else if (-1 < req.url.indexOf('/app/')) {
			let appId = req.url.split('app/')[1];
			console.log('ask app/', appId);
			res.end('woo app: ' + appId);
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

init();