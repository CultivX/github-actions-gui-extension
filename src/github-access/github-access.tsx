import { formatDistanceToNow } from 'date-fns';

export const getStorageData = (): Promise<{ token?: string; interval?: number }> => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['token', 'interval'], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result as { token?: string; interval?: number });
            }
        });
    });
};

export const fetchData = async (octokit, info, setIsFlashing, setShouldPoll, setHeadBranch, setHoverInfo) => {
    try {
        setIsFlashing(await accessGitHub(info, octokit, setHeadBranch, setHoverInfo));
    } catch (error) {
        if (error.status === 401) {
            console.error('Error: Bad credentials. Please check your GitHub Token.');
        } else {
            console.error('Error:', error);
        }
        setShouldPoll(false);
    }
};

export const accessGitHub = async (info, octokit, setHeadBranch, setHoverInfo) => {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
        owner: info.ownerName,
        repo: info.repoName
    })

    const runningWorkflow = data.workflow_runs.find(run => run.status === "in_progress" || run.status === "queued" || run.status === "waiting");
    setHeadBranch(runningWorkflow ? runningWorkflow.head_branch: '');

    if (runningWorkflow) {
        const createdAt = new Date(runningWorkflow.created_at);
        const runningTime = formatDistanceToNow(createdAt);
        setHoverInfo(`Workflow is running\nRunning time: ${runningTime}.`);
    }

    return !!runningWorkflow;
};
