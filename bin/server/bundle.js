(function () {
    'use strict';

    var TEST;
    (function (TEST) {
        TEST[TEST["Outside"] = 0] = "Outside";
        TEST[TEST["Inside"] = 1] = "Inside";
        TEST[TEST["Overlap"] = 2] = "Overlap";
    })(TEST || (TEST = {}));

    var space;
    (function (space) {
        var sply; // = { name: 'Captain', unregistered: true }
        space.ply = {
            id: 0,
            unregistered: true,
            where: {}
        };
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
        function getSublocationDescription(sublocation) {
            if (sublocation == 'Refuel')
                return 'You are at a refuelling bay.';
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
        function init() {
            let menu_button = document.getElementById("menu_button");
            menu_button.onclick = function () {
                showLoginOrRegister();
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
        function fetchSply() {
            makeRequest('GET', 'ply').then(function (res) {
                receiveStuple(res);
            });
        }
        space.fetchSply = fetchSply;
        function showLoginOrRegister() {
            let textHead = document.getElementById("mainDiv");
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
                return makeRequest('GET', 'where');
            })
                .then(function (res) {
                receiveStuple(res);
            });
            /*.catch(function (err) {
                console.error('Augh, there was an error!', err.statusText);
            });*/
        }
        function receiveStuple(res) {
            let stuple = JSON.parse(res);
            const type = stuple[0];
            const payload = stuple[1];
            console.log('received stuple type', type);
            if (type == 'sply') {
                sply = payload;
            }
            else if (type == 'flight') {
                // we are nowhere, in flight
                layoutFlight();
            }
            else if (type == 'swhere') {
                getSectorByName(payload.swhere.sectorName);
                const location = getLocationByName(payload.swhere.locationName);
                if (payload.swhere.sublocation == 'Refuel') {
                    layoutRefuel(stuple);
                    //console.log(answer[1]);
                }
                else if (location.type == 'Station')
                    layoutStation(stuple);
            }
        }
        function breadcrumbs(where) {
            const sector = getSectorByName(where.sectorName);
            const location = getLocationByName(where.locationName);
            let text = '';
            text += `
		<p class="smallish">`;
            if (sply.unregistered)
                text += `[Playing via ip (unregistered).]`;
            else
                text += `[You are player #${sply.id}, ${sply.name}]`;
            text += `<p>`;
            text += `
		You are in the <span class="sector">${sector.name}</span>
		/ <span class="location" style="colors: ${location.color || "inherit"} ">${location.name}
		(${location.type})</span>
		`;
            if (where.sublocation != 'None') {
                text += '<p>';
                //text +=`/ <span class="sublocation">${where.sublocation}</span>`;
                text += getSublocationDescription(where.sublocation);
            }
            return text;
        }
        function layoutStation(answer) {
            let textHead = document.getElementById("mainDiv");
            const swhere = answer[1].swhere;
            getSectorByName(swhere.sectorName);
            const location = getLocationByName(swhere.locationName);
            let text = breadcrumbs(swhere);
            text += `<p>`;
            text += `<span class="facilities">`;
            if (location.facilities) {
                if (location.facilities.indexOf("Refuel") > -1)
                    text += 'You can <span class="spanButton" onclick="space.transportSublocation(`refuel`)">refuel</span> here.';
            }
            text += `</span>`;
            textHead.innerHTML = text;
            layoutFlightControls();
        }
        function layoutRefuel(answer) {
            let textHead = document.getElementById("mainDiv");
            const swhere = answer[1].swhere;
            let text = breadcrumbs(swhere);
            //text += '<p>'
            text += ' <span class="spanButton" onclick="space.returnSublocation()">Back to Station</span>';
            textHead.innerHTML = text;
            //layoutFlightControls();
        }
        function layoutFlight(answer) {
            let textHead = document.getElementById("mainDiv");
            let text = '';
            text += 'boo';
            textHead.innerHTML += text;
        }
        function layoutFlightControls() {
            document.getElementById("mainDiv");
            if (!space.ply.where.sector)
                return;
            console.log(space.ply.where.sector);
            return;
        }
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
		<input class="wrong" type="text" placeholder="" name="username" id="username" minlength="4" maxlength="15"  required pattern="[a-zA-Z0-9]+"><br /><br />
	
		<label for="password">Password</label><br />
		<input class="wrong" type="password" placeholder="" name="password" id="password" minlength="4" maxlength="20" required><br /><br />
	
		<label for="password-repeat">Repeat Password</label><br />
		<input class="wrong" type="password" placeholder="" name="password-repeat" id="password-repeat" maxlength="20" minlength="4" required><br /><br />
	
		<button type="button" onclick="space.xhrRegister()">Register</button>
		
		</form>`;
            textHead.innerHTML = text;
        }
        space.showRegister = showRegister;
        function submitFlight() {
            var e = document.getElementById("cars");
            var strUser = e.options[e.selectedIndex].text;
            console.log(strUser);
            makeRequest('GET', 'submitFlight=' + strUser)
                .then(function (res) {
                console.log('submitted flight');
                receiveStuple(res);
            });
        }
        space.submitFlight = submitFlight;
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
                        return makeRequest('GET', 'where');
                    })
                        .then(function (res) {
                        receiveStuple(res);
                    });
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
            var http = new XMLHttpRequest();
            var url = 'register';
            var params = `username=${username}&password=${password}&password-repeat=${password_repeat}`;
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
    window.space = space;

})();
