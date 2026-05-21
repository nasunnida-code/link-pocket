let currentCategory = "관심";

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

// ─── 월별 다이어리 기능 로직 ───
let currentDate = new Date();

const monthLabel = document.getElementById("currentMonthLabel");
const diaryMemo = document.getElementById("diaryMemo");
const prevBtn = document.getElementById("prevMonthBtn");
const nextBtn = document.getElementById("nextMonthBtn");
const saveBtn = document.getElementById("saveDiaryBtn");

// 화면에 현재 연도와 월을 표시하고 저장된 메모를 불러오는 함수
function updateDiaryView() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 0부터 시작하므로 +1

  if (monthLabel) {
    monthLabel.textContent = `${year}년 ${month}월`;
  }

  // 스토리지 키 생성 (예: "diary_2026_5")
  const storageKey = `diary_${year}_${month}`;

  // 크롬 확장 프로그램 환경(chrome.storage)인지 일반 웹(localStorage)인지 체크 후 로드
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get([storageKey], (result) => {
      if (diaryMemo) diaryMemo.value = result[storageKey] || "";
    });
  } else {
    if (diaryMemo) diaryMemo.value = localStorage.getItem(storageKey) || "";
  }
}

// 이전달 이동 버튼 이벤트
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateDiaryView();
  });
}

// 다음달 이동 버튼 이벤트
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateDiaryView();
  });
}

// 메모 저장하기 버튼 이벤트
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const storageKey = `diary_${year}_${month}`;
    const text = diaryMemo ? diaryMemo.value : "";

    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      chrome.storage.local.set({ [storageKey]: text }, () => {
        alert("메모가 저장되었습니다!");
      });
    } else {
      localStorage.setItem(storageKey, text);
      alert("메모가 저장되었습니다!");
    }
  });
}

// 최초 실행 시 다이어리 데이터 불러오기
updateDiaryView();

/*
🚀 크롬 브라우저에서 테스트 및 실행 방법
위 파일 4개를 하나의 폴더(예: link-pocket)에 모아 저장합니다.

크롬 브라우저 주소창에 chrome://extensions/를 입력해 이동합니다.

우측 상단의 '개발자 모드' 토글을 켭니다.

좌측 상단에 나타나는 '압축해제된 확장 프로그램을 로드합니다.' 버튼을 누릅니다.

소스 코드가 담긴 폴더를 선택하면 브라우저에 등록됩니다.

아무 웹페이지나 들어가서 우클릭 후 연동을 확인해보세요! 과제 시연 및 제출용으로 완벽하게 동작할 것입니다. */
