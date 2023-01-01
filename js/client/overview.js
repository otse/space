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
class overview extends right_bar.toggler_behavior {
    constructor(toggler) {
        super(toggler);
        this.items = [];
        overview.instance = this;
    }
    on_open() {
        this.on_fetch();
    }
    on_close() {
        this.items = [];
    }
    on_fetch() {
        // <x-horizontal-rule></x-horizontal-rule>
        let text = '';
        text += `
			<table>
			<thead>
			<tr>
			<td>dist</td>
			<td>name</td>
			<td>type</td>
			</tr>
			</thead>
			<tbody>
		`;
        for (const thing of outer_space.things) {
            text += `
				<tr>
				<td>1km</td>
				<td>${truncate(thing.tuple[4], 10)}</td>
				<td>${thing.tuple[3]}</td>
				</tr>
			`;
            //console.log('woo', thing.tuple[4]);
            //this.do_once = false;
        }
        text += `
			</tbody>
			</table>
		`;
        this.toggler.content.innerHTML = text;
    }
    produce_items() {
        for (const thing of outer_space.things) {
            let ite = new item(thing);
            this.items.push(ite);
        }
    }
}
export default overview;
