exports.processPlanData = (req, res) => {
    if (!req.body.transport || !req.body.date || req.body.locations.length === 0) {
        return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบก่อนวางแผน" });
    }
    res.json({ success: true, routes: req.body.locations });
};
