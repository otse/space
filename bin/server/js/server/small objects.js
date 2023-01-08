"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.small_objects = void 0;
const hooks_1 = require("../shared/hooks");
const pts_1 = require("../shared/pts");
const lod_1 = require("./lod");
var small_objects;
(function (small_objects) {
    small_objects.ply_ships = {};
    function init() {
        small_objects.grid = new lod_1.default.grid(3000);
        hooks_1.default.register('userMinted', (user) => {
            when_user_minted(user);
            return false;
        });
        hooks_1.default.register('userPurged', (user) => {
            when_user_purged(user);
            return false;
        });
    }
    small_objects.init = init;
    function tick() {
        small_objects.grid.tick();
    }
    small_objects.tick = tick;
    function when_user_minted(user) {
        console.log('userMinted', user.id);
        user.pos = [Math.random() * 10 - 5, Math.random() * 10 - 5];
        let ship = new small_objects.ply_ship;
        ship.userId = user.id;
        ship.name = user.username;
        ship.pos = user.pos;
        ship.set();
        lod_1.default.add(small_objects.grid, ship);
    }
    small_objects.when_user_minted = when_user_minted;
    function when_user_purged(user) {
        let ship = small_objects.ply_ships[user.id];
        if (ship)
            lod_1.default.remove(ship);
    }
    small_objects.when_user_purged = when_user_purged;
    class obj_lifetime extends lod_1.default.obj {
        constructor() {
            super();
            this.lifetime = 100;
        }
        timed_out() {
            if (this.lifetime <= 0) {
                lod_1.default.remove(this);
                return true;
            }
            this.lifetime -= lod_1.default.tick_rate;
            return false;
        }
    }
    small_objects.obj_lifetime = obj_lifetime;
    class ply_ship extends lod_1.default.obj {
        constructor() {
            super();
            this.userId = -1;
            this.type = 'ply';
        }
        set() {
            this.random.userId = this.userId;
            small_objects.ply_ships[this.userId] = this;
        }
        tick() {
            super.tick();
            //this.pos = [Math.random() * 10 - 5, Math.random() * 10 - 5];
            lod_1.default.chunk.swap(this);
        }
    }
    small_objects.ply_ship = ply_ship;
    class tp_rock extends obj_lifetime {
        constructor() {
            super();
            this.angle = 0;
            this.speed = 0.3; // 0.3 km per second
            this.name = 'rock';
            this.type = 'rock';
            this.angle = Math.random() * Math.PI * 2;
            this.lifetime = 60 * 3;
            this.speed = 0.3 + Math.random() * 0.3;
        }
        tick() {
            if (this.timed_out())
                return;
            super.tick();
            const speed = this.speed * lod_1.default.tick_rate;
            let x = speed * Math.sin(this.angle);
            let y = speed * Math.cos(this.angle);
            this.pos = pts_1.default.add(this.pos, [x, y]);
            lod_1.default.chunk.swap(this);
            //console.log('tickk');
        }
    }
    small_objects.tp_rock = tp_rock;
})(small_objects = exports.small_objects || (exports.small_objects = {}));
exports.default = small_objects;