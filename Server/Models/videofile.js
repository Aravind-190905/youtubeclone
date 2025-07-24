import mongoose from "mongoose"
const videofileschema=new mongoose.Schema(
    {
        videotitle:{
            type:String,
            required:true,
        },
        filename:{
            type:String,
            required:true,
        },
        filetype:{
            type:String,
            required:true,
        },
        filepath:{
            type:String,
            required:true,
        },
        filesize:{
            type:String,
            required:true,
        },
        videochanel:{
            type:String,
            required:true,
        },
        Like:{
            type:Number,
            default:0,
        },
        views:{
            type:Number,
            default:0,
        },
        uploader:{
            type:String
        },
        // New field for multiple quality versions
        qualities: [{
            quality: {
                type: String,
                enum: ['240p', '360p', '480p', '720p', '1080p'],
                required: true
            },
            filepath: {
                type: String,
                required: true
            },
            filesize: {
                type: String,
                required: true
            },
            bitrate: {
                type: String,
                required: true
            }
        }],
        // Default quality for backward compatibility
        defaultQuality: {
            type: String,
            default: '720p'
        }
    },
    {
        timestamps:true,
    }
)
export default mongoose.model("Videofiles",videofileschema)