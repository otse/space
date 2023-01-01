"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
const hooks_1 = require("../shared/hooks");
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
            let user = get_user_from_table_or_fetch(username, false);
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
    function out_user(user) {
        console.log('out user', user.id);
        out_neat(user_path(user.username), user);
    }
    lost_minor_planet.out_user = out_user;
    function clean_ip(ip) {
        ip = ip.replace(/\s|:/g, '');
        return ip;
    }
    lost_minor_planet.clean_ip = clean_ip;
    function user_path(username) {
        return `users/${username}.json`;
    }
    lost_minor_planet.user_path = user_path;
    function new_user() {
        lost_minor_planet.meta.users++;
        out_meta();
        let user = {
            id: lost_minor_planet.meta.users,
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
    lost_minor_planet.new_user = new_user;
    function delete_user(ip, guest) {
        const username = lost_minor_planet.logins[ip];
        if (username) {
            const user = get_user_from_table_or_fetch(username);
            if (user) {
                if (guest == user.guest) {
                    delete lost_minor_planet.logins[ip];
                    delete lost_minor_planet.table[username];
                    hooks_1.default.call('userPurged', user);
                    fs.unlinkSync(user_path(username));
                    lost_minor_planet.users.splice(lost_minor_planet.users.indexOf(username), 1);
                    out_logins();
                    out_users();
                    return true;
                }
            }
        }
    }
    lost_minor_planet.delete_user = delete_user;
    /// used by server session
    function get_user_from_ip(ip) {
        if (lost_minor_planet.logins[ip]) {
            const username = lost_minor_planet.logins[ip];
            let user = get_user_from_table_or_fetch(username);
            return user;
        }
    }
    lost_minor_planet.get_user_from_ip = get_user_from_ip;
    /// powerful function used obliquely
    function get_user_from_table_or_fetch(username, dormant = true) {
        let user = lost_minor_planet.table[username];
        if (user)
            return user;
        else {
            let user = in_user(username);
            if (user) {
                if (user.dormant && !dormant)
                    return;
                lost_minor_planet.table[username] = user;
                hooks_1.default.call('userMinted', user);
            }
            return user;
        }
    }
    lost_minor_planet.get_user_from_table_or_fetch = get_user_from_table_or_fetch;
    /// can return undefined
    function in_user(username) {
        if (object_exists(user_path(username)))
            return object_from_file(user_path(username));
    }
    function make_quest(ip) {
        console.log('make new quest', lost_minor_planet.meta.users);
        let user;
        user = new_user();
        user.username = `pilot#${lost_minor_planet.meta.users}`;
        user.guest = true;
        user.ip = ip;
        lost_minor_planet.logins[ip] = user.username;
        lost_minor_planet.users.push(user.username);
        out_user(user);
        out_users();
        get_user_from_table_or_fetch(user.username);
        return user;
    }
    lost_minor_planet.make_quest = make_quest;
})(lost_minor_planet || (lost_minor_planet = {}));
exports.default = lost_minor_planet;
