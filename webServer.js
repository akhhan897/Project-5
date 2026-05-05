/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch their reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");
const app = express();

const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

app.get("/test/:p1", function (request, response) {
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    response.status(400).send("Bad param " + param);
  }
});

app.get("/user/list", function (request, response) {
  User.find({}, "_id first_name last_name", function (err, users) {
    if (err) {
      console.error("Error fetching user list:", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }
    response.status(200).json(users);
  });
});

app.get("/user/:id", function (request, response) {
  const id = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).send("Bad user id");
    return;
  }

  User.findById(
    id,
    "_id first_name last_name location description occupation",
    function (err, user) {
      if (err) {
        console.error("Error fetching user:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (!user) {
        console.log("User with _id:" + id + " not found.");
        response.status(400).send("Not found");
        return;
      }
      response.status(200).json(user);
    }
  );
});

app.get("/photosOfUser/:id", async function (request, response) {
  const id = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).send("Bad user id");
    return;
  }

  try {
    const user = await User.findById(id).lean();

    if (!user) {
      response.status(400).send("User not found");
      return;
    }

    const photos = await Photo.find({ user_id: id }).lean();

    const result = await Promise.all(
      photos.map(async function (photo) {
        const comments = await Promise.all(
          (photo.comments || []).map(async function (comment) {
            const commentUser = await User.findById(comment.user_id).lean();

            return {
              _id: comment._id,
              comment: comment.comment,
              date_time: comment.date_time,
              user: {
                _id: commentUser._id,
                first_name: commentUser.first_name,
                last_name: commentUser.last_name,
              },
            };
          })
        );

        return {
          _id: photo._id,
          user_id: photo.user_id,
          comments: comments,
          file_name: photo.file_name,
          date_time: photo.date_time,
        };
      })
    );

    response.status(200).json(result);
  } catch (err) {
    console.error("Error fetching photos of user:", err);
    response.status(500).send(JSON.stringify(err));
  }
});

app.delete("/comments/:comment_id", async function (request, response) {
  const commentId = request.params.comment_id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    response.status(400).send("Bad comment id");
    return;
  }

  try {
    const photo = await Photo.findOne({ "comments._id": commentId });

    if (!photo) {
      response.status(404).send("Comment not found");
      return;
    }

    photo.comments = photo.comments.filter(function (comment) {
      return comment._id.toString() !== commentId;
    });

    await photo.save();

    response.status(200).send("Comment deleted");
  } catch (err) {
    console.error("Error deleting comment:", err);
    response.status(500).send(JSON.stringify(err));
  }
});

app.delete("/photos/:photo_id", async function (request, response) {
  const photoId = request.params.photo_id;

  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    response.status(400).send("Bad photo id");
    return;
  }

  try {
    const photo = await Photo.findById(photoId);

    if (!photo) {
      response.status(404).send("Photo not found");
      return;
    }

    await Photo.deleteOne({ _id: photoId });

    response.status(200).send("Photo deleted");
  } catch (err) {
    console.error("Error deleting photo:", err);
    response.status(500).send(JSON.stringify(err));
  }
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});