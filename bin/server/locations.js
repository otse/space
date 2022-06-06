"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locations = void 0;
var fs = require('fs');
var locations;
(function (locations) {
    function init() {
        const path = 'locations.json';
        locations.file = JSON.parse(fs.readFileSync(path, 'utf8'));
    }
    locations.init = init;
    function get(name) {
        console.log('locations.get');
        for (let object of locations.file) {
            if (object.name == name)
                return object;
        }
    }
    locations.get = get;
    function instance(name) {
        console.log('locations.instance');
        if (instances[name]) {
            let instance;
            instance = instances[name];
            instance.refresh();
            return instance;
        }
        else {
            const simple = get(name);
            let instance;
            if (simple.type == 'Contested')
                instance = new contested_location_instance(simple);
            else
                instance = new location_instance(simple);
            instances[name] = instance;
            return instance;
        }
    }
    locations.instance = instance;
    var instances = {};
    class location_instance {
        constructor(simple) {
            this.simple = simple;
            this.create_or_fetch_persistence();
        }
        refresh() {
        }
        from_template() {
            this.data = {
                player_count: 0,
                enemies: []
            };
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
    locations.location_instance = location_instance;
    class contested_location_instance extends location_instance {
        constructor(simple) {
            super(simple);
            this.refresh();
        }
        refresh() {
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
            return {
                id: this.get_id(),
                name: this.get_random_name(),
                position: [Math.random() * 10, Math.random() * 10],
                health: 100,
                damage: 5,
                ship: 'Frigate'
            };
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
    locations.contested_location_instance = contested_location_instance;
})(locations = exports.locations || (exports.locations = {}));
exports.default = locations;
