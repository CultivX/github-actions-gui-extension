import { formatDistanceToNow } from 'date-fns';

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

export const fetchData = async (octokit, info, setIsFlashing, setShouldPoll, setIconHref, setHoverInfo) => {
    try {
        setIsFlashing(await accessGitHub(info, octokit, setIconHref, setHoverInfo));
    } catch (error) {
        if (error.status === 401) {
            console.error('Error: Bad credentials. Please check your GitHub Token.');
        } else {
            console.error('Error:', error);
        }
        setShouldPoll(false);
    }
};

const accessGitHub = async (info, octokit, setIconHref, setHoverInfo) => {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
        owner: info.ownerName,
        repo: info.repoName
    })

    const runningWorkflow = data.workflow_runs.find(run => run.status === "in_progress");
    const queuedWorkflow = data.workflow_runs.find(run => run.status === "queued" || run.status === "waiting");
    const firstWorkflowRunId = data.workflow_runs[0];
    if (runningWorkflow) {
        // return running workflow run id
        setIconHref("runs/" + runningWorkflow.id);

        const createdAt = new Date(runningWorkflow.created_at);
        const runningTime = formatDistanceToNow(createdAt);
        setHoverInfo(`Workflow is running\nRunning time: ${runningTime}.`);
    } else if (queuedWorkflow) {
        setIconHref("runs/" + queuedWorkflow.id);

        const createdAt = new Date(queuedWorkflow.created_at);
        const runningTime = formatDistanceToNow(createdAt);
        setHoverInfo(`Workflow is running\nRunning time: ${runningTime}.`);
    } else if (firstWorkflowRunId) {
        // return the latest workflow run id
        setIconHref("runs/" + firstWorkflowRunId.id);
    } else {
        setIconHref('');
    }

    return !!runningWorkflow;
};
