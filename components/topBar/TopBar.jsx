import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import "./TopBar.css";
import fetchModel from "../../lib/fetchModelData.js";

function TopBar({ context }) {
  const [version, setVersion] = useState("");

  useEffect(() => {
    fetchModel("/test/info").then((info) => {
      if (info && info.data && info.data.__v !== undefined) {
        setVersion(info.data.__v);
      }
    });
  }, []);

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar className="topbar-toolbar">
        
        {/* Left: App Title + Version */}
        <Typography variant="h5" className="topbar-name" color="inherit">
          Photo App Sprint&nbsp;
          <span className="topbar-version">
            {version !== "" ? `v${version}` : ""}
          </span>
        </Typography>

        {/* Right: Context */}
        <Typography variant="h5" className="topbar-context" color="inherit">
          {context || ""}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;