import React from "react";
import { createRoot } from "react-dom/client";
import FlashingIcon from "./flashingIcon";
import WorkflowStatus from "./workflowStatus";
import {
  listRunsForWorkflow,
  checkStatusForRuns,
} from "../github-access/github-access";

const IconScript = () => {
  // add style for flashing animation
  const addStyles = () => {
    const styleExists = document.head.querySelector(
      '[data-style="animated-path"]'
    );

    if (!styleExists) {
      const style = document.createElement("style");
      style.setAttribute("data-style", "animated-path");
      style.innerHTML = `
            .grey-svg {
            #848D79
            }
            .animated-path {
            animation: myAnimation 1s infinite;
            }

            @keyframes myAnimation {
            0% { fill: white; }
            50% { fill: #85B3DF; }
            100% { fill: white; }
            }
        `;
      document.head.appendChild(style);
    }
  };

  addStyles();

  // add SVG behind the repo
  const addSvgIcon = async (repo_list_class, repo_item_class) => {
    const components = document.querySelectorAll(repo_list_class);

    components.forEach((component) => {
      const targetElement = component.querySelector(repo_item_class);

      const is_repo_page = document.URL.split("/")[3] == "orgs";
      const target = is_repo_page
        ? '[data-testid="issue-count"]'
        : '[data-hovercard-type="repository"]';
      const targetHref = (component.querySelector(target) as HTMLAnchorElement)
        .href;

      const ownerName = targetHref.split("/")[3];
      const repoName = targetHref.split("/")[4];

      if (targetElement && !targetElement.querySelector(".actions-icon")) {
        const iconContainer = document.createElement("div");
        iconContainer.classList.add("actions-icon");
        targetElement.appendChild(iconContainer);
        const iconRoot = createRoot(iconContainer);
        iconRoot.render(
          <FlashingIcon ownerName={ownerName} repoName={repoName} />
        );
      }
    });
  };

  const addStatusLine = () => {
    // const targetElement = document.querySelector('#repo-title-component');
    const targetElement = document.querySelector(
      "#repository-container-header"
    );

    var currentUrl = window.location.href;
    const ownerName = currentUrl.split("/")[3];
    const repoName = currentUrl.split("/")[4];

    if (!targetElement.querySelector(".status-line")) {
      const statusContainer = document.createElement("div");
      statusContainer.classList.add(
        "status-line",
        "d-flex",
        "flex-wrap",
        "flex-justify-end",
        "container-xl",
        "px-3",
        "px-md-4",
        "px-lg-5"
      );
      targetElement.appendChild(statusContainer);
      const statusRoot = createRoot(statusContainer);
      statusRoot.render(
        <WorkflowStatus ownerName={ownerName} repoName={repoName} />
      );
    }
  };

  // Listening Dom
  const observer = new MutationObserver((mutations) => {
    const mutation = mutations[0];
    if (mutation && mutation.type === "childList") {
      // for repositories page
      const components = document.querySelectorAll(
        ".Box-sc-g0xbh4-0.list-view-item"
      );
      if (components.length > 0) {
        addSvgIcon(".Box-sc-g0xbh4-0.list-view-item", ".NuYbP");
        // observer.disconnect();
      }

      // for overview page
      const org_repos = document.querySelector(".org-repos.repo-list");
      if (org_repos) {
        addSvgIcon(".private.source.d-block", ".color-fg-muted.f6");
      }

      // for repostory page
      const is_repo_title_component = document.querySelector(
        "#repo-title-component"
      );
      if (is_repo_title_component) {
        addStatusLine();
      }
    }
  });

  // check status of running Actions
  const checkRunningActions = () => {
    // get all monitored repos
    chrome.storage.sync.get(["repos", "monitored_id_list"], (result) => {
      const repos = result.repos;
      let currentList = result.monitored_id_list;
      if (!currentList) currentList = [];

      // select all in_progress runs
      repos.map(async (repo) => {
        const [ownerName, repoName] = repo.name.split("/");
        const in_progressList = await listRunsForWorkflow(
          ownerName,
          repoName,
          "in_progress"
        );
        const queuedList = await listRunsForWorkflow(
          ownerName,
          repoName,
          "queued"
        );
        const waitingList = await listRunsForWorkflow(
          ownerName,
          repoName,
          "waiting"
        );
        let combinedArraySpread = [
          ...in_progressList,
          ...queuedList,
          ...waitingList,
        ];

        combinedArraySpread.forEach((run) => {
          if (
            !currentList.some((existingRun) => existingRun.runId === run.id)
          ) {
            currentList.push({
              ownerName: ownerName,
              repoName: repoName,
              runId: run.id,
              runName: run.name,
            });
            chrome.storage.sync.set({ monitored_id_list: currentList });
          }
        });
      });
    });

    // check each item status changed
    chrome.storage.sync.get("monitored_id_list", (result) => {
      let currentList = result.monitored_id_list;

      console.log(currentList);

      // check every runs, remove if completed
      currentList.map(async (runs) => {
        const runsStatus = await checkStatusForRuns(
          runs.ownerName,
          runs.repoName,
          runs.runId
        );

        const params = {
          repoName: runs.repoName,
          runName: runs.runName,
          conclusion: runsStatus.conclusion,
          ownerName: runs.ownerName,
          runsId: runs.runId,
        };

        if (
          runsStatus.conclusion === "success" ||
          runsStatus.conclusion === "cancelled" ||
          runsStatus.conclusion === "failure" ||
          runsStatus.conclusion === "timed_out"
        ) {
          // remove from monitored_id_list
          currentList = currentList.filter((item) => item.runId !== runs.runId);

          // notifiy background to create Notification
          chrome.runtime.sendMessage(
            { action: "createNotification", params: params },
            (response) => {
              console.log(response.status);
            }
          );
        }
        // unclear status
        // if (runsStatus === "action_required" ||runsStatus === "neutral" ||runsStatus === "skipped" ||runsStatus === "stale" ||runsStatus === "requested" ||runsStatus === "pending") {}

        // renew monitored_id_list
        chrome.storage.sync.set({ monitored_id_list: currentList });
      });
    });
  };

  // set interval timer
  const getIntervalAndSetTimer = async () => {
    try {
      chrome.storage.sync.get(["interval"], (result) => {
        const interval = result.interval || 60000;
        setInterval(checkRunningActions, interval);
      });
    } catch (error) {
      console.error("Error retrieving interval from storage:", error);
    }
  };

  getIntervalAndSetTimer();

  observer.observe(document.body, { childList: true, subtree: true });

  return null;
};

export default IconScript;

// invoke itself
const appContainer = document.createElement("div");
if (!appContainer) {
  throw new Error("Can not find appContainer");
}
document.body.appendChild(appContainer);
const root = createRoot(appContainer);
root.render(<IconScript />);
