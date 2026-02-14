import './style.css';
import './chatbot.css';
import { PioneerChatbot } from './chatbot.js';
import { setupFormHandler } from './form-handler.js';

window.addEventListener('DOMContentLoaded', () => {
    new PioneerChatbot();
    setupFormHandler();
});
