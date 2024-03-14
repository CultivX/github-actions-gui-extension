import React from 'react';
import { createRoot } from 'react-dom/client';
import FlashingIcon from './flashingIcon';


const IconScript = () => {
  // Listen from background.js
  chrome.runtime.onMessage.addListener((obj: any, sender: any, response: any) => {
    const { orgId } = obj;

    addSvgIcon(orgId);
    addStyles();
  });

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

  // add SVG behind the repo
  const addSvgIcon = (ownerName: string) => {
    const components = document.querySelectorAll('.Box-sc-g0xbh4-0.listviewitem');
    
    components.forEach(async (component) => {
      const targetElement = component.querySelector('.NuYbP');
      const targetRepo = component.querySelector('.gPDEWA');
      const repoName = targetRepo ? targetRepo.textContent : '';

      if (targetElement && !targetElement.querySelector('.actons-icon')) {
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('actions-icon');
        targetElement.appendChild(iconContainer);
        const iconRoot = createRoot(iconContainer);
        iconRoot.render(<FlashingIcon ownerName={ownerName} repoName={repoName} />);
      }
    })
  }

  return null;
};

export default IconScript;