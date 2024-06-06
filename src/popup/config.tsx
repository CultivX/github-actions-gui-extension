import React, { useEffect, useState } from 'react';
import './popup.css'

const Config = () => {
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
        });
    };
    
    return (
        <div>
            <div className="relative has-tooltip mb-6">
                <button className="btn btn-blue" type="button" onClick={handleGenerateTokenClick}>
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
                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                    Notification Level:
                </label>
                <div className="inline-flex rounded-md shadow-sm mb-6" role="group">
                    <button type="button" className="px-4 py-2 text-sm font-medium btn-blue border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700">
                        All
                    </button>
                    <button type="button" className="px-4 py-2 text-sm font-medium btn-blue border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700">
                        Interruption Only
                    </button>
                    <button type="button" className="px-4 py-2 text-sm font-medium btn-blue border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700">
                        None
                    </button>
                </div>
                <div>
                    <button className="btn btn-blue" type="submit" onClick={handleSaveButton}>
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Config;
