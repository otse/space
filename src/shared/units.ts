// https://stackoverflow.com/questions/307179/what-is-javascripts-highest-integer-value-that-a-number-can-go-to-without-losin


namespace units {
	type unit = number
	type kilometer = number

	const au: unit = 150000000;

	export const astronomical_unit: unit = 150000000; // 149597871

	export function is_astronomical_unit(km: kilometer) {
		
	}

	export function very_pretty_dist_format(km: kilometer) {
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