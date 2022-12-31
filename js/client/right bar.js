var right_bar;
(function (right_bar) {
    right_bar.togglers = [];
    class toggler_behavior {
        constructor(toggler) {
            this.toggler = toggler;
            toggler.behavior = this;
        }
        on_open() { }
        on_close() { }
        on_step() { }
    }
    right_bar.toggler_behavior = toggler_behavior;
    class toggler {
        constructor(name, from_top) {
            this.name = name;
            this.opened = false;
            right_bar.togglers.push(this);
            this.begin = document.querySelector(`x-right-bar x-begin:nth-last-of-type(${from_top})`);
            this.title = this.begin.querySelector('x-title');
            this.content = this.begin.querySelector('x-content');
            this.title.onclick = () => {
                var _a, _b;
                this.opened = !this.opened;
                if (this.opened)
                    console.log('boo');
                if (this.opened) {
                    this.content.style.display = 'flex';
                    (_a = this.behavior) === null || _a === void 0 ? void 0 : _a.on_open();
                }
                else {
                    this.content.style.display = 'none';
                    (_b = this.behavior) === null || _b === void 0 ? void 0 : _b.on_close();
                }
                //this.content.style.height = '100';
                //this.content.innerHTML = `wot up`;
            };
        }
        step() {
            var _a;
            (_a = this.behavior) === null || _a === void 0 ? void 0 : _a.on_step();
        }
    }
    right_bar.toggler = toggler;
    function init() {
        right_bar.element = document.querySelector('x-right-bar');
        stop();
    }
    right_bar.init = init;
    function start() {
        right_bar.element.innerHTML = `
		<x-begin>
			<x-title>
				<span>info</span> <span>info</span>
			</x-title>
			<x-content>
				nothing to see here
			</x-content>
		</x-begin>
		
		<x-begin>
			<x-title>
				<span>nearby ping</span> <span>sort</span>
			</x-title>
			<x-content>
				boo-ya
			</x-content>
		</x-begin>
		`;
        right_bar.nearby_ping_toggler = new toggler('nearby ping', 1);
        new toggler('info', 2);
        right_bar.element.style.visibility = 'visible';
    }
    right_bar.start = start;
    function stop() {
        right_bar.element.style.visibility = 'hidden';
        right_bar.togglers = [];
    }
    right_bar.stop = stop;
    function step() {
        for (const toggler of right_bar.togglers) {
            toggler.step();
        }
    }
    right_bar.step = step;
})(right_bar || (right_bar = {}));
export default right_bar;
