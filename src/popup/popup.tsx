import React from 'react';
import { createRoot } from 'react-dom/client'
import '../assets/tailwind.css'

const test = (
    <div>
        <h1 className="text-5xl bg-green-500">Hello W!</h1>
        <p>some desc</p>
    </div>
)

const container = document.createElement('div')
document.body.appendChild(container)
const root = createRoot(container)
root.render(test)