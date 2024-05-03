import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './popup.css'
import "../styles.css";

const Popup = () => {
    const [token, setToken] = useState('');
    const [interval, setInterval] = useState(5000);


    useEffect(() => {
        chrome.storage.sync.get(['token', 'interval'], (result) => {
            if (result.token) {
                setToken(result.token);
            }
            if (result.interval) {
                setInterval(result.interval);
            }
        });
    }, []);

    const handleGenerateTokenClick = () => {
        const url = 'https://github.com/settings/tokens/new';
        window.open(url, '_blank');
    };

    const handleSaveButton = () => {
        chrome.storage.sync.set({ token: token, interval: interval }, () => {
            console.log('Token and interval saved');
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0] && tabs[0].id) {
                    chrome.tabs.reload(tabs[0].id);
                }
            });
        });
    };

    return (
        <div>
            <div className="relative has-tooltip">
                <button className="btn btn-blue" type="submit" onClick={handleGenerateTokenClick}>
                    Generate New Token
                </button>
                <div className='tooltip absolute rounded shadow-lg p-1 bg-gray-600 text-dark-text'>
                    Access required: repo & workflow
                </div>
            </div>
            <form className="w-full max-w-lg">
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            GitHub Token:
                        </label>
                        <input 
                            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                            type="password" 
                            placeholder="******************"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full md:w-1/2 px-3">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Polling Interval (ms):
                        </label>
                        <input 
                            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                            type="text"
                            value={interval}
                            onChange={(e) => setInterval(parseInt(e.target.value, 10))}
                        />
                    </div>
                </div>
                <button className="btn btn-blue" type="submit" onClick={handleSaveButton}>
                    Save
                </button>
            </form>
        </div>
    );
};

const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
root.render(<Popup />);
