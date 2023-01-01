"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stellar_objects = void 0;
const hooks_1 = require("../shared/hooks");
const pts_1 = require("../shared/pts");
const lod_1 = require("./lod");
var stellar_objects;
(function (stellar_objects) {
    stellar_objects.ply_ships = {};
    function init() {
        hooks_1.default.register('userMinted', (user) => {
            when_user_minted(user);
            return false;
        });
        hooks_1.default.register('userPurged', (user) => {
            when_user_purged(user);
            return false;
        });
    }
    stellar_objects.init = init;
    function when_user_minted(user) {
        console.log('userMinted', user.id);
        user.pos = [Math.random() * 10 - 5, Math.random() * 10 - 5];
        let ship = new stellar_objects.ply_ship;
        ship.userId = user.id;
        ship.name = user.username;
        ship.pos = user.pos;
        ship.set();
        lod_1.default.add(ship);
    }
    stellar_objects.when_user_minted = when_user_minted;
    function when_user_purged(user) {
        let ship = stellar_objects.ply_ships[user.id];
        if (ship)
            lod_1.default.remove(ship);
    }
    stellar_objects.when_user_purged = when_user_purged;
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
        tick() {
            super.tick();
            //this.pos = [Math.random() * 10 - 5, Math.random() * 10 - 5];
            this.decay = 10;
            lod_1.default.chunk.swap(this);
        }
    }
    stellar_objects.ply_ship = ply_ship;
    class tp_rock extends lod_1.default.obj {
        constructor() {
            super();
            this.angle = 0;
            this.name = 'rock';
            this.type = 'rock';
            this.angle = Math.random() * Math.PI;
        }
        tick() {
            super.tick();
            if (this.expired())
                return;
            const speed = 0.3;
            let x = speed * Math.sin(this.angle);
            let y = speed * Math.cos(this.angle);
            this.pos = pts_1.default.add(this.pos, [x, y]);
            lod_1.default.chunk.swap(this);
            //console.log('tickk');
        }
    }
    stellar_objects.tp_rock = tp_rock;
})(stellar_objects = exports.stellar_objects || (exports.stellar_objects = {}));
exports.default = stellar_objects;
