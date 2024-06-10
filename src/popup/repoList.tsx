import React, { useEffect, useState } from 'react';
import './popup.css'

const RepoList = () => {
    const [repos, setRepos] = useState([]);

    useEffect(() => {
        chrome.storage.sync.get(['repos'], (result) => {
            setRepos(result.repos || []);
        });
    }, []);

    return (
        <ul className="space-y-2">
            {repos.map((repo, index) => (
                <li key={index} className="flex justify-between items-center p-2 border border-gray-200 shadow-md rounded-md">
                    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                        {repo.name}
                    </a>
                </li>
            ))}
        </ul>
    );
}

export default RepoList;
