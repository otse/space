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
        space.cplayer = {
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
        function showLoginOrRegister() {
            let textHead = document.getElementById("mainDiv");
            let text = `
		<span class="spanButton">login</span> or <span class="spanButton">register</span>?

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
                return makeRequest('GET', 'getwhere');
            })
                .then(function (res) {
                //console.log('got whereami');
                receiveStuple(res);
            }).catch(function (err) {
                console.error('Augh, there was an error!', err.statusText);
            });
            makeRequest('GET', 'sectors.json')
                .then(function (res) {
                console.log('got sectors');
                space.sectors = JSON.parse(res);
                return makeRequest('GET', 'locations.json');
            });
        }
        function askServer(url, callback) {
            console.log('space askServer', url);
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onload = function (e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200)
                        callback(xhr.responseText);
                    else
                        console.error(xhr.statusText);
                }
            };
            xhr.onerror = function (e) {
                let output = document.getElementById("output1");
                if (output == null)
                    return;
                output.innerHTML = xhr.statusText;
            };
            xhr.send(null);
        }
        space.askServer = askServer;
        function submit(event) {
            let input = document.getElementById('cli');
            if (input == null)
                return;
            askServer(input.value, receiveStuple);
            return false;
        }
        space.submit = submit;
        function receiveStuple(res) {
            console.log('receiveStuple');
            if (!res)
                return;
            let stuple = JSON.parse(res);
            const type = stuple[0];
            if (type == 'flight') {
                // we are nowhere, in flight
                layoutFlight();
            }
            if (type == 'swhere') {
                getSectorByName(stuple[1].swhere.sectorName);
                const location = getLocationByName(stuple[1].swhere.locationName);
                if (stuple[1].swhere.sublocation == 'Refuel') {
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
            if (space.cplayer.unregistered)
                text += `[Playing via ip.]`;
            else
                text += `[You are player #${space.cplayer.id}]`;
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
            if (!space.cplayer.where.sector)
                return;
            console.log(space.cplayer.where.sector);
            return;
        }
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
    })(space || (space = {}));
    window.space = space;

})();
