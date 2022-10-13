import express from "express";
import cors from "cors";
import AWS from "aws-sdk";
import fs from "fs";
const app = express();

app.use("/", express.static("public"));
app.use(cors());

const filePath = "./Firstview_high.mp4";
const filename = "1662639479008.mp4";

AWS.config.update({
  region: "us-east-2",
  accessKeyId: "AKIAQVJW6EGPAOLP2JPF",
  secretAccessKey: "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",
});

AWS.config.getCredentials(function (err) {
  if (err) console.log(err.stack);
  else {
    console.log("Access key:", AWS.config.credentials.accessKeyId);
  }
});

app.get("/api/annotate", (req, res) => {
  var s3 = new AWS.S3();
  const mimetype = "video/mp4";
  const file = "1662639479008.mp4";
  const cache = 0;
  console.log("const mimetype, file, and cache declared");
  // s3.listObjectsV2()
  s3.listObjectsV2(
    {
      Bucket: "elasticbeanstalk-us-east-2-045749248414",
      MaxKeys: 1,
      Prefix: file,
    },
    function (err, data) {
      if (err) {
        return res.status(400).send(err);
      }

      console.log("made request to s3 to list objects");
      console.log(data);
      if (req != null && req.headers.range != null) {
        console.log(req);
        var range = req.headers.range;
        var bytes = range.replace(/bytes=/, "").split("-");
        var start = parseInt(bytes[0], 10);
        var total = data.Contents[0].Size;
        var end = bytes[1] ? parseInt(bytes[1], 10) : total - 1;

        var chunksize = end - start + 1;

        if (start !== undefined && end !== undefined) {
          chunksize = end + 1 - start;
        } else if (start !== undefined) {
          chunksize = total - start;
        } else if (end !== undefined) {
          chunksize = end + 1;
        } else {
          chunksize = total;
        }

        console.log("declared range, bytes, start, total, end, chunksize vars");

        res.writeHead(206, {
          "Content-Range": "bytes " + start + "-" + end + "/" + total,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Accept-Encoding": "Identity",
          "Last-Modified": data.Contents[0].LastModified,
          "Content-Type": mimetype,
          "Content-Disposition": "inline",
          Connection: "keep-alive",
        });
        console.log("wrote header");
        s3.getObject({
          Bucket: "elasticbeanstalk-us-east-2-045749248414",
          Key: file,
          Range: range,
        })
          .createReadStream()
          .pipe(res);
        console.log("got object from s3 and created readstream");
      } else {
        console.log(req);
        res.writeHead(200, {
          "Cache-Control": "max-age=" + cache + ", private",
          "Content-Length": data.Contents[0].Size,
          "Last-Modified": data.Contents[0].LastModified,
          "Content-Type": mimetype,
        });
        s3.getObject({
          Bucket: "elasticbeanstalk-us-east-2-045749248414",
          Key: file,
        })
          .createReadStream()
          .pipe(res);
        console.log("fell into else statement, wrote header");
      }
    }
  );
});

app.get("/works-in-chrome-and-safari", (req, res) => {
  // Listing 3.
  var s3 = new AWS.S3();
  const mimetype = "video/mp4";
  const file = "Firstview_high.mp4";
  const cache = 0;
  console.log("const mimetype, file, and cache declared");

  const options = {};

  let start;
  let end;

  const range = req.headers.range;
  if (range) {
    const bytesPrefix = "bytes=";
    if (range.startsWith(bytesPrefix)) {
      const bytesRange = range.substring(bytesPrefix.length);
      const parts = bytesRange.split("-");
      if (parts.length === 2) {
        const rangeStart = parts[0] && parts[0].trim();
        if (rangeStart && rangeStart.length > 0) {
          options.start = start = parseInt(rangeStart);
        }
        const rangeEnd = parts[1] && parts[1].trim();
        if (rangeEnd && rangeEnd.length > 0) {
          options.end = end = parseInt(rangeEnd);
        }
      }
    }
  }

  res.setHeader("content-type", "video/mp4");
  console.log("Reach to pass");
  s3.listObjectsV2(
    {
      Bucket: "elasticbeanstalk-us-east-2-045749248414",
      MaxKeys: 1,
      Prefix: file,
    },
    function (err, data) {
      if (err) {
        console.error(`File stat error for ${filePath}.`);
        console.error(err);
        res.sendStatus(500);
        return;
      }

      console.log("Reach to Size");

      let contentLength = data.Contents[0].Size;

      // Listing 4.
      if (req.method === "HEAD") {
        res.statusCode = 200;
        res.setHeader("accept-ranges", "bytes");
        res.setHeader("content-length", contentLength);
        res.end();
      } else {
        // Listing 5.
        let retrievedLength;
        if (start !== undefined && end !== undefined) {
          retrievedLength = end + 1 - start;
        } else if (start !== undefined) {
          retrievedLength = contentLength - start;
        } else if (end !== undefined) {
          retrievedLength = end + 1;
        } else {
          retrievedLength = contentLength;
        }

        // Listing 6.
        res.statusCode = start !== undefined || end !== undefined ? 206 : 200;

        res.setHeader("content-length", retrievedLength);

        if (range !== undefined) {
          res.setHeader(
            "content-range",
            `bytes ${start || 0}-${end || contentLength - 1}/${contentLength}`
          );
          res.setHeader("accept-ranges", "bytes");
        }

        // Listing 7.
        s3.getObject({
          Bucket: "elasticbeanstalk-us-east-2-045749248414",
          Key: file,
          Range: range,
        })
          .createReadStream()
          .pipe(res);
      }
    }
  );
});

app.get("/works-in-chrome-and-safari1", (req, res) => {
  // Listing 3.
  const options = {};

  let start;
  let end;

  const range = req.headers.range;
  if (range) {
    const bytesPrefix = "bytes=";
    if (range.startsWith(bytesPrefix)) {
      const bytesRange = range.substring(bytesPrefix.length);
      const parts = bytesRange.split("-");
      if (parts.length === 2) {
        const rangeStart = parts[0] && parts[0].trim();
        if (rangeStart && rangeStart.length > 0) {
          options.start = start = parseInt(rangeStart);
        }
        const rangeEnd = parts[1] && parts[1].trim();
        if (rangeEnd && rangeEnd.length > 0) {
          options.end = end = parseInt(rangeEnd);
        }
      }
    }
  }

  res.setHeader("content-type", "video/mp4");

  fs.stat(filePath, (err, stat) => {
    if (err) {
      console.error(`File stat error for ${filePath}.`);
      console.error(err);
      res.sendStatus(500);
      return;
    }

    let contentLength = stat.size;

    // Listing 4.
    if (req.method === "HEAD") {
      res.statusCode = 200;
      res.setHeader("accept-ranges", "bytes");
      res.setHeader("content-length", contentLength);
      res.end();
    } else {
      // Listing 5.
      let retrievedLength;
      if (start !== undefined && end !== undefined) {
        retrievedLength = end + 1 - start;
      } else if (start !== undefined) {
        retrievedLength = contentLength - start;
      } else if (end !== undefined) {
        retrievedLength = end + 1;
      } else {
        retrievedLength = contentLength;
      }

      // Listing 6.
      res.statusCode = start !== undefined || end !== undefined ? 206 : 200;

      res.setHeader("content-length", retrievedLength);

      if (range !== undefined) {
        res.setHeader(
          "content-range",
          `bytes ${start || 0}-${end || contentLength - 1}/${contentLength}`
        );
        res.setHeader("accept-ranges", "bytes");
      }

      // Listing 7.
      const fileStream = fs.createReadStream(filePath, options);
      fileStream.on("error", (error) => {
        console.log(`Error reading file ${filePath}.`);
        console.log(error);
        res.sendStatus(500);
      });

      fileStream.pipe(res);
    }
  });
});

app.get("/works-in-chrome-and-safari2", (req, res) => {
  // Listing 3.
  var s3 = new AWS.S3();
  const mimetype = "video/mp4";
  const cache = 0;
  let start;
  let end;
  const options = {};

  const range = req.headers.range;
  if (range) {
    const bytesPrefix = "bytes=";
    if (range.startsWith(bytesPrefix)) {
      const bytesRange = range.substring(bytesPrefix.length);
      const parts = bytesRange.split("-");
      if (parts.length === 2) {
        const rangeStart = parts[0] && parts[0].trim();
        if (rangeStart && rangeStart.length > 0) {
          options.start = start = parseInt(rangeStart);
        }
        const rangeEnd = parts[1] && parts[1].trim();
        if (rangeEnd && rangeEnd.length > 0) {
          options.end = end = parseInt(rangeEnd);
        }
      }
    }
  }

  res.setHeader("content-type", "video/mp4");

  s3.listObjectsV2(
    {
      Bucket: "elasticbeanstalk-us-east-2-045749248414",
      MaxKeys: 1,
      Prefix: filename,
    },
    function (err, data) {
      if (err) {
        return res.status(400).send(err);
      }

      console.log("made request to s3 to list objects");
      console.log(data);
      console.log(req.header.range);
      if (req != null && req.headers.range != null) {
        // console.log(req);
        var range = req.headers.range;
        console.log(range);
        var bytes = range.replace(/bytes=/, "").split("-");
        var start = parseInt(bytes[0], 10);
        var total = data.Contents[0].Size;
        var end = bytes[1] ? parseInt(bytes[1], 10) : total - 1;

        var chunksize = end - start + 1;

        if (start !== undefined && end !== undefined) {
          chunksize = end + 1 - start;
        } else if (start !== undefined) {
          chunksize = total - start;
        } else if (end !== undefined) {
          chunksize = end + 1;
        } else {
          chunksize = total;
        }

        console.log("declared range, bytes, start, total, end, chunksize vars");

        res.writeHead(206, {
          "Content-Range": "bytes " + start + "-" + end + "/" + total,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Accept-Encoding": "Identity",
          "Last-Modified": data.Contents[0].LastModified,
          "Content-Type": mimetype,
          "Content-Disposition": "inline",
          Connection: "keep-alive",
        });
        console.log("wrote header");
        s3.getObject({
          Bucket: "elasticbeanstalk-us-east-2-045749248414",
          Key: filename,
          Range: range,
        })
          .createReadStream()
          .pipe(res);
        console.log("got object from s3 and created readstream");
      } else {
        // console.log(req);
        res.writeHead(200, {
          "Cache-Control": "max-age=" + cache + ", private",
          "Content-Length": data.Contents[0].Size,
          "Last-Modified": data.Contents[0].LastModified,
          "Content-Type": mimetype,
        });
        s3.getObject({
          Bucket: "elasticbeanstalk-us-east-2-045749248414",
          Key: filename,
        })
          .createReadStream()
          .pipe(res);
        console.log("fell into else statement, wrote header");
      }
    }
  );
});

app.get("/works-in-chrome-and-safari3", (req, res) => {
  // Listing 3.
  var s3 = new AWS.S3();
  const mimetype = "video/mp4";
  const cache = 0;
  let start;
  let end;
  const options = {};

  const range = req.headers.range;
  if (range) {
    const bytesPrefix = "bytes=";
    if (range.startsWith(bytesPrefix)) {
      const bytesRange = range.substring(bytesPrefix.length);
      const parts = bytesRange.split("-");
      if (parts.length === 2) {
        const rangeStart = parts[0] && parts[0].trim();
        if (rangeStart && rangeStart.length > 0) {
          options.start = start = parseInt(rangeStart);
        }
        const rangeEnd = parts[1] && parts[1].trim();
        if (rangeEnd && rangeEnd.length > 0) {
          options.end = end = parseInt(rangeEnd);
        }
      }
    }
  }

  res.setHeader("content-type", "video/mp4");

  s3.listObjectsV2(
    {
      Bucket: "elasticbeanstalk-us-east-2-045749248414",
      MaxKeys: 1,
      Prefix: filename,
    },
    function (err, data) {
      if (err) {
        return res.status(400).send(err);
      }

      console.log("made request to s3 to list objects");
      console.log(data);
      console.log(req.header.range);
      if (req != null && req.headers.range != null) {
        // console.log(req);
        s3.headObject(
          {
            Bucket: "elasticbeanstalk-us-east-2-045749248414",
            Key: filename,
          },
          function (err, data) {
            if (err) {
              // an error occurred
              console.error(err);
              return res.status(500).send("returning err");
            }

            const videoSize = Number(data.ContentLength);
            const CHUNK_SIZE = 10 ** 6; // 1MB
            const start = Number(range.replace(/\D/g, ""));
            const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

            var params = {
              Bucket: "elasticbeanstalk-us-east-2-045749248414",
              Key: filename,
              Range: range,
            };
            var stream = s3.getObject(params).createReadStream();

            res.status(206);
            res.set("Content-Type", data.ContentType);
            res.set("Content-Disposition", "inline");
            res.set("Accept-Ranges", "bytes");
            res.set("Accept-Encoding", "Identity");
            res.set(
              "Content-Range",
              "bytes " + start + "-" + end + "/" + videoSize
            );
            res.set("Content-Length", data.ContentLength);
            res.set(
              "X-Playback-Session-Id",
              req.header("X-Playback-Session-Id")
            ); // Part of the attempt to fix
            res.set("Connection", "keep-alive");
            res.set("Last-Modified", data.LastModified);
            res.set("ETag", data.ETag);
            stream.pipe(res);
          }
        );
      } else {
        // console.log(req);
        res.writeHead(200, {
          "Cache-Control": "max-age=" + cache + ", private",
          "Content-Length": data.Contents[0].Size,
          "Last-Modified": data.Contents[0].LastModified,
          "Content-Type": mimetype,
        });
        s3.getObject({
          Bucket: "elasticbeanstalk-us-east-2-045749248414",
          Key: filename,
        })
          .createReadStream()
          .pipe(res);
        console.log("fell into else statement, wrote header");
      }
    }
  );
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("started");
});
