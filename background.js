// 카테고리 정의
const CATEGORIES = {
  cat_dev: "개발/정보",
  cat_news: "뉴스",
  cat_shop: "쇼핑",
  cat_etc: "기타",
};

// 1. 확장 프로그램 설치 시 우클릭 메뉴 생성 및 사이드바 설정
chrome.runtime.onInstalled.addListener(() => {
  // 메인 부모 메뉴 생성
  chrome.contextMenus.create({
    id: "link_pocket_main",
    title: "링크 포켓에 저장",
    contexts: ["page", "link"], // 페이지 빈 곳 및 링크 위에서도 우클릭 가능하도록 확장
  });

  // 자식 카테고리 메뉴 생성
  Object.entries(CATEGORIES).forEach(([id, title]) => {
    chrome.contextMenus.create({
      id: id,
      parentId: "link_pocket_main",
      title: title,
      contexts: ["page", "link"],
    });
  });

  // 툴바 아이콘 클릭 시 팝업 대신 사이드바가 기본으로 열리도록 설정
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("사이드바 설정 실패:", error));
});

// 2. 우클릭 메뉴 클릭 이벤트 리스너
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // 선택한 메뉴가 카테고리 중 하나인지 확인
  if (CATEGORIES[info.menuItemId]) {
    const categoryName = CATEGORIES[info.menuItemId];

    // 우클릭한 대상이 링크라면 해당 링크 주소를, 아니라면 현재 페이지 주소를 사용
    const linkUrl = info.linkUrl || info.pageUrl;
    const linkTitle = tab.title || "제목 없음";

    // 저장할 데이터 객체 생성
    const newLink = {
      id: Date.now().toString(), // 삭제 시 식별할 고유 ID
      title: linkTitle,
      url: linkUrl,
      category: categoryName,
      date: new Date().toLocaleDateString(),
    };

    // 기존 데이터 가져온 후 추가 저장
    chrome.storage.local.get({ links: [] }, (result) => {
      const currentLinks = result.links;
      currentLinks.push(newLink);

      chrome.storage.local.set({ links: currentLinks }, () => {
        console.log("링크 포켓 저장 완료:", newLink);

        // 저장이 성공하면 현재 활성화된 탭(content.js)으로 알림 전송
        if (tab && tab.id) {
          chrome.tabs.sendMessage(
            tab.id,
            {
              action: "SHOW_TOAST",
              category: categoryName,
            },
            (response) => {
              // 콘텐트 스크립트가 로드되지 않은 특수 페이지(크롬 설정 등)에서의 에러 방지
              if (chrome.runtime.lastError) {
                console.log(
                  "알림 전송 실패 (콘텐트 스크립트 미실행 페이지):",
                  chrome.runtime.lastError.message,
                );
              }
            },
          );
        }
      });
    });
  }
});

// 3. 확장 프로그램 툴바 아이콘 클릭 시 사이드바 토글 오픈
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});
