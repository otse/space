import pts from "../shared/pts";
import outer_space from "./outer space";
import right_bar from "./right bar";

class item {
	faded = false
	constructor(public readonly thing: outer_space.obj) {

	}
}

function truncate(string, limit) {
	if (string.length <= limit)
		return string;
	return string.slice(0, limit) + '...';
}

class tab {
	element
	static active?: tab
	static tabs: tab[] = []
	constructor(readonly parent: overview, readonly name, index) {
		tab.tabs.push(this);
		this.element = this.parent.toggler.content.querySelector(`x-tab:nth-of-type(${index})`);
		this.element.onclick = () => {
			tab.select(this);
			overview.instance.build_table();
		}
	}
	static select(which: tab) {
		tab.active?.element.classList.remove('selected');
		tab.active = which;
		tab.active.element.classList.add('selected');
	}
}

class overview extends right_bar.toggler_behavior {
	static instance: overview;
	items: item[] = []
	x_tabs
	x_inner_content
	tbody
	//tabs: tab[] = []
	general
	mining

	constructor(toggler: right_bar.toggler) {
		super(toggler);
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

			</x-tabs>
			<x-outer-content>
			<x-inner-content>
			<table>
			<thead>
			<tr>
			<td><x-center>Dist <span>arrow_drop_down</span></x-center></td>
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
		this.x_inner_content = this.toggler.content.querySelector('x-inner-content')!;
		this.tbody = this.toggler.content.querySelector('tbody')!;

		new tab(this, 'General', 1);
		new tab(this, 'Mining', 2);

		tab.select(tab.tabs[0]);

		console.log('x-inner-content', this.x_inner_content);
	}
	override on_open() {
		//this.on_fetch();
		this.build_table();
	}
	override on_close() {
		this.items = [];
	}
	override on_fetch() {
		this.build_table();
	}
	build_table() {
		let table = '';
		const copy = outer_space.objs.slice();
		const dist = (obj: outer_space.obj) => pts.dist(outer_space.center, obj.tuple[2]);

		copy.sort((a, b) => dist(a) > dist(b) ? 1 : -1)
		for (const obj of copy) {
			const type = obj.tuple[3];
			if (tab.active?.name == 'General') {
				if (!(type.includes('ply')))
					continue;
			}
			else if (tab.active?.name == 'Mining') {
				if (!(type.includes('rock') || type.includes('debris')))
					continue;
			}
			const dist = pts.dist(outer_space.center, obj.tuple[2]);
			table += `
				<tr>
				<td>${dist.toFixed(2)} km</td>
				<td>${truncate(obj.tuple[4], 10)}</td>
				<td>${obj.tuple[3]}</td>
				</tr>
			`;
			//console.log('woo', thing.tuple[4]);
			//this.do_once = false;
		}
		this.tbody.innerHTML = table;

	}
	produce_items() {
		for (const obj of outer_space.objs) {
			let ite = new item(obj);
			this.items.push(ite);
		}
	}
}

export default overview;