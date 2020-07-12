const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;


const favoriteSchema = new Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes:[
       { type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'}
    ]
},{
    timestamps: true
});


var Favorites = mongoose.model('Favorites', favoriteSchema);

module.exports = Favorites;