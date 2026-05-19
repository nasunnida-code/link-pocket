// background.js로부터 "링크 저장 완료" 메시지를 받으면,
// 현재 사용자가 보고 있는 웹페이지의 우측 상단에
// 동적으로 토스트(Toast) 알림 창을 띄워주는 역할을 한다.

// background.js로부터 메시지를 수신 대기합니다.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SHOW_TOAST") {
    showLinkPocketToast(message.category);
    sendResponse({ status: "success" });
  }
});

/**
 * 화면 우측 상단에 링크 저장 완료 토스트 알림을 생성합니다.
 * @param {string} category - 저장된 카테고리 이름
 */
function showLinkPocketToast(category) {
  // 1. 이미 기존 토스트가 있다면 제거
  const existingToast = document.getElementById("link-pocket-toast");
  if (existingToast) {
    existingToast.remove();
  }

  // 2. 토스트 컨테이너 생성 및 스타일링
  const toast = document.createElement("div");
  toast.id = "link-pocket-toast";

  // 외부 웹사이트의 CSS와 충돌하지 않도록 스타일을 JS로 직접 지정 (Shadow DOM을 쓰면 더 안전합니다)
  Object.assign(toast.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "16px 24px",
    backgroundColor: "#1e1e2f",
    color: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: "999999", // 최상단에 배치
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "opacity 0.3s ease, transform 0.3s ease",
    opacity: "0",
    transform: "translateY(-10px)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderLeft: "5px solid #4cf5b2", // 포인트 컬러
  });

  // 3. 내용 삽입
  toast.innerHTML = `
    <span style="font-size: 16px;">📂</span>
    <div>
      <span style="color: #4cf5b2;">[${category}]</span> 카테고리에 링크가 저장되었습니다!
    </div>
  `;

  // 4. 문서(DOM)에 추가 및 애니메이션 효과
  document.body.appendChild(toast);

  // 약간의 딜레이 후 페이드인
  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  }, 10);

  // 5. 3초 후 페이드아웃 및 제거
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";

    // 애니메이션이 끝난 후 DOM에서 완전히 제거
    toast.addEventListener("transitionend", () => {
      toast.remove();
    });
  }, 3000);
}
