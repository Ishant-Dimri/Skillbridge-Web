// chat.js — Global SkillBridge AI Assistant (Upgraded)

// ⚠️ PASTE YOUR REAL GEMINI API KEY HERE
const GEMINI_API_KEY = "AIzaSyBzLi85KvjcUFzXF9I3QZ75FLbFiOabLZQ"; 

const SYSTEM_PROMPT = `
You are the official AI Assistant for SkillBridge, a student engineering learning platform.
Here are the rules and facts you must know:
1. SkillBridge has two main Skill Tracks: Full-Stack Web Development and AI/Machine Learning.
2. The "Placement Readiness Score" goes up when users complete tasks on their dashboard.
3. The "Skill Gap Analyzer" compares their completed skills against job roles to show what they are missing.
4. Users can upload projects to the "Project Showcase".
5. They can share a "Public Portfolio" link with recruiters.
Keep answers concise, friendly, and highly encouraging. Use emojis.
`;

// 1. INJECT THE HTML AUTOMATICALLY
function injectChatUI() {
    if (document.getElementById('chat-widget')) return;

    const chatHTML = `
    <div id="chat-widget" style="position: fixed; bottom: 24px; right: 24px; z-index: 9999; font-family: inherit;">
        <button id="chat-fab" class="btn btn-primary" style="width: 60px; height: 60px; border-radius: 50%; box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4); font-size: 24px; display: flex; justify-content: center; align-items: center; border: none; cursor: pointer; transition: all 0.3s ease;">
            <i class="fa-solid fa-robot"></i>
        </button>
        <div id="chat-window" class="glass" style="display: none; position: absolute; bottom: 80px; right: 0; width: 360px; height: 500px; flex-direction: column; padding: 0; overflow: hidden; border: 1px solid rgba(124, 58, 237, 0.3); box-shadow: 0 12px 40px rgba(0,0,0,0.5); transform-origin: bottom right; transition: all 0.3s ease; background: var(--bg1);">
            <div style="background: linear-gradient(90deg, #7c3aed, #06b6d4); padding: 16px; color: white; display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 16px;"><i class="fa-solid fa-sparkles"></i> SkillBridge Guide</strong>
                <button id="close-chat" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 18px;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div id="chat-messages" style="flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; font-size: 14px;">
                <div style="align-self: flex-start; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 2px 16px 16px 16px; color: #e6eef8;">
                    Hi there! I'm the SkillBridge AI. I can help you understand your Placement Score, navigate your Roadmap, or explain how the platform works. What do you need help with?
                </div>
            </div>
            <div style="padding: 12px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); display: flex; gap: 8px;">
                <input type="text" id="chat-input" placeholder="Ask a question..." style="flex: 1; padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white; outline: none; font-family: inherit;">
                <button id="send-chat" class="btn btn-primary" style="padding: 0 16px; border-radius: 8px; border: none; cursor: pointer;"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', chatHTML);
}

// 2. INITIALIZE LOGIC & MEMORY
document.addEventListener('DOMContentLoaded', () => {
    injectChatUI(); 

    const fab = document.getElementById('chat-fab');
    const windowEl = document.getElementById('chat-window');
    const closeBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-chat');
    const inputEl = document.getElementById('chat-input');
    const messagesEl = document.getElementById('chat-messages');

    // --- MEMORY SYSTEM ---
    let chatHistory = JSON.parse(sessionStorage.getItem('sb_chat_history')) || [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Understood! I am ready." }] }
    ];

    // Explicitly set initial display
    if (sessionStorage.getItem('sb_chat_open') === 'true') {
        windowEl.style.display = 'flex';
        fab.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
    } else {
        windowEl.style.display = 'none';
        fab.innerHTML = '<i class="fa-solid fa-robot"></i>';
    }

    if (chatHistory.length > 2) {
        for (let i = 2; i < chatHistory.length; i++) {
            const msg = chatHistory[i];
            const sender = msg.role === 'user' ? 'user' : 'bot';
            appendMessage(msg.parts[0].text, sender);
        }
    }

    function saveMemory() {
        sessionStorage.setItem('sb_chat_history', JSON.stringify(chatHistory));
    }

    // --- BULLETPROOF TOGGLE LOGIC ---
    fab.addEventListener('click', () => {
        if (windowEl.style.display === 'none') {
            windowEl.style.display = 'flex'; // Open
            fab.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
            sessionStorage.setItem('sb_chat_open', 'true');
        } else {
            windowEl.style.display = 'none'; // Close
            fab.innerHTML = '<i class="fa-solid fa-robot"></i>';
            sessionStorage.setItem('sb_chat_open', 'false');
        }
    });

    closeBtn.addEventListener('click', () => {
        windowEl.style.display = 'none'; // Force Close
        fab.innerHTML = '<i class="fa-solid fa-robot"></i>';
        sessionStorage.setItem('sb_chat_open', 'false');
    });

    // --- SEND LOGIC & SMART ERROR HANDLING ---
    sendBtn.addEventListener('click', handleSend);
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });

    async function handleSend() {
        const text = inputEl.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        inputEl.value = '';
        
        chatHistory.push({ role: "user", parts: [{ text: text }] });
        saveMemory(); 

        const typingId = appendMessage("Thinking...", 'bot');

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: chatHistory })
            });
            
            const data = await response.json();

            // Did Google reject the request? If so, throw the exact error.
            if (!response.ok) {
                console.error("Google API Error:", data);
                throw new Error(data.error?.message || "Unknown Google API Error");
            }

            const botReply = data.candidates[0].content.parts[0].text;
            chatHistory.push({ role: "model", parts: [{ text: botReply }] });
            saveMemory(); 

            document.getElementById(typingId).innerHTML = formatText(botReply);
            messagesEl.scrollTop = messagesEl.scrollHeight;

        } catch (error) {
            console.error("Full Error:", error);
            // Print the ACTUAL error directly into the chat bubble!
            document.getElementById(typingId).innerHTML = `<strong>Error:</strong> ${error.message}`;
        }
    }

    function appendMessage(text, sender) {
        const msgId = 'msg-' + Date.now();
        const div = document.createElement('div');
        const isUser = sender === 'user';
        
        div.id = msgId;
        div.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
        div.style.background = isUser ? 'linear-gradient(90deg, #7c3aed, #06b6d4)' : 'rgba(255,255,255,0.05)';
        div.style.border = isUser ? 'none' : '1px solid rgba(255,255,255,0.1)';
        div.style.color = '#fff';
        div.style.padding = '12px 16px';
        div.style.borderRadius = isUser ? '16px 16px 2px 16px' : '2px 16px 16px 16px';
        div.style.maxWidth = '85%';
        div.style.lineHeight = '1.5';
        
        div.innerHTML = formatText(text);
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        
        return msgId;
    }

    function formatText(text) {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    }
});
