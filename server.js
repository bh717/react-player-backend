import express from "express";
import cors from "cors";
import AWS from "aws-sdk";

const app = express();

app.use("/", express.static("public"));
app.use(cors());

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
        console.log("declared range, bytes, start, total, end, chunksize vars");

        res.writeHead(206, {
          "Content-Range": "bytes " + start + "-" + end + "/" + total,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Accept-Encoding": "Identity",
          "Last-Modified": data.Contents[0].LastModified,
          "Content-Type": mimetype,
          "Content-Disposition": "inline",
          "Connection": "keep-alive",
          'ETag' : data.Contents[0].ETag
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("started");
});
