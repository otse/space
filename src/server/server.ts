import { write } from "fs";
import { locations } from "./locations";
import game from "./game";
import lod from "./lod";
import lmp from "./lost minor planet";
import short_lived from "./session";

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

var sessions: game.ply[] = [];

var ply_grids: [game.ply, lod.grid]
var all_plys: game.ply[]

interface LostMinorPlanet {
	players: number
	writes: number
	boo: number
}

/*export function get_region_by_name(name) {
	for (let region of regions)
		if (regions.name == name)
			return region;
}*/

export function tick() {

}

function init() {

	setInterval(tick, 1000);

	new lod.galaxy;

	for (let i = 0; i < 5; i++) {
		let rock = new lod.obj;
		rock.type = 'rock';
		rock.pos = [Math.random() * 20 - 10, Math.random() * 20 - 10];
		lod.add(rock);
	}

	lmp.init();

	locations.init();


	//createLocationPersistence();

	//apiCall('https://api.steampowered.com/ISteamApps/GetAppList/v2');

	http.createServer(function (req, res) {

		// console.log('request from ', req.socket.remoteAddress, req.socket.remotePort);

		console.log(req.url);

		if (req.url == '/') {
			let page = fs.readFileSync('page.html');
			res.writeHead(200, { CONTENT_TYPE: TEXT_HTML });
			res.end(page);
			return;
		}
		else if (req.url == '/style.css') {
			let style = fs.readFileSync('style.css');
			res.writeHead(200, { CONTENT_TYPE: "text/css" });
			res.end(style);
			return;
		}
		else if (req.url == '/outer%20space.css') {
			let style = fs.readFileSync('outer space.css');
			res.writeHead(200, { CONTENT_TYPE: "text/css" });
			res.end(style);
			return;
		}
		else if (req.url == '/bundle.js') {
			let client = fs.readFileSync('bundle.js');
			res.writeHead(200, { CONTENT_TYPE: TEXT_JAVASCRIPT });
			res.end(client);
			return;
		}
		else if (req.url == '/regions.json') {
			res.writeHead(200, { CONTENT_TYPE: APPLICATION_JSON });
			let str = JSON.stringify(lmp.regions);
			res.end(str);
			return;
		}
		else if (req.url == '/locations.json') {
			res.writeHead(200, { CONTENT_TYPE: APPLICATION_JSON });
			let str = JSON.stringify(locations.file);
			res.end(str);
			return;
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

				const path = lmp.reg_path(username);

				if (lmp.object_exists(path)) {
					let ply = lmp.object_from_file(path);
					lmp.regs[username] = ply;
					let logged_in_elsewhere = false;
					let ip2;
					for (ip2 in lmp.logins) {
						let username2 = lmp.logins[ip2];
						if (username == username2 && ip != ip2) {
							logged_in_elsewhere = true;
							break;
						}
					}
					if (lmp.logins[ip] == username) {
						res.writeHead(400);
						res.end('already logged in here');
					}
					else if (ply.password == password) {
						res.writeHead(200);
						let msg = 'logging you in';

						if (logged_in_elsewhere) {
							msg += '. you\'ve been logged out of your other device';
							delete lmp.logins[ip2];
						}
						res.end(msg);
						lmp.logins[ip] = ply.username;
						lmp.write_logins();
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

					const path = lmp.reg_path(username);

					if (fs.existsSync(path)) {
						res.writeHead(400);
						res.end(`a player already exists with username ${username}. try logging in`);
					}
					else {
						let ply = lmp.new_ply();
						ply.unreg = false;
						ply.ip = 'N/A';
						ply.username = parsed['username'];
						ply.password = parsed['password'];

						res.writeHead(200);
						res.end(`congratulations, you've registered as ${username}. now login`);

						const payload = JSON.stringify(ply, null, 4);
						fs.writeFileSync(lmp.reg_path(username), payload);
					}
				}
			});

			return;
		}

		/*else if (req.url == '/where') {
			console.log('got where');

			sendSwhere();
		}*/

		const ip = lmp.sanitize_ip(req.socket.remoteAddress);

		let ply = lmp.get_ply(req.socket.remoteAddress);

		let session = new short_lived;
		session.ply = ply;
		session.grid = new lod.grid(lod.ggalaxy, 2, 2);
		session.grid.big = lod.galaxy.big(ply.pos);
		lod.ggalaxy.update_grid(session.grid, ply.pos);

		const send_sply = function () {
			let reduced: any = {
				id: ply.id,
				username: ply.username,
				unreg: ply.unreg,
				pos: ply.pos,
				goto: ply.goto,
				flight: ply.flight,
				flightLocation: ply.flightLocation,
			};

			send_stuple([['sply'], reduced]);
		}

		const send_smessage = function (message) {
			send_stuple([['message'], message]);
		}

		const send_stuple = function (anything: object) {
			let str = JSON.stringify(anything);
			res.end(str);
		}

		if (req.url == '/ply') {
			console.log('get ply');
			send_sply();
			return;
		}
		else if (req.url == '/celestial%20objects') {
			let objects = session.grid.gather();
			send_stuple([['celestial objects'], objects]);
			res.end();
			return;
		}
		else if (req.url == '/logout') {
			console.log('going to log you out');
			if (lmp.logins[ip]) {
				const username = lmp.logins[ip];
				delete lmp.logins[ip];
				lmp.write_logins();
				res.end(`logging out ${username}`);
			}
			else {
				res.end(`not logged in, playing as unregistered`);
			}
			return;
		}
		else {
			res.end('unhandled resource');
		}

	}).listen(port);

}

init();