// 카테고리 정의
const CATEGORIES = {
  cat_dev: "개발/정보",
  cat_news: "뉴스",
  cat_shop: "쇼핑",
  cat_etc: "기타",
};

// 1. 확장 프로그램 설치 시 우클릭 메뉴 생성
chrome.runtime.onInstalled.addListener(() => {
  // 메인 부모 메뉴 생성
  chrome.contextMenus.create({
    id: "link_pocket_main",
    title: "링크 포켓에 저장",
    contexts: ["page"],
  });

  // 자식 카테고리 메뉴 생성
  Object.entries(CATEGORIES).forEach(([id, title]) => {
    chrome.contextMenus.create({
      id: id,
      parentId: "link_pocket_main",
      title: title,
      contexts: ["page"],
    });
  });
});

// 2. 우클릭 메뉴 클릭 이벤트 리스너
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // 선택한 메뉴가 카테고리 중 하나인지 확인
  if (CATEGORIES[info.menuItemId]) {
    const categoryName = CATEGORIES[info.menuItemId];

    // 저장할 데이터 객체 생성 (기획서 명세 반영)
    const newLink = {
      id: Date.now().toString(), // 삭제 시 식별할 고유 ID
      title: tab.title || "제목 없음",
      url: tab.url,
      category: categoryName,
      date: new Date().toLocaleDateString(),
    };

    // 기존 데이터 가져온 후 추가 저장
    chrome.storage.local.get({ links: [] }, (result) => {
      const currentLinks = result.links;
      currentLinks.push(newLink);

      chrome.storage.local.set({ links: currentLinks }, () => {
        console.log("링크 포켓 저장 완료:", newLink);
      });
    });
  }
});
