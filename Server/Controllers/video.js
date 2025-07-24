import videofile from "../Models/videofile.js";
import { processVideoQualities } from "../Helper/videoProcessor.js";
import path from 'path';
import fs from 'fs';

export const uploadvideo = async (req, res) => {
    if (req.file === undefined) {
        res.status(404).json({ message: "plz upload a mp.4 video file only" })
    } else {
        try {
            // Process video into multiple qualities
            const outputDir = path.dirname(req.file.path);
            const filename = path.parse(req.file.originalname).name;
            
            console.log('Processing video qualities...');
            const qualities = await processVideoQualities(req.file.path, outputDir, filename);
            
            // Create video file record with qualities
            const file = new videofile({
                videotitle: req.body.title,
                filename: req.file.originalname,
                filepath: req.file.path,
                filetype: req.file.mimetype,
                filesize: req.file.size,
                videochanel: req.body.chanel,
                uploader: req.body.uploader,
                qualities: qualities,
                defaultQuality: '720p' // Set default quality
            });

            await file.save();
            res.status(200).send("File uploaded successfully with multiple qualities");
        } catch (error) {
            console.error('Upload error:', error);
            res.status(404).json(error.message)
            return
        }
    }
}

export const getallvideos = async (req, res) => {
    try {
        const files = await videofile.find();
        res.status(200).send(files)
    } catch (error) {
        res.status(404).json(error.message)
        return
    }
}

// New endpoint to get video qualities for a specific video
export const getVideoQualities = async (req, res) => {
    try {
        const { videoId } = req.params;
        const video = await videofile.findById(videoId);
        
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        res.status(200).json({
            qualities: video.qualities || [],
            defaultQuality: video.defaultQuality || '720p'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}