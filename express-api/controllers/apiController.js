const Api = require('../models/Api');

class ApiController {
    static async createApi(apiData) {
        try {
            const result = await Api.create(apiData);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ApiController;