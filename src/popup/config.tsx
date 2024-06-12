import React, { useEffect, useState, useRef } from "react";
import "./popup.css";

const Config = () => {
  const [token, setToken] = useState("");
  const [interval, setInterval] = useState(5000);
  const [notificationLevel, setNotificationLevel] = useState(null);
  const levelRef1 = useRef(null);
  const levelRef2 = useRef(null);
  const levelRef3 = useRef(null);

  useEffect(() => {
    chrome.storage.sync.get(
      ["token", "interval", "notification_level"],
      (result) => {
        if (result.token) {
          setToken(result.token);
        }
        if (result.interval) {
          setInterval(result.interval);
        }
        if (result.notification_level) {
          setNotificationLevel(result.notification_level);
        }
      }
    );
  }, []);

  useEffect(() => {
    if (notificationLevel === 1) levelRef1.current.focus();
    if (notificationLevel === 2) levelRef2.current.focus();
    if (notificationLevel === 3) levelRef3.current.focus();
  }, [notificationLevel]);

  const handleGenerateTokenClick = () => {
    const url = "https://github.com/settings/tokens/new";
    window.open(url, "_blank");
  };

  const handleSaveButton = () => {
    chrome.storage.sync.set({ token: token, interval: interval }, () => {
      console.log("Token and interval saved");
    });
  };

  const handleNotificationLevel = (level) => {
    chrome.storage.sync.set({ notification_level: level });
  };

  const handleClearCache = () => {
    chrome.storage.sync.set({ monitored_id_list: [] });
  };

  return (
    <div>
      <div className="relative has-tooltip mb-6">
        <button
          className="btn btn-blue rounded-lg"
          type="button"
          onClick={handleGenerateTokenClick}
        >
          Generate New Token
        </button>
        <div className="tooltip absolute shadow-lg p-1 bg-gray-600 text-dark-text">
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
          <button
            ref={levelRef1}
            type="button"
            className="btn btn-blue rounded-s-lg focus:bg-blue-900"
            onClick={() => {
              handleNotificationLevel(1);
            }}
          >
            All
          </button>
          <button
            ref={levelRef2}
            type="button"
            className="btn btn-blue focus:bg-blue-900"
            onClick={() => {
              handleNotificationLevel(2);
            }}
          >
            Interruption Only
          </button>
          <button
            ref={levelRef3}
            type="button"
            className="btn btn-blue rounded-e-lg focus:bg-blue-900"
            onClick={() => {
              handleNotificationLevel(3);
            }}
          >
            None
          </button>
        </div>

        <div className="mb-6">
          <button
            className="btn btn-blue rounded-lg"
            type="button"
            onClick={handleClearCache}
          >
            Clear Cache
          </button>
        </div>

        <div className="mb-6">
          <button
            className="btn btn-blue rounded-lg"
            type="submit"
            onClick={handleSaveButton}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default Config;
