import React from 'react';
import { Typography, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import './userDetail.css';
import FetchModel from '../../lib/fetchModelData';

class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
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

    FetchModel(`/user/${userId}`)
      .then((res) => {
        this.setState({ user: res.data });

        if (this.props.setContext) {
          this.props.setContext(
            res.data.first_name + " " + res.data.last_name
          );
        }
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
      });
  }

  render() {
    const { user } = this.state;

    if (!user) {
      return <Typography>Loading user...</Typography>;
    }

    return (
      <Paper style={{ margin: "20px", padding: "20px" }}>
        <Typography variant="h4">
          {user.first_name} {user.last_name}
        </Typography>

        <Typography>
          <strong>Location:</strong> {user.location}
        </Typography>

        <Typography>
          <strong>Occupation:</strong> {user.occupation}
        </Typography>

        <Typography>
          <strong>Description:</strong> {user.description}
        </Typography>

        <Button
          variant="contained"
          component={Link}
          to={`/photos/${user._id}`}
          style={{ marginTop: "20px" }}
        >
          View {user.first_name}'s Photos
        </Button>
      </Paper>
    );
  }
}

export default UserDetail;