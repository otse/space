const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const url = require('url');

import short_lived from "./session";
import small_objects from "./small objects";

namespace actions {
	export function handle(session: short_lived, req, res) {

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
			let ship = small_objects.ply_ship.get(session.ply.id);
			ship.target = [x, y];
			ship.flyTowardsTarget = true;
			console.log('fly towards target');

		}
		return false;
	}
}

export default actions;