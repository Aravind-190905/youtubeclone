import mongoose from "mongoose";

const userschema=mongoose.Schema({
    email:{type:String,require:true},
    name:{type:String},
    desc:{type:String},
    joinedon:{type:Date,default:Date.now},
    plan: {
        type: String,
        enum: ['free', 'bronze', 'silver', 'gold'],
        default: 'free'
    },
    planExpiry: {
        type: Date,
        default: null
    }
})

export default mongoose.model("User",userschema)