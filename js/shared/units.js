// https://stackoverflow.com/questions/307179/what-is-javascripts-highest-integer-value-that-a-number-can-go-to-without-losin
var units;
(function (units) {
    const au = 150000000;
    units.astronomical_unit = 150000000; // 149597871
    function is_astronomical_unit(km) {
    }
    units.is_astronomical_unit = is_astronomical_unit;
    function very_pretty_dist_format(km) {
        const func = (n) => n.toLocaleString("en-US");
        let text = `${func(Math.round(km))} km`;
        if (km <= 10)
            text = `${func(Math.round(km * 1000))} m`;
        else if (km >= units.astronomical_unit / 10)
            text = `${func((km / units.astronomical_unit).toFixed(1))} au`;
        return text;
    }
    units.very_pretty_dist_format = very_pretty_dist_format;
})(units || (units = {}));
export default units;
