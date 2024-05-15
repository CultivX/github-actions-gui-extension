import { Octokit } from "octokit";


interface StorageResult {
    token?: string;
    interval?: number;
}
// Get stored values for token and interval
export const getStorageData = (): Promise<StorageResult> => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['token', 'interval'], (result: StorageResult) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result);
            }
        });
    });
};

export const accessGitHub = async (info, octokit, setHeadBranch, setHoverInfo) => {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
        owner: info.ownerName,
        repo: info.repoName
    })

    const runningWorkflow = data.workflow_runs.find(run => run.status === "in_progress" || run.status === "queued" || run.status === "waiting");
    setHeadBranch(runningWorkflow ? runningWorkflow.head_branch: '');

    if (runningWorkflow) {
        const createdAt = new Date(runningWorkflow.created_at).getTime();
        const now = new Date().getTime();
        const runningTime = Math.floor((now - createdAt) / 1000);
        setHoverInfo(`Workflow is running\nRunning time: ${runningTime}s.`);
    }

    return !!runningWorkflow;
};
