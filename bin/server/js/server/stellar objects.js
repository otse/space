"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stellar_objects = void 0;
const lod_1 = require("./lod");
var stellar_objects;
(function (stellar_objects) {
    stellar_objects.ply_ships = {};
    function get_ply_ship_by_user_id(user) {
        return stellar_objects.ply_ships[user.id];
    }
    stellar_objects.get_ply_ship_by_user_id = get_ply_ship_by_user_id;
    class ply_ship extends lod_1.default.obj {
        constructor() {
            super();
            this.userId = -1;
            this.type = 'ply';
        }
        set() {
            this.random.userId = this.userId;
            stellar_objects.ply_ships[this.userId] = this;
        }
    }
    stellar_objects.ply_ship = ply_ship;
})(stellar_objects = exports.stellar_objects || (exports.stellar_objects = {}));
exports.default = stellar_objects;
