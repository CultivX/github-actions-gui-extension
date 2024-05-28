import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import FlashingIcon from './flashingIcon';
import WorkflowStatus from './workflowStatus';


const IconScript = () => {
  // add style for flashing animation
  const addStyles = () => {
    const styleExists = document.head.querySelector('[data-style="animated-path"]');

    if (!styleExists) {
      const style = document.createElement('style');
      style.setAttribute('data-style', 'animated-path');
      style.innerHTML = `
        .grey-svg {
          #848D79
        }
        .animated-path {
          animation: myAnimation 1s infinite;
        }

        @keyframes myAnimation {
          0% { fill: white; }
          50% { fill: #85B3DF; }
          100% { fill: white; }
        }
      `;
      document.head.appendChild(style);
    }
  };

  addStyles();

  // add SVG behind the repo
  const addSvgIcon = async (repo_list_class, repo_item_class) => {
    const components = document.querySelectorAll(repo_list_class);

    components.forEach( (component) => {
      const targetElement = component.querySelector(repo_item_class);
      
      const is_repo_page = document.URL.split("/")[3] == 'orgs';
      const target = is_repo_page ? '[data-testid="issue-count"]' : '[data-hovercard-type="repository"]';
      const targetHref = (component.querySelector(target) as HTMLAnchorElement).href;
      
      const ownerName = targetHref.split("/")[3];
      const repoName = targetHref.split("/")[4];

      if (targetElement && !targetElement.querySelector('.actions-icon')) {
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('actions-icon');
        targetElement.appendChild(iconContainer);
        const iconRoot = createRoot(iconContainer);
        iconRoot.render(<FlashingIcon ownerName={ownerName} repoName={repoName} />);
      }
    })
  }

  const addStatusLine = () => {
    // const targetElement = document.querySelector('#repo-title-component');
    const targetElement = document.querySelector('#repository-container-header');

    var currentUrl = window.location.href;
    const ownerName = currentUrl.split("/")[3];
    const repoName = currentUrl.split("/")[4];

    if (!targetElement.querySelector('.status-line')) {
      const statusContainer = document.createElement('div');
      statusContainer.classList.add('status-line');
      targetElement.appendChild(statusContainer);
      const statusRoot = createRoot(statusContainer);
      statusRoot.render(<WorkflowStatus ownerName={ownerName} repoName={repoName}/>)
    }
  }

  // Listening Dom
  const observer = new MutationObserver((mutations) => {
    const mutation = mutations[0];
    if (mutation && mutation.type === 'childList') {
      // for repositories page
      const components = document.querySelectorAll('.Box-sc-g0xbh4-0.listviewitem');
      if (components.length > 0) {
        addSvgIcon('.Box-sc-g0xbh4-0.listviewitem', '.NuYbP');
        // observer.disconnect();
      }

      // for overview page
      const org_repos = document.querySelector('.org-repos.repo-list');
      if (org_repos) {
        addSvgIcon('.private.source.d-block', '.color-fg-muted.f6');
      }

      // for repostory page
      const is_repo_title_component = document.querySelector('#repo-title-component');
      if (is_repo_title_component) {
        addStatusLine();
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return null;
};

export default IconScript;

// invoke itself
const appContainer = document.createElement('div')
if (!appContainer) {
    throw new Error("Can not find appContainer");
}
document.body.appendChild(appContainer)
const root = createRoot(appContainer)
root.render(<IconScript />);
