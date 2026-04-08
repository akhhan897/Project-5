import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { withRouter, matchPath } from "react-router-dom";
import "./TopBar.css";
import fetchModel from "../../lib/fetchModelData";

function TopBar(props) {
  const { location } = props;
  const [version, setVersion] = useState("");
  const [context, setContext] = useState("Photo Sharing App");

  useEffect(() => {
    fetchModel("/test/info")
      .then((info) => {
        if (info && info.data && info.data.__v !== undefined) {
          setVersion(info.data.__v);
        }
      })
      .catch((error) => {
        console.error("Error fetching schema info:", error);
      });
  }, []);

  useEffect(() => {
    const userMatch = matchPath(location.pathname, {
      path: "/users/:userId",
      exact: true,
    });

    const photoMatch = matchPath(location.pathname, {
      path: "/photos/:userId",
      exact: true,
    });

    if (location.pathname === "/" || location.pathname === "") {
      setContext("Home");
      return;
    }

    if (location.pathname === "/users") {
      setContext("Users");
      return;
    }

    if (userMatch) {
      fetchModel(`/user/${userMatch.params.userId}`)
        .then((response) => {
          const user = response.data;
          setContext(`${user.first_name} ${user.last_name}`);
        })
        .catch((error) => {
          console.error("Error fetching top bar user context:", error);
          setContext("User Detail");
        });
      return;
    }

    if (photoMatch) {
      fetchModel(`/user/${photoMatch.params.userId}`)
        .then((response) => {
          const user = response.data;
          setContext(`Photos of ${user.first_name} ${user.last_name}`);
        })
        .catch((error) => {
          console.error("Error fetching top bar photo context:", error);
          setContext("User Photos");
        });
      return;
    }

    setContext("Photo Sharing App");
  }, [location.pathname]);

  return (
    <AppBar className="topbar-appBar" position="fixed">
      <Toolbar className="topbar-toolbar">
        <Typography variant="h5" className="topbar-name" color="inherit">
          Photo App Sprint
          <span className="topbar-version">
            {version !== "" ? ` v${version}` : ""}
          </span>
        </Typography>

        <Typography variant="h6" className="topbar-context" color="inherit">
          {context}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default withRouter(TopBar);