import React from "react";
import { withRouter } from "react-router-dom";
import {
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import "./loginRegister.css";

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login_name: "",
      password: "",
      error: "",
      loading: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  handleLogin(event) {
    event.preventDefault();

    const { login_name, password } = this.state;

    if (!login_name.trim() || !password.trim()) {
      this.setState({
        error: "Please enter both login name and password.",
      });
      return;
    }

    this.setState({
      loading: true,
      error: "",
    });

    fetch("/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login_name: login_name.trim(),
        password: password.trim(),
      }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            (data && data.message) ||
              (typeof data === "string" ? data : "Login failed.")
          );
        }

        return data;
      })
      .then((user) => {
        this.setState({
          loading: false,
          error: "",
          login_name: "",
          password: "",
        });

        if (this.props.onLoginSuccess) {
          this.props.onLoginSuccess(user);
        }

        if (user && user._id) {
          this.props.history.push(`/users/${user._id}`);
        } else {
          this.props.history.push("/");
        }
      })
      .catch((error) => {
        this.setState({
          loading: false,
          error: error.message || "Login failed. Please try again.",
        });
      });
  }

  render() {
    const { login_name, password, error, loading } = this.state;

    return (
      <Paper elevation={3} className="login-register-container">
        <Typography variant="h5" className="login-register-title">
          Please Login
        </Typography>

        <Typography variant="body1" className="login-register-subtitle">
          Enter your login credentials to continue.
        </Typography>

        <form className="login-register-form" onSubmit={this.handleLogin}>
          <TextField
            label="Login Name"
            name="login_name"
            value={login_name}
            onChange={this.handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={this.handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
          />

          {error && (
            <Typography variant="body2" className="login-register-error">
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="login-register-button"
            disabled={loading}
          >
            {loading ? "Logging In..." : "Login"}
          </Button>
        </form>
      </Paper>
    );
  }
}

export default withRouter(LoginRegister);