const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');

let ffmpegPath, ffprobePath;
if (fs.existsSync('/usr/bin/ffmpeg') && fs.existsSync('/usr/bin/ffprobe')) {
  ffmpegPath = '/usr/bin/ffmpeg';
  ffprobePath = '/usr/bin/ffprobe';
  console.log('Using system FFmpeg at:', ffmpegPath);
  console.log('Using system ffprobe at:', ffprobePath);
} else {
  ffmpegPath = ffmpegInstaller.path;
  ffprobePath = ffprobeInstaller.path;
  
  console.log('Using bundled FFmpeg at:', ffmpegPath);
  console.log('Using bundled ffprobe at:', ffprobePath);
}

function getVideoMetadata(videoPath) {
  return new Promise((resolve, reject) => {
    const ffprobeArgs = [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      videoPath
    ];    const ffprobeProcess = spawn(ffprobePath, ffprobeArgs, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';

    ffprobeProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ffprobeProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffprobeProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`ffprobe failed with code ${code}: ${stderr}`));
      }

      try {
        const metadata = JSON.parse(stdout);
        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        const duration = parseFloat(metadata.format.duration) || 0;
        const format = metadata.format.format_name || '';
        const resolution = videoStream ? `${videoStream.width}x${videoStream.height}` : '';
        
        let bitrate = null;
        if (metadata.format.bit_rate) {
          bitrate = Math.round(parseInt(metadata.format.bit_rate) / 1000);
        }

        let fps = null;
        if (videoStream && videoStream.avg_frame_rate) {
          const fpsRatio = videoStream.avg_frame_rate.split('/');
          if (fpsRatio.length === 2 && parseInt(fpsRatio[1]) !== 0) {
            fps = Math.round((parseInt(fpsRatio[0]) / parseInt(fpsRatio[1]) * 100)) / 100;
          } else {
            fps = parseInt(fpsRatio[0]) || null;
          }
        }

        resolve({
          duration,
          format,
          resolution,
          bitrate,
          fps,
          raw: metadata
        });
      } catch (error) {
        reject(new Error(`Failed to parse ffprobe output: ${error.message}`));
      }
    });

    ffprobeProcess.on('error', (error) => {
      reject(new Error(`ffprobe process error: ${error.message}`));
    });
  });
}

function convertTimestamp(timestamp, duration) {
  if (typeof timestamp === 'string' && timestamp.endsWith('%')) {
    const percentage = parseFloat(timestamp.replace('%', ''));
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      return '10';
    }
    const seconds = Math.floor((duration * percentage) / 100);
    return seconds.toString();
  }
  
  return timestamp.toString();
}

function generateThumbnail(videoPath, outputPath, options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        timestamp = '10%',
        size = '854x480',
        quality = 2
      } = options;

      let actualTimestamp = timestamp;
      if (typeof timestamp === 'string' && timestamp.endsWith('%')) {
        try {
          const metadata = await getVideoMetadata(videoPath);
          actualTimestamp = convertTimestamp(timestamp, metadata.duration);
        } catch (error) {
          console.warn('Could not get duration for percentage conversion, using 10 seconds:', error.message);
          actualTimestamp = '10';
        }
      }

      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const ffmpegArgs = [
        '-i', videoPath,
        '-ss', actualTimestamp,
        '-vframes', '1',
        '-vf', `scale=${size}`,
        '-q:v', quality.toString(),
        '-y',
        outputPath
      ];      const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs, {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      });

      let stderr = '';

      ffmpegProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpegProcess.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`ffmpeg failed with code ${code}: ${stderr}`));
        }

        if (!fs.existsSync(outputPath)) {
          return reject(new Error('Thumbnail file was not created'));
        }

        resolve(outputPath);
      });

      ffmpegProcess.on('error', (error) => {
        reject(new Error(`ffmpeg process error: ${error.message}`));
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function getVideoDuration(videoPath) {
  try {
    const metadata = await getVideoMetadata(videoPath);
    return metadata.duration;
  } catch (error) {
    throw new Error(`Failed to get video duration: ${error.message}`);
  }
}

function getVideoFileSize(videoPath) {
  const stats = fs.statSync(videoPath);
  return stats.size;
}

module.exports = {
  getVideoMetadata,
  generateThumbnail,
  getVideoDuration,
  getVideoFileSize,
  ffmpegPath,
  ffprobePath
};