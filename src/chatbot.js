/**
 * Pioneer Chatbot
 * Handles lead capture conversation and Q&A based on page content.
 */

export class PioneerChatbot {
    constructor() {
        this.isOpen = false;
        this.state = 'INIT'; // INIT, ASK_NAME, ASK_EMAIL, ASK_PHONE, ASK_TYPE, QA_MODE, DONE
        this.leadData = {};
        this.knowledgeBase = [];

        // DOM Elements
        this.elements = {};

        this.init();
    }

    init() {
        this.buildKnowledgeBase();
        this.createDOM();
        this.attachEvents();

        // Initial bot message delay
        setTimeout(() => {
            if (this.state === 'INIT') {
                this.addBotMessage("Hi! 👋 Welcome to Pioneer Concrete Coatings.");
                setTimeout(() => {
                    this.addBotMessage("I can help you get a free quote or answer your questions. First, what's your name?");
                    this.state = 'ASK_NAME';
                }, 800);
            }
        }, 1000);
    }

    buildKnowledgeBase() {
        // Simple scraper to build a searchable index from the page content
        const indexConfig = [
            { selector: '#faq .faq-item', titleSel: 'button', contentSel: '.answer' },
            { selector: '#services h2', context: 'closest section', contentSel: 'p, ul' },
            { selector: '#process .text-center', titleSel: 'h3', contentSel: 'p' },
        ];

        try {
            // FAQs
            document.querySelectorAll('#faq .faq-item').forEach(el => {
                const question = el.querySelector('.question span')?.innerText || '';
                const answer = el.querySelector('.answer')?.innerText || '';
                if (question && answer) {
                    this.knowledgeBase.push({ type: 'faq', q: question, a: answer, tokens: this.tokenize(question + ' ' + answer) });
                }
            });

            // Services
            document.querySelectorAll('#services h2').forEach(el => {
                const title = el.innerText;
                const section = el.parentElement; // simplified relative finding
                const content = section.innerText;
                if (title && content) {
                    this.knowledgeBase.push({ type: 'service', q: title, a: content.substring(0, 300) + '...', tokens: this.tokenize(title + ' ' + content) });
                }
            });

            console.log(`Chatbot KB built with ${this.knowledgeBase.length} entries.`);

        } catch (e) {
            console.warn('Chatbot KB build error', e);
        }
    }

    tokenize(str) {
        return str.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    }

    createDOM() {
        // Container
        const container = document.createElement('div');
        container.id = 'pioneer-chatbot';
        container.innerHTML = `
            <div class="cb-fab" id="cb-fab">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </div>
            <div class="cb-window" id="cb-window">
                <div class="cb-header">
                    <span class="cb-title">Support & Quotes</span>
                    <button class="cb-close" id="cb-close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div class="cb-messages" id="cb-messages"></div>
                <form class="cb-input-area" id="cb-form">
                    <input type="text" name="fax" class="cb-fax" id="cb-fax" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true">
                    <input type="text" class="cb-input" id="cb-input" placeholder="Type your message..." autocomplete="off">
                    <button type="submit" class="cb-send" id="cb-send">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
        `;
        document.body.appendChild(container);

        // Cache elements
        this.elements.fab = document.getElementById('cb-fab');
        this.elements.window = document.getElementById('cb-window');
        this.elements.close = document.getElementById('cb-close');
        this.elements.messages = document.getElementById('cb-messages');
        this.elements.form = document.getElementById('cb-form');
        this.elements.input = document.getElementById('cb-input');
    }

    attachEvents() {
        this.elements.fab.addEventListener('click', () => this.toggleWindow());
        this.elements.close.addEventListener('click', () => this.toggleWindow());
        this.elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleInput();
        });
    }

    toggleWindow() {
        this.isOpen = !this.isOpen;
        this.elements.window.classList.toggle('open', this.isOpen);
        if (this.isOpen) {
            this.elements.input.focus();
        }
    }

    addBotMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'cb-msg bot';
        msg.innerHTML = text; // innerHTML allows links if needed
        this.elements.messages.appendChild(msg);
        this.scrollToBottom();
    }

    addUserMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'cb-msg user';
        msg.textContent = text;
        this.elements.messages.appendChild(msg);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    handleInput() {
        const faxField = this.elements.form.querySelector('#cb-fax');
        if (faxField && faxField.value) {
            this.isBot = true;
        }

        const text = this.elements.input.value.trim();
        if (!text) return;

        this.addUserMessage(text);
        this.elements.input.value = '';

        // Process based on state
        setTimeout(() => this.processState(text), 400);
    }

    processState(input) {
        switch (this.state) {
            case 'ASK_NAME':
                this.leadData.name = input;
                this.addBotMessage(`Nice to meet you, ${input}. What is your email address?`);
                this.state = 'ASK_EMAIL';
                break;

            case 'ASK_EMAIL':
                if (input.includes('@')) {
                    this.leadData.email = input;
                    this.addBotMessage("Got it. And what is your phone number?");
                    this.state = 'ASK_PHONE';
                } else {
                    this.addBotMessage("That doesn't look like a valid email. Please try again.");
                }
                break;

            case 'ASK_PHONE':
                this.leadData.phone = input;
                this.addBotMessage("Thanks. Lastly, what type of coating project are you interested in? (e.g. Garage, Basement, Patio)");
                this.state = 'ASK_TYPE';
                break;

            case 'ASK_TYPE':
                this.leadData.projectType = input;
                this.submitLead();
                this.addBotMessage("Perfect! I've sent your info to our team. We'll be in touch shortly.");
                setTimeout(() => {
                    this.addBotMessage("In the meantime, feel free to ask me any questions about our services, process, or pricing!");
                    this.state = 'QA_MODE';
                }, 1000);
                break;

            case 'QA_MODE':
                this.handleQA(input);
                break;

            default:
                this.addBotMessage("Not sure what happened there. Let's start over.");
                this.state = 'INIT';
        }
    }

    submitLead() {
        if (this.isBot) {
            console.log('Bot detected. Dropping lead securely.');
            return;
        }

        console.log('Lead Captured:', this.leadData);
        // Here you would typically POST to an API or Formspree
        // For now we just log it as a simulation

        // Attempt to convert to formspree format and post silently if possible
        try {
            const formData = new FormData();
            formData.append('name', this.leadData.name);
            formData.append('email', this.leadData.email);
            formData.append('_replyto', this.leadData.email); // Explicit reply-to
            formData.append('_subject', 'New Lead from Chatbot');
            formData.append('phone', this.leadData.phone);
            formData.append('message', `[Bot Capture] Project Type: ${this.leadData.projectType}`);

            fetch("https://formspree.io/f/mrezynqq", {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).catch(e => console.error('Silent submission failed', e));
        } catch (e) { }
    }

    handleQA(query) {
        const qTokens = this.tokenize(query);
        let bestMatch = null;
        let maxScore = 0;

        for (const item of this.knowledgeBase) {
            let score = 0;
            qTokens.forEach(token => {
                if (item.tokens.includes(token)) score++;
            });
            // basic relevance check
            if (score > maxScore) {
                maxScore = score;
                bestMatch = item;
            }
        }

        if (bestMatch && maxScore > 0) {
            this.addBotMessage(bestMatch.a);
            // Add a follow up prompt occasionally
            if (Math.random() > 0.7) {
                setTimeout(() => this.addBotMessage("Any other questions?"), 1000);
            }
        } else {
            this.addBotMessage("I'm not exactly sure about that one. You can call us at (413) 544-4933 or check our FAQ section below!");
        }
    }
}
