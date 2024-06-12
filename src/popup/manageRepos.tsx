import React, { useState, useEffect } from "react";
import "./popup.css";

const ManageRepos = () => {
  const [repos, setRepos] = useState([]);
  const [repoName, setRepoName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = () => {
    chrome.storage.sync.get(["repos"], (result) => {
      setRepos(result.repos || []);
    });
  };

  const addRepo = () => {
    const newRepo = { name: repoName, url: repoUrl };
    const updatedRepos = [...repos, newRepo];
    chrome.storage.sync.set({ repos: updatedRepos }, () => {
      setRepoName("");
      setRepoUrl("");
      setError("");
      loadRepos();
    });
  };

  const isValidGitHubUrl = (url) => {
    const regex = /^https:\/\/github\.com\/([A-Za-z0-9_-]+\/[A-Za-z0-9_-]+)$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const deleteRepo = (index) => {
    const updatedRepos = repos.filter((_, i) => i !== index);
    chrome.storage.sync.set({ repos: updatedRepos }, () => {
      loadRepos();
    });
  };

  const handleRepoUrl = (e) => {
    const url = e.target.value;
    setRepoUrl(url);

    const tempName = isValidGitHubUrl(url);
    if (tempName) {
      setRepoName(tempName);
    } else {
      setRepoName("Error Repo Name");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValidGitHubUrl(repoUrl)) {
      addRepo();
      chrome.notifications.create(
        {
          type: "basic",
          iconUrl: "actions-icon.png",
          title: "Repository Monitoring",
          message: "New GitHub Repository Monitoring",
        },
        (notificationId) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          } else {
            console.log(`Notification created with ID: ${notificationId}`);
          }
        }
      );
    } else {
      setError("Please enter a valid GitHub URL.");
    }
  };

  return (
    <div>
      <div className="border border-gray-300 p-4 rounded-lg shadow-md space-y-3">
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            value={repoUrl}
            onChange={handleRepoUrl}
            placeholder="Repo URL"
            className="input w-full"
            required
          />
          <button type="submit" className="btn btn-blue rounded-lg mt-3 w-full">
            Add Repo
          </button>
        </form>
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <ul className="mt-4 space-y-2">
        {repos.map((repo, index) => (
          <li
            key={index}
            className="flex justify-between items-center p-2 border border-gray-200 shadow-md rounded-md"
          >
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              {repo.name}
            </a>
            <button onClick={() => deleteRepo(index)} className="button">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageRepos;
