"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const url = require('url');
var actions;
(function (actions) {
    function handle(req, res) {
        const q = url.parse(req.url, true);
        if (q.pathname == '/follow') {
            const id = q.query.id;
            console.log('we want to follow obj ', id);
            res.end('1');
            return true;
        }
        return false;
    }
    actions.handle = handle;
})(actions || (actions = {}));
exports.default = actions;
