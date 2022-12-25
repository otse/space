"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.celestial_objects = void 0;
const lod_1 = require("./lod");
var celestial_objects;
(function (celestial_objects) {
    celestial_objects.ply_ships_by_name = {};
    class ply_ship extends lod_1.default.obj {
        constructor() {
            super();
            this.plyId = -1;
            this.type = 'ply';
        }
        init() {
            this.random.plyId = this.plyId;
        }
    }
    celestial_objects.ply_ship = ply_ship;
})(celestial_objects = exports.celestial_objects || (exports.celestial_objects = {}));
exports.default = celestial_objects;
