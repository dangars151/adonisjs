'use strict'

const History = use('App/Models/History')

class HistoryController {
    async index({ response }) {
        const histories = await History.all()
        return response.json(histories)
    }
}

module.exports = HistoryController
