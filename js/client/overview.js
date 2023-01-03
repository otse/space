import pts from "../shared/pts";
import outer_space from "./outer space";
import right_bar from "./right bar";
class item {
    constructor(thing) {
        this.thing = thing;
        this.faded = false;
    }
}
function truncate(string, limit) {
    if (string.length <= limit)
        return string;
    return string.slice(0, limit) + '...';
}
class tab {
    constructor(parent, name, index) {
        this.parent = parent;
        this.name = name;
        tab.tabs.push(this);
        this.element = this.parent.toggler.content.querySelector(`x-tab:nth-of-type(${index})`);
        this.element.onclick = () => {
            tab.select(this);
            overview.instance.on_fetch();
        };
    }
    static select(which) {
        var _a;
        (_a = tab.active) === null || _a === void 0 ? void 0 : _a.element.classList.remove('selected');
        tab.active = which;
        tab.active.element.classList.add('selected');
    }
}
tab.tabs = [];
class overview extends right_bar.toggler_behavior {
    constructor(toggler) {
        super(toggler);
        this.items = [];
        overview.instance = this;
        let text = '';
        text += `
			<x-tabs>
				<x-tab>
					General
				</x-tab>
				<x-tab>
					Mining
				</x-tab>
				<x-tab>
					Junk
				</x-tab>
			</x-tabs>
			<x-outer-content>
				<x-inner-content>
					Nothing here yet
				</x-inner-content>
			</x-outer-content>
		`;
        this.toggler.content.innerHTML = text;
        this.x_inner_content = this.toggler.content.querySelector('x-inner-content');
        new tab(this, 'General', 1);
        new tab(this, 'Mining', 2);
        tab.select(tab.tabs[0]);
        console.log('x-inner-content', this.x_inner_content);
    }
    on_open() {
        this.on_fetch();
    }
    on_close() {
        this.items = [];
    }
    on_fetch() {
        var _a, _b;
        // 
        let text = '';
        text += `
			<table>
			<thead>
			<tr>
			<td>Dist</td>
			<td>Name</td>
			<td>Type</td>
			</tr>
			</thead>
			<tbody>
		`;
        const copy = outer_space.objs.slice();
        for (const obj of outer_space.objs) {
            const type = obj.tuple[3];
            if (((_a = tab.active) === null || _a === void 0 ? void 0 : _a.name) == 'General') {
                if (!(type.includes('ply')))
                    continue;
            }
            else if (((_b = tab.active) === null || _b === void 0 ? void 0 : _b.name) == 'Mining') {
                if (!(type.includes('rock') || type.includes('debris')))
                    continue;
            }
            const dist = pts.dist(outer_space.center, obj.tuple[2]);
            text += `
				<tr>
				<td>${dist.toFixed(2)} km</td>
				<td>${truncate(obj.tuple[4], 10)}</td>
				<td>${obj.tuple[3]}</td>
				</tr>
			`;
            //console.log('woo', thing.tuple[4]);
            //this.do_once = false;
        }
        text += `
			</tbody>
			</table>
		`;
        this.x_inner_content.innerHTML = text;
    }
    produce_items() {
        for (const obj of outer_space.objs) {
            let ite = new item(obj);
            this.items.push(ite);
        }
    }
}
export default overview;
