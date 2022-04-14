declare type vec4 = [number, number, number, number];
declare type vec3 = [number, number, number];
declare type vec2 = [number, number];

type ServerAnswer = [type: string, payload: any]

interface Sectors {
	sectors: [{name}]
}

interface Locations {
	writes: number
	boo: number
}

interface BriefApp {

}

