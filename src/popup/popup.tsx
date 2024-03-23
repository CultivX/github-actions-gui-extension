import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form, Container, Tooltip, OverlayTrigger } from 'react-bootstrap';
import './popup.css'

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
        <Container>
            <div className="d-flex justify-content-end mb-3">
                <OverlayTrigger
                    placement="auto"
                    overlay={<Tooltip id="generate-token-tooltip">GitHub Token for get status of workflows</Tooltip>}
                >
                    <Button variant="primary" type="submit" onClick={handleGenerateTokenClick}>
                        Generate new token
                    </Button>
                </OverlayTrigger>
                </div>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>GitHub Token:</Form.Label>
                    <Form.Control
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Polling Interval (ms):</Form.Label>
                    <Form.Control
                        type="number"
                        value={interval}
                        onChange={(e) => setInterval(parseInt(e.target.value, 10))}
                    />
                </Form.Group>
                <div className="d-flex justify-content-end">
                    <Button variant="primary" type="submit" onClick={handleSaveButton}>
                        Save
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
root.render(<Popup />);
