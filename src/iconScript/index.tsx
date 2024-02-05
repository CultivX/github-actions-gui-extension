import React from "react"
import { createRoot } from 'react-dom/client'
import IconScript from "./iconScript"

function init() {
    const appContainer = document.createElement('div')
    if (!appContainer) {
        throw new Error("Can not find appContainer");
    }
    document.body.appendChild(appContainer)
    const root = createRoot(appContainer)
    root.render(<IconScript />);
}

init();

