declare type vec4 = [number, number, number, number];
declare type vec3 = [number, number, number];
declare type vec2 = [number, number];

type Stuple = [type: string, payload: any]

interface Sector {
	name: string
	locations: string[]
}

interface Location {
	name: string
	type: string
	position: vec2,
	color: string
	facilities: string[]
}

type enemy_ships = 'Frigate' | 'Scout' | 'Dragonfly'