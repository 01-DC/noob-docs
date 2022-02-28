import { Schema, model } from 'mongoose'

const Document = new Schema({
    _id: String,
    data: Object
})

module.exports = model("Document", Document)