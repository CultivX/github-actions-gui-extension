import React, { useState, useEffect } from "react";
import "../styles.css";
import { accessGitHub } from "../github-access/github-access";

const WorkflowStatus = (info) => {
  const [ghToken, setGHToken] = useState("");
  const [pollingInterval, setPollingInterval] = useState(5000);
  const [isRunning, setIsRunning] = useState(false);
  const [iconHref, setIconHref] = useState("");
  const [hoverInfo, setHoverInfo] = useState("");

  useEffect(() => {
    if (ghToken) {
      try {
        const intervalId = setInterval(async () => {
          const result = await accessGitHub(info, ghToken);
          if (result) {
            setIconHref(result.iconHref);
            if (result.hoverInfo) {
              setIsRunning(true);
              setHoverInfo(result.hoverInfo);
            } else {
              setIsRunning(false);
              setHoverInfo("No running workflow");
            }
          } else {
            console.log("error: accessGitHub");
            setIsRunning(false);
          }
        }, pollingInterval);
        return () => clearInterval(intervalId);
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      console.log("Please check your GitHub Token.");
    }
  }, [ghToken, pollingInterval]);

  useEffect(() => {
    setHoverInfo("Workflow is running");
    chrome.storage.sync.get(["token", "interval"], (result) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        setGHToken(result.token);
        setPollingInterval(result.interval);
      }
    });
  }, []);

  return (
    <div className="flex-auto min-width-0 width-fit mt-3 color-fg-muted">
      {isRunning ? hoverInfo : "No running workflow"}
    </div>
  );
};
export default WorkflowStatus;
