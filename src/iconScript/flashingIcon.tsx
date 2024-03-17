import React, { useState, useEffect } from 'react';
import { Octokit } from "octokit";
import { OverlayTrigger, Tooltip } from 'react-bootstrap';


const FlashingIcon = (info) => {
    const [isFlashing, setIsFlashing] = useState(false);
    const [headBranch, setHeadBranch] = useState('');
    const [ghToken, setGHToken] = useState('');
    const [hoverInfo, setHoverInfo] = useState('Workflow is running');
    const [pollingInterval, setPollingInterval] = useState(5000);
    const [shouldPoll, setShouldPoll] = useState(true);


    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        if (ghToken && shouldPoll) {
            try {
                const octokit = new Octokit({ auth: ghToken });
                fetchData(octokit);
                const intervalId = setInterval(() => {
                    if (shouldPoll) {
                        fetchData(octokit);
                    } else {
                        clearInterval(intervalId);
                    }
                }, pollingInterval);
                return () => clearInterval(intervalId);
            } catch (error) {
                console.error('Error:', error);
                setShouldPoll(false);
            }
        } else {
            console.log('Please check your GitHub Token.');
        }
    }, [ghToken, pollingInterval, shouldPoll]);
    

    interface StorageResult {
        token?: string;
        interval?: number;
    }

    const initialize = async () => {
        // Get stored values for token and interval
        const getStorageData = (): Promise<StorageResult> => {
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
    
        const result = await getStorageData();
        if (result.token) {
            setGHToken(result.token);
        }
        if (result.interval) {
            setPollingInterval(result.interval);
        }
    };

    const fetchData = async (octokit) => {
        try {
            setIsFlashing(await accessGitHub(info, octokit));
        } catch (error) {
            if (error.status === 401) {
                console.error('Error: Bad credentials. Please check your GitHub Token.');
            } else {
                console.error('Error:', error);
            }
            setShouldPoll(false);
        }
    };

    const accessGitHub = async (info, octokit) => {
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

    return (
        <OverlayTrigger
            placement="top"
            overlay={
                <Tooltip id={`tooltip-${info.ownerName}-${info.repoName}`}>
                    {isFlashing ? hoverInfo : 'No running workflow'}
                </Tooltip>
            }
        >
            <a href={`https://github.com/${info.ownerName}/${info.repoName}/actions/workflows/main.yml?query=branch%3A${headBranch}`} target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path className={`${isFlashing ? 'animated-path' : ''}`} fill="#4A7EBF" d="M53.604 0c29.604 0 53.604 23.992 53.604 53.59c0 29.09-23.189 52.75-52.093 53.553c0 2.461.109 7.111 1.501 9.92c1.933 3.893 13.525 11.144 24.892 11.144h4.084c2.567-18.271 18.257-32.332 37.24-32.332c18.906 0 34.55 13.946 37.211 32.11h21.13c2.661-18.164 18.304-32.11 37.21-32.11c20.775 0 37.617 16.837 37.617 37.607s-16.842 37.606-37.617 37.606c-18.906 0-34.55-13.948-37.21-32.11h-21.129c-2.66 18.162-18.305 32.11-37.212 32.11c-18.87 0-34.494-13.893-37.199-32.007l-4.515.135c-7.435-.056-15.29-2.042-21.598-6.328c-1.72-1.169-3.415-2.397-5.182-3.56v2.441c-.01.79-.153 12.657-.164 25.833v2.79c.005 8.641.073 17.545.277 24.04c.446 14.246 12.034 25.745 24.822 28.436c1.663.35 4.52.394 6.321.238c2.571-18.264 18.26-32.32 37.238-32.32c20.774 0 37.616 16.838 37.616 37.607c0 20.77-16.842 37.607-37.616 37.607c-18.769 0-34.323-13.744-37.153-31.714h-3.254c-24.436-1.334-39.628-23.746-39.363-41.923c.334-22.877.082-45.764.079-68.646v-7.565C18.546 101.286 0 79.606 0 53.591C0 23.992 23.999 0 53.604 0m69.228 191.78c-14.701 0-26.62 11.915-26.62 26.613c0 14.699 11.919 26.614 26.62 26.614c14.702 0 26.62-11.915 26.62-26.614c0-14.698-11.918-26.614-26.62-26.614m0-84.912c-14.701 0-26.62 11.915-26.62 26.614c0 14.697 11.919 26.613 26.62 26.613c14.702 0 26.62-11.916 26.62-26.613c0-14.699-11.918-26.614-26.62-26.614m95.551 0c-14.702 0-26.62 11.915-26.62 26.614c0 14.697 11.918 26.613 26.62 26.613c14.703 0 26.621-11.916 26.621-26.613c0-14.699-11.918-26.614-26.62-26.614m15.161 15.408a5.496 5.496 0 0 1 .17 7.606l-.16.168l-16.31 16.345a5.499 5.499 0 0 1-7.576.198l-.172-.163l-7.985-7.86a5.496 5.496 0 0 1-.06-7.773a5.499 5.499 0 0 1 7.606-.22l.168.16l4.092 4.027l12.452-12.477a5.498 5.498 0 0 1 7.775-.01m-95.99-.08a5.497 5.497 0 0 1 .17 7.606l-.16.168l-16.31 16.344a5.499 5.499 0 0 1-7.576.198l-.172-.163l-7.985-7.86a5.498 5.498 0 0 1 7.546-7.992l.168.16l4.093 4.027l12.451-12.478a5.499 5.499 0 0 1 7.775-.01M53.604 10.993c-23.532 0-42.608 19.07-42.608 42.598c0 23.525 19.076 42.597 42.608 42.597c23.532 0 42.608-19.072 42.608-42.597c0-23.527-19.076-42.598-42.608-42.598M49.171 28.13A743.51 743.51 0 0 1 75.7 44.841c7.308 4.82 7.29 13.563-.1 18.394a608.475 608.475 0 0 1-27.058 16.712c-7.455 4.34-15.8-.65-16.002-9.344c-.13-5.602-.024-11.21-.032-16.817c-.006-5.454-.113-10.911.019-16.363c.222-9.248 8.736-14.066 16.643-9.293m-5.91 8.872v3.868l-.001 5.674l-.001 3.71v5.482c0 4.23.002 8.394.01 12.557c.003 1.96 1.023 1.88 2.343 1.063c7.605-4.714 15.214-9.423 22.827-14.127c1.258-.776 1.294-1.587.06-2.365c-8.154-5.139-16.318-10.26-25.238-15.862"/>
                    <path className={`${isFlashing ? 'animated-path' : ''}`} fill="#4A7EBF" d="M133.227 223.88a5.497 5.497 0 1 0 .001-10.996a5.497 5.497 0 0 0 0 10.995m-21.049.001a5.497 5.497 0 1 0 0-10.996a5.497 5.497 0 0 0 0 10.995m106.205 21.128c-14.702 0-26.62-11.915-26.62-26.614c0-14.698 11.918-26.614 26.62-26.614c14.701 0 26.62 11.916 26.62 26.614c0 14.699-11.919 26.614-26.62 26.614m0-64.22c-18.906 0-34.55 13.947-37.211 32.11h-6.153c-2.685 0-4.864 2.461-4.864 5.496c0 3.036 2.179 5.497 4.864 5.497h6.153c2.66 18.163 18.305 32.11 37.21 32.11C239.159 256 256 239.162 256 218.393c0-20.77-16.842-37.607-37.616-37.607"/>
                </svg>
            </a>
        </OverlayTrigger>
    );
};

export default FlashingIcon;