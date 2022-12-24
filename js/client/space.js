var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//import { rename } from "fs";
import app from "./app";
import outer_space from "./outer space";
import pts from "../shared/pts";
var space;
(function (space) {
    function sample(a) {
        return a[Math.floor(Math.random() * a.length)];
    }
    space.sample = sample;
    function clamp(val, min, max) {
        return val > max ? max : val < min ? min : val;
    }
    space.clamp = clamp;
    function get_location_by_name(name) {
        for (let location of space.locations)
            if (location.name == name)
                return location;
        console.warn(`location ${space.location} doesnt exist`);
    }
    function get_region_by_name(name) {
        for (let region of space.regions)
            if (region.name == name)
                return region;
    }
    function make_request(method, url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                }
                else {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
    }
    space.make_request = make_request;
    // Example:
    function deleteAllCookies() {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
    function tick() {
        outer_space.tick();
    }
    space.tick = tick;
    function init() {
        return __awaiter(this, void 0, void 0, function* () {
            outer_space.init();
            app.mouse();
            let menuButton = document.getElementById("menu_button");
            menuButton.onclick = function () {
                show_account_bubbles();
            };
            //new aabb2([0,0],[0,0]);
            if (document.cookie) {
                document.cookie = 'a';
                console.log('our cookie is ', document.cookie);
            }
            else {
                console.log('logged_in');
            }
            yield ask_initial();
            outer_space.statics();
        });
    }
    space.init = init;
    function handle_sply() {
        console.log('handle-sply', space.sply);
        let logo = document.querySelector(".logo .text");
        space.region = get_region_by_name(space.sply.sector);
        //if (sply.unregistered)
        //	logo.innerHTML = `space`
        //else
        //	logo.innerHTML = `space - ${sply.username}`
    }
    space.handle_sply = handle_sply;
    var showingAccountBubbles = false;
    function show_account_bubbles() {
        showingAccountBubbles = true;
        let textHead = document.getElementById("mainDiv");
        let username = space.sply && space.sply.username;
        let text = '';
        text += username_header();
        text += addReturnOption();
        text += `
		<span class="spanButton" onclick="space.showLogin()">login</span>,
		<span class="spanButton" onclick="space.logout()">logout</span>,
		or
		<span class="spanButton" onclick="space.show_register()">register</span>

		`;
        textHead.innerHTML = text;
    }
    function ask_initial() {
        return __awaiter(this, void 0, void 0, function* () {
            const one = yield make_request('GET', 'regions.json');
            const two = yield make_request('GET', 'locations.json');
            const three = yield make_request('GET', 'ply');
            space.regions = JSON.parse(one);
            space.locations = JSON.parse(two);
            receive_stuple(three);
            console.log('asked initials');
        });
    }
    function chooseLayout() {
        if (space.sply.flight) {
            layoutFlight();
        }
        else if (space.sply.sublocation == 'Refuel') {
            layoutRefuel();
        }
        else if (space.sply.scanning) {
            layoutScanning();
        }
        else if (space.location) {
            if (space.location.type == 'Station') {
                layoutStation();
            }
            else if (space.location.type == 'Junk') {
                layoutJunk();
            }
            else if (space.location.type == 'Contested') {
            }
            layoutContested();
        }
        else {
            layout_default();
        }
    }
    space.chooseLayout = chooseLayout;
    function receive_stuple(res) {
        if (res.length == 0) {
            console.warn('expected a stuple but received nothing');
            return;
        }
        let stuple = JSON.parse(res);
        const type = stuple[0];
        const payload = stuple[1];
        console.log('received stuple type', type);
        if (type == 'sply') {
            console.log('sply!');
            space.sply = payload;
            space.region = get_region_by_name(space.sply.sector);
            space.location = get_location_by_name(space.sply.location);
            handle_sply();
            chooseLayout();
        }
        else if (type == 'message') {
            layoutMessage(payload);
        }
        else if (type == 'senemies') {
            space.senemies = payload;
        }
    }
    function BuildLargeTile(tile) {
        console.log('build large tile from', tile);
        let gameBox = document.createElement('div');
        gameBox.classList.toggle('gameBox');
    }
    function username_header() {
        let text = '';
        text += `
		<p class="smallish reminder">`;
        if (space.sply)
            console.log('sply is', space.sply);
        if (space.sply.unreg)
            text += `
			Playing unregistered (by ip)
			<span class="material-icons" style="font-size: 18px">
			no_accounts
			</span>`;
        else
            text += `
			Logged in as ${space.sply.username} <!-- #${space.sply.id} -->
			<span class="material-icons" style="font-size: 18px">
			how_to_reg
			</span>
			`;
        text += `<p>`;
        return text;
    }
    function addFlightOption() {
        let textHead = document.getElementById("mainDiv");
        let text = '';
        text += `
		<p>
		<br />
		<span class="spanButton" onclick="space.layoutFlightControls()">Flight Menu</span>
		`;
        return text;
    }
    function addReturnOption() {
        let text = '';
        text += `
		<p>
		<span class="spanButton" onclick="space.chooseLayout()"><</span>
		<p>
		`;
        return text;
    }
    var activeTab = 'action';
    function addTabs() {
        let text = '';
        text += `
		<p>
		<div class="tabbar">
		<span class="tabbutton" onclick="space.chooseTabOne()">action</span>
		<span class="tabbutton" onclick="space.chooseTabOne()">ship</span>
		</div>
		<div class="tabcontent">
		<p>
		`;
        return text;
    }
    function endTabs() {
        return "</div>";
    }
    function addLocationMeter() {
        let text = '';
        let position = `<span class="positionArray">
		<span>${space.sply.position[0].toFixed(1)}</span>,
		<span>${space.sply.position[1].toFixed(1)}</span>
		</span>`;
        text += `
		<div class="positionMeter">position: ${position} km in ${space.sply.location}</div>
		<p>
		<br />
		`;
        return text;
    }
    function makeWhereabouts() {
        for (let region of space.regions) {
            let dist = pts.dist([1, 0], region.center);
            if (dist < region.radius) {
                console.log(`were in region ${region.name} dist ${dist}`);
            }
        }
        let text = '';
        text += `
		<div id="whereabouts">
		
		<span class="sector">belt</span> ~>
		<br />
		
		<span class="location" style="colors: inherit} ">
		&nbsp;boop
		<!--(crash)--></span>
		</div>
		`;
        return text;
    }
    function layout_default() {
        let textHead = document.getElementById("mainDiv");
        let text = username_header();
        text += makeWhereabouts();
        text += addFlightOption();
        textHead.innerHTML = text;
    }
    function layoutStation() {
        let textHead = document.getElementById("mainDiv");
        let text = username_header();
        //text += drawSpaceship();
        text += makeWhereabouts();
        text += `<p>`;
        text += `<span class="facilities">`;
        if (space.location.facilities) {
            if (space.location.facilities.indexOf("Refuel") > -1)
                text += 'You can <span class="spanButton" onclick="space.transportSublocation(`refuel`)">refuel</span> here.';
        }
        text += `</span>`;
        textHead.innerHTML = text;
        addFlightOption();
        //layoutFlightControls();
    }
    function layoutJunk() {
        let textHead = document.getElementById("mainDiv");
        let text = username_header();
        text += makeWhereabouts();
        text += `<p>`;
        text += `
		It's a junk field.
		You can <span class="spanButton" onclick="space.scanJunk()">scan</span> the debris.
		`;
        textHead.innerHTML = text;
        addFlightOption();
        //layoutFlightControls();
    }
    function layoutContested() {
        let textHead = document.getElementById("mainDiv");
        let text = username_header();
        text += makeWhereabouts();
        text += addLocationMeter();
        text += `<p>`;
        text += `
		This regional blob of space is unmonitored by law.
		<p>
		You can <span class="spanButton" onclick="space.seeEnemies()">see nearby enemies.</span>
		`;
        textHead.innerHTML = text;
        addFlightOption();
        //layoutFlightControls();
    }
    function layoutEnemies() {
        let textHead = document.getElementById("mainDiv");
        let text = '';
        text += username_header();
        text += addReturnOption();
        text += addLocationMeter();
        /*let t;
        t = setInterval(() => {
            makeRequest('GET', 'ply')
            .then(function (res: any) {
                //receiveStuple(res);
                console.log('got');
                
            })
        }, 2000);*/
        //text += makeWhereabouts();
        text += `<p>`;
        text += `
		These are pirates and exiles that you can engage.
		<p>
		<div class="enemies">
		<table>
		<thead>
		<tr>
		<td></td>
		<td>type</td>
		<!--<td>hp</td>
		<!--<td>dmg</td>-->
		<td>pos</td>
		<td>dist</td>
		</tr>
		</thead>
		<tbody id="list">
		`;
        for (let enemy of space.senemies) {
            let position = [
                enemy.position[0].toFixed(1),
                enemy.position[1].toFixed(1)
            ];
            text += `
			<tr>
			<td class="sel">&nbsp;</td>
			<td>${enemy.name}</td>
			<!--<td>%${enemy.health}</td>
			<td>${enemy.damage}</td>-->
			<td>${position[0]}, ${position[1]}</td>
			<td>${pts.dist(space.sply.position, enemy.position).toFixed(1)} km</td>
			</tr>
			`;
            //
        }
        text += `
		</tbody>
		</table>
		</div>
		`;
        textHead.innerHTML = text;
        let list = document.getElementById("list");
        console.log(list.childElementCount);
        let active;
        for (let i = 0; i < list.children.length; i++) {
            let child = list.children[i];
            child.onclick = function () {
                let dom = this;
                console.log('woo', this);
                if (active != this) {
                    if (active) {
                        active.classList.remove('selected');
                    }
                    dom.classList.add('selected');
                    active = this;
                }
            };
            console.log(child);
        }
        //addFlightOption();
        //layoutFlightControls();
    }
    function layoutRefuel() {
        let textHead = document.getElementById("mainDiv");
        let text = username_header();
        text += 'You are at a refuelling bay.';
        text += ' <span class="spanButton" onclick="space.returnSublocation()">Back to Station</span>';
        textHead.innerHTML = text;
        //layoutFlightControls();
    }
    function layoutScanning() {
        let textHead = document.getElementById("mainDiv");
        let text = username_header();
        text += `You\'re scanning the junk at ${space.location.name || ''}.`;
        if (!space.sply.scanCompleted)
            text += ' <span class="spanButton" onclick="space.stopScanning()">Cancel?</span>';
        console.log(space.sply);
        //if (!sply.scanCompleted) {
        function updateBar() {
            let now = Date.now();
            if (now > space.sply.scanEnd)
                now = space.sply.scanEnd;
            const duration = space.sply.scanEnd - space.sply.scanStart;
            const time = now - space.sply.scanStart;
            const width = time / duration;
            const minutesPast = Math.floor(time / 1000 / 60).toFixed(0);
            const minutesRemain = Math.round(duration / 1000 / 60).toFixed(0);
            const over = space.sply.scanEnd - Date.now();
            let bar = document.getElementById("barProgress");
            let text = document.getElementById("barText");
            if (!bar || !text)
                return;
            bar.style.width = `${(width * 100).toFixed(0)}%`;
            if (over > 0)
                text.innerHTML = `${minutesPast} / ${minutesRemain} minutes`;
            else
                text.innerHTML = '<span onclick="space.completeScan()">Ok</span>';
        }
        text += `
		<div class="bar">
		<div id="barProgress"></div>
		<span id="barText"></span>
		</div>`;
        //if (sply.scanCompleted)
        //	text += '<p><br /><span class="spanButton" onclick="space.completeScan()">See scan results</span>';
        textHead.innerHTML = text;
        updateBar();
        const t = setInterval(function () {
            if (space.sply.scanning) {
                const time = space.sply.scanEnd - Date.now();
                if (time <= 0) {
                    clearInterval(t);
                    console.log('clear the interval');
                }
                updateBar();
            }
            else {
                clearInterval(t);
            }
        }, 1000);
        //layoutFlightControls();
    }
    function layoutMessage(message) {
        let textHead = document.getElementById("mainDiv");
        let text = `<span class="message">${message}</span>`;
        textHead.innerHTML += text;
    }
    function returnButton() {
        return '<p><span class="spanButton" onclick="space.chooseLayout()">Return</span><p>';
    }
    function layoutFlight() {
        let textHead = document.getElementById("mainDiv");
        let text = username_header();
        //text += addTabs();
        const loc = get_location_by_name(space.sply.flightLocation);
        text += `You\'re flying towards <span style="colors: ${loc.color || "inherit"} ">${loc.name}
		(${loc.type})</span>.`;
        /*text += `
        <div class="bar">
        <div id="barProgress"></div>
        <span id="barText">x</span>
        </div>`*/
        text += '';
        text += ' Attempt to <span class="spanButton" onclick="space.tryDock()">arrive / dock</span>';
        textHead.innerHTML = text;
        addFlightOption();
        //text += endTabs();
        //layoutFlightControls();
    }
    function layoutFlightControls() {
        let textHead = document.getElementById("mainDiv");
        console.log('wot up');
        let text = username_header();
        text += addReturnOption();
        if (space.region) {
            text += `
		Flight menu
		<p>
		${space.region.name} ~>
		<select name="flights" id="flights" >`;
            for (let location of space.region.locations) {
                text += `<option>${location}</option>`;
            }
            text += `<option>Non-existing option</option>`;
            text += `</select>
		<span class="spanButton" onclick="space.submitFlight()">Flight</span>
		</form>`;
        }
        textHead.innerHTML = text;
    }
    space.layoutFlightControls = layoutFlightControls;
    function showLogin() {
        let textHead = document.getElementById("mainDiv");
        let text = `
		<form action="login" method="post">
		<label for="username">Username</label><br />
		<input id="username" type="text" placeholder="" name="username" required><br /><br />
		
		<label for="psw">Password</label><br />
		<input id="password" type="password" placeholder="" name="psw" required><br /><br />
		
		<button type="button" onclick="space.xhrLogin()">Login</button>
		
		</form>
		<p>
		<span class="smallish">You will remain logged in until you logout.</span>
		`;
        textHead.innerHTML = text;
    }
    space.showLogin = showLogin;
    function show_register() {
        let textHead = document.getElementById("mainDiv");
        let text = `
		<form action="register" method="post">

		<label for="username">Username</label><br />
		<input class="wrong" type="text" name="username" id="username" minlength="4" maxlength="15"  required pattern="[a-zA-Z0-9]+">
		<br /><br />
	
		<label for="password">Password</label><br />
		<input class="wrong" type="password" autocomplete="new-password" name="password" id="password" minlength="4" maxlength="20" required>
		<br /><br />
	
		<label for="password-repeat">Repeat Password</label><br />
		<input class="wrong" type="password" autocomplete="new-password" name="password-repeat" id="password-repeat" maxlength="20" minlength="4" required>
		<br /><br />
		
		<label for="keep-ship" title="Start fresh or keep your play-via-ip, unregistered ship">
		<input type="checkbox" checked="checked" name="remember" id="keep-ship"> Keep current progress
		</label>
		<p>
		you can link your mail later
		<br />
		<br />

		<button type="button" onclick="space.xhr_register()">Register</button>
		
		</form>`;
        textHead.innerHTML = text;
    }
    space.show_register = show_register;
    function submitFlight() {
        var e = document.getElementById("flights");
        var strUser = e.options[e.selectedIndex].text;
        console.log(strUser);
        make_request('GET', 'submitFlight=' + strUser)
            .then(function (res) {
            console.log('submitted flight');
            receive_stuple(res);
        });
    }
    space.submitFlight = submitFlight;
    function scanJunk() {
        make_request('GET', 'scan')
            .then(function (res) {
            receive_stuple(res);
        });
    }
    space.scanJunk = scanJunk;
    function completeScan() {
        make_request('GET', 'completeScan')
            .then(function (res) {
            receive_stuple(res);
        });
    }
    space.completeScan = completeScan;
    function stopScanning() {
        make_request('GET', 'stopScanning')
            .then(function (res) {
            receive_stuple(res);
        });
    }
    space.stopScanning = stopScanning;
    function seeEnemies() {
        make_request('GET', 'seeEnemies')
            .then(function (res) {
            receive_stuple(res);
            layoutEnemies();
        });
    }
    space.seeEnemies = seeEnemies;
    function tryDock() {
        make_request('GET', 'dock')
            .then(function (res) {
            console.log('asking server if we can dock');
            receive_stuple(res);
        });
    }
    space.tryDock = tryDock;
    function returnSublocation() {
        make_request('GET', 'returnSublocation')
            .then(function (res) {
            console.log('returned from sublocation');
            receive_stuple(res);
        });
    }
    space.returnSublocation = returnSublocation;
    function transportSublocation(facility) {
        make_request('GET', 'knock&sublocation=refuel')
            .then(function (res) {
            console.log('returned from sublocation');
            receive_stuple(res);
        });
    }
    space.transportSublocation = transportSublocation;
    function logout() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield make_request('GET', 'logout');
            alert(res);
            space.sply.unreg = true;
            handle_sply();
        });
    }
    space.logout = logout;
    function xhrLogin() {
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        var http = new XMLHttpRequest();
        var url = 'login';
        var params = `username=${username}&password=${password}`;
        http.open('POST', url, true);
        //Send the proper header information along with the request
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == 200) {
                alert(http.responseText);
                make_request('GET', 'ply')
                    .then(function (res) {
                    receive_stuple(res);
                    //return makeRequest('GET', 'where');
                });
                //.then(function (res: any) {
                //	receiveStuple(res);
                //});
            }
            else if (http.readyState == 4 && http.status == 400) {
                alert(http.responseText);
            }
        };
        http.send(params);
    }
    space.xhrLogin = xhrLogin;
    function xhr_register() {
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        let password_repeat = document.getElementById("password-repeat").value;
        let keep_ship = document.getElementById("keep-ship").checked;
        console.log(keep_ship);
        var http = new XMLHttpRequest();
        const url = 'register';
        var params = `username=${username}&password=${password}&password-repeat=${password_repeat}&keep-ship=${keep_ship}`;
        http.open('POST', url, true);
        //Send the proper header information along with the request
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == 200) {
                alert(http.responseText);
                showLogin();
            }
            else if (http.readyState == 4 && http.status == 400) {
                alert(http.responseText);
            }
        };
        http.send(params);
    }
    space.xhr_register = xhr_register;
})(space || (space = {}));
function cls() {
}
export default space;
window.space = space;
