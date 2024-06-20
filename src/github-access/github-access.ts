import { formatDistanceToNow } from "date-fns";
import { Octokit } from "octokit";

export const getGitHubToken = (): Promise<{
  token?: string;
  interval?: number;
}> => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(["token", "interval"], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result as { token?: string; interval?: number });
      }
    });
  });
};

export const accessGitHub = async (info, ghToken) => {
  const octokit = new Octokit({ auth: ghToken });
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/actions/runs",
    {
      owner: info.ownerName,
      repo: info.repoName,
    }
  );

  const runningWorkflow = data.workflow_runs.find(
    (run) => run.status === "in_progress"
  );
  const queuedWorkflow = data.workflow_runs.find(
    (run) => run.status === "queued" || run.status === "waiting"
  );

  if (runningWorkflow) {
    const runStartAt = new Date(runningWorkflow.run_started_at);
    const runningTime = formatDistanceToNow(runStartAt);
    return {
      iconHref: "runs/" + runningWorkflow.id,
      hoverInfo: `Workflow is running\nRunning time: ${runningTime}.`,
    };
  } else if (queuedWorkflow) {
    const runStartAt = new Date(queuedWorkflow.run_started_at);
    const runningTime = formatDistanceToNow(runStartAt);
    return {
      iconHref: "runs/" + runningWorkflow.id,
      hoverInfo: `Workflow is running\nRunning time: ${runningTime}.`,
    };
  }

  if (data.workflow_runs[0]) {
    // return the latest workflow run id
    return { iconHref: "runs/" + data.workflow_runs[0].id };
  } else {
    return { iconHref: "" };
  }
};

export const listRunsForWorkflow = async (ownerName, repoName, status?) => {
  const gitHubToken = await getGitHubToken();
  const octokit = new Octokit({ auth: gitHubToken.token });
  const params: { owner; repo; status? } = {
    owner: ownerName,
    repo: repoName,
  };

  if (status) {
    params.status = status;
  }
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/actions/runs",
    params
  );
  return data.workflow_runs;
};

export const checkStatusForRuns = async (ownerName, repoName, runsId) => {
  const gitHubToken = await getGitHubToken();
  const octokit = new Octokit({ auth: gitHubToken.token });
  const params = {
    owner: ownerName,
    repo: repoName,
    runsId: runsId,
  };
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/actions/runs/{runsId}",
    params
  );
  return { status: data.status, conclusion: data.conclusion };
};
