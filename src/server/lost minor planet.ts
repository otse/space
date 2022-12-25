var fs = require('fs');

import stellar_objects from "./stellar objects";


interface LostMinorPlanet {
	users: number
	writes: number
	boo: number
}

namespace lost_minor_planet {

	export interface ply_json {
		id: number
		ip: string
		guest: boolean
		dormant: boolean
		username: string
		password: string
		pos: vec2
		goto: vec2
	}

	export var meta, regions, logins, users;

	//export var asd: {[user: string]: ply_json }

	export var table = {};

	export function init() {
		meta = object_from_file('lost minor planet.json');
		regions = object_from_file('regions.json');
		logins = object_from_file('logins.json');
		users = object_from_file('users.json');

		let num = 0;
		for (let name of users) {
			let ply = fetch_user(name);
			if (!ply.dormant) {
				num++;
				table[name] = ply;
			}
		}
		//colors.enable();
		console.log(`loaded ${num} non dormant users`);

	}

	export function out_neat(path, object) {
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

	export function write_meta() {
		meta.writes++;
		out_neat('lost minor planet.json', meta);
	}

	export function write_logins() {
		out_neat('logins.json', logins);
	}

	export function write_users() {
		out_neat('users.json', users);
	}

	export function write_ply(ply: ply_json) {
		console.log('writing ply', ply.id);
		out_neat(user_path(ply.username), ply);
	}

	export function clean_ip(ip: string) {
		ip = ip.replace(/\s|:/g, '');
		return ip;
	}

	export function user_path(username) {
		return `users/${username}.json`;
	}

	export function new_ply() {
		meta.users++;
		write_meta();
		let ply: ply_json = {
			id: meta.users,
			ip: 'N/A',
			guest: false,
			dormant: false,
			username: 'Captain',
			password: 'N/A',
			pos: [0, 0],
			goto: [0, 0],
		};
		return ply;
	}

	export function handle_new_login(ip) {
		if (logins[ip])
			0;
	}

	export function delete_user(ip) {
		const username = logins[ip];
		if (username) {
			const ply = get_ply_from_table_or_fetch(username);
			if (ply) {
				if (ply.guest) {
					delete logins[ip];
					write_logins();
					return true;
				}
			}
		}
	}

	export function get_ply_from_table_or_fetch(username) {
		let ply = table[username];
		if (!ply) {
			ply = table[username] = fetch_user(username);
		}
		return ply;
	}

	export function fetch_user(username) {
		return object_from_file(user_path(username));
	}

	export function make_quest(ip) {
		console.log('make new quest');
		let ply: ply_json;
		ply = new_ply();
		ply.username = `pilot#${meta.users++}`;
		ply.guest = true;
		ply.ip = ip;
		logins[ip] = ply.username;
		users.push(ply.username);
		write_users();
		write_ply(ply);
		write_logins();
		return ply;
	}

	export function get_ply_from_ip(ip) {

		console.log('new get ply', ip);

		let ply: ply_json | undefined;

		if (logins[ip]) {
			const username = logins[ip];
			if (table[username]) {
				ply = table[username];
			}
			else {
				// not logged in yet this server-session
				if (object_exists(user_path(username))) {
					ply = fetch_user(username);
					table[username] = ply;
				}
				else {
					// logins.json is pointing to a non-existing user.json

				}
			}
		}
		//else {
		// we aren't in logins.json -> make a temporary ply user#1234
		//	ply = make_quest(ip);
		//}

		return ply;
	}
}

export default lost_minor_planet;