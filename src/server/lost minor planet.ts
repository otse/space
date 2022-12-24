import game from "./game";

var fs = require('fs');

namespace lost_minor_planet {
	export var file;

	export var regions;

	export var regs = {};
	export var unregs = {};
	export var logins = {};

	export function init() {
		file = object_from_file('lost minor planet.json');
		logins = object_from_file('logins.json');
		regions = object_from_file('regions.json');
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
		file.writes++;
		object_to_file('lost minor planet.json', file);
	}

	export function write_logins() {
		object_to_file('logins.json', logins);
	}

	export function write_ply(ply: game.ply) {
		console.log('writing ply ', ply.id);

		if (ply.unreg)
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
		file.players++;
		write_lost_minor_planet();
		let ply: game.ply = {
			id: file.players,
			ip: 'N/A',
			unreg: false,
			username: 'Captain',
			password: 'N/A',
			pos: [0, 0],
			goto: [0, 0],
			speed: 1,
			health: 100,
			flight: false,
			flightLocation: '',
			scanning: false
		};
		return ply;
	}

	export function get_ply(ip) {

		ip = sanitize_ip(ip);

		let ply: game.ply;

		/*
		the following resolves ply, every http request (whether its a stylesheet or a page)
		*/

		if (logins[ip]) {
			const username = logins[ip];
			if (regs[username]) {
				ply = regs[username];
			}
			else {
				console.log('we dont have this ply in a session yet');

				if (object_exists(reg_path(username))) {
					ply = object_from_file(reg_path(username));
					regs[username] = ply;
				}
				else {
					// invalid logins.json entry pointing to a deleted user
					// todo this is way too much error-handling
					delete logins[username];
					ply = new_ply();
					write_ply(ply);
					regs[username] = ply;
					console.warn('user in users doesnt exist');
				}

			}
		}
		else if (unregs[ip]) {
			ply = unregs[ip];
		}
		else {
			if (object_exists(unreg_path(ip))) {
				ply = object_from_file(unreg_path(ip));
				unregs[ip] = ply;
			}
			else {
				ply = new_ply();
				ply.unreg = true;
				ply.ip = ip;

				object_to_file(unreg_path(ip), ply);
			}
		}
		ply.goto = [Math.random() * 10, Math.random() * 10];
		//add_session(ply);
		return ply;
	}
}

export default lost_minor_planet;