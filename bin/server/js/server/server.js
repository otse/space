"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tick = void 0;
const locations_1 = require("./locations");
const stellar_objects_1 = require("./stellar objects");
const lod_1 = require("./lod");
const lost_minor_planet_1 = require("./lost minor planet");
const session_1 = require("./session");
var http = require('http');
var https = require('https');
const fs = require('fs');
const path = require('path');
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
/*export function get_region_by_name(name) {
    for (let region of regions)
        if (regions.name == name)
            return region;
}*/
function tick() {
    lod_1.default.chunk.tick();
}
exports.tick = tick;
function init() {
    setInterval(tick, lod_1.default.tick_rate * 1000);
    new lod_1.default.universe;
    for (let i = 0; i < 5; i++) {
        let rock = new stellar_objects_1.default.tp_rock;
        //rock.type = 'rock';
        rock.pos = [Math.random() * 20 - 10, Math.random() * 20 - 10];
        lod_1.default.add(rock);
    }
    locations_1.locations.init();
    stellar_objects_1.default.init();
    lost_minor_planet_1.default.init();
    /*for (let username of lmp.users) {
        let ply = lmp.get_user_from_table_or_fetch(username, false);
        //make_ship(ply);
    }*/
    //createLocationPersistence();
    //apiCall('https://api.steampowered.com/ISteamApps/GetAppList/v2');
    http.createServer(function (req, res) {
        // console.log('request from ', req.socket.remoteAddress, req.socket.remotePort);
        //console.log(req.url);
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
        else if (req.url == '/styles.css') {
            let style = fs.readFileSync('styles.css');
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
            let str = JSON.stringify(lost_minor_planet_1.default.regions);
            res.end(str);
            return;
        }
        else if (req.url == '/locations.json') {
            res.writeHead(200, { CONTENT_TYPE: APPLICATION_JSON });
            let str = JSON.stringify(locations_1.locations.file);
            res.end(str);
            return;
        }
        const ip = req.socket.remoteAddress;
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
                if (lost_minor_planet_1.default.table[username] || lost_minor_planet_1.default.object_exists(lost_minor_planet_1.default.user_path(username))) {
                    let ply = lost_minor_planet_1.default.get_user_from_table_or_fetch(username);
                    let logged_in_elsewhere = false;
                    let ip2;
                    for (ip2 in lost_minor_planet_1.default.logins) {
                        let username2 = lost_minor_planet_1.default.logins[ip2];
                        if (username == username2 && ip != ip2) {
                            logged_in_elsewhere = true;
                            break;
                        }
                    }
                    if (lost_minor_planet_1.default.logins[ip] == username) {
                        res.writeHead(400);
                        res.end(`You're already logged in with this user`);
                    }
                    else if (ply.password == password) {
                        res.writeHead(200);
                        let msg = `Logged into ${username}`;
                        if (logged_in_elsewhere) {
                            msg += '. You\'ve been logged out of your other device';
                            delete lost_minor_planet_1.default.logins[ip2];
                        }
                        lost_minor_planet_1.default.delete_user(ip, true);
                        lost_minor_planet_1.default.logins[ip] = ply.username;
                        lost_minor_planet_1.default.out_logins();
                        res.end(msg);
                    }
                    else if (ply.password != password) {
                        res.writeHead(400);
                        res.end('Wrong pw');
                    }
                    else {
                        res.writeHead(400);
                        res.end('Generic error');
                    }
                }
                else {
                    res.writeHead(400);
                    res.end('User not found');
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
                const username = parsed.username;
                const password = parsed.password;
                const doesItHaveLetter = /[a-zA-Z]/.test(parsed['username']);
                var letterNumber = /^[0-9a-zA-Z]+$/;
                if (lost_minor_planet_1.default.has_user(username)) {
                    res.writeHead(400);
                    res.end(`Username taken`);
                }
                else if (!username.match(letterNumber)) {
                    res.writeHead(400);
                    res.end('Username not alpha numeric');
                }
                else if (!doesItHaveLetter) {
                    res.writeHead(400);
                    res.end('Need at least one letter');
                }
                else if (username.length < 4) {
                    res.writeHead(400);
                    res.end('Username length must be 4 - 20');
                }
                else if (password.length < 4 || password.length > 20) {
                    res.writeHead(400);
                    res.end('Password length 4 - 20');
                }
                else if (password != parsed['password-repeat']) {
                    res.writeHead(400);
                    res.end('Your passwords aren\'t the same');
                }
                else {
                    let ply = lost_minor_planet_1.default.new_user();
                    ply.guest = false;
                    ply.ip = 'N/A';
                    ply.username = username;
                    ply.password = password;
                    lost_minor_planet_1.default.delete_user(ip, true);
                    lost_minor_planet_1.default.users.push(username);
                    lost_minor_planet_1.default.out_users();
                    lost_minor_planet_1.default.table[username] = ply;
                    res.writeHead(200);
                    res.end(`Congratulations, you've registered as ${username}. Now login`);
                    lost_minor_planet_1.default.out_user(ply);
                }
            });
            return;
        }
        /*else if (req.url == '/where') {
            console.log('got where');

            sendSwhere();
        }*/
        let ply = lost_minor_planet_1.default.get_user_from_ip(req.socket.remoteAddress);
        let session;
        if (ply) {
            session = new session_1.default;
            session.ply = ply;
            session.observer = new lod_1.default.observer(lod_1.default.guniverse, 2);
            session.observer.big = lod_1.default.universe.big(ply.pos);
            lod_1.default.guniverse.update_observer(session.observer, ply.pos);
        }
        const send_sply = function (ply) {
            let reduced = {
                id: ply.id,
                ip: ip,
                guest: ply.guest,
                username: ply.username,
                pos: ply.pos,
                goto: ply.goto
            };
            send_object(['sply', reduced]);
        };
        const send_smessage = function (message) {
            send_object(['message', message]);
        };
        const send_object = function (anything) {
            let str = JSON.stringify(anything);
            res.end(str);
        };
        if (req.url == '/ply') {
            if (ply)
                send_sply(ply);
            else
                send_object(['sply', false]);
            return;
        }
        else if (req.url == '/guest') {
            if (!lost_minor_planet_1.default.logins[ip]) {
                let guest = lost_minor_planet_1.default.make_quest(ip);
                res.end('true');
            }
            else
                res.end('false');
            return;
        }
        else if (req.url == '/purge') {
            let res = lost_minor_planet_1.default.delete_user(ip, true);
            send_object(res || false);
            return;
        }
        else if (req.url == '/astronomical%20objects') {
            if (session) {
                let objects = session.observer.gather();
                send_object(['astronomical objects', objects]);
            }
            else {
                res.end('0');
            }
            return;
        }
        else if (req.url == '/logout') {
            console.log('going to log you out');
            if (lost_minor_planet_1.default.logins[ip]) {
                const username = lost_minor_planet_1.default.logins[ip];
                const ply = lost_minor_planet_1.default.table[username];
                if (ply) {
                    if (ply.guest) {
                        send_object([false, `can't logout guest user`]);
                    }
                    else {
                        delete lost_minor_planet_1.default.logins[ip];
                        lost_minor_planet_1.default.out_logins();
                        send_object([true, `logging out ${username}`]);
                    }
                }
            }
            else {
                send_object([false, `you don't appear to be logged in`]);
            }
            return;
        }
        else {
            res.end('unhandled resource');
        }
    }).listen(port);
}
init();
