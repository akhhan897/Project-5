import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";
import { Grid, Typography, Paper } from "@mui/material";
import "./styles/main.css";

import TopBar from "./components/topBar/TopBar";
import UserDetail from "./components/userDetail/userDetail";
import UserList from "./components/userList/userList";
import UserPhotos from "./components/userPhotos/userPhotos";

class PhotoShare extends React.Component {
  render() {
    return (
      <HashRouter>
        <div>
          <TopBar />
          <div className="main-topbar-buffer" />

          <Grid container spacing={2} className="main-grid-container">
            <Grid item xs={12} sm={3}>
              <Paper className="main-grid-item">
                <UserList />
              </Paper>
            </Grid>

            <Grid item xs={12} sm={9}>
              <Paper className="main-grid-item main-right-grid-item">
                <Switch>
                  <Route
                    exact
                    path="/"
                    render={() => (
                      <Typography variant="h6" className="home-welcome">
                        Welcome to the Photo Sharing App.
                      </Typography>
                    )}
                  />

                  <Route
                    exact
                    path="/users"
                    component={UserList}
                  />

                  <Route
                    path="/users/:userId"
                    render={(props) => <UserDetail {...props} />}
                  />

                  <Route
                    path="/photos/:userId"
                    render={(props) => <UserPhotos {...props} />}
                  />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(
  <PhotoShare />,
  document.getElementById("photoshareapp")
);