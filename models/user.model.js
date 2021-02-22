/**@format */

const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

mongoose.set('useCreateIndex', true)

var UserSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'username is required'] },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        validate: {
			validator: function (v) {
				return /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(v)
			},
			message: (email) => `${email.value} is an invalid email`,
		}
    },
    password: { type: String, required: [true, 'password is required'] },
    statistics: [{ type: mongoose.Types.ObjectId, ref: 'Statistics' }],
    created: {
        type: Date,
        required: [true, 'account creation date is required']
    }
})

UserSchema.statics.generateJwt = (user) => {
	if (process.env.NODE_ENV !== 'test') {
		return jwt.sign(
			{
				id: user._id,
				name: user.name,
				email: user.email,
				created: user.created,
			},
			process.env.JWT_KEY,
			{
				expiresIn: process.env.JWT_EXP,
			}
		)
	} else {
		return
	}
}

module.exports = mongoose.model('User', UserSchema)