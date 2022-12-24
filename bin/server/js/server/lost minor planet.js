"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
var lost_minor_planet;
(function (lost_minor_planet) {
    lost_minor_planet.regs = {};
    lost_minor_planet.unregs = {};
    lost_minor_planet.logins = {};
    function init() {
        lost_minor_planet.file = object_from_file('lost minor planet.json');
        lost_minor_planet.logins = object_from_file('logins.json');
        lost_minor_planet.regions = object_from_file('regions.json');
    }
    lost_minor_planet.init = init;
    function object_to_file(path, object) {
        const stringified = JSON.stringify(object, null, 4);
        fs.writeFileSync(path, stringified);
        return 1;
    }
    lost_minor_planet.object_to_file = object_to_file;
    function object_from_file(path) {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    }
    lost_minor_planet.object_from_file = object_from_file;
    function object_exists(path) {
        return fs.existsSync(path);
    }
    lost_minor_planet.object_exists = object_exists;
    function write_lost_minor_planet() {
        lost_minor_planet.file.writes++;
        object_to_file('lost minor planet.json', lost_minor_planet.file);
    }
    lost_minor_planet.write_lost_minor_planet = write_lost_minor_planet;
    function write_logins() {
        object_to_file('logins.json', lost_minor_planet.logins);
    }
    lost_minor_planet.write_logins = write_logins;
    function write_ply(ply) {
        console.log('writing ply ', ply.id);
        if (ply.unreg)
            object_to_file(unreg_path(ply.ip), ply);
        else
            object_to_file(reg_path(ply.username), ply);
    }
    lost_minor_planet.write_ply = write_ply;
    function sanitize_ip(ip) {
        ip = ip.replace('::', '');
        ip = ip.replace(':', '');
        return ip;
    }
    lost_minor_planet.sanitize_ip = sanitize_ip;
    function unreg_path(ip) {
        return `players/ip/${ip}.json`;
    }
    lost_minor_planet.unreg_path = unreg_path;
    function reg_path(username) {
        return `players/${username}.json`;
    }
    lost_minor_planet.reg_path = reg_path;
    function new_ply() {
        lost_minor_planet.file.players++;
        write_lost_minor_planet();
        let ply = {
            id: lost_minor_planet.file.players,
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
    lost_minor_planet.new_ply = new_ply;
    function get_ply(ip) {
        ip = sanitize_ip(ip);
        let ply;
        /*
        the following resolves ply, every http request (whether its a stylesheet or a page)
        */
        if (lost_minor_planet.logins[ip]) {
            const username = lost_minor_planet.logins[ip];
            if (lost_minor_planet.regs[username]) {
                ply = lost_minor_planet.regs[username];
            }
            else {
                console.log('we dont have this ply in a session yet');
                if (object_exists(reg_path(username))) {
                    ply = object_from_file(reg_path(username));
                    lost_minor_planet.regs[username] = ply;
                }
                else {
                    // invalid logins.json entry pointing to a deleted user
                    // todo this is way too much error-handling
                    delete lost_minor_planet.logins[username];
                    ply = new_ply();
                    write_ply(ply);
                    lost_minor_planet.regs[username] = ply;
                    console.warn('user in users doesnt exist');
                }
            }
        }
        else if (lost_minor_planet.unregs[ip]) {
            ply = lost_minor_planet.unregs[ip];
        }
        else {
            if (object_exists(unreg_path(ip))) {
                ply = object_from_file(unreg_path(ip));
                lost_minor_planet.unregs[ip] = ply;
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
    lost_minor_planet.get_ply = get_ply;
})(lost_minor_planet || (lost_minor_planet = {}));
exports.default = lost_minor_planet;
