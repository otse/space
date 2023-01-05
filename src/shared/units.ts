namespace units {
	type unit = number
	type kilometre = number

	const au: unit = 150000000;

	export const astronomical_unit: unit = 150000000; // 149597871

	export function is_astronomical_unit(km: kilometre) {

	}

	export function express_number_with_unit(km: kilometre) {
		const func = (n) => n.toLocaleString("en-US");
		let text = `${func(Math.round(km))} km`;
		if (km <= 10)
			text = `${func(Math.round(km * 1000))} m`;
		else if (km >= astronomical_unit / 10)
			text = `${func((km / astronomical_unit).toFixed(1))} au`;
		return text;
	}
}

export default units;