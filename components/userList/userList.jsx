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
    };
  }

  componentDidMount() {
    fetchModel("/user/list")
      .then((result) => {
        this.setState({ users: result.data });
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  }

  render() {
    const { users } = this.state;

    return (
      <Paper elevation={3} className="user-list-container">
        <Typography variant="h6" className="user-list-title">
          Users
        </Typography>
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
      </Paper>
    );
  }
}

export default UserList;
