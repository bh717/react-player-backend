import express from "express";
import cors from "cors";
import AWS from "aws-sdk";
import fs from "fs";
const app = express();

app.use("/", express.static("public"));
app.use(cors());

const filePath = "./Firstview_high.mp4";

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
  // const file = "https://elasticbeanstalk-us-east-2-045749248414.s3.amazonaws.com/1665446699465";
  const file = "1665446699465";
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
          ETag: data.Contents[0].ETag,
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
  const file = "1665446699465";
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("started");
});
