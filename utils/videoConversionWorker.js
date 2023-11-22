const { workerData, parentPort } = require("worker_threads");
require("dotenv").config();
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);

const convertVideo = () => {
  const { resolution, inputFilePath, outputPath } = workerData;
  console.log(resolution);
  if (fs.existsSync(outputPath)) {
    console.log("Video already exists, skipping conversion");
    parentPort.postMessage({ success: true });
    return;
  }
  ffmpeg(inputFilePath)
    .size(`${resolution.width}x${resolution.height}`)
    .output(outputPath)
    .on("end", () => {
      console.log(`Video in ${resolution.name} is ready`);
      parentPort.postMessage({ success: true });
    })
    .on("error", (err) => {
      console.log(`Error in ${resolution.name}`);
      parentPort.postMessage({ success: false, error: err.message });
    })
    .run();
};
convertVideo();
