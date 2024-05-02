const Joi = require('joi')

function authenticatedUserValidation(user){
    let Schema = Joi.object({
        email: Joi.string().max(50).required().email(),
        password: Joi.string().min(6).required()
    })

    return Schema.validate(user)
}

module.exports.authenticatedUserValidation = authenticatedUserValidation






