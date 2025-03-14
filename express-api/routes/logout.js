const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.post("/logout", auth, (req, res) => {
    // In a real-world application, you might want to add the token to a blacklist
    // or invalidate it in your database

    res.json({
        success: true,
        message: "Successfully logged out",
    });
});

module.exports = router;
