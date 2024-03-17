import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import FlashingIcon from './flashingIcon';


const IconScript = () => {
  const [objList, setObjList] = useState(false);

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
  const addSvgIcon = async () => {
    const components = document.querySelectorAll('.Box-sc-g0xbh4-0.listviewitem');
    
    components.forEach( (component) => {
      const ownerName = document.URL.split("/")[4];
      const targetElement = component.querySelector('.NuYbP');
      const targetRepo = component.querySelector('.gPDEWA');
      const repoName = targetRepo ? targetRepo.textContent : '';

      if (targetElement && !targetElement.querySelector('.actions-icon')) {
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('actions-icon');
        targetElement.appendChild(iconContainer);
        const iconRoot = createRoot(iconContainer);
        iconRoot.render(<FlashingIcon ownerName={ownerName} repoName={repoName} />);
      }
    })
  }

  addStyles();

  // Listening Dom
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(async (mutation) => {
      if (mutation.type === 'childList') {
        // check .listviewitem 
        const components = document.querySelectorAll('.Box-sc-g0xbh4-0.listviewitem');
        if (components.length > 0) {
          addSvgIcon();
          setObjList(true);
          
          observer.disconnect();
        }
      }
    });
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
