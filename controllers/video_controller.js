const { ErrorHandler } = require("../middlewares/error");
const fs = require("fs");

const videoCtrl = {
  streamVideo: async (req, res, next) => {
    try {
      const range = req.headers.range;
      if (!range) {
        return next(new ErrorHandler(400, "Required range header"));
      }
      const videoPath = req.query.path;
      const videoSize = fs.statSync(videoPath).size;
      const CHUNK_SIZE = 10 ** 6;
      const start = Number(range.replace(/\D/g, ""));
      const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
      const contentLength = end - start + 1;
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Range": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, headers);
      const videostream = fs.createReadStream(videoPath, { start, end });
      videostream.pipe(res);
    } catch (e) {
      next(e);
    }
  },
};
module.exports = videoCtrl;
