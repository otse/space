import aabb2 from "./aabb2";
import pts from "./pts";
import ren from "./renderer";
var client;
(function (client) {
    // comment
    pts;
    aabb2;
    function getLocationByName(name) {
        for (let location of client.locations)
            if (location.name == name)
                return location;
        console.warn("location doesnt exist");
    }
    function getSectorByName(name) {
        for (let sector of client.sectors)
            if (sector.name == name)
                return sector;
        console.warn("sector doesnt exist");
    }
    function makeRequest(method, url) {
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
    }
    client.tick = tick;
    function init() {
        ren.init();
        let menu_button = document.getElementById("menu_button");
        menu_button.onclick = function () {
            showAccountBubbles();
        };
        //new aabb2([0,0],[0,0]);
        if (document.cookie) {
            document.cookie = 'a';
            console.log('our cookie is ', document.cookie);
        }
        else {
            console.log('logged_in');
        }
        getInitTrios();
    }
    client.init = init;
    function handleSply() {
        console.log('handlesply', client.sply);
        let logo = document.querySelector(".logo .text");
        client.sector = getSectorByName(client.sply.sector);
        //if (sply.unregistered)
        //	logo.innerHTML = `space`
        //else
        //	logo.innerHTML = `space - ${sply.username}`
    }
    client.handleSply = handleSply;
    var showingAccountBubbles = false;
    function showAccountBubbles() {
        showingAccountBubbles = true;
        let textHead = document.getElementById("mainDiv");
        let username = client.sply && client.sply.username;
        let text = '';
        text += addReturnOption();
        text += `
		<span class="spanButton" onclick="space.showLogin()">login</span>,
		<span class="spanButton" onclick="space.logout()">logout</span>,
		or
		<span class="spanButton" onclick="space.showRegister()">register</span>

		`;
        textHead.innerHTML = text;
    }
    function getInitTrios() {
        makeRequest('GET', 'sectors.json')
            .then(function (res) {
            console.log('got sectors');
            client.sectors = JSON.parse(res);
            return makeRequest('GET', 'locations.json');
        })
            .then(function (res) {
            console.log('got locations');
            client.locations = JSON.parse(res);
            return makeRequest('GET', 'ply');
        })
            .then(function (res) {
            receiveStuple(res);
            //return makeRequest('GET', 'where');
        });
        //.then(function (res: any) {
        //	receiveStuple(res);
        //})
        /*.catch(function (err) {
            console.error('Augh, there was an error!', err.statusText);
        });*/
    }
    function chooseLayout() {
        if (client.sply.flight) {
            layoutFlight();
        }
        else if (client.sply.sublocation == 'Refuel') {
            layoutRefuel();
        }
        else if (client.sply.scanning) {
            layoutScanning();
        }
        else if (client.location.type == 'Station') {
            layoutStation();
        }
        else if (client.location.type == 'Junk') {
            layoutJunk();
        }
        else if (client.location.type == 'Contested') {
            layoutContested();
        }
    }
    client.chooseLayout = chooseLayout;
    function receiveStuple(res) {
        if (res.length == 0) {
            console.warn('expected a stuple but received nothing');
            return;
        }
        let stuple = JSON.parse(res);
        const type = stuple[0];
        const payload = stuple[1];
        console.log('received stuple type', type);
        if (type == 'sply') {
            client.sply = payload;
            client.sector = getSectorByName(client.sply.sector);
            client.location = getLocationByName(client.sply.location);
            handleSply();
            chooseLayout();
        }
        else if (type == 'message') {
            layoutMessage(payload);
        }
        else if (type == 'senemies') {
            client.senemies = payload;
        }
    }
    function BuildLargeTile(tile) {
        console.log('build large tile from', tile);
        let gameBox = document.createElement('div');
        gameBox.classList.toggle('gameBox');
    }
    function usernameReminder() {
        let text = '';
        text += `
		<p class="smallish reminder">`;
        if (client.sply.unregistered)
            text += `
			Playing unregistered
			<!--<span class="material-icons" style="font-size: 18px">
			no_accounts
			</span>-->`;
        else
            text += `
			Logged in as ${client.sply.username} <!-- #${client.sply.id} -->
			<!--<span class="material-icons" style="font-size: 18px">
			how_to_reg
			</span>-->
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
        textHead.innerHTML += text;
    }
    function addReturnOption() {
        let text = '';
        text += `
		<p>
		<span class="spanButton" onclick="space.chooseLayout()"><</span>
		<p>
		<br />
		`;
        return text;
    }
    function makeWhereabouts() {
        let text = '';
        text += `
		<div id="whereabouts">
		<div></div>
		<span class="sector">${client.sector.name}</span> ~>
		<br />
		
		<span class="location" style="colors: ${client.location.color || "inherit"} ">
		&nbsp;${client.location.name}
		<!--(${client.location.type})--></span>
		</div>
		`;
        return text;
    }
    function layoutStation() {
        let textHead = document.getElementById("mainDiv");
        let text = usernameReminder();
        text += makeWhereabouts();
        text += `<p>`;
        text += `<span class="facilities">`;
        if (client.location.facilities) {
            if (client.location.facilities.indexOf("Refuel") > -1)
                text += 'You can <span class="spanButton" onclick="space.transportSublocation(`refuel`)">refuel</span> here.';
        }
        text += `</span>`;
        textHead.innerHTML = text;
        addFlightOption();
        //layoutFlightControls();
    }
    function layoutJunk() {
        let textHead = document.getElementById("mainDiv");
        let text = usernameReminder();
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
        let text = usernameReminder();
        text += makeWhereabouts();
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
        //text = breadcrumbs();
        text += addReturnOption();
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
		<td>name</td>
		<td>health</td>
		<td>damage</td>
		</tr>
		</thead>
		<tbody id="list">
		`;
        for (let enemy of client.senemies) {
            text += `
			<tr>
			<td class="sel">&nbsp;</td>
			<td>${enemy.name}</td>
			<td>%${enemy.health}</td>
			<td>${enemy.damage}</td>
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
        let text = usernameReminder();
        text += 'You are at a refuelling bay.';
        text += ' <span class="spanButton" onclick="space.returnSublocation()">Back to Station</span>';
        textHead.innerHTML = text;
        //layoutFlightControls();
    }
    function layoutScanning() {
        let textHead = document.getElementById("mainDiv");
        let text = usernameReminder();
        text += `You\'re scanning the junk at ${client.location.name || ''}.`;
        if (!client.sply.scanCompleted)
            text += ' <span class="spanButton" onclick="space.stopScanning()">Cancel?</span>';
        console.log(client.sply);
        //if (!sply.scanCompleted) {
        function updateBar() {
            let now = Date.now();
            if (now > client.sply.scanEnd)
                now = client.sply.scanEnd;
            const duration = client.sply.scanEnd - client.sply.scanStart;
            const time = now - client.sply.scanStart;
            const width = time / duration;
            const minutesPast = Math.floor(time / 1000 / 60).toFixed(0);
            const minutesRemain = Math.round(duration / 1000 / 60).toFixed(0);
            const over = client.sply.scanEnd - Date.now();
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
            if (client.sply.scanning) {
                const time = client.sply.scanEnd - Date.now();
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
        let text = usernameReminder();
        const loc = getLocationByName(client.sply.flightLocation);
        text += `You\'re flying towards <span style="colors: ${loc.color || "inherit"} ">${loc.name}
		(${loc.type})</span>.`;
        text += '';
        text += ' Attempt to <span class="spanButton" onclick="space.tryDock()">arrive / dock</span>';
        textHead.innerHTML = text;
        addFlightOption();
        //layoutFlightControls();
    }
    function layoutFlightControls() {
        let textHead = document.getElementById("mainDiv");
        let text = usernameReminder();
        text += addReturnOption();
        text += `
		Flight menu
		<p>
		${client.sector.name} ~>
		<select name="flights" id="flights" >`;
        for (let location of client.sector.locations) {
            text += `<option>${location}</option>`;
        }
        text += `<option>Non-existing option</option>`;
        text += `</select>
		<span class="spanButton" onclick="space.submitFlight()">Flight</span>
		</form>`;
        textHead.innerHTML = text;
    }
    client.layoutFlightControls = layoutFlightControls;
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
    client.showLogin = showLogin;
    function showRegister() {
        let textHead = document.getElementById("mainDiv");
        let text = `
		<form action="register" method="post">

		<label for="username">Username</label><br />
		<input class="wrong" type="text" placeholder="" name="username" id="username" minlength="4" maxlength="15"  required pattern="[a-zA-Z0-9]+">
		<br /><br />
	
		<label for="password">Password</label><br />
		<input class="wrong" type="password" placeholder="" name="password" id="password" minlength="4" maxlength="20" required>
		<br /><br />
	
		<label for="password-repeat">Repeat Password</label><br />
		<input class="wrong" type="password" placeholder="" name="password-repeat" id="password-repeat" maxlength="20" minlength="4" required>
		<br /><br />
		
		<label for="keep-ship" title="Start fresh or keep your play-via-ip, unregistered ship">
		<input type="checkbox" checked="checked" name="remember" id="keep-ship"> Keep current progress
		</label>
		<br />
		<br />

		<button type="button" onclick="space.xhrRegister()">Register</button>
		
		</form>`;
        textHead.innerHTML = text;
    }
    client.showRegister = showRegister;
    function submitFlight() {
        var e = document.getElementById("flights");
        var strUser = e.options[e.selectedIndex].text;
        console.log(strUser);
        makeRequest('GET', 'submitFlight=' + strUser)
            .then(function (res) {
            console.log('submitted flight');
            receiveStuple(res);
        });
    }
    client.submitFlight = submitFlight;
    function scanJunk() {
        makeRequest('GET', 'scan')
            .then(function (res) {
            receiveStuple(res);
        });
    }
    client.scanJunk = scanJunk;
    function completeScan() {
        makeRequest('GET', 'completeScan')
            .then(function (res) {
            receiveStuple(res);
        });
    }
    client.completeScan = completeScan;
    function stopScanning() {
        makeRequest('GET', 'stopScanning')
            .then(function (res) {
            receiveStuple(res);
        });
    }
    client.stopScanning = stopScanning;
    function seeEnemies() {
        makeRequest('GET', 'seeEnemies')
            .then(function (res) {
            receiveStuple(res);
            layoutEnemies();
        });
    }
    client.seeEnemies = seeEnemies;
    function tryDock() {
        makeRequest('GET', 'dock')
            .then(function (res) {
            console.log('asking server if we can dock');
            receiveStuple(res);
        });
    }
    client.tryDock = tryDock;
    function returnSublocation() {
        makeRequest('GET', 'returnSublocation')
            .then(function (res) {
            console.log('returned from sublocation');
            receiveStuple(res);
        });
    }
    client.returnSublocation = returnSublocation;
    function transportSublocation(facility) {
        makeRequest('GET', 'knock&sublocation=refuel')
            .then(function (res) {
            console.log('returned from sublocation');
            receiveStuple(res);
        });
    }
    client.transportSublocation = transportSublocation;
    function logout() {
        makeRequest('GET', 'logout')
            .then(function (res) {
            alert(res);
            client.sply.unregistered = true;
            handleSply();
            //chooseLayout();
        });
    }
    client.logout = logout;
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
                makeRequest('GET', 'ply')
                    .then(function (res) {
                    receiveStuple(res);
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
    client.xhrLogin = xhrLogin;
    function xhrRegister() {
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        let password_repeat = document.getElementById("password-repeat").value;
        let keep_ship = document.getElementById("keep-ship").checked;
        console.log(keep_ship);
        var http = new XMLHttpRequest();
        var url = 'register';
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
    client.xhrRegister = xhrRegister;
})(client || (client = {}));
function cls() {
}
export default client;
window.client = client;
