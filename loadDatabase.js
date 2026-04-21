/**
 * This Node.js program loads the Project 6 model data into Mongoose
 * defined objects in a MongoDB database. It can be run with the command:
 *     node loadDatabase.js
 * be sure to have an instance of the MongoDB running on the localhost.
 *
 * This script loads the data into the MongoDB database named 'project6'.
 * In loads into collections named User and Photos. The Comments are added in
 * the Photos of the comments. Any previous objects in those collections is
 * discarded.
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const models = require("./modelData/photoApp.js").models;

const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

const versionString = "1.0";

async function loadDatabase() {
  try {
    await User.deleteMany({});
    await Photo.deleteMany({});
    await SchemaInfo.deleteMany({});

    const userModels = models.userListModel();
    const mapFakeId2RealId = {};

    await Promise.all(
      userModels.map(async function (user) {
        const userObj = await User.create({
          first_name: user.first_name,
          last_name: user.last_name,
          location: user.location,
          description: user.description,
          occupation: user.occupation,
          login_name: user.last_name.toLowerCase(),
          password: "weak",
        });

        mapFakeId2RealId[user._id] = userObj._id;
        user.objectID = userObj._id;

        console.log(
          "Adding user:",
          user.first_name + " " + user.last_name,
          " with ID ",
          user.objectID
        );
      })
    );

    const photoModels = [];
    Object.keys(mapFakeId2RealId).forEach(function (id) {
      photoModels.push(...models.photoOfUserModel(id));
    });

    await Promise.all(
      photoModels.map(async function (photo) {
        const comments = (photo.comments || []).map(function (comment) {
          console.log(
            "Adding comment of length %d by user %s to photo %s",
            comment.comment.length,
            comment.user.objectID,
            photo.file_name
          );

          return {
            comment: comment.comment,
            date_time: comment.date_time,
            user_id: comment.user.objectID,
          };
        });

        const photoObj = await Photo.create({
          file_name: photo.file_name,
          date_time: photo.date_time,
          user_id: mapFakeId2RealId[photo.user_id],
          comments: comments,
        });

        photo.objectID = photoObj._id;

        console.log(
          "Adding photo:",
          photo.file_name,
          " of user ID ",
          photoObj.user_id
        );
      })
    );

    const schemaInfo = await SchemaInfo.create({
      version: versionString,
    });

    console.log(
      "SchemaInfo object created with version ",
      schemaInfo.version
    );
    console.log("loadDatabase Completed");

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error loading database:", err);
    await mongoose.disconnect();
  }
}

loadDatabase();
