// Firebase init
const firebaseConfig = {
  apiKey: "AIzaSyBd4r_6QEDLG0dD1C3XiVcHgpkIA700CfQ",
  authDomain: "happy-luna.firebaseapp.com",
  projectId: "happy-luna",
  storageBucket: "happy-luna.appspot.com",
  messagingSenderId: "771017673760",
  appId: "1:771017673760:web:d91617613f639340618045"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Elements
const calendarGrid = document.getElementById("calendar-grid");
const calendarTitle = document.getElementById("calendar-title");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");
const saveStatus = document.getElementById("saveStatus");
const boardInput = document.getElementById("boardId");
const createBoardBtn = document.getElementById("createBoard");
const copyLinkBtn = document.getElementById("copyLink");
const copyMsg = document.getElementById("copyMsg");

let currentDate = new Date();
let happyDays = {};
let badDays = {};
let boardId = localStorage.getItem("boardId") || "";

// ---------- Board ID ----------
function generateBoardId() {
  return Math.random().toString(36).substring(2, 10);
}
function createBoard() {
  boardId = generateBoardId();
  localStorage.setItem("boardId", boardId);
  boardInput.value = boardId;
  copyLinkBtn.disabled = false;
  saveStatus.textContent = "شناسه ساخته شد ✅";
  loadFromFirestore();
}
createBoardBtn.addEventListener("click", createBoard);

copyLinkBtn.addEventListener("click", () => {
  const link = `${window.location.origin}${window.location.pathname}?board=${boardId}`;
  navigator.clipboard.writeText(link);
  copyMsg.textContent = "لینک کپی شد!";
});

// اگر لینک با ?board= بود
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("board")) {
  boardId = urlParams.get("board");
  boardInput.value = boardId;
  copyLinkBtn.disabled = false;
  loadFromFirestore();
} else if (boardId) {
  boardInput.value = boardId;
  copyLinkBtn.disabled = false;
  loadFromFirestore();
}

// ---------- Calendar ----------
function renderCalendar() {
  calendarGrid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "ژانویه","فوریه","مارس","آوریل","مه","ژوئن",
    "ژوئیه","اوت","سپتامبر","اکتبر","نوامبر","دسامبر"
  ];
  calendarTitle.textContent = `${monthNames[month]} ${year}`;

  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.classList.add("day");
    const span = document.createElement("span");
    span.classList.add("num");
    span.textContent = day;
    cell.appendChild(span);

    const key = `${year}-${month + 1}-${day}`;
    if (happyDays[key]) cell.classList.add("is-happy");
    if (badDays[key]) cell.classList.add("is-bad");

    cell.addEventListener("click", () => toggleDay(key, cell));
    calendarGrid.appendChild(cell);
  }
}

function toggleDay(key, cell) {
  if (!boardId) return alert("ابتدا شناسه بسازید!");

  if (happyDays[key]) {
    delete happyDays[key];
    badDays[key] = true;
  } else if (badDays[key]) {
    delete badDays[key];
  } else {
    happyDays[key] = true;
  }

  saveToFirestore();
  renderCalendar();
}

prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});
nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// ---------- Firestore ----------
function saveToFirestore() {
  db.collection("boards").doc(boardId).set({happyDays, badDays})
    .then(() => saveStatus.textContent = "ذخیره شد ✅")
    .catch(() => saveStatus.textContent = "خطا در ذخیره ❌");
}

function loadFromFirestore() {
  if (!boardId) return;
  db.collection("boards").doc(boardId).onSnapshot(doc => {
    if (doc.exists) {
      happyDays = doc.data().happyDays || {};
      badDays = doc.data().badDays || {};
      renderCalendar();
      saveStatus.textContent = "داده‌ها بارگذاری شدند ✅";
    } else {
      happyDays = {};
      badDays = {};
      renderCalendar();
    }
  });
}

// ---------- Init ----------
renderCalendar();
