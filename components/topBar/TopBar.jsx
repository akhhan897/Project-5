import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import "./TopBar.css";
import fetchModel from "../../lib/fetchModelData.js";

/**
 * TopBar component
 * - Shows app name on the left
 * - Shows version from /test/info in the center-left area of the name
 * - Shows context (current view info) on the right
 */
function TopBar({ context }) {
  const [version, setVersion] = useState("");

  useEffect(() => {
    fetchModel("/test/info").then((info) => {
      if (info && info.__v !== undefined) {
        setVersion(info.__v);
      }
    });
  }, []);

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar className="topbar-toolbar">
        {/* Left: App name + version */}
        <Typography variant="h5" className="topbar-name" color="inherit">
          Aarav&nbsp;
          <span className="topbar-version">
            {version !== "" ? `v${version}` : ""}
          </span>
        </Typography>

        {/* Right: Context text */}
        <Typography variant="h5" className="topbar-context" color="inherit">
          {context || ""}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
