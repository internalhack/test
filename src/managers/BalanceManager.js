const Emitter = require('../classes/Emitter')
const EconomyError = require('../classes/EconomyError')

const FetchManager = require('./FetchManager')
const DatabaseManager = require('./DatabaseManager')

const errors = require('../structures/Errors')

/**
* Balance manager methods class.
* @extends {Emitter}
*/
class BalanceManager extends Emitter {

    /**
     * Economy constructor options object. There's only needed options object properties for this manager to work properly.
     * @param {Object} options Constructor options object.
     * @param {String} options.storagePath Full path to a JSON file. Default: './storage.json'.
     */
    constructor(options = {}) {
        super(options)

        /**
         * Economy constructor options object.
         * @type {EconomyOptions}
         * @private
         */
        this.options = options

        /**
         * Fetch manager methods object.
         * @type {FetchManager}
         * @private
         */
        this.fetcher = new FetchManager(options)

        /**
         * Fetch manager methods object.
         * @type {DatabaseManager}
         * @private
         */
        this.database = new DatabaseManager(options)
    }

    /**
    * Fetches the user's balance.
    * @param {String} memberID Member ID
    * @param {String} guildID Guild ID
    * @returns {Number} User's balance
    */
    fetch(memberID, guildID) {
        if (typeof memberID !== 'string') throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        return this.fetcher.fetchBalance(memberID, guildID)
    }

    /**
     * Sets the money amount on user's balance.
     * @param {Number} amount Money amount.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {String} reason The reason why you add the money.
     * @returns {Number} Money amount.
     */
    set(amount, memberID, guildID, reason = null) {
        if (isNaN(amount)) throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        if (typeof memberID !== 'string') throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        this.database.set(`${guildID}.${memberID}.money`, amount)

        const balance = this.fetcher.fetchBalance(memberID, guildID)
        this.emit('balanceSet', {
            type: 'set',
            guildID,
            memberID,
            amount: Number(amount),
            balance,
            reason
        })

        return amount
    }

    /**
     * Adds the money amount on user's balance.
     * @param {Number} amount Money amount.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {String} reason The reason why you add the money.
     * @returns {Number} Money amount.
     */
    add(amount, memberID, guildID, reason = null) {
        if (isNaN(amount)) throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        if (typeof memberID !== 'string') throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        this.database.add(`${guildID}.${memberID}.money`, amount)

        const balance = this.fetcher.fetchBalance(memberID, guildID)
        this.emit('balanceAdd', {
            type: 'add',
            guildID,
            memberID,
            amount: Number(amount),
            balance,
            reason
        })

        return amount
    }

    /**
     * Subtracts the money amount on user's balance.
     * @param {Number} amount Money amount.
     * @param {String} memberID Member ID.
     * @param {String} guildID Guild ID.
     * @param {String} reason The reason why you add the money.
     * @returns {Number} Money amount.
     */
    subtract(amount, memberID, guildID, reason = null) {
        if (isNaN(amount)) throw new EconomyError(errors.invalidTypes.amount + typeof amount)
        if (typeof memberID !== 'string') throw new EconomyError(errors.invalidTypes.memberID + typeof memberID)
        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        this.database.subtract(`${guildID}.${memberID}.money`, amount)

        const balance = this.fetcher.fetchBalance(memberID, guildID)
        this.emit('balanceSubtract', {
            type: 'subtract',
            guildID,
            memberID,
            amount: Number(amount),
            balance,
            reason
        })

        return amount
    }

    /**
     * Shows a money leaderboard for your server
     * @param {String} guildID Guild ID
     * @returns {BalanceLeaderboard[]} Sorted leaderboard array
     */
    leaderboard(guildID) {
        let lb = []
        const data = this.fetcher.fetchAll()

        if (typeof guildID !== 'string') throw new EconomyError(errors.invalidTypes.guildID + typeof guildID)

        const guildData = data[guildID]
        if (!guildData) return []

        let users = Object.keys(guildData)
        let ranks = Object.values(guildData).map(x => x.money).filter(x => !isNaN(x))

        for (let i in ranks) lb.push({
            index: Number(i) + 1,
            userID: users[i],
            money: Number(ranks[i])
        })

        return lb.sort((a, b) => a.money + b.money)
    }
}

/**
 * Balance leaderboard object.
 * @typedef {Object} BalanceLeaderboard
 * @property {Number} index User's place in the top.
 * @property {String} userID User's ID.
 * @property {Number} money User's amount of money.
 */

/**
 * Balance manager class.
 * @type {BalanceManager}
 */
module.exports = BalanceManager