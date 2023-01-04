import pts from "../shared/pts";
import outer_space from "./outer space";
import right_bar from "./right bar";
class item {
    constructor(thing) {
        this.thing = thing;
        this.faded = false;
    }
}
// from SO
function is_overflown(element) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
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
            overview.instance.build_table();
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
			<x-scrollable>arrow_downward</x-scrollable>
			</x-tabs>
			<x-outer-content>
			<x-inner-content>
			<x-amount>showing 10 rows</x-amount>
			<table>
			<thead>
			<tr>
			<td><x-sorter data-a="dist">Dist <span>arrow_drop_up</span></x-sorter></td>
			<td>Name</td>
			<td>Type</td>
			</tr>
			</thead>
			<tbody>
			</tbody>
			</table>
			</x-inner-content>
			</x-outer-content>
		`;
        this.toggler.content.innerHTML = text;
        this.x_inner_content = this.toggler.content.querySelector('x-inner-content');
        this.tbody = this.toggler.content.querySelector('tbody');
        this.scrollable = this.toggler.content.querySelector('x-scrollable');
        this.amount = this.toggler.content.querySelector('x-amount');
        new tab(this, 'General', 1);
        new tab(this, 'Mining', 2);
        tab.select(tab.tabs[0]);
        console.log('x-inner-content', this.x_inner_content);
    }
    on_open() {
        //this.on_fetch();
        this.build_table();
    }
    on_close() {
        this.items = [];
    }
    on_step() {
    }
    on_fetch() {
        this.build_table();
    }
    build_table() {
        var _a, _b, _c;
        let table = '';
        let copy = outer_space.objs.slice();
        const dist = (obj) => pts.dist(outer_space.center, obj.tuple[2]);
        copy.sort((a, b) => dist(a) > dist(b) ? 1 : -1);
        if (((_a = tab.active) === null || _a === void 0 ? void 0 : _a.name) == 'General') {
            copy = copy.filter(a => a.is_type(['ply']));
        }
        else if (((_b = tab.active) === null || _b === void 0 ? void 0 : _b.name) == 'Mining') {
            copy = copy.filter(a => a.is_type(['rock']));
        }
        for (const obj of copy) {
            const type = obj.tuple[3];
            const dist = pts.dist(outer_space.center, obj.tuple[2]);
            table += `
				<tr data-a="${obj.tuple[1]}">
				<td>${dist.toFixed(2)} km</td>
				<td>${truncate(obj.tuple[4], 10)}</td>
				<td>${obj.tuple[3]}</td>
				</tr>
			`;
            //console.log('woo', thing.tuple[4]);
            //this.do_once = false;
        }
        this.amount.innerHTML = `showing ${copy.length} items`;
        this.tbody.innerHTML = table;
        if (is_overflown(this.x_inner_content)) {
            this.scrollable.style.display = 'block';
        }
        else {
            this.scrollable.style.display = 'none';
        }
        for (const obj of copy) {
            const tr = this.tbody.querySelector(`tr[data-a="${obj.tuple[1]}"]`);
            if (!tr)
                continue;
            const select = () => {
                var _a;
                (_a = this.selected_tr) === null || _a === void 0 ? void 0 : _a.classList.remove('selected');
                this.selected_tr = tr;
                tr.classList.add('selected');
            };
            if (tr.dataset.a == ((_c = outer_space.obj.focus) === null || _c === void 0 ? void 0 : _c.tuple[1])) {
                select();
            }
            tr.onclick = () => {
                outer_space.focus_obj(obj);
                select();
            };
        }
    }
    produce_items() {
        for (const obj of outer_space.objs) {
            let ite = new item(obj);
            this.items.push(ite);
        }
    }
}
export default overview;
