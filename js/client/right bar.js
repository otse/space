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
        on_fetch() { }
        on_step() { }
    }
    right_bar.toggler_behavior = toggler_behavior;
    class toggler {
        constructor(name, index) {
            this.name = name;
            this.opened = false;
            right_bar.togglers.push(this);
            this.begin = document.querySelector(`x-right-bar x-begin:nth-of-type(${index})`);
            this.title = this.begin.querySelector('x-title');
            this.content = this.begin.querySelector('x-content');
            this.begin.onmouseover = () => {
                toggler.hovering = true;
            };
            this.begin.onmouseleave = () => {
                toggler.hovering = false;
            };
            this.begin.classList.add(name);
            this.title.onclick = () => {
                this.opened = !this.opened;
                if (this.opened) {
                    this.open();
                }
                else {
                    this.close();
                }
            };
        }
        open() {
            var _a;
            this.opened = true;
            this.content.style.display = 'flex';
            (_a = this.behavior) === null || _a === void 0 ? void 0 : _a.on_open();
        }
        close() {
            var _a;
            this.opened = false;
            this.content.style.display = 'none';
            (_a = this.behavior) === null || _a === void 0 ? void 0 : _a.on_close();
        }
        fetch() {
            var _a;
            (_a = this.behavior) === null || _a === void 0 ? void 0 : _a.on_fetch();
        }
        step() {
            var _a;
            (_a = this.behavior) === null || _a === void 0 ? void 0 : _a.on_step();
        }
    }
    toggler.hovering = false;
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
				<span>rocket_launch</span>
				<span>Selected</span>
			</x-title>
			<x-content>
				nothing to see here
			</x-content>
		</x-begin>
		
		<x-begin>
			<x-title>
				<span>sort</span>
				<span>Objects</span>
			</x-title>
			<x-content>
				boo-ya
			</x-content>
		</x-begin>
		`;
        right_bar.selected_item_toggler = new toggler('selected-item', 1);
        right_bar.nearby_ping_toggler = new toggler('overview', 2);
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
            if (toggler.opened) {
                toggler.step();
            }
        }
    }
    right_bar.step = step;
    function on_fetch() {
        for (const toggler of right_bar.togglers) {
            if (toggler.opened) {
                toggler.fetch();
            }
        }
    }
    right_bar.on_fetch = on_fetch;
})(right_bar || (right_bar = {}));
export default right_bar;
