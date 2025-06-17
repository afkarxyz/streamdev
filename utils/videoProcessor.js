const { generateThumbnail: createThumbnail, getVideoDuration, getVideoFileSize } = require('./ffmpegUtils');
const path = require('path');
const { paths } = require('./storage');
const getVideoInfo = async (filepath) => {
  try {
    const duration = await getVideoDuration(filepath);
    const fileSize = getVideoFileSize(filepath);
    return {
      duration,
      fileSize
    };
  } catch (error) {
    console.error('Error getting video info:', error);
    throw error;
  }
};
const generateThumbnail = async (videoPath, thumbnailName) => {
  try {
    const thumbnailPath = path.join(paths.thumbnails, thumbnailName);
    await createThumbnail(videoPath, thumbnailPath, {
      timestamp: '10',
      size: '854x480'
    });
    return thumbnailPath;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
};
module.exports = {
  getVideoInfo,
  generateThumbnail
};