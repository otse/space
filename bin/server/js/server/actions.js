"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const url = require('url');
const small_objects_1 = require("./small objects");
var actions;
(function (actions) {
    function handle(session, req, res) {
        const q = url.parse(req.url, true);
        if (q.pathname == '/follow') {
            const id = q.query.id;
            console.log('we want to follow obj', id);
            res.end('1');
            return true;
        }
        else if (q.pathname == '/fly') {
            if (!q.query.x || !q.query.y)
                return;
            const x = parseFloat(q.query.x);
            const y = parseFloat(q.query.y);
            let ship = small_objects_1.default.ply_ship.get(session.ply.id);
            ship.target = [x, y];
            ship.flyTowardsTarget = true;
            console.log('fly towards target');
        }
        return false;
    }
    actions.handle = handle;
})(actions || (actions = {}));
exports.default = actions;
