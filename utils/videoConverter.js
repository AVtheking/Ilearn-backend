const { Worker } = require("worker_threads");

const createConversionWorker = (resolution, inputFilePath, outputPath) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./utils/videoConversionWorker.js", {
      workerData: {resolution, inputFilePath, outputPath},
    });
    worker.on("message", (message) => {
      if (message.success) {
        resolve();
      } else {
        reject(new Error(message.error || "Video conversion failed."));
      }
    });
    worker.on("error", (err) => {
      reject(err);
    });
  });
};
module.exports = createConversionWorker;
