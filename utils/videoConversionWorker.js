const { workerData, parentPort } = require("worker_threads");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
ffmpeg.setFfmpegPath("C:ffmpeg\\bin\\ffmpeg.exe");
ffmpeg.setFfprobePath("C:ffmpeg\\bin\\ffprobe.exe");

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
