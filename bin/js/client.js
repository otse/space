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
        //console.warn("location doesnt exist");
    }
    function getSectorByName(name) {
        for (let sector of space.sectors)
            if (sector.name == name)
                return sector;
        //console.warn("sector doesnt exist");
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
    function init() {
        //new aabb2([0,0],[0,0]);
        makeRequest('GET', 'sectors.json')
            .then(function (res) {
            console.log('got sectors');
            space.sectors = JSON.parse(res);
            return makeRequest('GET', 'locations.json');
        })
            .then(function (res) {
            console.log('got locations');
            space.locations = JSON.parse(res);
            return makeRequest('GET', 'whereami');
        })
            .then(function (res) {
            console.log('got whereami');
            receiveAnswer(res);
        }).catch(function (err) {
            console.error('Augh, there was an error!', err.statusText);
        });
        //askServer('sectors.json', (res) => sectors = JSON.parse(res));
    }
    space.init = init;
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
        askServer(input.value, receiveAnswer);
        return false;
    }
    space.submit = submit;
    function receiveAnswer(res) {
        console.log('receiveAnswer');
        if (!res)
            return;
        let answer = JSON.parse(res);
        const type = answer[0];
        if (type == 'where') {
            const location = getLocationByName(answer[1].location);
            if (answer[1].sublocation == 'Refuel') {
                layoutRefuel(answer);
                console.log(answer[1]);
            }
            else if (location.type == 'Station')
                layoutStation(answer);
        }
    }
    function BuildLargeTile(tile) {
        console.log('build large tile from', tile);
        let gameBox = document.createElement('div');
        gameBox.classList.toggle('gameBox');
    }
    function layoutStation(answer) {
        let textHead = document.getElementById("textHead");
        const sector = getSectorByName(answer[1].sector);
        const location = getLocationByName(answer[1].location);
        let text = `
			You are in the <span class="sector">${sector.name}</span>
			/ <span class="location" style="colors: ${location.color || "inherit"} ">${location.name}
			(${location.type})</span>
			`;
        text += `<p>`;
        text += `<span class="facilities">`;
        if (location.facilities) {
            if (location.facilities.indexOf("Refuel") > -1)
                text += 'You can <span class="spanButton" onclick="space.transportSublocation("Refuel")">refuel</span> here <br />';
        }
        text += `</span>`;
        textHead.innerHTML = text;
    }
    function layoutRefuel(answer) {
        let textHead = document.getElementById("textHead");
        let text = `

		`;
        text += '<span class="spanButton" onclick="space.returnSublocation()">Go back to Station?</span>';
        textHead.innerHTML = text;
    }
    function returnSublocation() {
        makeRequest('GET', 'returnSublocation')
            .then(function (res) {
            console.log('returned from sublocation');
            receiveAnswer(res);
        });
    }
    space.returnSublocation = returnSublocation;
    function transportSublocation(facility) {
        makeRequest('GET', 'transportSublocation?xx')
            .then(function (res) {
            console.log('returned from sublocation');
            receiveAnswer(res);
        });
    }
    space.transportSublocation = transportSublocation;
})(space || (space = {}));
function cls() {
}
window.space = space;
