import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import RepoList from "./repoList";
import ManageRepos from "./manageRepos";
import Config from "./config";
import "./popup.css";

const Popup = () => {
  const [activeTab, setActiveTab] = useState("");
  const [tabs, setTabs] = useState<string[]>([
    "Repo List",
    "Manage Repos",
    "Config",
  ]);

  useEffect(() => {
    setActiveTab("Config");
  }, []);

  return (
    <div className="text-sm font-medium text-center text-gray-500">
      <ul className="flex flex-wrap">
        {tabs.map((tab) => (
          <li
            key={tab}
            className={`popup-tab ${tab === activeTab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </li>
        ))}
      </ul>

      <div className="pb-4 mt-4">
        {activeTab === "Repo List" && <RepoList />}
        {activeTab === "Manage Repos" && <ManageRepos />}
        {activeTab === "Config" && <Config />}
      </div>
    </div>
  );
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<Popup />);
