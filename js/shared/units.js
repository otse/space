var units;
(function (units) {
    const au = 150000000;
    units.astronomical_unit = 150000000; // 149597871
    function is_astronomical_unit(km) {
    }
    units.is_astronomical_unit = is_astronomical_unit;
    function express_number_with_unit(km) {
        const func = (n) => n.toLocaleString("en-US");
        let text = `${func(Math.round(km))} km`;
        if (km < 10)
            text = `${func(Math.round(km * 1000))} m`;
        return text;
    }
    units.express_number_with_unit = express_number_with_unit;
})(units || (units = {}));
export default units;
