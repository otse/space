var fs = require('fs');

import hooks from "../shared/hooks";

interface continuum_file {
	users: number
	writes: number
	boo: number
}

namespace continuum {

	export interface user_json {
		id: number
		ip: string
		guest: boolean
		dormant: boolean
		username: string
		password: string
		pos: vec2
		goto: vec2
	}

	export var meta: continuum_file

	export var regions, logins, users;

	//export var asd: {[user: string]: ply_json }

	export var table = {};

	export function init() {
		meta = object_from_file('lost minor planet.json');
		regions = object_from_file('regions.json');
		logins = object_from_file('logins.json');
		users = object_from_file('users.json');

		let num = 0;
		for (const username of users) {
			let user = get_user_from_table_or_fetch(username, false);
		}
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

	export function has_user(username) {
		return users.indexOf(username) !== -1;
	}

	export function out_meta() {
		meta.writes++;
		out_neat('lost minor planet.json', meta);
	}

	export function out_logins() {
		out_neat('logins.json', logins);
	}

	export function out_users() {
		out_neat('users.json', users);
	}

	export function out_user(user: user_json) {
		console.log('out user', user.id);
		out_neat(user_path(user.username), user);
	}

	export function clean_ip(ip: string) {
		ip = ip.replace(/\s|:/g, '');
		return ip;
	}

	export function user_path(username: string) {
		return `users/${username}.json`;
	}

	export function new_user() {
		meta.users++;
		out_meta();
		let user: user_json = {
			id: meta.users,
			ip: 'N/A',
			guest: false,
			dormant: false,
			username: 'Captain',
			password: 'N/A',
			pos: [0, 0],
			goto: [0, 0],
		};
		return user;
	}

	export function delete_user(ip, guest) {
		const username = logins[ip];
		if (username) {
			const user = get_user_from_table_or_fetch(username);
			if (user) {
				if (guest == user.guest) {
					delete logins[ip];
					delete table[username];
					hooks.call('userPurged', user);
					fs.unlinkSync(user_path(username));
					users.splice(users.indexOf(username), 1);
					out_logins();
					out_users();
					return true;
				}
			}
		}
	}

	/// used by server session
	export function get_user_from_ip(ip) {
		if (logins[ip]) {
			const username = logins[ip];
			let user = get_user_from_table_or_fetch(username);
			return user;
		}
	}

	/// powerful function used obliquely
	export function get_user_from_table_or_fetch(username, dormant = true) {
		let user = table[username];
		if (user)
			return user;
		else {
			let user = in_user(username);
			if (user) {
				if (user.dormant && !dormant)
					return;
				table[username] = user;
				hooks.call('userMinted', user);
			}
			return user;
		}
	}

	/// can return undefined
	function in_user(username) {
		if (object_exists(user_path(username)))
			return object_from_file(user_path(username));
	}

	export function make_quest(ip) {
		console.log('make new quest', meta.users);
		let user: user_json;
		user = new_user();
		user.username = `pilot#${meta.users}`;
		user.guest = true;
		user.ip = ip;
		logins[ip] = user.username;
		users.push(user.username);
		out_user(user);
		out_users();
		out_logins();
		get_user_from_table_or_fetch(user.username);
		return user;
	}
}

export default continuum;