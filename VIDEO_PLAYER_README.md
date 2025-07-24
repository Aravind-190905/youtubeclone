# Video Player with Quality Selection

This YouTube clone now includes a sophisticated video player with quality selection functionality that allows users to switch between different video qualities (240p, 360p, 480p, 720p, 1080p).

## Features

### Video Player Component
- **Quality Selection**: Dropdown menu to switch between available video qualities
- **Seamless Switching**: Maintains playback position when changing quality
- **Loading States**: Visual feedback during quality transitions
- **File Size Display**: Shows file size for each quality option
- **Responsive Design**: Works on both desktop and mobile devices

### Backend Processing
- **Multi-Quality Generation**: Automatically processes uploaded videos into multiple qualities
- **FFmpeg Integration**: Uses FFmpeg for video transcoding (with fallback for development)
- **Quality Metadata**: Stores quality information including file paths, sizes, and bitrates
- **API Endpoints**: New endpoints to fetch available qualities for videos

## Technical Implementation

### Database Schema Updates
The video model now includes:
```javascript
qualities: [{
    quality: String,      // '240p', '360p', '480p', '720p', '1080p'
    filepath: String,     // Path to quality-specific video file
    filesize: String,     // File size in bytes
    bitrate: String       // Video bitrate
}],
defaultQuality: String    // Default quality (e.g., '720p')
```

### Video Processing
- **FFmpeg Processing**: Converts uploaded videos to multiple qualities
- **Fallback Mode**: If FFmpeg is unavailable, creates mock quality entries for development
- **Quality Settings**:
  - 240p: 400k bitrate
  - 360p: 800k bitrate
  - 480p: 1200k bitrate
  - 720p: 2500k bitrate
  - 1080p: 5000k bitrate

### Frontend Components
- **VideoPlayer**: Main component with quality selection
- **Quality Selector**: Dropdown menu with quality options
- **Loading Overlay**: Visual feedback during quality changes

## Installation & Setup

### Prerequisites
1. Node.js and npm installed
2. FFmpeg (optional, for full functionality)

### Dependencies
The following packages have been added to the server:
```bash
npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg
```

### Usage

#### Uploading Videos
Videos are automatically processed into multiple qualities when uploaded. The system will:
1. Save the original video file
2. Process it into 5 different quality versions
3. Store metadata for each quality
4. Set a default quality (720p)

#### Playing Videos
Users can:
1. Play videos at the default quality
2. Click the quality selector (⚙️ button)
3. Choose from available qualities
4. Switch quality seamlessly without losing playback position

## API Endpoints

### Get Video Qualities
```
GET /api/video/:videoId/qualities
```
Returns available qualities for a specific video:
```json
{
  "qualities": [
    {
      "quality": "240p",
      "filepath": "uploads/video_240p.mp4",
      "filesize": "1024000",
      "bitrate": "400k"
    }
  ],
  "defaultQuality": "720p"
}
```

## File Structure

```
client/src/Component/VideoPlayer/
├── VideoPlayer.jsx      # Main video player component
└── VideoPlayer.css      # Styling for video player

Server/
├── Helper/
│   └── videoProcessor.js # Video processing utilities
├── Models/
│   └── videofile.js     # Updated video model
└── Controllers/
    └── video.js         # Updated video controller
```

## Development Notes

### FFmpeg Fallback
If FFmpeg is not available on the system, the application will:
1. Log a warning message
2. Create mock quality entries using the original video file
3. Continue to function normally for development purposes

### Performance Considerations
- Video processing is CPU-intensive and may take time for large files
- Consider implementing background job processing for production
- Quality switching maintains playback position for better UX

### Browser Compatibility
The video player uses standard HTML5 video elements and should work in all modern browsers.

## Future Enhancements

Potential improvements for the video player:
1. **Adaptive Bitrate Streaming**: Implement HLS or DASH for better streaming
2. **Quality Auto-Selection**: Automatically select quality based on network conditions
3. **Thumbnail Generation**: Generate video thumbnails for each quality
4. **Progress Tracking**: Track quality selection preferences per user
5. **Caching**: Implement video caching for frequently accessed content 