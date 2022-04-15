"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPly = exports.plyTempl = exports.plyPath = exports.unregisteredPath = exports.sanitizeIp = exports.writePly = exports.writeMcf = void 0;
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
var locations;
var ips_logged_in;
var players;
function writeMcf() {
    main_computer_file.writes++;
    fs.writeFileSync('mcf.json', JSON.stringify(main_computer_file, null, 4));
}
exports.writeMcf = writeMcf;
function writePly(ply) {
    console.log('writing ply ', ply.id);
    let payload = JSON.stringify(ply, null, 4);
    if (ply.unregistered)
        fs.writeFileSync(unregisteredPath(ply.ip), payload);
    else
        fs.writeFileSync('players/' + ply.id + '.json', payload);
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
var ipPlys = {};
function plyTempl() {
    main_computer_file.players++;
    writeMcf();
    return {
        id: main_computer_file.players,
        ip: 'N/A',
        name: 'Captain',
        password: 'N/A',
        speed: 1,
        unregistered: false,
        flight: false,
        flightLocation: '',
        position: [0, 0],
        sector: 'Great Suldani Belt',
        location: 'Dartwing',
        sublocation: 'None',
    };
}
exports.plyTempl = plyTempl;
function getPly(ip) {
    let cleanIp = sanitizeIp(ip);
    let ply;
    if (ipPlys[cleanIp]) {
        ply = ipPlys[cleanIp];
        console.log('got ply safely from table');
    }
    else {
        if (fs.existsSync(unregisteredPath(cleanIp)))
            ply = ipPlys[cleanIp] = JSON.parse(fs.readFileSync(unregisteredPath(cleanIp), 'utf8'));
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
    main_computer_file = JSON.parse(fs.readFileSync('mcf.json', 'utf8'));
    sectors = JSON.parse(fs.readFileSync('sectors.json', 'utf8'));
    locations = JSON.parse(fs.readFileSync('locations.json', 'utf8'));
    //ips_logged_in = <any>JSON.parse(fs.readFileSync('ips_logged_in.json', 'utf8'));
    //apiCall('https://api.steampowered.com/ISteamApps/GetAppList/v2');
    http.createServer(function (req, res) {
        // console.log('request from ', req.socket.remoteAddress, req.socket.remotePort);
        let ply = getPly(req.socket.remoteAddress);
        const sendSwhere = function () {
            if (ply.flight) {
                sendStuple([['flight'], {
                        position: ply.position
                    }]);
            }
            else {
                sendStuple([['swhere'], {
                        swhere: {
                            sectorName: ply.sector,
                            locationName: ply.location,
                            sublocation: ply.sublocation
                        }
                    }]);
            }
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
                sendSwhere();
            }
            //let arg = input.split(' ');
        }
        if (req.url == '/login' && req.method == 'POST') {
            console.log('received post login');
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
                    console.log('this file exists');
                    ply = JSON.parse(fs.readFileSync(path, 'utf8'));
                    if (ply.password == password) {
                        res.writeHead(200);
                        res.end('success');
                    }
                    else {
                        res.writeHead(400);
                        res.end('wrong pw');
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
                var letterNumber = /^[0-9a-zA-Z]+$/;
                if (!parsed['username'].match(letterNumber)) {
                    res.writeHead(400);
                    res.end('username not alpha numeric');
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
                        ply.name = parsed['username'];
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
        if (false)
            0;
        else if (req.url == '/') {
            let page = fs.readFileSync('page.html');
            res.writeHead(200, { CONTENT_TYPE: TEXT_HTML });
            sendGeneric(page);
        }
        else if (req.url == '/style.css') {
            let client = fs.readFileSync('style.css');
            res.writeHead(200, { CONTENT_TYPE: "text/css" });
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
            sendObject(locations);
        }
        else if (req.url == '/getwhere') {
            console.log('got getwhere');
            sendSwhere();
        }
        else if (req.url.search('/submitFlight') == 0) {
            console.log('received flight');
            let val;
            val = req.url.split('=')[1];
            val = val.replace(/%20/g, " ");
            console.log(val);
            sendSwhere();
        }
        else if (req.url == '/returnSublocation') {
            //console.log('return from sublocation');
            ply.sublocation = 'None';
            writePly(ply);
            sendSwhere();
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
