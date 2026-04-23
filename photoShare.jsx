import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import {
  HashRouter,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import { Grid, Typography, Paper } from "@mui/material";
import "./styles/main.css";

import TopBar from "./components/topBar/TopBar";
import LoginRegister from "./components/loginRegister/loginRegister";
import UserDetail from "./components/userDetail/userDetail";
import UserList from "./components/userList/userList";
import UserPhotos from "./components/userPhotos/userPhotos";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      authChecked: false,
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    axios
      .get("/admin/current")
      .then((response) => {
        this.setState({
          currentUser: response.data,
          authChecked: true,
        });
      })
      .catch(() => {
        this.setState({
          currentUser: null,
          authChecked: true,
        });
      });
  }

  handleLogin(user) {
    this.setState({
      currentUser: user,
    });
  }

  handleLogout() {
    return axios.post("/admin/logout").finally(() => {
      this.setState({
        currentUser: null,
      });
    });
  }

  render() {
    const { currentUser, authChecked } = this.state;

    return (
      <HashRouter>
        <Route
          render={(routeProps) => (
            <div>
              <TopBar
                {...routeProps}
                currentUser={currentUser}
                onLogout={this.handleLogout}
              />
              <div className="main-topbar-buffer" />

              {!authChecked ? (
                <Grid container spacing={2} className="main-grid-container">
                  <Grid item xs={12}>
                    <Paper className="main-grid-item main-right-grid-item">
                      <Typography variant="h6" className="home-welcome">
                        Loading...
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              ) : currentUser ? (
                <Grid container spacing={2} className="main-grid-container">
                  <Grid item xs={12} sm={3}>
                    <Paper className="main-grid-item">
                      <UserList />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={9}>
                    <Paper className="main-grid-item main-right-grid-item">
                      <Switch>
                        <Route exact path="/">
                          <Redirect to={`/users/${currentUser._id}`} />
                        </Route>

                        <Route exact path="/login-register">
                          <Redirect to={`/users/${currentUser._id}`} />
                        </Route>

                        <Route exact path="/users">
                          <Redirect to={`/users/${currentUser._id}`} />
                        </Route>

                        <Route
                          path="/users/:userId"
                          render={(props) => <UserDetail {...props} />}
                        />

                        <Route
                          path="/photos/:userId"
                          render={(props) => <UserPhotos {...props} />}
                        />

                        <Route>
                          <Redirect to={`/users/${currentUser._id}`} />
                        </Route>
                      </Switch>
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2} className="main-grid-container">
                  <Grid item xs={12}>
                    <Paper className="main-grid-item main-right-grid-item">
                      <Switch>
                        <Route
                          exact
                          path="/login-register"
                          render={(props) => (
                            <LoginRegister
                              {...props}
                              onLogin={this.handleLogin}
                            />
                          )}
                        />

                        <Route>
                          <Redirect to="/login-register" />
                        </Route>
                      </Switch>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </div>
          )}
        />
      </HashRouter>
    );
  }
}

ReactDOM.render(
  <PhotoShare />,
  document.getElementById("photoshareapp")
);
