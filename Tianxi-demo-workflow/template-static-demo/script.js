const DEMO_PAGES = [
  {
    id: "home",
    title: "快速 Demo 模板",
    desc: "先跑通主流程，再逐步还原关键视觉细节。",
    cards: [
      ["P0 快速跑通", "先搭入口、导航、关键页面和基础点击。"],
      ["P1 关键还原", "优先还原演示最常走的页面、弹窗和输入框。"],
      ["P2 视觉精修", "集中处理 hover、选中态、toast、滚动条和资产。"],
    ],
  },
  {
    id: "flow",
    title: "主流程",
    desc: "这里放必须演示成功的关键路径。",
    cards: [
      ["步骤 1", "用户从入口进入核心页面。"],
      ["步骤 2", "用户完成一次选择或输入。"],
      ["步骤 3", "系统给出结果或完成态。"],
    ],
  },
  {
    id: "review",
    title: "评审态",
    desc: "这里放适合设计评审和浏览器批注的页面。",
    cards: [
      ["批注规则", "每条批注说明问题、期望、依据和优先级。"],
      ["交付规则", "每轮改完都提供线上链接和变更说明。"],
    ],
  },
];

let currentPageId = DEMO_PAGES[0].id;

const nav = document.querySelector("#demo-nav");
const title = document.querySelector("#page-title");
const desc = document.querySelector("#page-desc");
const content = document.querySelector("#page-content");
const sendButton = document.querySelector("#send-button");
const promptEditor = document.querySelector("#prompt-editor");

function renderNav() {
  nav.innerHTML = DEMO_PAGES.map((page) => `
    <button type="button" data-page="${page.id}" class="${page.id === currentPageId ? "is-active" : ""}">
      ${page.title}
    </button>
  `).join("");
}

function renderPage() {
  const page = DEMO_PAGES.find((item) => item.id === currentPageId) || DEMO_PAGES[0];
  title.textContent = page.title;
  desc.textContent = page.desc;
  content.innerHTML = page.cards.map(([cardTitle, cardDesc]) => `
    <article class="demo-card">
      <strong>${cardTitle}</strong>
      <p>${cardDesc}</p>
    </article>
  `).join("");
  renderNav();
}

nav.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-page]");
  if (!button) return;
  currentPageId = button.dataset.page;
  renderPage();
});

sendButton.addEventListener("click", () => {
  const value = promptEditor.textContent.trim();
  if (!value) return;
  content.insertAdjacentHTML("afterbegin", `
    <article class="demo-card">
      <strong>已收到输入</strong>
      <p>${value}</p>
    </article>
  `);
  promptEditor.textContent = "";
});

renderPage();
