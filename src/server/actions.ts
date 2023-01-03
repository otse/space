const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const url = require('url');

namespace actions {
	export function handle(req, res) {
		
		const q = url.parse(req.url, true);

		if (q.pathname == '/follow') {
			const id = q.query.id;
			console.log('we want to follow obj ', id);
			res.end('1');
			return true;
		}
		return false;
	}
}

export default actions;