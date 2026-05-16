// background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log("JP ChatBuddy background script loaded ✅");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GREETING") {
    sendResponse({ reply: "Konnichiwa 👋" });
  }

  // Xử lý khi chọn ⭐ (Lưu từ) hoặc 🪄 (Giải thích)
  if (message.type === "TEXT_SELECTED" || message.type === "EXPLAIN_TEXT") {
    console.log(`📌 ${message.type}:`, message.payload);

    // 1. Lưu vào storage để có thể truy xuất sau này
    chrome.storage.local.set({
      lastAction: {
        type: message.type,
        text: message.payload,
        timestamp: Date.now(),
      },
    });

    // 2. Chuyển tiếp tin nhắn đến Content Script để đẩy vào iframe ChatBot
    chrome.tabs.sendMessage(sender.tab.id, {
      type: "FORWARD_TO_IFRAME",
      originalType: message.type,
      payload: message.payload,
    });
  }
});
