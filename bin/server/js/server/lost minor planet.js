"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
var lost_minor_planet;
(function (lost_minor_planet) {
    //export var asd: {[user: string]: ply_json }
    lost_minor_planet.table = {};
    function init() {
        lost_minor_planet.meta = object_from_file('lost minor planet.json');
        lost_minor_planet.regions = object_from_file('regions.json');
        lost_minor_planet.logins = object_from_file('logins.json');
        lost_minor_planet.users = object_from_file('users.json');
        let num = 0;
        for (let name of lost_minor_planet.users) {
            let ply = fetch_user(name);
            if (!ply.dormant) {
                num++;
                lost_minor_planet.table[name] = ply;
            }
        }
        //colors.enable();
        console.log(`loaded ${num} non dormant users`);
    }
    lost_minor_planet.init = init;
    function out_neat(path, object) {
        const stringified = JSON.stringify(object, null, 4);
        fs.writeFileSync(path, stringified);
        return 1;
    }
    lost_minor_planet.out_neat = out_neat;
    function object_from_file(path) {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    }
    lost_minor_planet.object_from_file = object_from_file;
    function object_exists(path) {
        return fs.existsSync(path);
    }
    lost_minor_planet.object_exists = object_exists;
    function write_meta() {
        lost_minor_planet.meta.writes++;
        out_neat('lost minor planet.json', lost_minor_planet.meta);
    }
    lost_minor_planet.write_meta = write_meta;
    function write_logins() {
        out_neat('logins.json', lost_minor_planet.logins);
    }
    lost_minor_planet.write_logins = write_logins;
    function write_users() {
        out_neat('users.json', lost_minor_planet.users);
    }
    lost_minor_planet.write_users = write_users;
    function write_ply(ply) {
        console.log('writing ply', ply.id);
        out_neat(user_path(ply.username), ply);
    }
    lost_minor_planet.write_ply = write_ply;
    function clean_ip(ip) {
        ip = ip.replace(/\s|:/g, '');
        return ip;
    }
    lost_minor_planet.clean_ip = clean_ip;
    function user_path(username) {
        return `users/${username}.json`;
    }
    lost_minor_planet.user_path = user_path;
    function new_ply() {
        lost_minor_planet.meta.users++;
        write_meta();
        let ply = {
            id: lost_minor_planet.meta.users,
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
    lost_minor_planet.new_ply = new_ply;
    function handle_new_login(ip) {
        if (lost_minor_planet.logins[ip])
            0;
    }
    lost_minor_planet.handle_new_login = handle_new_login;
    function delete_user(ip) {
        const username = lost_minor_planet.logins[ip];
        if (username) {
            const ply = get_ply_from_table_or_fetch(username);
            if (ply) {
                if (ply.guest) {
                    delete lost_minor_planet.logins[ip];
                    write_logins();
                    return true;
                }
            }
        }
    }
    lost_minor_planet.delete_user = delete_user;
    function get_ply_from_table_or_fetch(username) {
        let ply = lost_minor_planet.table[username];
        if (!ply) {
            ply = lost_minor_planet.table[username] = fetch_user(username);
        }
        return ply;
    }
    lost_minor_planet.get_ply_from_table_or_fetch = get_ply_from_table_or_fetch;
    function fetch_user(username) {
        return object_from_file(user_path(username));
    }
    lost_minor_planet.fetch_user = fetch_user;
    function make_quest(ip) {
        console.log('make new quest');
        let ply;
        ply = new_ply();
        ply.username = `pilot#${lost_minor_planet.meta.users++}`;
        ply.guest = true;
        ply.ip = ip;
        lost_minor_planet.logins[ip] = ply.username;
        lost_minor_planet.users.push(ply.username);
        write_users();
        write_ply(ply);
        write_logins();
        return ply;
    }
    lost_minor_planet.make_quest = make_quest;
    function get_ply_from_ip(ip) {
        console.log('new get ply', ip);
        let ply;
        if (lost_minor_planet.logins[ip]) {
            const username = lost_minor_planet.logins[ip];
            if (lost_minor_planet.table[username]) {
                ply = lost_minor_planet.table[username];
            }
            else {
                // not logged in yet this server-session
                if (object_exists(user_path(username))) {
                    ply = fetch_user(username);
                    lost_minor_planet.table[username] = ply;
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
    lost_minor_planet.get_ply_from_ip = get_ply_from_ip;
})(lost_minor_planet || (lost_minor_planet = {}));
exports.default = lost_minor_planet;
