'use strict'

const Redis = use('Redis')

class AuctionController {
    async bid({ request, response }) {
        try {
            const { auction_id, new_bid } = request.only(['auction_id', 'new_bid'])

            const result = await Redis.eval(`
                local key = KEYS[1]
                local new_bid = tonumber(ARGV[1])
    
                local current_bid = tonumber(redis.call('HGET', key, 'current_bid'))
                local step_price = tonumber(redis.call('HGET', key, 'step_price'))
    
                if new_bid >= current_bid + step_price then
                    redis.call('HSET', key, 'current_bid', new_bid)
                    return 1
                else
                    return 0
                end
            `, 1, `auction:${auction_id}`, new_bid)
    
            if (result === 1) {
                return response.status(200).json({ message: 'Auction successful!' })
            } 
                
            return response.status(200).json({ message: 'Auction failed!' })
        } catch (error) {
            console.error('AuctionController.bid error: ', error.message)
            return response.status(500).json({ message: 'Something went wrong. Please try again later.' })
        }
    }

    async get_info({ request, response }) {
        try {
            const { auction_id } = request.only(['auction_id'])

            const key = 'auction:' + auction_id

            const data = await Redis.hmget(key, 'base_price', 'step_price', 'current_bid')

            const ttl = await Redis.ttl(key)

            return response.status(200).json({'base_price': Number(data[0]), 'current_bid': Number(data[2]), 'ttl': ttl})
        } catch (error) {
            console.error('AuctionController.get_current_bid error: ', error.message)
            return response.status(500).json({ message: 'Something went wrong. Please try again later.' })
        }
    }

    async init({ request, response }) {
        try {
            const { base_price, step_price, current_bid, auction_id, ttl } = request.only(['base_price', 'step_price', 'current_bid', 'auction_id', 'ttl'])

            const id = 'auction:' + auction_id

            await Redis.hmset(id, {
              base_price: base_price,
              step_price: step_price,
              current_bid: current_bid,
            })
            await Redis.expire(id, ttl)

            return response.status(200).json({ message: 'Init auction successfully!' })
        } catch (error) {
            console.error('AuctionController.init error: ', error.message)
            return response.status(500).json({ message: 'Something went wrong. Please try again later.' })
        }
    }
}

module.exports = AuctionController
