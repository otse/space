import aabb2 from "./aabb2";
import pts from "./pts";
var space;
(function (space) {
    // comment
    pts;
    aabb2;
    function getLocationByName(name) {
        for (let location of space.locations)
            if (location.name == name)
                return location;
        console.warn("location doesnt exist");
    }
    function getSectorByName(name) {
        for (let sector of space.sectors)
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
    function init() {
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
    space.init = init;
    function handleSply() {
        console.log('handlesply', space.sply);
        let logo = document.querySelector(".logo .text");
        space.sector = getSectorByName(space.sply.sector);
        if (space.sply.unregistered)
            logo.innerHTML = `space`;
        else
            logo.innerHTML = `space - ${space.sply.username}`;
    }
    space.handleSply = handleSply;
    function showAccountBubbles() {
        let textHead = document.getElementById("mainDiv");
        let username = space.sply && space.sply.username;
        let text = `
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
            space.sectors = JSON.parse(res);
            return makeRequest('GET', 'locations.json');
        })
            .then(function (res) {
            console.log('got locations');
            space.locations = JSON.parse(res);
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
        if (space.sply.flight) {
            layoutFlight();
        }
        else if (space.sply.sublocation == 'Refuel') {
            layoutRefuel();
        }
        else if (space.sply.scanning) {
            layoutScanning();
        }
        else if (space.location.type == 'Station') {
            layoutStation();
        }
        else if (space.location.type == 'Junk') {
            layoutJunk();
        }
    }
    space.chooseLayout = chooseLayout;
    function receiveStuple(res) {
        let stuple = JSON.parse(res);
        const type = stuple[0];
        const payload = stuple[1];
        console.log('received stuple type', type);
        if (type == 'sply') {
            space.sply = payload;
            space.sector = getSectorByName(space.sply.sector);
            space.location = getLocationByName(space.sply.location);
            handleSply();
            chooseLayout();
        }
        else if (type == 'message') {
            layoutMessage(payload);
        }
    }
    function BuildLargeTile(tile) {
        console.log('build large tile from', tile);
        let gameBox = document.createElement('div');
        gameBox.classList.toggle('gameBox');
    }
    function breadcrumbs() {
        let text = '';
        text += `
		<p class="smallish">`;
        if (space.sply.unregistered)
            text += `[ Playing via this ip (unregistered). ]`;
        else
            text += `[ Logged in as ${space.sply.username} (#${space.sply.id}) ]`;
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
    function layoutStation() {
        let textHead = document.getElementById("mainDiv");
        let text = breadcrumbs();
        text += `
		You are in the <span class="sector">${space.sector.name}</span>
		/ <span class="location" style="colors: ${space.location.color || "inherit"} ">${space.location.name}
		(${space.location.type})</span>
		`;
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
        let text = breadcrumbs();
        text += `
		You are in the <span class="sector">${space.sector.name}</span>
		/ <span class="location" style="colors: ${space.location.color || "inherit"} ">${space.location.name}
		(${space.location.type})</span>
		`;
        text += `<p>`;
        text += `
		It's a junk field.
		You can <span class="spanButton" onclick="space.scanJunk()">scan</span> the debris.
		`;
        textHead.innerHTML = text;
        addFlightOption();
        //layoutFlightControls();
    }
    function layoutRefuel() {
        let textHead = document.getElementById("mainDiv");
        let text = breadcrumbs();
        text += 'You are at a refuelling bay.';
        text += ' <span class="spanButton" onclick="space.returnSublocation()">Back to Station</span>';
        textHead.innerHTML = text;
        //layoutFlightControls();
    }
    function layoutScanning() {
        let textHead = document.getElementById("mainDiv");
        let text = breadcrumbs();
        text += 'You are scanning the junk. This may take a moment.';
        text += ' <span class="spanButton" onclick="space.stopScanning()">Cancel</span>';
        console.log(space.sply);
        if (!space.sply.scanCompleted) {
            let started = Date.now() - space.sply.scanStart;
            started /= 1000;
            if (started < 60.0) {
                started = `${started.toFixed(0)} seconds ago`;
            }
            else if (started < 60 * 60) {
                started = `${Math.floor(started / 60).toFixed(0)} minutes ago`;
            }
            started;
            text += `<p>Start time: ${started}`;
            let ending = space.sply.scanEnd - Date.now();
            ending /= 1000;
            if (ending < 0)
                ending = '[ Completed ]';
            else if (ending < 60.0) {
                ending = `${ending.toFixed(0)} seconds`;
            }
            else if (ending < 60 * 60) {
                ending = `${Math.ceil(ending / 60).toFixed(0)} minutes`;
            }
            text += `<p>Scan complete in ${ending}`;
            const duration = space.sply.scanEnd - space.sply.scanStart;
            const time = Date.now() - space.sply.scanStart;
            const width = time / duration;
            console.log('width', width);
            console.log('scanEnd', space.sply.scanEnd, 'scanStart', space.sply.scanStart);
            text += `<div class="scanBar"><div class="inside" style="width: ${(width * 100).toFixed(0)}%"></div></div>`;
        }
        else {
            text += '<p><br /><span class="spanButton" onclick="space.completeScan()">Complete scan</span>';
        }
        textHead.innerHTML = text;
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
        let text = breadcrumbs();
        const loc = getLocationByName(space.sply.flightLocation);
        text += `You\'re flying towards <span class="location" style="colors: ${loc.color || "inherit"} ">${loc.name}
		(${loc.type})</span>.`;
        text += '';
        text += ' Attempt to <span class="spanButton" onclick="space.tryDock()">dock</span>';
        textHead.innerHTML = text;
        addFlightOption();
        //layoutFlightControls();
    }
    function layoutFlightControls() {
        let textHead = document.getElementById("mainDiv");
        let text = breadcrumbs();
        text += addReturnOption();
        text += 'Flight menu';
        text += '<p>';
        text += ``;
        text += `<select name="flights" id="flights" >`;
        for (let location of space.sector.locations) {
            text += `<option>${location}</option>`;
        }
        text += `<option>Non-existing option</option>`;
        text += `</select>
		<span class="spanButton" onclick="space.submitFlight()">Flight</span>
		</form>`;
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

		</form>`;
        textHead.innerHTML = text;
    }
    space.showLogin = showLogin;
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
    space.showRegister = showRegister;
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
    space.submitFlight = submitFlight;
    function scanJunk() {
        makeRequest('GET', 'scan')
            .then(function (res) {
            receiveStuple(res);
        });
    }
    space.scanJunk = scanJunk;
    function completeScan() {
        makeRequest('GET', 'completeScan')
            .then(function (res) {
            receiveStuple(res);
        });
    }
    space.completeScan = completeScan;
    function stopScanning() {
        makeRequest('GET', 'stopScanning')
            .then(function (res) {
            receiveStuple(res);
        });
    }
    space.stopScanning = stopScanning;
    function tryDock() {
        makeRequest('GET', 'dock')
            .then(function (res) {
            console.log('asking server if we can dock');
            receiveStuple(res);
        });
    }
    space.tryDock = tryDock;
    function returnSublocation() {
        makeRequest('GET', 'returnSublocation')
            .then(function (res) {
            console.log('returned from sublocation');
            receiveStuple(res);
        });
    }
    space.returnSublocation = returnSublocation;
    function transportSublocation(facility) {
        makeRequest('GET', 'knock&sublocation=refuel')
            .then(function (res) {
            console.log('returned from sublocation');
            receiveStuple(res);
        });
    }
    space.transportSublocation = transportSublocation;
    function logout() {
        makeRequest('GET', 'logout')
            .then(function (res) {
            alert(res);
            space.sply.unregistered = true;
            handleSply();
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
    space.xhrLogin = xhrLogin;
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
    space.xhrRegister = xhrRegister;
})(space || (space = {}));
function cls() {
}
window.space = space;
