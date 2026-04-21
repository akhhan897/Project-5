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
const bodyParser = require("body-parser");

const express = require("express");
const session = require("express-session");
const multer = require("multer");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const upload = multer({ storage: multer.memoryStorage() });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "photo-share-session-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(async function (request, response, next) {
  if (!request.session || !request.session.userId) {
    request.user = null;
    next();
    return;
  }

  try {
    const user = await User.findById(request.session.userId);

    if (!user) {
      request.session.userId = undefined;
      request.user = null;
      next();
      return;
    }

    request.user = user;
    next();
  } catch (err) {
    next(err);
  }
});

app.use(express.static(__dirname));

function filterUser(user) {
  const userObj = user.toObject ? user.toObject() : user;

  return {
    _id: userObj._id,
    first_name: userObj.first_name,
    last_name: userObj.last_name,
    location: userObj.location,
    description: userObj.description,
    occupation: userObj.occupation,
    login_name: userObj.login_name,
  };
}

function isAuthenticated(request, response, next) {
  if (!request.session || !request.session.userId) {
    response.status(401).send("Unauthorized");
    return;
  }

  next();
}

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

app.post("/admin/login", upload.none(), function (request, response) {
  const loginName = request.body && request.body.login_name;
  const password = request.body && request.body.password;

  if (!loginName || !password) {
    response.status(400).send("Missing login credentials");
    return;
  }

  User.findOne({ login_name: loginName }, function (err, user) {
    if (err) {
      console.error("Error during login:", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }

    if (!user || user.password !== password) {
      response.status(400).send("Invalid login credentials");
      return;
    }

    request.session.userId = user._id;
    response.status(200).json(filterUser(user));
  });
});

app.post("/admin/logout", function (request, response) {
  if (!request.session) {
    response.status(200).json({ message: "Logged out" });
    return;
  }

  request.session.destroy(function (err) {
    if (err) {
      console.error("Error during logout:", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }

    response.clearCookie("connect.sid");
    response.status(200).json({ message: "Logged out" });
  });
});

app.get("/user/list", isAuthenticated, function (request, response) {
  User.find({}, "_id first_name last_name", function (err, users) {
    if (err) {
      console.error("Error fetching user list:", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }
    response.status(200).json(users);
  });
});

app.get("/user/:id", isAuthenticated, function (request, response) {
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

app.get("/photosOfUser/:id", isAuthenticated, async function (request, response) {
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
              user: commentUser
                ? {
                    _id: commentUser._id,
                    first_name: commentUser.first_name,
                    last_name: commentUser.last_name,
                  }
                : null,
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

app.post("/commentsOfPhoto/:photo_id", async function (request, response) {
  const photoId = request.params.photo_id;
  const commentText = request.body.comment;
  const userId = request.body.user_id;

  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    response.status(400).send("Bad photo id");
    return;
  }

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    response.status(400).send("Bad user id");
    return;
  }

  if (!commentText || commentText.trim() === "") {
    response.status(400).send("Comment cannot be empty");
    return;
  }

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      response.status(404).send("Photo not found");
      return;
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      response.status(404).send("User not found");
      return;
    }

    const newComment = {
      comment: commentText.trim(),
      date_time: new Date(),
      user_id: userId,
    };

    photo.comments.push(newComment);
    await photo.save();

    const savedComment = photo.comments[photo.comments.length - 1];

    response.status(200).json({
      _id: savedComment._id,
      comment: savedComment.comment,
      date_time: savedComment.date_time,
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (err) {
    console.error("Error posting comment:", err);
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
