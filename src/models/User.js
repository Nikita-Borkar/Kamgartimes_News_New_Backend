const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        password:{
            type:String,
            required:true,
        },
        role:{
            type:String,
            default:"user",
            lowercase:true,
            trim:true,
            index:true,
        },
        isActive:{
            type:Boolean,
            default:true,
        },
    },
    {
        timestamps:true,
    }
);

const user = mongoose.model("User", userSchema);
module.exports = user;
