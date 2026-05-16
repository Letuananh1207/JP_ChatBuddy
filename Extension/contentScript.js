(() => {
  console.log("JP ChatBuddy content script running...");

  let isMinimized = true;
  let iframeCreated = false;
  let iframe = null;
  const IFRAME_HEIGHT = 280;

  /* =======================
      Inject Chatbot Container
  ======================== */
  const container = document.createElement("div");
  container.id = "jp-chatbot-wrapper";
  // Container luôn cao cố định (iframe + nút) để giữ vị trí cho nút bấm
  container.style.cssText = `
    position: fixed;
    bottom: 0px;
    right: 10px;
    z-index: 9999999;
    width: 300px;
    height: ${IFRAME_HEIGHT + 30}px; 
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    pointer-events: none;
    transition: transform 0.3s ease-in-out;
  `;
  document.body.appendChild(container);

  const toggleBtn = document.createElement("div");
  toggleBtn.style.cssText = `
    width: 35px;
    height: 30px;
    background: #4A90E2;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    box-shadow: 0 -2px 5px rgba(0,0,0,0.2);
    font-size: 14px;
    user-select: none;
    pointer-events: auto;
  `;
  container.appendChild(toggleBtn);

  /* =======================
      Hàm tạo Iframe
  ======================== */
  const createIframe = () => {
    if (iframeCreated) return;
    iframe = document.createElement("iframe");
    iframe.src = chrome.runtime.getURL("dist/index.html");
    iframe.allow = "microphone";
    iframe.style.cssText = `
      border: none;
      height: ${IFRAME_HEIGHT}px;
      width: 300px;
      background: white;
      box-shadow: 0 0 15px rgba(0,0,0,0.2);
      display: block;
      pointer-events: auto;
      border-radius: 5px 0 0 0;
    `;
    container.appendChild(iframe);
    iframeCreated = true;
  };

  /* =======================
      Logic Cập Nhật UI
  ======================== */
  const updateUI = (minimized, animate = true) => {
    isMinimized = minimized;
    container.style.transition = animate
      ? "transform 0.3s ease-in-out"
      : "none";

    if (isMinimized) {
      // Đẩy container xuống đúng bằng chiều cao iframe, chỉ để lộ 30px của nút
      container.style.transform = `translateY(${IFRAME_HEIGHT}px)`;
      toggleBtn.innerHTML = "▲";
    } else {
      createIframe();
      container.style.transform = "translateY(0px)";
      toggleBtn.innerHTML = "▼";
    }
  };

  // Khôi phục trạng thái từ Storage
  chrome.storage.local.get(["jp_chatbot_minimized"], (result) => {
    const savedState =
      result.jp_chatbot_minimized !== undefined
        ? result.jp_chatbot_minimized
        : false;
    updateUI(savedState, false);
  });

  toggleBtn.addEventListener("click", () => {
    const nextState = !isMinimized;
    updateUI(nextState, true);
    chrome.storage.local.set({ jp_chatbot_minimized: nextState });
  });

  /* =======================
      Floating Controls Group
  ======================== */
  const buttonGroup = document.createElement("div");
  buttonGroup.style.cssText = `
    position: absolute;
    display: none;
    gap: 8px;
    z-index: 1000000;
    pointer-events: none;
  `;
  document.body.appendChild(buttonGroup);

  const commonBtnStyle = `
    width: 28px; height: 28px; background: #fff; border-radius: 50%;
    cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
    pointer-events: auto; user-select: none;
  `;

  const floatBtnLookup = document.createElement("div");
  floatBtnLookup.title = "Giải thích chi tiết";
  floatBtnLookup.style.cssText = commonBtnStyle;
  const imgLookup = document.createElement("img");
  imgLookup.src = chrome.runtime.getURL("./dist/quote_ic.png");
  imgLookup.style.width = "18px";
  floatBtnLookup.appendChild(imgLookup);

  const floatBtnAdd = document.createElement("div");
  floatBtnAdd.title = "Thêm từ vựng";
  floatBtnAdd.style.cssText = commonBtnStyle;
  const imgAdd = document.createElement("img");
  imgAdd.src = chrome.runtime.getURL("./dist/star_ic.png");
  imgAdd.style.width = "18px";
  floatBtnAdd.appendChild(imgAdd);

  buttonGroup.appendChild(floatBtnLookup);
  buttonGroup.appendChild(floatBtnAdd);

  let selectedText = "";
  document.addEventListener("mouseup", () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      buttonGroup.style.display = "none";
      return;
    }
    selectedText = selection.toString().trim();
    if (!selectedText) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    buttonGroup.style.top = `${window.scrollY + rect.top - 40}px`;
    buttonGroup.style.left = `${window.scrollX + rect.left}px`;
    buttonGroup.style.display = "flex";
  });

  const autoExpandAndSend = (type, payload) => {
    if (isMinimized) {
      updateUI(false, true);
      chrome.storage.local.set({ jp_chatbot_minimized: false });
    }
    setTimeout(
      () => {
        if (iframe) iframe.contentWindow.postMessage({ type, payload }, "*");
      },
      iframeCreated ? 10 : 500
    );
  };

  floatBtnAdd.addEventListener("click", (e) => {
    e.stopPropagation();
    autoExpandAndSend("TEXT_SELECTED", selectedText);
    hideButtons();
  });

  floatBtnLookup.addEventListener("click", (e) => {
    e.stopPropagation();
    autoExpandAndSend("EXPLAIN_TEXT", selectedText);
    hideButtons();
  });

  function hideButtons() {
    buttonGroup.style.display = "none";
    window.getSelection()?.removeAllRanges();
  }

  /* Bridge & Listeners */
  window.addEventListener("message", (event) => {
    if (!event.data?.type) return;
    if (event.data.type === "START_MIC")
      chrome.runtime.sendMessage({ type: "START_MIC" });
    if (event.data.type === "STOP_MIC")
      chrome.runtime.sendMessage({ type: "STOP_MIC" });
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "SPEECH_RESULT" && iframe) {
      iframe.contentWindow.postMessage(msg, "*");
    }
  });

  console.log("JP ChatBuddy injected ✅ Final UI Fixed.");
})();
