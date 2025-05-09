const moment = require("moment");

function isPlaceOpen(openingHours, visitDateTime) {
    if (!openingHours || !openingHours.periods) return null;

    const day = visitDateTime.day(); // 0 = Sunday
    const time = visitDateTime.format("HHmm");

    const todayPeriods = openingHours.periods.filter(p => p.open.day === day);

    for (const period of todayPeriods) {
        const openTime = period.open.time;
        const closeTime = period.close?.time || "2359";

        if (time >= openTime && time < closeTime) {
            return true;
        }
    }
    return false;
}
