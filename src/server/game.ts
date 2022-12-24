export namespace game {

	export interface ply {
		id: number
		ip: string
		unreg: boolean
		username: string
		password: string
		pos: vec2
		goto: vec2
		health: number
		speed: number
		flight: boolean
		flightLocation: string
		scanning?: boolean
		scanStart?: number
		scanEnd?: number
		scanCompleted?: boolean
		engaging?: boolean
	}

}

export default game;