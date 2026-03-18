import React from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';
import fetchModel from '../../lib/fetchModelData';
import './userPhotos.css';

/**
 * Define UserPhotos, a React component of project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
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

    fetchModel(`/photosOfUser/${userId}`)
      .then((response) => {
        this.setState({
          photos: response.data,
        });
      })
      .catch((error) => {
        console.error('Error fetching photos:', error);
      });
  }

  render() {
    const { photos } = this.state;

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
                      <Link
                        to={`/users/${comment.user._id}`}
                        className="comment-user-link"
                      >
                        {comment.user.first_name} {comment.user.last_name}
                      </Link>
                      : {comment.comment}
                    </Typography>
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