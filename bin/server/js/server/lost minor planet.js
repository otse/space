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
        for (const username of lost_minor_planet.users) {
            let ply = get_ply_from_table_or_fetch(username);
            if (ply) {
                if (ply.dormant) {
                    delete lost_minor_planet.table[username];
                }
                else {
                    num++;
                    lost_minor_planet.table[username] = ply;
                }
            }
        }
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
    function has_user(username) {
        return lost_minor_planet.users.indexOf(username) !== -1;
    }
    lost_minor_planet.has_user = has_user;
    function out_meta() {
        lost_minor_planet.meta.writes++;
        out_neat('lost minor planet.json', lost_minor_planet.meta);
    }
    lost_minor_planet.out_meta = out_meta;
    function out_logins() {
        out_neat('logins.json', lost_minor_planet.logins);
    }
    lost_minor_planet.out_logins = out_logins;
    function out_users() {
        out_neat('users.json', lost_minor_planet.users);
    }
    lost_minor_planet.out_users = out_users;
    function out_ply(ply) {
        console.log('out ply', ply.id);
        out_neat(user_path(ply.username), ply);
    }
    lost_minor_planet.out_ply = out_ply;
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
        out_meta();
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
        delete_user(ip, true);
    }
    lost_minor_planet.handle_new_login = handle_new_login;
    function splice_user(username) {
        lost_minor_planet.users.splice(lost_minor_planet.users.indexOf(username), 1);
    }
    function delete_user(ip, guest) {
        const username = lost_minor_planet.logins[ip];
        if (username) {
            const ply = get_ply_from_table_or_fetch(username);
            if (ply) {
                if (guest == ply.guest) {
                    delete lost_minor_planet.logins[ip];
                    delete lost_minor_planet.table[username];
                    fs.unlinkSync(user_path(username));
                    splice_user(username);
                    out_logins();
                    out_users();
                    return true;
                }
            }
        }
    }
    lost_minor_planet.delete_user = delete_user;
    function get_ply_from_table_or_fetch(username, dormant = true) {
        let ply = lost_minor_planet.table[username];
        if (ply)
            return ply;
        else {
            let ply = in_user(username);
            if (ply.dormant && !dormant)
                return;
            if (ply)
                lost_minor_planet.table[username] = ply;
            return ply;
        }
    }
    lost_minor_planet.get_ply_from_table_or_fetch = get_ply_from_table_or_fetch;
    function in_user(username) {
        if (object_exists(user_path(username)))
            return object_from_file(user_path(username));
    }
    lost_minor_planet.in_user = in_user;
    function make_quest(ip) {
        console.log('make new quest', lost_minor_planet.meta.users);
        let ply;
        ply = new_ply();
        ply.username = `pilot#${lost_minor_planet.meta.users}`;
        ply.guest = true;
        ply.ip = ip;
        lost_minor_planet.logins[ip] = ply.username;
        lost_minor_planet.users.push(ply.username);
        out_ply(ply);
        out_users();
        out_logins();
        return ply;
    }
    lost_minor_planet.make_quest = make_quest;
    function get_ply_from_ip(ip) {
        if (lost_minor_planet.logins[ip]) {
            const username = lost_minor_planet.logins[ip];
            let ply = get_ply_from_table_or_fetch(username);
            return ply;
        }
    }
    lost_minor_planet.get_ply_from_ip = get_ply_from_ip;
})(lost_minor_planet || (lost_minor_planet = {}));
exports.default = lost_minor_planet;