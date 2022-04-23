"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPly = exports.serverTick = exports.getSector = exports.plyTempl = exports.plyPath = exports.unregisteredPath = exports.sanitizeIp = exports.writePly = exports.write_ips_logged_in = exports.writeMcf = void 0;
const locations_1 = require("./locations");
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
const logo = `
S(t)ream
`;
const header = `
<wut>
`;
function exitHandler(options, exitCode) {
    console.log('exitHandler');
    if (options.cleanup)
        console.log('clean');
    if (exitCode || exitCode === 0)
        console.log(exitCode);
    if (options.exit)
        process.exit();
}
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
const indent = ``;
var main_computer_file;
var sectors;
var remembrance_table = {};
var logins_by_ip = {};
var all_plys;
function writeMcf() {
    main_computer_file.writes++;
    const payload = JSON.stringify(main_computer_file, null, 4);
    fs.writeFileSync('mcf.json', payload);
}
exports.writeMcf = writeMcf;
function write_ips_logged_in() {
    const payload = JSON.stringify(logins_by_ip, null, 4);
    fs.writeFileSync('ips_logged_in.json', payload);
}
exports.write_ips_logged_in = write_ips_logged_in;
function writePly(ply) {
    console.log('writing ply ', ply.id);
    let payload = JSON.stringify(ply, null, 4);
    if (ply.unregistered)
        fs.writeFileSync(unregisteredPath(ply.ip), payload);
    else {
        const path = `players/${ply.username}.json`;
        fs.writeFileSync(path, payload);
    }
}
exports.writePly = writePly;
function sanitizeIp(ip) {
    ip = ip.replace('::', '');
    ip = ip.replace(':', '');
    return ip;
}
exports.sanitizeIp = sanitizeIp;
function unregisteredPath(ip) {
    return `players/ip/${ip}.json`;
}
exports.unregisteredPath = unregisteredPath;
function plyPath(username) {
    return `players/${username}.json`;
}
exports.plyPath = plyPath;
var unregisteredPlys = {};
function plyTempl() {
    main_computer_file.players++;
    writeMcf();
    let ply = {
        id: main_computer_file.players,
        ip: 'N/A',
        username: 'Captain',
        password: 'N/A',
        speed: 1,
        health: 100,
        unregistered: false,
        flight: false,
        flightLocation: '',
        scanning: false,
        position: [0, 0],
        sector: 'Great Suldani Belt',
        location: 'Dartwing',
        sublocation: 'None'
    };
    return ply;
}
exports.plyTempl = plyTempl;
function getSector(name) {
    for (let sector of sectors)
        if (sectors.name == name)
            return sector;
    return false;
}
exports.getSector = getSector;
function serverTick() {
    //for ()
}
exports.serverTick = serverTick;
function getPly(ip) {
    let cleanIp = sanitizeIp(ip);
    let ply;
    if (logins_by_ip[`${cleanIp}`]) {
        //console.log('this ip is remembered to be logged in');
        const username = logins_by_ip[`${cleanIp}`];
        if (remembrance_table[username]) {
            //console.log('we have remembrance this server session');
            ply = remembrance_table[username];
        }
        else {
            console.log('we dont have a remembrance this server session');
            const path = `players/${username}.json`;
            ply = JSON.parse(fs.readFileSync(path, 'utf8'));
            remembrance_table[username] = ply;
        }
    }
    else if (unregisteredPlys[`${cleanIp}`]) {
        ply = unregisteredPlys[`${cleanIp}`];
        //console.log('got ply safely from unregistered table');
    }
    else {
        if (fs.existsSync(unregisteredPath(cleanIp)))
            ply = unregisteredPlys[`${cleanIp}`] = JSON.parse(fs.readFileSync(unregisteredPath(cleanIp), 'utf8'));
        else {
            ply = plyTempl();
            ply.unregistered = true;
            ply.ip = cleanIp;
            fs.writeFileSync(unregisteredPath(cleanIp), JSON.stringify(ply, null, 4));
        }
    }
    return ply;
}
exports.getPly = getPly;
function init() {
    setInterval(serverTick, 1000);
    main_computer_file = JSON.parse(fs.readFileSync('mcf.json', 'utf8'));
    locations_1.locations.init();
    sectors = JSON.parse(fs.readFileSync('sectors.json', 'utf8'));
    logins_by_ip = JSON.parse(fs.readFileSync('ips_logged_in.json', 'utf8'));
    //createLocationPersistence();
    //apiCall('https://api.steampowered.com/ISteamApps/GetAppList/v2');
    http.createServer(function (req, res) {
        // console.log('request from ', req.socket.remoteAddress, req.socket.remotePort);
        const ip = sanitizeIp(req.socket.remoteAddress);
        let ply = getPly(req.socket.remoteAddress);
        const sendSply = function () {
            let object = {
                id: ply.id,
                username: ply.username,
                unregistered: ply.unregistered,
                sector: ply.sector,
                location: ply.location,
                sublocation: ply.sublocation,
                position: ply.position,
                flight: ply.flight,
                flightLocation: ply.flightLocation,
            };
            if (ply.scanning) {
                console.log('were scanning');
                object.scanning = true;
                object.scanStart = ply.scanStart || 0;
                object.scanEnd = ply.scanEnd || 0;
                object.scanCompleted = ply.scanCompleted;
            }
            if (ply.engaging) {
                object.engaging = true;
            }
            sendStuple([['sply'], object]);
        };
        const sendSmessage = function (message) {
            sendStuple([['message'], message]);
        };
        const transportSublocation = function (where) {
            if (where == 'Refuel')
                console.log('requesting refuel sublocation');
        };
        const sendGeneric = function (str) {
            res.write(str);
            res.end();
        };
        const sendObject = function (anything) {
            let str = JSON.stringify(anything);
            sendGeneric(str);
        };
        const sendStuple = function (anything) {
            let str = JSON.stringify(anything);
            sendGeneric(str);
        };
        function receivedKnock(inputs) {
            //console.log('Knock ', inputs);
            const sublocation = inputs.sublocation;
            if (sublocation == 'refuel') {
                ply.sublocation = 'Refuel';
                writePly(ply);
                sendSply();
            }
            //let arg = input.split(' ');
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
                const path = `players/${username}.json`;
                if (fs.existsSync(path)) {
                    ply = JSON.parse(fs.readFileSync(path, 'utf8'));
                    remembrance_table[`${username}`] = ply;
                    let logged_in_elsewhere = false;
                    let ip2;
                    for (ip2 in logins_by_ip) {
                        let username2 = logins_by_ip[ip2];
                        if (username == username2 && ip != ip2) {
                            logged_in_elsewhere = true;
                            break;
                        }
                    }
                    if (logins_by_ip[`${ip}`] == username) {
                        res.writeHead(400);
                        res.end('already logged in here');
                    }
                    else if (ply.password == password) {
                        res.writeHead(200);
                        let msg = 'logging you in';
                        if (logged_in_elsewhere) {
                            msg += '. you\'ve been logged out of your other device';
                            delete logins_by_ip[ip2];
                        }
                        res.end(msg);
                        logins_by_ip[`${ip}`] = ply.username;
                        write_ips_logged_in();
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
                    const path = `players/${username}.json`;
                    if (fs.existsSync(path)) {
                        res.writeHead(400);
                        res.end(`a player already exists with username ${username}. try logging in`);
                    }
                    else {
                        let ply = plyTempl();
                        ply.unregistered = false;
                        ply.ip = 'N/A';
                        ply.username = parsed['username'];
                        ply.password = parsed['password'];
                        res.writeHead(200);
                        res.end(`you're registered as ${username}. now login`);
                        const payload = JSON.stringify(ply, null, 4);
                        fs.writeFileSync(`players/${username}.json`, payload);
                    }
                }
            });
            return;
        }
        else if (req.method !== 'GET') {
            res.end('boo');
            return;
        }
        if (ply.scanning) {
            const scanRemaining = ply.scanEnd - Date.now();
            if (scanRemaining < 0) {
                ply.scanCompleted = true;
            }
        }
        if (req.url == '/') {
            let page = fs.readFileSync('page.html');
            res.writeHead(200, { CONTENT_TYPE: TEXT_HTML });
            sendGeneric(page);
        }
        else if (req.url == '/style.css') {
            let style = fs.readFileSync('style.css');
            res.writeHead(200, { CONTENT_TYPE: "text/css" });
            sendGeneric(style);
        }
        else if (req.url == '/stars.png') {
            let client = fs.readFileSync('stars.');
            res.writeHead(200, { CONTENT_TYPE: "image/png" });
            sendGeneric(client);
        }
        else if (req.url == '/bundle.js') {
            let client = fs.readFileSync('bundle.js');
            res.writeHead(200, { CONTENT_TYPE: TEXT_JAVASCRIPT });
            sendGeneric(client);
        }
        else if (req.url == '/sectors.json') {
            res.writeHead(200, { CONTENT_TYPE: APPLICATION_JSON });
            sendObject(sectors);
        }
        else if (req.url == '/locations.json') {
            res.writeHead(200, { CONTENT_TYPE: APPLICATION_JSON });
            sendObject(locations_1.locations.file);
        }
        /*else if (req.url == '/where') {
            console.log('got where');

            sendSwhere();
        }*/
        else if (req.url == '/ply') {
            console.log('get ply');
            sendSply();
        }
        else if (req.url == '/logout') {
            console.log('going to log you out');
            if (logins_by_ip[`${ip}`]) {
                const username = logins_by_ip[`${ip}`];
                delete logins_by_ip[`${ip}`];
                write_ips_logged_in();
                res.end(`logging out ${username}`);
            }
            else {
                res.end(`not logged in, playing as unregistered`);
            }
        }
        else if (req.url == '/askTick') {
        }
        else if (req.url == '/engagePirate') {
            ply.engaging = true;
            sendSply();
        }
        else if (req.url == '/seeEnemies') {
            console.log('seeEnemies');
            const location = locations_1.locations.instance(ply.location);
            //ply.engaging = true;
            const cast = location;
            const enemies = cast.get_enemies();
            //locations.locations
            sendStuple([['senemies'], enemies]);
        }
        else if (req.url == '/scan') {
            const location = locations_1.locations.get(ply.location);
            if (location.type == 'Junk') {
                const durationMinutes = 2;
                ply.scanning = true;
                ply.scanCompleted = false;
                ply.scanStart = Date.now();
                ply.scanEnd = Date.now() + (1000 * 60 * durationMinutes);
                writePly(ply);
                sendSply();
            }
            else {
                sendSmessage("Can only scan junk.");
            }
        }
        else if (req.url == '/stopScanning') {
            const location = locations_1.locations.get(ply.location);
            ply.scanning = false;
            writePly(ply);
            sendSply();
        }
        else if (req.url == '/completeScan') {
            //const location = locations.get(ply.location);
            ply.scanning = false;
            writePly(ply);
            sendSply();
        }
        else if (req.url == '/dock') {
            if (ply.flight) {
                ply.flight = false;
                ply.location = ply.flightLocation;
                writePly(ply);
                sendSply();
            }
            //sendStuple([['message'], `Can\'t dock. Not nearby ${ply.flightLocation}.`]);
        }
        else if (req.url.search('/submitFlight') == 0) {
            console.log('received flight');
            let val;
            val = req.url.split('=')[1];
            val = val.replace(/%20/g, " ");
            console.log(val);
            if (!locations_1.locations.get(val)) {
                sendSmessage("Location doesn't exist");
            }
            else {
                ply.flight = true;
                ply.flightLocation = val;
                writePly(ply);
                sendSply();
            }
        }
        else if (req.url == '/returnSublocation') {
            //console.log('return from sublocation');
            ply.sublocation = 'None';
            writePly(ply);
            sendSply();
        }
        else if (-1 < req.url.indexOf('/app/')) {
            let appId = req.url.split('app/')[1];
            console.log('ask app/', appId);
            sendGeneric('woo app: ' + appId);
        }
        else if (-1 < req.url.indexOf('/getobject/')) {
            let appId = req.url.split('getobject/')[1];
            sendObject({ someObject: true });
        }
        else if (req.url == '/api/server/2/booking') {
        }
        else if (req.url.search("/knock") == 0) {
            res.writeHead(200, { CONTENT_TYPE: APPLICATION_JSON });
            const parsed = qs.parse(req.url);
            // msg&boo&shu '/knock': '', boo: '', shu: ''
            //console.log(parsed);
            receivedKnock(parsed);
        }
        else {
            res.end();
        }
    }).listen(port);
}
function loop() {
    //console.log('wo');
}
init();
setInterval(loop, 1000);
