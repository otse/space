"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
const hooks_1 = require("../shared/hooks");
var continuum;
(function (continuum) {
    //export var asd: {[user: string]: ply_json }
    continuum.table = {};
    function init() {
        continuum.meta = object_from_file('lost minor planet.json');
        continuum.regions = object_from_file('regions.json');
        continuum.logins = object_from_file('logins.json');
        continuum.users = object_from_file('users.json');
        let num = 0;
        for (const username of continuum.users) {
            let user = get_user_from_table_or_fetch(username, false);
        }
        console.log(`loaded ${num} non dormant users`);
    }
    continuum.init = init;
    function out_neat(path, object) {
        const stringified = JSON.stringify(object, null, 4);
        fs.writeFileSync(path, stringified);
        return 1;
    }
    continuum.out_neat = out_neat;
    function object_from_file(path) {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    }
    continuum.object_from_file = object_from_file;
    function object_exists(path) {
        return fs.existsSync(path);
    }
    continuum.object_exists = object_exists;
    function has_user(username) {
        return continuum.users.indexOf(username) !== -1;
    }
    continuum.has_user = has_user;
    function out_meta() {
        continuum.meta.writes++;
        out_neat('lost minor planet.json', continuum.meta);
    }
    continuum.out_meta = out_meta;
    function out_logins() {
        out_neat('logins.json', continuum.logins);
    }
    continuum.out_logins = out_logins;
    function out_users() {
        out_neat('users.json', continuum.users);
    }
    continuum.out_users = out_users;
    function out_user(user) {
        console.log('out user', user.id);
        out_neat(user_path(user.username), user);
    }
    continuum.out_user = out_user;
    function clean_ip(ip) {
        ip = ip.replace(/\s|:/g, '');
        return ip;
    }
    continuum.clean_ip = clean_ip;
    function user_path(username) {
        return `users/${username}.json`;
    }
    continuum.user_path = user_path;
    function new_user() {
        continuum.meta.users++;
        out_meta();
        let user = {
            id: continuum.meta.users,
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
    continuum.new_user = new_user;
    function delete_user(ip, guest) {
        const username = continuum.logins[ip];
        if (username) {
            const user = get_user_from_table_or_fetch(username);
            if (user) {
                if (guest == user.guest) {
                    delete continuum.logins[ip];
                    delete continuum.table[username];
                    hooks_1.default.call('userPurged', user);
                    fs.unlinkSync(user_path(username));
                    continuum.users.splice(continuum.users.indexOf(username), 1);
                    out_logins();
                    out_users();
                    return true;
                }
            }
        }
    }
    continuum.delete_user = delete_user;
    /// used by server session
    function get_user_from_ip(ip) {
        if (continuum.logins[ip]) {
            const username = continuum.logins[ip];
            let user = get_user_from_table_or_fetch(username);
            return user;
        }
    }
    continuum.get_user_from_ip = get_user_from_ip;
    /// powerful function used obliquely
    function get_user_from_table_or_fetch(username, dormant = true) {
        let user = continuum.table[username];
        if (user)
            return user;
        else {
            let user = in_user(username);
            if (user) {
                if (user.dormant && !dormant)
                    return;
                continuum.table[username] = user;
                hooks_1.default.call('userMinted', user);
            }
            return user;
        }
    }
    continuum.get_user_from_table_or_fetch = get_user_from_table_or_fetch;
    /// can return undefined
    function in_user(username) {
        if (object_exists(user_path(username)))
            return object_from_file(user_path(username));
    }
    function make_quest(ip) {
        console.log('make new quest', continuum.meta.users);
        let user;
        user = new_user();
        user.username = `pilot#${continuum.meta.users}`;
        user.guest = true;
        user.ip = ip;
        continuum.logins[ip] = user.username;
        continuum.users.push(user.username);
        out_user(user);
        out_users();
        out_logins();
        get_user_from_table_or_fetch(user.username);
        return user;
    }
    continuum.make_quest = make_quest;
})(continuum || (continuum = {}));
exports.default = continuum;
