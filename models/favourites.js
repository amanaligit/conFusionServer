const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);



var favSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [{ type: Schema.Types.ObjectId, ref: 'Dish' }]
}, {
    timestamps: true
});



var Favourite = mongoose.model('Favourite', favSchema);

module.exports = Favourite;