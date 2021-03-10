/** @format */

process.on('unhandledRejection', function(err) {
    console.log(err)
  })

const mongoose = require('mongoose')

var globalSchema = new mongoose.Schema({
    wordsTyped: { type: Number, default: 0 },
    fastestWPM: { type: Number, default: 0 },
    averageAcc: { type: Number, default: 0 },
    dateJoined: { type: Date, default: Date.now() }
})

var exerciseSchema = new mongoose.Schema({
    fastestWPM: { type: Number, default: 0 },
    bestAcc: { type: Number, default: 0 }
})

var exercisesSchema = new mongoose.Schema({
    exercise1: { type: exerciseSchema },
        exercise2: { type: exerciseSchema },
        exercise3: { type: exerciseSchema },
        exercise4: { type: exerciseSchema },
        exercise5: { type: exerciseSchema },
        exercise6: { type: exerciseSchema },
        exercise7: { type: exerciseSchema },
        exercise8: { type: exerciseSchema },
        exercise9: { type: exerciseSchema },
        exercise10: { type: exerciseSchema }
})

var achievementSchema = new mongoose.Schema({
    allTheWords: { type: Boolean, default: false },
    tripleDigitClub: { type: Boolean, default: false },
    aPlusAccuracy: { type: Boolean, default: false },
    bestFriendsForever: { type: Boolean, default: false }
})

var statisticsSchema = new mongoose.Schema({
    globalStats: { type: globalSchema },
    exerciseStats: { type: exercisesSchema },
    achievements: { type: achievementSchema }
})

module.exports.statisticsSchema = statisticsSchema;

module.exports.Statistics = mongoose.model('Statistics', statisticsSchema)