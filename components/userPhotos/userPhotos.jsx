import React from "react";
import { Link } from "react-router-dom";
import { Typography, Button, TextField } from "@mui/material";
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
      commentErrors: {},
      submittingComments: {},
    };

    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.handleAddComment = this.handleAddComment.bind(this);
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
      commentInputs: {},
      commentErrors: {},
      submittingComments: {},
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
      commentErrors: {
        ...prevState.commentErrors,
        [photoId]: "",
      },
    }));
  }

  async handleAddComment(photoId) {
    const commentText = (this.state.commentInputs[photoId] || "").trim();

    if (!commentText) {
      this.setState((prevState) => ({
        commentErrors: {
          ...prevState.commentErrors,
          [photoId]: "Comment cannot be empty.",
        },
      }));
      return;
    }

    this.setState((prevState) => ({
      commentErrors: {
        ...prevState.commentErrors,
        [photoId]: "",
      },
      submittingComments: {
        ...prevState.submittingComments,
        [photoId]: true,
      },
    }));

    try {
      const response = await fetch(`/commentsOfPhoto/${photoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: commentText }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          (data && data.message) || "Unable to add comment."
        );
      }

      this.setState((prevState) => ({
        photos: prevState.photos.map((photo) =>
          photo._id === photoId
            ? {
                ...photo,
                comments: [...(photo.comments || []), data],
              }
            : photo
        ),
        commentInputs: {
          ...prevState.commentInputs,
          [photoId]: "",
        },
        commentErrors: {
          ...prevState.commentErrors,
          [photoId]: "",
        },
        submittingComments: {
          ...prevState.submittingComments,
          [photoId]: false,
        },
      }));
    } catch (error) {
      console.error("Error adding comment:", error);
      this.setState((prevState) => ({
        commentErrors: {
          ...prevState.commentErrors,
          [photoId]: error.message || "Unable to add comment.",
        },
        submittingComments: {
          ...prevState.submittingComments,
          [photoId]: false,
        },
      }));
    }
  }

  render() {
    const {
      photos,
      loading,
      error,
      commentInputs,
      commentErrors,
      submittingComments,
    } = this.state;

    if (loading) {
      return <Typography variant="body1">Loading photos...</Typography>;
    }

    if (error) {
      return <Typography variant="body1">{error}</Typography>;
    }

    return (
      <div className="user-photos">
        {photos.map((photo) => (
          <div key={photo._id} className="photo-card">
            <img
              src={`/images/${photo.file_name}`}
              alt="user upload"
              className="photo-image"
            />

            <Typography variant="body2" className="photo-date">
              {photo.date_time}
            </Typography>

            <div className="photo-comments">
              <Typography variant="subtitle1" className="comments-title">
                Comments
              </Typography>

              {photo.comments && photo.comments.length > 0 ? (
                photo.comments.map((comment) => (
                  <div key={comment._id} className="comment-card">
                    <Typography variant="body2" className="comment-date">
                      {comment.date_time}
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
            </div>

            <TextField
              fullWidth
              margin="normal"
              label="Add a comment"
              value={commentInputs[photo._id] || ""}
              onChange={(event) =>
                this.handleCommentChange(photo._id, event.target.value)
              }
              error={Boolean(commentErrors[photo._id])}
              helperText={commentErrors[photo._id] || ""}
            />

            <Button
              variant="contained"
              onClick={() => this.handleAddComment(photo._id)}
              disabled={Boolean(submittingComments[photo._id])}
            >
              Add Comment
            </Button>
          </div>
        ))}
      </div>
    );
  }
}

export default UserPhotos;
