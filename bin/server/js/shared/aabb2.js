"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pts_1 = require("./pts");
var TEST;
(function (TEST) {
    TEST[TEST["Outside"] = 0] = "Outside";
    TEST[TEST["Inside"] = 1] = "Inside";
    TEST[TEST["Overlap"] = 2] = "Overlap";
})(TEST || (TEST = {}));
class aabb2 {
    static dupe(bb) {
        return new aabb2(bb.min, bb.max);
    }
    constructor(a, b) {
        this.min = this.max = [...a];
        if (b) {
            this.extend(b);
        }
    }
    extend(v) {
        this.min = pts_1.default.min(this.min, v);
        this.max = pts_1.default.max(this.max, v);
    }
    diagonal() {
        return pts_1.default.subtract(this.max, this.min);
    }
    center() {
        return pts_1.default.add(this.min, pts_1.default.mult(this.diagonal(), 0.5));
    }
    translate(v) {
        this.min = pts_1.default.add(this.min, v);
        this.max = pts_1.default.add(this.max, v);
    }
    test(b) {
        if (this.max[0] < b.min[0] || this.min[0] > b.max[0] ||
            this.max[1] < b.min[1] || this.min[1] > b.max[1])
            return 0;
        if (this.min[0] <= b.min[0] && this.max[0] >= b.max[0] &&
            this.min[1] <= b.min[1] && this.max[1] >= b.max[1])
            return 1;
        return 2;
    }
}
aabb2.TEST = TEST;
exports.default = aabb2;
