const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    isBlocked: { type: Boolean, default: false },
    cart: { type: Array, default: [] },
    address: [{ type: Object }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    refreshToken: { type: String },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSaltSync(10)
  this.password = await bcrypt.hashSync(this.password, salt)
})
userSchema.methods.isPasswordMatched = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password)
}
userSchema.methods.createResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
  return resetToken
}

//Export the model
module.exports = mongoose.model('User', userSchema)
