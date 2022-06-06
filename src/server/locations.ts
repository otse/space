var fs = require('fs');

export namespace locations {

	type locationtype = 'Station' | 'Junk' | 'Contested' | 'Minerals'

	interface location_json {
		name: string
		type: locationtype
		position: vec2
		color: string
		facilities: string[]
	}

	export var file: any;

	export function init() {
		const path = 'locations.json';
		file = JSON.parse(fs.readFileSync(path, 'utf8'));
	}

	export function get(name: string): location_json | undefined {
		console.log('locations.get');
		for (let object of file) {
			if (object.name == name)
				return object;
		}
	}

	export function instance(name: string) {
		console.log('locations.instance');
		if (instances[name]) {
			let instance;
			instance = instances[name];
			instance.refresh();
			return instance;
		}
		else {
			const simple = get(name)!;
			let instance;
			if (simple.type == 'Contested')
				instance = new contested_location_instance(simple);
			else
				instance = new location_instance(simple);
			instances[name] = instance;
			return instance;
		}

	}

	interface location_persistence_json {
		player_count,
		enemies: enemy_json[]
	}

	var instances = {};
	export class location_instance {
		data: location_persistence_json
		constructor(protected simple: location_json) {
			this.create_or_fetch_persistence();
		}
		refresh() {

		}
		from_template() {
			this.data = <location_persistence_json>{
				player_count: 0,
				enemies: []
			}
		}
		path() {
			return `persistence/locations/${this.simple.name.toLowerCase()}.json`;
		}
		get_data() {
			return this.data;
		}
		create_or_fetch_persistence() {
			const path = this.path();
			if (fs.existsSync(path)) {
				this.data = JSON.parse(fs.readFileSync(path, 'utf8'));
			}
			else {
				console.log('making fresh file');
				this.from_template();
				this.write();
			}
		}
		write() {
			const pretty = JSON.stringify(this.data, null, 4);
			fs.writeFileSync(this.path(), pretty);
		}
		checkin(ply) {
			this.data.player_count++;
			this.write();
		}
		checkout(ply) {
			this.data.player_count--;
			this.write();
		}
	}

	interface enemy_json {
		id: number
		name: string
		health: number
		damage: number,
		ship: string
	}

	export class contested_location_instance extends location_instance {
		constructor(simple) {
			super(simple);
			this.refresh();
		}
		override refresh() {
			super.refresh();
			this.make_enemies();
		}
		get_random_name() {
			return [
				"Raider", "Looter", "Pirate", "Bounty"
			][Math.floor(Math.random() * 4)];
		}
		get_id() {
			let id = 0;
			for (let enemy of this.data.enemies) {
				if (id <= enemy.id)
					id++;
			}
			console.log('highest id is ', id);
			
			return id;
		}
		make_enemy() {
			return <enemy_json>{
				id: this.get_id(),
				name: this.get_random_name(),
				position: [Math.random() * 10, Math.random() * 10],
				health: 100,
				damage: 5,
				ship: 'Frigate'
			}
		}
		make_enemies() {
			while (this.data.enemies.length < 4) {
				this.data.enemies.push(this.make_enemy());
			}
			this.write();
		}
		get_enemies() {
			return this.data.enemies;
		}
	}
}

export default locations;