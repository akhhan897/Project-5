import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
import fetchModel from '../../lib/fetchModelData';
import './userDetail.css';

/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
  }

  componentDidMount() {
    this.loadUser();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.loadUser();
    }
  }

  loadUser() {
    const userId = this.props.match.params.userId;

    fetchModel(`/user/${userId}`)
      .then((response) => {
        this.setState({
          user: response.data,
        });
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
      });
  }

  render() {
    const { user } = this.state;

    if (!user) {
      return (
        <Typography variant="body1">
          Loading user details...
        </Typography>
      );
    }

    return (
      <div className="user-detail">
        <Typography variant="h4" className="user-name">
          {user.first_name} {user.last_name}
        </Typography>

        <Typography variant="body1" className="user-info">
          <strong>Location:</strong> {user.location}
        </Typography>

        <Typography variant="body1" className="user-info">
          <strong>Occupation:</strong> {user.occupation}
        </Typography>

        <Typography variant="body1" className="user-info">
          <strong>Description:</strong> {user.description}
        </Typography>

        <Button
          variant="contained"
          component={Link}
          to={`/photos/${user._id}`}
          className="photos-button"
        >
          View Photos
        </Button>
      </div>
    );
  }
}

export default UserDetail;