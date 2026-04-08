import React from "react";
import { Link } from "react-router-dom";
import { Typography, Button } from "@mui/material";
import fetchModel from "../../lib/fetchModelData";
import "./userDetail.css";

class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true,
      error: "",
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

    this.setState({
      loading: true,
      error: "",
      user: null,
    });

    fetchModel(`/user/${userId}`)
      .then((response) => {
        this.setState({
          user: response.data,
          loading: false,
        });
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        this.setState({
          loading: false,
          error: "Unable to load user details.",
        });
      });
  }

  render() {
    const { user, loading, error } = this.state;

    if (loading) {
      return <Typography variant="body1">Loading user details...</Typography>;
    }

    if (error) {
      return <Typography variant="body1">{error}</Typography>;
    }

    if (!user) {
      return <Typography variant="body1">User not found.</Typography>;
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