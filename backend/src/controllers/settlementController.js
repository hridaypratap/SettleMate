const settlementService = require("../services/settlementService");

const getGroupSettlement = async (req, res) => {
    try {
        const { groupId } = req.params;
        const requestingUserId = req.userId;

        const result = await settlementService.getGroupSettlement(
            groupId,
            requestingUserId
        );

        if (result.error) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);

    } catch (error) {
        return res.status(500).json({
            error: "INTERNAL_SERVER_ERROR"
        });
    }
};

module.exports = {
    getGroupSettlement
};
