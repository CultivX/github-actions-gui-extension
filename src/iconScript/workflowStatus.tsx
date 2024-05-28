import React, { useState, useEffect } from 'react';
import { Octokit } from "octokit";
import "../styles.css";
import { getStorageData, fetchData } from '../github-access/github-access';



const WorkflowStatus = (info) => {
    const [isRunning, setIsRunning] = useState(false);
    const [headBranch, setHeadBranch] = useState('');
    const [ghToken, setGHToken] = useState('');
    const [hoverInfo, setHoverInfo] = useState('Workflow is running');
    const [pollingInterval, setPollingInterval] = useState(5000);
    const [shouldPoll, setShouldPoll] = useState(true);

    useEffect(() => {
        if (ghToken && shouldPoll) {
            try {
                const octokit = new Octokit({ auth: ghToken });
                fetchData(octokit, info, setIsRunning, setShouldPoll, setHeadBranch, setHoverInfo);
                const intervalId = setInterval(() => {
                    if (shouldPoll) {
                        fetchData(octokit, info, setIsRunning, setShouldPoll, setHeadBranch, setHoverInfo);
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

    useEffect(() => {
        initialize();
    }, []);

    const initialize = async () => {
        const result = await getStorageData();
        if (result.token) {
            setGHToken(result.token);
        }
        if (result.interval) {
            setPollingInterval(result.interval);
        }
    };

    return (
        <div>
            {isRunning ? hoverInfo : 'No running workflow'}
        </div>
    );
};
export default WorkflowStatus;
