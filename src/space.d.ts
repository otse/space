declare type vec4 = [number, number, number, number];
declare type vec3 = [number, number, number];
declare type vec2 = [number, number];

type Stuple = [type: string, payload: any]

interface JSector {
	name: string
	locations: string[]
}

interface JLocation {
	name: string
	type: string
	position: vec2
	color: string
	facilities: string[]
}

interface Locations {
	writes: number
	boo: number
}

interface BriefApp {

}

