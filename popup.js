let currentCategory = "개발/정보";

// 팝업이 열릴 때 데이터 로드
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  renderLinks();
});

// 탭 클릭 이벤트 초기화
function initTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      tabs.forEach((t) => t.classList.remove("active"));
      e.target.classList.add("active");
      currentCategory = e.target.getAttribute("data-category");
      renderLinks();
    });
  });
}

// 스토리지에서 데이터를 읽어와 현재 카테고리에 맞는 리스트 화면 렌더링
function renderLinks() {
  const linkListEl = document.getElementById("linkList");
  linkListEl.innerHTML = ""; // 기존 아이템 초기화

  chrome.storage.local.get({ links: [] }, (result) => {
    // 현재 선택된 카테고리의 데이터만 필터링
    const filteredLinks = result.links.filter(
      (link) => link.category === currentCategory,
    );

    if (filteredLinks.length === 0) {
      linkListEl.innerHTML = `<li class="empty-msg">저장된 링크가 없습니다.</li>`;
      return;
    }

    filteredLinks.forEach((link) => {
      const li = document.createElement("li");
      li.className = "link-item";

      // HTML 구조 생성 (클릭 시 새 탭으로 이동)
      li.innerHTML = `
        <div class="link-info">
          <a href="${link.url}" target="_blank" title="${link.title}">${link.title}</a>
        </div>
        <button class="delete-btn" data-id="${link.id}">×</button>
      `;

      // 삭제 버튼 이벤트 연결
      li.querySelector(".delete-btn").addEventListener("click", (e) => {
        const idToDelete = e.target.getAttribute("data-id");
        deleteLink(idToDelete);
      });

      linkListEl.appendChild(li);
    });
  });
}

// 링크 삭제 함수
function deleteLink(id) {
  chrome.storage.local.get({ links: [] }, (result) => {
    const updatedLinks = result.links.filter((link) => link.id !== id);
    chrome.storage.local.set({ links: updatedLinks }, () => {
      renderLinks(); // 삭제 후 새로고침
    });
  });
}

/*
🚀 크롬 브라우저에서 테스트 및 실행 방법
위 파일 4개를 하나의 폴더(예: link-pocket)에 모아 저장합니다.

크롬 브라우저 주소창에 chrome://extensions/를 입력해 이동합니다.

우측 상단의 '개발자 모드' 토글을 켭니다.

좌측 상단에 나타나는 '압축해제된 확장 프로그램을 로드합니다.' 버튼을 누릅니다.

소스 코드가 담긴 폴더를 선택하면 브라우저에 등록됩니다.

아무 웹페이지나 들어가서 우클릭 후 연동을 확인해보세요! 과제 시연 및 제출용으로 완벽하게 동작할 것입니다. */
