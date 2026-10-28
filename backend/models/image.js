import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    filename:{
        type:String,
        required:true,
    },
    originalName:{
        type:String,
        required:true,
    },
    imageUrl: {
        type:String,
        required:true,
    },
},
{timestamps:true}
)
export default mongoose.model("Image", imageSchema);