/*

function layoutStation() {
    let textHead = document.getElementById("mainDiv")!;

    let text = username_header();

    //text += drawSpaceship();

    text += makeWhereabouts();

    text += `<p>`
    text += `<span class="facilities">`

    if (location.facilities) {
        if (location.facilities.indexOf("Refuel") > -1)
            text += 'You can <span class="spanButton" onclick="space.transportSublocation(`refuel`)">refuel</span> here.';
    }
    text += `</span>`;

    textHead.innerHTML = text;

    addFlightOption();

    //layoutFlightControls();
}

function layoutJunk() {
    let textHead = document.getElementById("mainDiv")!;

    let text = username_header();

    text += makeWhereabouts();

    text += `<p>`

    text += `
    It's a junk field.
    You can <span class="spanButton" onclick="space.scanJunk()">scan</span> the debris.
    `;

    textHead.innerHTML = text;

    addFlightOption();

    //layoutFlightControls();
}


function layoutContested() {
    let textHead = document.getElementById("mainDiv")!;

    let text = username_header();

    text += makeWhereabouts();

    text += addLocationMeter();

    text += `<p>`

    text += `
    This regional blob of space is unmonitored by law.
    <p>
    You can <span class="spanButton" onclick="space.seeEnemies()">see nearby enemies.</span>
    `;

    textHead.innerHTML = text;

    addFlightOption();

    //layoutFlightControls();
}


function layoutRefuel() {
    let textHead = document.getElementById("mainDiv")!;

    let text = username_header();

    text += 'You are at a refuelling bay.';

    text += ' <span class="spanButton" onclick="space.returnSublocation()">Back to Station</span>';

    textHead.innerHTML = text;

    //layoutFlightControls();
}

function layoutScanning() {
    let textHead = document.getElementById("mainDiv")!;

    let text = username_header();

    text += `You\'re scanning the junk at ${location.name || ''}.`;

    if (!sply.scanCompleted)
        text += ' <span class="spanButton" onclick="space.stopScanning()">Cancel?</span>';

    console.log(sply);

    //if (!sply.scanCompleted) {
    function updateBar() {
        let now = Date.now();

        if (now > sply.scanEnd)
            now = sply.scanEnd;

        const duration = sply.scanEnd - sply.scanStart;
        const time = now - sply.scanStart;
        const width = time / duration;
        const minutesPast = Math.floor(time / 1000 / 60).toFixed(0);
        const minutesRemain = Math.round(duration / 1000 / 60).toFixed(0);

        const over = sply.scanEnd - Date.now();

        let bar = document.getElementById("barProgress")!;
        let text = document.getElementById("barText")!;

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
    </div>`

    //if (sply.scanCompleted)
    //	text += '<p><br /><span class="spanButton" onclick="space.completeScan()">See scan results</span>';

    textHead.innerHTML = text;

    updateBar();

    const t = setInterval(function () {
        if (sply.scanning) {
            const time = sply.scanEnd - Date.now();
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

function layoutEnemies() {
    let textHead = document.getElementById("mainDiv")!;

    let text = '';

    text += username_header();

    text += addReturnOption();

    text += addLocationMeter();

    //text += makeWhereabouts();

    text += `<p>`

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

    for (let enemy of senemies) {
        let position = [
            enemy.position[0].toFixed(1),
            enemy.position[1].toFixed(1)
        ]
        text += `
        <tr>
        <td class="sel">&nbsp;</td>
        <td>${enemy.name}</td>
        <!--<td>%${enemy.health}</td>
        <td>${enemy.damage}</td>-->
        <td>${position[0]}, ${position[1]}</td>
        <td>${pts.dist(sply.position, enemy.position).toFixed(1)} km</td>
        </tr>
        `
        //
    }

    text += `
    </tbody>
    </table>
    </div>
    `

    textHead.innerHTML = text;

    let list = document.getElementById("list")!;

    console.log(list.childElementCount);

    let active;
    for (let i = 0; i < list.children.length; i++) {
        let child = list.children[i] as HTMLElement;
        child.onclick = function () {
            let dom = this as HTMLElement;
            console.log('woo', this);
            if (active != this) {
                if (active) {
                    active.classList.remove('selected')
                }
                dom.classList.add('selected')
                active = this;
            }
        }
        console.log(child);
    }

    //addFlightOption();

    //layoutFlightControls();
}
*/ 
