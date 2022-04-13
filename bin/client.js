var steam_days;
(function (steam_days) {
    function init() {
        Get('featured');
    }
    steam_days.init = init;
    function Get(msg) {
        console.log('steam_days Get', msg);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", 'msg?=' + msg, true);
        xhr.onload = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200)
                    ReceiveMsg(xhr.responseText);
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
    steam_days.Get = Get;
    function submit(event) {
        let input = document.getElementById('cli');
        if (input == null)
            return;
        Get(input.value);
        return false;
    }
    steam_days.submit = submit;
    function ReceiveMsg(res) {
        console.log('unpack res', res);
        if (!res)
            return;
        let outMsg = JSON.parse(res);
        const type = outMsg[0];
        if (type == 'featured') {
            for (let tile of outMsg[1]) {
                console.log('show featured tiles');
                //document.querySelectorAll('.my #awesome selector');
                BuildLargeTile(tile);
            }
        }
        /*let output = document.getElementById(object["dest"]);
        if (output == null)
            return;
        output.innerHTML = object["payload"];
        console.log('boo');*/
    }
    function BuildLargeTile(tile) {
        console.log('build large tile from', tile);
        let gameBox = document.createElement('div');
        gameBox.classList.toggle('gameBox');
        let dayCandles = document.createElement('div');
        dayCandles.classList.toggle('dayCandles');
        gameBox.appendChild(dayCandles);
        let target = document.getElementsByClassName('featuredTiles')[0];
        target === null || target === void 0 ? void 0 : target.appendChild(gameBox);
        const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        let clampedDays = { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
        let max = 99999999;
        for (let day of days)
            max = Math.max(tile.days[day]);
        for (let day of days)
            clampedDays[day] = tile.days[day] / max * 100.0;
        for (let day of days) {
            const plys = clampedDays[day];
            console.log(`day ${day} has ${plys} plys`);
            let dayCandle = document.createElement('div');
            dayCandle.classList.toggle('dayCandle');
            dayCandle.classList.toggle(day);
            dayCandle.style.height = plys + '%';
            dayCandles.appendChild(dayCandle);
        }
    }
})(steam_days || (steam_days = {}));
function cls() {
}
window.steam_days = steam_days;
