import React from "react";
import { Link } from "react-router-dom";
import { Button, Typography } from "@mui/material";
import fetchModel from "../../lib/fetchModelData";
import "./userPhotos.css";

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      loading: true,
      error: "",
    };
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

  handleDeletePhoto(photoId) {
    fetchModel(`/photos/${photoId}`, {
      method: "DELETE",
    })
      .then(() => {
        this.setState((prevState) => ({
          photos: prevState.photos.filter((photo) => photo._id !== photoId),
        }));
      })
      .catch((error) => {
        console.error("Error deleting photo:", error);
        this.setState({
          error: "Unable to delete photo.",
        });
      });
  }

  handleDeleteComment(commentId) {
    fetchModel(`/comments/${commentId}`, {
      method: "DELETE",
    })
      .then(() => {
        this.setState((prevState) => ({
          photos: prevState.photos.map((photo) => ({
            ...photo,
            comments: photo.comments
              ? photo.comments.filter((comment) => comment._id !== commentId)
              : [],
          })),
        }));
      })
      .catch((error) => {
        console.error("Error deleting comment:", error);
        this.setState({
          error: "Unable to delete comment.",
        });
      });
  }

  render() {
    const { photos, loading, error } = this.state;

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

            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => this.handleDeletePhoto(photo._id)}
            >
              Delete Photo
            </Button>

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

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => this.handleDeleteComment(comment._id)}
                    >
                      Delete Comment
                    </Button>
                  </div>
                ))
              ) : (
                <Typography variant="body2">No comments</Typography>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default UserPhotos;