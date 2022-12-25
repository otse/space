"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stellar_objects = void 0;
const lod_1 = require("./lod");
var stellar_objects;
(function (stellar_objects) {
    stellar_objects.ply_ships_by_ply_id = {};
    class ply_ship extends lod_1.default.obj {
        constructor() {
            super();
            this.plyId = -1;
            this.type = 'ply';
        }
        set() {
            this.random.plyId = this.plyId;
            stellar_objects.ply_ships_by_ply_id[this.plyId] = this;
        }
    }
    stellar_objects.ply_ship = ply_ship;
})(stellar_objects = exports.stellar_objects || (exports.stellar_objects = {}));
exports.default = stellar_objects;
