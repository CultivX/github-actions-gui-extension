import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import RepoList from './repoList';
import ManageRepos from './manageRepos';
import Config from './config';
import './popup.css'
import "../styles.css";

const Popup = () => {
    const [activeTab, setActiveTab] = useState<String>('Repo List');
    const [tabs, setTabs] = useState<string[]>([
        'Repo List',
        'Manage Repos',
        'Config',
    ]);

    return (
        <div className="text-sm font-medium text-center text-gray-500">
            <ul className="flex flex-wrap -mb-px">
                {tabs.map(tab => (
                    <li
                        key={tab}
                        className={`popup-tab ${tab === activeTab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </li>
                ))}
            </ul>

            <div className="mt-4">
                {activeTab === 'Repo List' && <RepoList />}
                {activeTab === 'Manage Repos' && <ManageRepos />}
                {activeTab === 'Config' && <Config />}
            </div>
        </div>
    );
};

const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
root.render(<Popup />);
