const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");

const API_KEY = "AIzaSyBwVkgm1gDG54kaFRaYIBr3_vUedrgeL3g"; // ⚠️ Replace with your actual Gemini API key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const userData = {
    message: null,
};

// ✅ Create message element
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};


// ✅ Generate Bot Response
const generateBotResponse = async (incomingMessageDiv) => {

    const messageElement=incomingMessageDiv.querySelector(".message-text");
    try {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: userData.message }]
                    }
                ]
            })
        };

        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();

        // Handle error responses
        if (!response.ok) {
            throw new Error(data.error?.message || "API request failed");
        }

        // console.log("Gemini API Response:", data);

        // Extract model reply text
        const apiResponse=data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim();
        const botReply = apiResponse || "I'm sorry, I didn't receive a response.";
        messageElement.innerText=botReply;

    } catch (error) {

        console.error("Error:", error);

        // Show error in chat
        const errorMessage = createMessageElement(
            `<div class="message-text">⚠️ Error: ${error.message}</div>`,
            "bot-message"
        );
        chatBody.appendChild(errorMessage);
    }finally{
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }
};

// ✅ Handle outgoing message
const handleOutgoingMessage = (e) => {
    e.preventDefault();

    userData.message = messageInput.value.trim();
    if (!userData.message) return;

    messageInput.value = "";

    // Create and display user message
    const userMessageHTML = `<div class="message-text">${userData.message}</div>`;
    const outgoingMessageDiv = createMessageElement(userMessageHTML, "user-message");
    chatBody.appendChild(outgoingMessageDiv);

    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    // Simulate bot "thinking" indicator
    setTimeout(() => {
        const botThinkingHTML = `
            <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50"
                viewBox="0 0 1024 1024">
                <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 
                47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 
                41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 
                106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9z"></path>
            </svg>
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>`;

        const incomingMessageDiv = createMessageElement(botThinkingHTML, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);

        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        generateBotResponse(incomingMessageDiv);
    }, 600);
};

// ✅ Send message on Enter key press
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
        e.preventDefault();
        handleOutgoingMessage(e);
    }
});

// ✅ Send message on button click
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
