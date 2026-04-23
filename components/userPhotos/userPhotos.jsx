import React from "react";
import { Link } from "react-router-dom";
import { Typography } from "@mui/material";
import fetchModel from "../../lib/fetchModelData";
import "./userPhotos.css";

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      loading: true,
      error: "",
      commentInputs: {},
      postingComment: false,
      selectedPhotoFile: null,
      uploadingPhoto: false,
      uploadError: "",
    };

    this.fileInputRef = React.createRef();
    this.loadPhotos = this.loadPhotos.bind(this);
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    this.handlePhotoFileChange = this.handlePhotoFileChange.bind(this);
    this.handlePhotoUpload = this.handlePhotoUpload.bind(this);
  }

  componentDidMount() {
    this.loadPhotos();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.loadPhotos();
    }
  }

  loadPhotos() {
    const userId = this.props.match.params.userId;

    this.setState({
      photos: [],
      loading: true,
      error: "",
    });

    fetchModel(`/photosOfUser/${userId}`)
      .then((response) => {
        this.setState({
          photos: response.data || [],
          loading: false,
        });
      })
      .catch((error) => {
        console.error("Error fetching photos:", error);
        this.setState({
          loading: false,
          error: "Unable to load photos.",
        });
      });
  }

  handleCommentChange(photoId, value) {
    this.setState((prevState) => ({
      commentInputs: {
        ...prevState.commentInputs,
        [photoId]: value,
      },
    }));
  }

  handleCommentSubmit(photoId) {
    const commentText = this.state.commentInputs[photoId];

    if (!commentText || commentText.trim() === "") {
      alert("Comment cannot be empty.");
      return;
    }

    if (!this.props.currentUser || !this.props.currentUser._id) {
      alert("Current user not found. Make sure login/currentUser is set up.");
      return;
    }

    this.setState({ postingComment: true });

    fetch(`/commentsOfPhoto/${photoId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: commentText.trim(),
        user_id: this.props.currentUser._id,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text || "Failed to post comment");
          });
        }
        return response.json();
      })
      .then((newComment) => {
        this.setState((prevState) => ({
          photos: prevState.photos.map((photo) => {
            if (photo._id === photoId) {
              return {
                ...photo,
                comments: [...(photo.comments || []), newComment],
              };
            }
            return photo;
          }),
          commentInputs: {
            ...prevState.commentInputs,
            [photoId]: "",
          },
          postingComment: false,
        }));
      })
      .catch((error) => {
        console.error("Error posting comment:", error);
        this.setState({ postingComment: false });
        alert("Failed to post comment.");
      });
  }

  handlePhotoFileChange(event) {
    this.setState({
      selectedPhotoFile: event.target.files[0] || null,
      uploadError: "",
    });
  }

  handlePhotoUpload(event) {
    event.preventDefault();

    const { selectedPhotoFile } = this.state;

    if (!selectedPhotoFile) {
      this.setState({ uploadError: "Please choose a photo to upload." });
      return;
    }

    const formData = new FormData();
    formData.append("uploadedphoto", selectedPhotoFile);

    this.setState({
      uploadingPhoto: true,
      uploadError: "",
    });

    fetch("/photos/new", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text || "Failed to upload photo");
          });
        }
        return response.json();
      })
      .then(() => {
        if (this.fileInputRef.current) {
          this.fileInputRef.current.value = "";
        }

        this.setState(
          {
            selectedPhotoFile: null,
            uploadingPhoto: false,
          },
          this.loadPhotos
        );
      })
      .catch((error) => {
        console.error("Error uploading photo:", error);
        this.setState({
          uploadingPhoto: false,
          uploadError: error.message || "Failed to upload photo.",
        });
      });
  }

  render() {
    const {
      photos,
      loading,
      error,
      commentInputs,
      postingComment,
      selectedPhotoFile,
      uploadingPhoto,
      uploadError,
    } = this.state;

    if (loading) {
      return <Typography variant="body1">Loading photos...</Typography>;
    }

    if (error) {
      return <Typography variant="body1">{error}</Typography>;
    }

    return (
      <div className="user-photos">
        <form className="photo-upload-form" onSubmit={this.handlePhotoUpload}>
          <input
            ref={this.fileInputRef}
            type="file"
            accept="image/*"
            onChange={this.handlePhotoFileChange}
            className="photo-upload-input"
          />
          <button
            type="submit"
            className="photo-upload-button"
            disabled={!selectedPhotoFile || uploadingPhoto}
          >
            {uploadingPhoto ? "Uploading..." : "Upload Photo"}
          </button>
          {uploadError && (
            <Typography variant="body2" className="photo-upload-error">
              {uploadError}
            </Typography>
          )}
        </form>

        {photos.map((photo) => (
          <div key={photo._id} className="photo-card">
            <img
              src={`/images/${photo.file_name}`}
              alt="user upload"
              className="photo-image"
            />

            <Typography variant="body2" className="photo-date">
              {new Date(photo.date_time).toLocaleString()}
            </Typography>

            <div className="photo-comments">
              <Typography variant="subtitle1" className="comments-title">
                Comments
              </Typography>

              {photo.comments && photo.comments.length > 0 ? (
                photo.comments.map((comment) => (
                  <div key={comment._id} className="comment-card">
                    <Typography variant="body2" className="comment-date">
                      {new Date(comment.date_time).toLocaleString()}
                    </Typography>

                    <Typography variant="body1" className="comment-text">
                      {comment.user ? (
                        <Link
                          to={`/users/${comment.user._id}`}
                          className="comment-user-link"
                        >
                          {comment.user.first_name} {comment.user.last_name}
                        </Link>
                      ) : (
                        <span className="comment-user-link">Unknown User</span>
                      )}
                      : {comment.comment}
                    </Typography>
                  </div>
                ))
              ) : (
                <Typography variant="body2">No comments</Typography>
              )}

              <div className="comment-section">
                <textarea
                  className="comment-input"
                  placeholder="Write a comment..."
                  value={commentInputs[photo._id] || ""}
                  onChange={(e) =>
                    this.handleCommentChange(photo._id, e.target.value)
                  }
                />
                <button
                  className="comment-button"
                  onClick={() => this.handleCommentSubmit(photo._id)}
                  disabled={postingComment}
                >
                  {postingComment ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default UserPhotos;
