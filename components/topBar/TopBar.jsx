import React, { useEffect, useState } from "react";
import "./TopBar.css";
import FetchModel from "../../lib/FetchModel";

function TopBar({ context }) {
  const [version, setVersion] = useState("");

  useEffect(() => {
    FetchModel("/test/info")
      .then((data) => {
        setVersion(data.__v || data.version || "Unknown");
      })
      .catch((err) => {
        console.error("Error fetching version:", err);
        setVersion("Error");
      });
  }, []);

  return (
    <div className="topbar">
      {/* Left: App Name */}
      <div className="topbar-left">
        <h2>Photo App</h2>
      </div>

      {/* Right: Context + Version */}
      <div className="topbar-right">
        <span className="context">{context}</span>
        <span className="version">Version: {version}</span>
      </div>
    </div>
  );
}

export default TopBar;