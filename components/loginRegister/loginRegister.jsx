import React, { useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import "./loginRegister.css";

function getErrorMessage(err, fallbackMessage) {
  if (err.response && typeof err.response.data === "string" && err.response.data) {
    return err.response.data;
  }

  if (err.response && err.response.data && err.response.data.message) {
    return err.response.data.message;
  }

  return fallbackMessage;
}

function LoginRegister(props) {
  const { onLogin, history } = props;
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const [registerLoginName, setRegisterLoginName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [occupation, setOccupation] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoginSubmitting(true);
    setLoginError("");

    try {
      const response = await axios.post("/admin/login", {
        login_name: loginName,
        password,
      });

      onLogin(response.data);
      history.push(`/users/${response.data._id}`);
    } catch (err) {
      setLoginError(getErrorMessage(err, "Invalid login credentials."));
    } finally {
      setLoginSubmitting(false);
    }
  };

  const clearRegistrationForm = () => {
    setRegisterLoginName("");
    setRegisterPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setLocation("");
    setDescription("");
    setOccupation("");
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");

    if (registerPassword !== confirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }

    setRegisterSubmitting(true);

    try {
      await axios.post("/user", {
        login_name: registerLoginName,
        password: registerPassword,
        first_name: firstName,
        last_name: lastName,
        location,
        description,
        occupation,
      });

      clearRegistrationForm();
      setRegisterSuccess("Registration successful. You can now log in.");
    } catch (err) {
      setRegisterError(
        getErrorMessage(err, "Registration failed. Please try again.")
      );
    } finally {
      setRegisterSubmitting(false);
    }
  };

  return (
    <Box className="login-register-page">
      <Paper elevation={3} className="login-register-card">
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>

        <Typography variant="body1" className="login-register-intro">
          Sign in to access the Photo Sharing App.
        </Typography>

        <Box component="form" onSubmit={handleLoginSubmit}>
          <Stack spacing={2}>
            {loginError ? <Alert severity="error">{loginError}</Alert> : null}

            <TextField
              label="Login Name"
              value={loginName}
              onChange={(event) => setLoginName(event.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loginSubmitting}
            >
              {loginSubmitting ? "Logging In..." : "Login"}
            </Button>
          </Stack>
        </Box>

        <Divider className="login-register-divider" />

        <Typography variant="h5" gutterBottom>
          Register
        </Typography>

        <Typography variant="body1" className="login-register-intro">
          Create a new account below.
        </Typography>

        <Box component="form" onSubmit={handleRegisterSubmit}>
          <Stack spacing={2}>
            {registerError ? <Alert severity="error">{registerError}</Alert> : null}
            {registerSuccess ? (
              <Alert severity="success">{registerSuccess}</Alert>
            ) : null}

            <TextField
              label="Login Name"
              value={registerLoginName}
              onChange={(event) => setRegisterLoginName(event.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={registerPassword}
              onChange={(event) => setRegisterPassword(event.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              fullWidth
            />

            <TextField
              label="First Name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Last Name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              fullWidth
              multiline
              minRows={2}
            />

            <TextField
              label="Occupation"
              value={occupation}
              onChange={(event) => setOccupation(event.target.value)}
              required
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              disabled={registerSubmitting}
            >
              {registerSubmitting ? "Registering..." : "Register Me"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginRegister;
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
