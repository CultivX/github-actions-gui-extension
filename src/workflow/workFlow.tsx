import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';


const WorkFlow = () => {
  // Function to update the turbo frame
  const updateTurboFrame = () => {
    const turboFrame = document.querySelector('#repo-content-turbo-frame');
    if (turboFrame) {
      turboFrame.innerHTML = '<p>New Content</p>';
    }
  };

  // Function to add the Workflow tab
  const addWorkFlowTab = () => {
    const navBar = document.querySelector('.UnderlineNav-body');
    if (navBar && !document.getElementById('workflow-tab')) {
      const container = document.createElement('li');
      container.className = 'd-inline-flex';

      const imagePath = chrome.runtime.getURL('workflow.svg');

      // Render component into the container
      const root = createRoot(container);
      root.render(
        <a id="workflow-tab" 
          className="UnderlineNav-item no-wrap js-responsive-underlinenav-item"
          onClick={updateTurboFrame}>
            <img src={imagePath}  style={{ width: '16px', height: '16px', verticalAlign: 'middle' }} />
            Work Flow
        </a>
      );

      navBar.appendChild(container);
    }
  };

  // Effect hook to set up the MutationObserver
  useEffect(() => {
    const addWorkFlowTabSafely = () => {
      if (chrome.runtime.lastError) {
        console.warn("Extension context lost. Skipping addWorkFlowTab.");
        return;
      }
  
      try {
        addWorkFlowTab();
      } catch (error) {
        console.error("Failed to add workflow tab:", error);
      }
    };
  
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          addWorkFlowTabSafely();
        }
      });
    });
  
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);
  

  // Add the tab
  useEffect(() => {
    addWorkFlowTab();
  }, []);

  return null;
};


export default WorkFlow;