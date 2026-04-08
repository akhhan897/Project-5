import React from "react";
import { Link } from "react-router-dom";
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Paper,
} from "@mui/material";
import fetchModel from "../../lib/fetchModelData";
import "./userList.css";

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: true,
      error: "",
    };
  }

  componentDidMount() {
    fetchModel("/user/list")
      .then((result) => {
        this.setState({
          users: result.data || [],
          loading: false,
          error: "",
        });
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        this.setState({
          loading: false,
          error: "Unable to load users.",
        });
      });
  }

  render() {
    const { users, loading, error } = this.state;

    return (
      <Paper elevation={3} className="user-list-container">
        <Typography variant="h6" className="user-list-title">
          Users
        </Typography>

        {loading && (
          <Typography className="user-list-message">
            Loading users...
          </Typography>
        )}

        {!loading && error && (
          <Typography className="user-list-message">
            {error}
          </Typography>
        )}

        {!loading && !error && (
          <List component="nav" disablePadding>
            {users.map((user) => (
              <React.Fragment key={user._id}>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to={`/users/${user._id}`}>
                    <ListItemText
                      primary={`${user.first_name} ${user.last_name}`}
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    );
  }
}

export default UserList;