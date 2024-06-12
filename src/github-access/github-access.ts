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

export const fetchData = async (
  octokit,
  info,
  setIsFlashing,
  setShouldPoll,
  setHeadBranch,
  setHoverInfo
) => {
  try {
    setIsFlashing(
      await accessGitHub(info, octokit, setHeadBranch, setHoverInfo)
    );
  } catch (error) {
    if (error.status === 401) {
      console.error("Error: Bad credentials. Please check your GitHub Token.");
    } else {
      console.error("Error:", error);
    }
    setShouldPoll(false);
  }
};

export const accessGitHub = async (
  info,
  octokit,
  setHeadBranch,
  setHoverInfo
) => {
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/actions/runs",
    {
      owner: info.ownerName,
      repo: info.repoName,
    }
  );

  const runningWorkflow = data.workflow_runs.find(
    (run) =>
      run.status === "in_progress" ||
      run.status === "queued" ||
      run.status === "waiting"
  );
  setHeadBranch(runningWorkflow ? runningWorkflow.head_branch : "");

  if (runningWorkflow) {
    const createdAt = new Date(runningWorkflow.created_at);
    const runningTime = formatDistanceToNow(createdAt);
    setHoverInfo(`Workflow is running\nRunning time: ${runningTime}.`);
  }

  return !!runningWorkflow;
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
