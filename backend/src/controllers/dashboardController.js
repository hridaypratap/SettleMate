const {
    getDashboardData
} = require("../services/dashboardService");

const getDashboardController = async (req, res) => {
    try {
        const result = await getDashboardData(req.userId);

        return res.status(200).json(result);

    } catch (error) {
        console.error(
            "Get Dashboard Error",
            error
        );

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    getDashboardController
};