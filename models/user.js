const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    roles: {
        type: Map,
        of: Number,
        default: { User: 2001 }
    },
    refreshToken: String,
    address: String,
    dateCreated: {
        type: Date,
        default: Date.now
    },
    dietaryRestrictions: {
        type: [String],
        required: function() {
            return this.roles && this.roles.get('User') === 2001;
        }
    },
    intolerances: {
        type: [String],
        required: function() {
            return this.roles && this.roles.get('User') === 2001;
        }
    },
    excludedIngredients: {
        type: [String],
        required: function() {
            return this.roles && this.roles.get('User') === 2001;
        }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    contact: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);
