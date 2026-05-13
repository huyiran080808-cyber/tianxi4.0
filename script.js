// ── Side Float Panels (历史对话 / 虾详情) ─────────────────

const windowBody = document.querySelector('.window-body');

const historyPanel = document.getElementById('history-panel');
const agentDetailPanel = document.getElementById('agent-detail-panel');
const addSkillPanel = document.getElementById('add-skill-panel');
const btnHistory = document.getElementById('btn-history');
const btnAgentDetail = document.getElementById('btn-agent-detail');

const allSidePanels = [historyPanel, agentDetailPanel, addSkillPanel];
const allSideBtns = [btnHistory, btnAgentDetail];

function openSidePanel(panel, btn) {
  allSidePanels.forEach(p => {
    if (p !== panel) p.classList.remove('open');
  });
  allSideBtns.forEach(b => {
    if (b !== btn) b?.classList.remove('is-active');
  });

  const isOpen = panel.classList.contains('open');
  if (isOpen) {
    panel.classList.remove('open');
    btn?.classList.remove('is-active');
  } else {
    panel.classList.add('open');
    btn?.classList.add('is-active');
  }
}

function closeSidePanel(panel, btn) {
  panel.classList.remove('open');
  btn?.classList.remove('is-active');
}

btnHistory?.addEventListener('click', () => openSidePanel(historyPanel, btnHistory));
btnAgentDetail?.addEventListener('click', () => openSidePanel(agentDetailPanel, btnAgentDetail));
document.getElementById('history-close')?.addEventListener('click', () => closeSidePanel(historyPanel, btnHistory));
document.getElementById('agent-detail-close')?.addEventListener('click', () => closeSidePanel(agentDetailPanel, btnAgentDetail));

// "+" button in skill-section-header opens a small list popover (Figma 3618:206193 / 3618:206746)
let addSkillListEl = null;
let addSkillListOpen = false;

function ensureAddSkillListPopover() {
  if (addSkillListEl) return addSkillListEl;
  const el = document.createElement('div');
  el.className = 'skill-add-list-popover';
  el.style.display = 'none';
  el.innerHTML = `
    <button class="skill-add-list-option" type="button" data-action="go-market">
      <span class="skill-add-list-main">
        <img class="skill-add-list-icon" src="./icon/skill-add-go-market.svg" alt="" />
        <span class="skill-add-list-text">去技能广场添加技能</span>
      </span>
    </button>
    <button class="skill-add-list-option" type="button" data-action="create-by-chat">
      <span class="skill-add-list-main">
        <img class="skill-add-list-icon" src="./icon/skill-add-chat.svg" alt="" />
        <span class="skill-add-list-text">通过对话创建技能</span>
      </span>
    </button>
  `;
  document.body.appendChild(el);
  addSkillListEl = el;

  el.querySelectorAll('.skill-add-list-option').forEach(btn => {
    btn.addEventListener('mousedown', e => e.preventDefault());
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      closeAddSkillListPopover();

      // After any selection, close all right side float panels.
      [historyPanel, agentDetailPanel, addSkillPanel].forEach(p => p?.classList.remove('open'));
      [btnHistory, btnAgentDetail].forEach(b => b?.classList.remove('is-active'));

      if (action === 'go-market') {
        navigateTo('skills-market');
        return;
      }
      if (action === 'create-by-chat') {
        // Keep current page style; only fill the composer input (Figma 2271:63247).
        fillCreateSkillByChatPrompt();
      }
    });
  });

  return el;
}

function openAddSkillListPopover(buttonEl) {
  const pop = ensureAddSkillListPopover();
  pop.style.display = 'block';
  pop.getBoundingClientRect();
  // Position below the "+" button, aligned to the right edge, like design.
  const rect = buttonEl.getBoundingClientRect();
  const gap = 8;
  const left = Math.max(12, Math.min(rect.right - pop.offsetWidth, window.innerWidth - pop.offsetWidth - 12));
  const top = Math.max(12, Math.min(rect.bottom + gap, window.innerHeight - pop.offsetHeight - 12));
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
  addSkillListOpen = true;
}

function closeAddSkillListPopover() {
  if (!addSkillListEl) return;
  addSkillListEl.style.display = 'none';
  addSkillListOpen = false;
}

function toggleAddSkillListPopover(buttonEl) {
  if (addSkillListOpen) closeAddSkillListPopover();
  else openAddSkillListPopover(buttonEl);
}

document.getElementById('btn-add-skill')?.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  toggleAddSkillListPopover(e.currentTarget);
});

document.getElementById('add-skill-close')?.addEventListener('click', () => {
  // Close add-skill-panel and re-open agent-detail-panel
  addSkillPanel.classList.remove('open');
  agentDetailPanel.classList.add('open');
  btnAgentDetail?.classList.add('is-active');
});

// Close add-skill list popover on outside click / Esc
document.addEventListener('mousedown', e => {
  if (!addSkillListOpen) return;
  const pop = addSkillListEl;
  const btn = document.getElementById('btn-add-skill');
  if (pop && pop.contains(e.target)) return;
  if (btn && btn.contains(e.target)) return;
  closeAddSkillListPopover();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && addSkillListOpen) {
    e.preventDefault();
    closeAddSkillListPopover();
  }
});

// Category tab switching in add-skill-panel
document.querySelectorAll('.add-skill-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.add-skill-tab').forEach(t => t.classList.remove('is-active'));
    tab.classList.add('is-active');
  });
});

// ── Pre-built History Conversations (copy7) ────────────
const HISTORY_CONVERSATIONS = [
  // 0: 帮我解读这个文件
  {
    title: '帮我解读这个文件',
    messages: [
      { type: 'user', text: '帮我解读一下这个文件' },
      {
        type: 'ai-file',
        fileName: 'Q1产品规划草案.pdf',
        fileSize: '1.2 MB',
        analysis: {
          summary: '这是一份 Q1 产品规划草案，主要围绕天禧 Claw 的核心功能迭代展开。',
          sections: [
            { title: '📌 核心目标', content: '提升用户日均使用时长至 45 分钟，新增技能广场模块' },
            { title: '🔧 功能规划', content: '多智能体协作、定时任务、知识库管理、本地设备控制' },
            { title: '📊 关键指标', content: 'DAU 目标 10 万，次日留存率 > 40%，技能广场添加率 > 25%' },
            { title: '⏰ 时间节点', content: '1月：MVP 内测 → 2月：功能完善 → 3月：公测发布' },
          ],
        },
      },
      {
        type: 'ai',
        text: '整体来说这份规划比较清晰，核心目标和关键指标对齐得不错。有几个建议：',
        bullets: [
          '技能广场的冷启动策略可以再细化一下，首批精选技能需要有代表性',
          'DAU 10万的目标偏激进，建议补充增长路径和渠道规划',
          '多智能体协作的技术方案部分可以再深入，特别是 session 隔离和上下文管理',
        ],
      },
    ],
  },
  // 1: 什么是第一性原理？
  {
    title: '什么是第一性原理？',
    messages: [
      { type: 'user', text: '什么是第一性原理？' },
      {
        type: 'ai-thinking',
        steps: [
          { type: 'read', text: '搜索了第一性原理的定义和应用' },
          { type: 'text', text: '第一性原理（First Principles）是一种思维方式...' },
        ],
      },
      {
        type: 'ai',
        text: '**第一性原理思维**，就是把复杂问题拆解到最基本的、不可再简化的事实，然后从这些基本事实出发，重新推导解决方案。',
        sections: [
          {
            title: '🧠 核心概念',
            content: '类比思维是"别人怎么做我也怎么做"，而第一性原理是"回到事物本身，从头想"。最早由亚里士多德提出，后来被马斯克广泛推广。',
          },
          {
            title: '🚀 经典案例',
            content: '马斯克造火箭时，发现火箭成本极高。他没有接受"火箭就是贵"的类比思维，而是从原材料成本（铝合金、钛、碳纤维）出发，发现材料成本只占火箭价格的 2%，从而创立 SpaceX 自己造火箭。',
          },
          { title: '💡 如何运用', content: '1) 识别并质疑现有假设 → 2) 拆解到基本事实 → 3) 从零开始重构方案' },
        ],
      },
      {
        type: 'ai',
        text: '举个贴近生活的例子：你想开一家咖啡店。类比思维是"看看别人怎么开的"，第一性原理则是拆解到本质——咖啡店的核心价值是什么？是咖啡？是空间？是社交？从最基本的用户需求出发，可能会得出完全不同的方案。',
      },
    ],
  },
  // 2: 写一段生日祝福文案
  {
    title: '写一段生日祝福文案',
    messages: [
      { type: 'user', text: '写一段生日祝福文案，送给我的好朋友，她叫小美，25岁，喜欢旅行和摄影' },
      { type: 'ai-thinking', steps: [{ type: 'text', text: '好的，我来为小美写一段温暖的生日祝福～' }] },
      { type: 'ai', text: '🎂 **给小美的生日祝福**' },
      {
        type: 'ai',
        text: '亲爱的小美：\n\n25岁，正是最好的年纪。愿你新的一岁里，脚步踏遍更多山川湖海，镜头里装下更多人间烟火。愿你走过的每段旅途都成为生命里的光，愿你的每一天都值得被记录。\n\n生日快乐！🎈📸✨',
      },
      {
        type: 'ai',
        text: '如果你觉得风格不太对，可以告诉我想要什么样的语气，比如更搞笑的、更文艺的，或者更简短的朋友圈版本，我随时可以调整～',
        options: ['再来一个搞笑版', '写个朋友圈短版', '英文版', '改成诗歌风格'],
      },
    ],
  },
  // 3: 帮我做一份周报
  {
    title: '帮我做一份周报',
    messages: [
      { type: 'user', text: '帮我做一份周报，主要写这周完成的产品设计评审和下周的技能广场上线计划' },
      { type: 'ai-thinking', steps: [{ type: 'text', text: '好的，我来帮你整理周报内容～' }] },
      { type: 'ai', text: '📋 **本周工作周报**' },
      {
        type: 'ai',
        text: '本周主要完成了产品设计评审会议，对天禧 Claw 的多智能体协作方案进行了讨论。下周的核心工作是技能广场的上线准备。',
        sections: [
          { title: '✅ 本周完成', content: '产品设计评审、原型 Demo 制作、技能广场卡片设计' },
          { title: '🔜 下周计划', content: '技能广场 MVP 上线、首批精选技能导入、用户反馈收集' },
          { title: '⚠️ 风险项', content: '技能广场冷启动内容不足，需要运营团队配合补充' },
        ],
      },
      { type: 'ai', text: '这份周报可以直接复制到飞书文档里，需要调整格式或补充内容的话随时告诉我～', options: ['补充更多细节', '生成飞书文档', '导出 PDF'] },
    ],
  },
  // 4: 规划一个成都周末两日游
  {
    title: '规划一个成都周末两日游',
    messages: [
      { type: 'user', text: '帮我规划一个成都周末两日游，预算 500 以内，喜欢美食和文化景点' },
      { type: 'ai-thinking', steps: [{ type: 'read', text: '搜索了成都美食攻略和文化景点推荐' }, { type: 'tool', text: '执行了行程规划和预算计算' }] },
      { type: 'ai', text: '🗺️ **成都周末两日游规划**' },
      {
        type: 'ai',
        text: '根据预算和偏好，给你规划了一条经典路线：',
        sections: [
          { title: '📅 Day 1', content: '宽窄巷子（免费）→ 锦里吃小吃（约 80 元）→ 武侯祠（50 元）→ 九眼桥夜景' },
          { title: '📅 Day 2', content: '杜甫草堂（50 元）→ 人民公园喝茶（20 元）→ 春熙路逛吃（约 100 元）→ 太古里打卡' },
          { title: '💰 预算估算', content: '门票约 100 元 + 餐饮约 250 元 + 交通约 50 元 = 总计约 400 元' },
        ],
      },
      { type: 'ai', text: '如果想增加一个都江堰半日游，需要额外约 100 元（门票 + 交通），总预算刚好 500。要加上吗？', options: ['加上都江堰', '就这样吧', '推荐几个特色小店'] },
    ],
  },
  // 5: 把这份会议纪要整理成邮件
  {
    title: '把这份会议纪要整理成邮件',
    messages: [
      { type: 'user', text: '帮我把这份会议纪要整理成一封正式邮件发给团队' },
      { type: 'ai-thinking', steps: [{ type: 'read', text: '解析了会议纪要内容' }, { type: 'text', text: '正在整理邮件格式...' }] },
      { type: 'ai', text: '📧 **会议纪要邮件草稿**' },
      {
        type: 'ai',
        text: '以下是整理好的邮件草稿，已经转换为正式商务格式：',
        sections: [
          { title: '📌 会议主题', content: '天禧 Claw 产品功能评审会 - 2026/04/14' },
          { title: '👥 参会人员', content: '产品组全体、研发组代表、设计组' },
          { title: '✅ 结论', content: '技能广场 MVP 确认 4/20 上线，多智能体协作方案进入开发阶段' },
          { title: '🔜 Action Items', content: '小黄 - 技能广场 PRD 定稿；研发组 - 技术架构评审；设计组 - 卡片视觉稿' },
        ],
      },
      { type: 'ai', text: '可以直接复制到邮件里发送。需要调整语气、补充内容，或者生成飞书文档吗？', options: ['语气再正式一点', '生成飞书文档', '直接发送'] },
    ],
  },
  // 6: 帮我写一篇产品介绍文案
  {
    title: '帮我写一篇产品介绍文案',
    messages: [
      { type: 'user', text: '帮我写一篇天禧 Claw 的产品介绍文案，面向科技爱好者，突出"开箱即用的超级AI助手"这个定位' },
      { type: 'ai-thinking', steps: [{ type: 'read', text: '分析了天禧 Claw 产品文档和竞品特点' }, { type: 'text', text: '正在生成产品介绍文案...' }] },
      { type: 'ai', text: '🚀 **天禧 Claw：开箱即用的超级 AI 助手**' },
      {
        type: 'ai',
        text: '不用配置环境、不用写提示词、不用学 API —— 打开就能用的 AI 助手，才是好助手。',
        bullets: [
          '🦞 **多智能体协作**：虾管家管日常、虾小秘处理邮件、虾溜达规划旅行，各有所长',
          '🛠 **技能广场**：像手机装 APP 一样给你的 AI 加技能，一键安装，即装即用',
          '🔌 **全平台覆盖**：PC、手机、平板无缝切换，聊天记录自动同步',
          '📅 **定时任务**：到点自动执行，不用每次手动触发',
        ],
      },
      { type: 'ai', text: 'AI 助手不应该只是一个聊天框。它应该是你的数字分身——能理解你的习惯，主动帮你做事，而且越用越懂你。' },
      { type: 'ai', text: '需要调整风格吗？比如更技术流的写法、或者更偏社交媒体传播的版本？', options: ['写一篇社交媒体版', '写个技术向版本', '再精简到 100 字'] },
    ],
  },
  // 7: 帮我写一封商务邮件
  {
    title: '帮我写一封商务邮件',
    messages: [
      { type: 'user', text: '帮我写一封商务邮件，邀请合作方参加产品发布会' },
      { type: 'ai-thinking', steps: [{ type: 'text', text: '好的，我来帮你起草一封商务邀请邮件～' }] },
      { type: 'ai', text: '📧 **商务邀请邮件草稿**' },
      {
        type: 'ai',
        text: '尊敬的合作伙伴：\n\n您好！我们诚挚地邀请您参加天禧 Claw 产品发布会。\n\n📅 时间：2026年5月10日 14:00\n📍 地点：成都高新区天府软件园\n🎯 主题：开箱即用的超级 AI 助手\n\n届时将展示多智能体协作、技能广场等核心功能。期待您的光临！',
        options: ['调整语气更正式', '加个回复截止日期', '生成英文版'],
      },
    ],
  },
  // 8: 整理今天的会议纪要
  {
    title: '整理今天的会议纪要',
    messages: [
      { type: 'user', text: '帮我把今天的会议内容整理成纪要' },
      { type: 'ai-thinking', steps: [{ type: 'read', text: '解析了会议记录' }, { type: 'text', text: '正在整理会议纪要...' }] },
      { type: 'ai', text: '📋 **会议纪要**' },
      {
        type: 'ai',
        text: '以下是整理好的会议纪要：',
        sections: [
          { title: '📌 会议主题', content: '产品功能评审 - 2026/04/14' },
          { title: '👥 参会人员', content: '产品组、研发组、设计组' },
          { title: '✅ 结论', content: '确认技能广场 4/20 上线，多智能体协作进入开发' },
          { title: '🔜 Action Items', content: '小黄 - PRD 定稿；研发 - 架构评审；设计 - 视觉稿' },
        ],
      },
    ],
  },
  // 9: 安排明天的会议
  {
    title: '安排明天的会议',
    messages: [
      { type: 'user', text: '帮我安排一个明天下午的产品评审会议，2小时，邀请研发和设计组' },
      { type: 'ai-thinking', steps: [{ type: 'tool', text: '执行了日历查询和会议创建' }] },
      { type: 'ai', text: '✅ **会议已创建**' },
      {
        type: 'ai',
        text: '以下是会议详情：',
        sections: [
          { title: '📅 时间', content: '2026年4月15日 14:00 - 16:00' },
          { title: '📍 地点', content: '5F 会议室 A' },
          { title: '👥 参会人', content: '研发组全体、设计组全体' },
          { title: '📝 主题', content: '天禧 Claw 多智能体协作方案评审' },
        ],
      },
      { type: 'ai', text: '已自动发送会议邀请给所有参会人员，需要调整时间或补充参会人吗？', options: ['改到上午', '补充参会人员', '加个会议议程'] },
    ],
  },
  // 10: 帮我回复这封催办邮件
  {
    title: '帮我回复这封催办邮件',
    messages: [
      { type: 'user', text: '合作方催问项目进度了，帮我回复一下' },
      { type: 'ai-thinking', steps: [{ type: 'text', text: '好的，我来帮你起草回复...' }] },
      { type: 'ai', text: '📧 **回复草稿**' },
      {
        type: 'ai',
        text: '感谢您的跟进！项目目前进展顺利：\n\n✅ 核心功能开发已完成 85%\n✅ 技能广场 MVP 即将上线\n🔜 多智能体协作模块正在联调\n\n预计 5 月初可以完成整体交付，届时我们会安排一次演示。如有任何疑问随时沟通～',
        options: ['语气再委婉一点', '加个具体日期', '直接发送'],
      },
    ],
  },
  // 11: 帮我规划三亚五日游
  {
    title: '帮我规划三亚五日游',
    messages: [
      { type: 'user', text: '帮我规划一个三亚五日游，两个人，预算 8000，喜欢海和美食' },
      { type: 'ai-thinking', steps: [{ type: 'read', text: '搜索了三亚旅游攻略和美食推荐' }, { type: 'tool', text: '执行了行程规划和预算计算' }] },
      { type: 'ai', text: '🗺️ **三亚五日游规划**' },
      {
        type: 'ai',
        text: '为你规划了一条经典路线：',
        sections: [
          { title: '📅 Day 1', content: '抵达三亚 → 亚龙湾海滩 → 第一市场海鲜大餐' },
          { title: '📅 Day 2', content: '蜈支洲岛一日游（潜水 + 水上项目）' },
          { title: '📅 Day 3', content: '南山文化旅游区 → 天涯海角 → 椰梦长廊看日落' },
          { title: '📅 Day 4', content: '三亚湾浮潜 → 免税店购物 → 鹿回头夜景' },
          { title: '📅 Day 5', content: '自由活动 → 返程' },
        ],
      },
      { type: 'ai', text: '💰 预算估算：机票 3000 + 住宿 2000 + 餐饮 1200 + 门票及活动 1500 + 交通 300 = 总计约 8000 元', options: ['加个潜水推荐', '换个便宜点的方案', '帮我订酒店'] },
    ],
  },
  // 12: 推荐几家成都特色火锅
  {
    title: '推荐几家成都特色火锅',
    messages: [
      { type: 'user', text: '推荐几家成都本地人爱吃的火锅店，不要太游客的那种' },
      { type: 'ai-thinking', steps: [{ type: 'read', text: '搜索了成都本地人推荐的火锅店' }] },
      { type: 'ai', text: '🍲 **成都本地人推荐的火锅店**' },
      {
        type: 'ai',
        text: '这几家都是成都土著推荐的，游客少、味道正：',
        bullets: ['🔥 **大龙燚**（玉林路）— 老牌辣锅，毛肚和鹅肠是必点', '🌶️ **小龙坎**（总店）— 牛油锅底，本地人从小吃到大', '🥢 **蜀大侠**（建设路）— 性价比高，适合多人聚餐', '🍖 **电台巷火锅**（九眼桥）— 复古风，味道够劲'],
      },
      { type: 'ai', text: '如果不太能吃辣，建议点个鸳鸯锅或者微辣，成都的微辣可能也有点刺激 😂', options: ['推荐几家不辣的', '加个评分对比', '帮我查最近的店'] },
    ],
  },
  // 13: 帮我查一下明天的天气
  {
    title: '帮我查一下明天的天气',
    messages: [
      { type: 'user', text: '帮我查一下成都明天的天气，我准备出去走走' },
      { type: 'ai-thinking', steps: [{ type: 'tool', text: '查询了天气数据' }] },
      { type: 'ai', text: '🌤️ **成都明天天气**' },
      {
        type: 'ai',
        text: '天气概况：',
        sections: [
          { title: '🌡️ 温度', content: '18°C - 26°C，适宜出行' },
          { title: '☀️ 天气', content: '多云转晴，午后阳光不错' },
          { title: '💧 降水概率', content: '20%，基本不会下雨' },
          { title: '🌬️ 风力', content: '微风 1-2 级' },
        ],
      },
      { type: 'ai', text: '天气很适合出去走走！推荐你去人民公园喝个盖碗茶，或者去锦里逛逛，下午的阳光很舒服～', options: ['推荐几个散步路线', '查查后天的天气', '帮我规划半天行程'] },
    ],
  },
  // 14: 做一个日本樱花季旅行攻略
  {
    title: '做一个日本樱花季旅行攻略',
    messages: [
      { type: 'user', text: '帮我做一个日本樱花季的旅行攻略，大概 7 天，东京大阪京都' },
      { type: 'ai-thinking', steps: [{ type: 'read', text: '搜索了日本樱花季最佳观赏时间和路线' }, { type: 'tool', text: '执行了行程规划' }] },
      { type: 'ai', text: '🌸 **日本樱花季 7 日游攻略**' },
      {
        type: 'ai',
        text: '樱花季推荐 3 月底到 4 月初，以下是经典路线：',
        sections: [
          { title: '📅 Day 1-2 东京', content: '新宿御苑赏樱 → 涩谷 → 浅草寺 → 东京塔夜景' },
          { title: '📅 Day 3-4 京都', content: '新干线 → 岚山竹林 → 清水寺 → 哲学之道赏樱' },
          { title: '📅 Day 5-6 大阪', content: '大阪城公园 → 道顿堀美食 → 奈良喂鹿 → 环球影城' },
          { title: '📅 Day 7', content: '心斋桥购物 → 关西机场返程' },
        ],
      },
      { type: 'ai', text: '💰 预算参考：机票 3000 + 住宿 4000 + JR Pass 2000 + 餐饮 2000 + 门票 1000 = 总计约 12000 元', options: ['加个美食推荐', '帮我查樱花花期', '预算再压一压'] },
    ],
  },
];

function renderPrebuiltConversation(conv) {
  if (!conv || !conversationThread) return;
  conversationStarted = true;
  navigateTo('conversation');
  conversationThread.innerHTML = '';

  const doScroll = () => {
    const s = document.getElementById('main-stage-scroll');
    if (s) s.scrollTop = s.scrollHeight;
  };

  let delay = 0;
  const addDelayed = (el, ms) => {
    delay += ms;
    setTimeout(() => {
      appendMessage(el);
      doScroll();
    }, delay);
  };

  conv.messages.forEach((msg, idx) => {
    if (msg.type === 'user') {
      addDelayed(createUserBubble(msg.text), idx === 0 ? 100 : 600);
      return;
    }
    if (msg.type === 'ai-thinking') {
      addDelayed(createThinkingIndicator(msg.steps), 500);
      return;
    }
    if (msg.type === 'ai-file') {
      addDelayed(createFileAnalysisCard(msg), 600);
      return;
    }
    if (msg.type === 'ai') {
      addDelayed(createAiMessageBubble(msg), 400);
    }
  });
}

function createThinkingIndicator(steps) {
  const el = document.createElement('div');
  el.className = 'execution-section history-demo';
  el.innerHTML =
    '<div class="execution-steps">' +
      '<div class="execution-header"><span class="execution-status">执行中</span></div>' +
      '<div class="execution-timeline history-timeline" style="opacity: 1; max-height: none; overflow: visible;">' +
        '<div class="timeline-content">' +
          (steps || []).map(s => `<div class="step-item"><span class="step-text">${escapeHtml(s.text || '')}</span></div>`).join('') +
        '</div>' +
      '</div>' +
    '</div>';

  setTimeout(() => {
    const header = el.querySelector('.execution-header');
    const timeline = el.querySelector('.history-timeline');
    if (header) header.innerHTML = '<span class="complete-text">已完成</span>';
    if (timeline) {
      timeline.style.maxHeight = timeline.scrollHeight + 'px';
      setTimeout(() => {
        timeline.style.maxHeight = '0';
        timeline.style.opacity = '0';
        timeline.style.transition = 'max-height 300ms ease, opacity 300ms ease';
      }, 800);
    }
  }, 1200);
  return el;
}

function createFileAnalysisCard(msg) {
  const el = document.createElement('div');
  el.className = 'result-section';
  el.style.opacity = '1';
  const rows = (msg.analysis?.sections || []).map(s =>
    `<div class="doc-row"><div class="doc-k">${escapeHtml(s.title || '')}</div><div class="doc-v">${escapeHtml(s.content || '')}</div></div>`
  ).join('');
  el.innerHTML =
    `<div class="attachment-card history-file-card">` +
      `<div class="attachment-info">` +
        `<span class="attachment-name">${escapeHtml(msg.fileName || '')}</span>` +
        `<span class="attachment-meta">PDF · ${escapeHtml(msg.fileSize || '')}</span>` +
      `</div>` +
    `</div>` +
    `<p class="result-text">${escapeHtml(msg.analysis?.summary || '')}</p>` +
    `<div class="doc-table">${rows}</div>`;
  const fileCard = el.querySelector('.history-file-card');
  fileCard?.addEventListener('click', () => {
    openPreview(
      msg.fileName || '文件',
      'https://www.figma.com/api/mcp/asset/a3d8d6f5-e399-4108-be4b-06175be4e067'
    );
  });
  return el;
}

function createAiMessageBubble(msg) {
  const el = document.createElement('div');
  el.className = 'result-section history-ai-bubble';
  el.style.opacity = '1';

  let html = '';
  if (msg.text) {
    html += `<p class="result-text" data-typewriter-text="${escapeHtml(String(msg.text)).replace(/"/g, '&quot;')}"></p>`;
  }
  if (msg.text2) {
    html += `<p class="result-text" style="color:rgba(255,255,255,0.48);font-size:14px;" data-typewriter-text="${escapeHtml(String(msg.text2)).replace(/"/g, '&quot;')}"></p>`;
  }
  const hasAnimatedText = Boolean(msg.text || msg.text2);
  const hiddenAttr = hasAnimatedText ? ' data-ai-reveal="after-typewriter" style="display:none;"' : '';
  if (msg.sections) {
    html += `<div class="doc-table"${hiddenAttr}>` + msg.sections.map(s =>
      `<div class="doc-row"><div class="doc-k">${escapeHtml(s.title || '')}</div><div class="doc-v">${escapeHtml(s.content || '')}</div></div>`
    ).join('') + '</div>';
  }
  if (msg.bullets) {
    html += `<div class="result-list"${hiddenAttr}>` + msg.bullets.map(b =>
      `<div class="result-item"><div class="result-bullet"><div class="result-bullet-dot"></div></div><span class="result-item-text">${escapeHtml(b)}</span></div>`
    ).join('') + '</div>';
  }
  if (msg.options) {
    html += `<div class="history-options"${hiddenAttr}>` + msg.options.map(o =>
      `<button class="history-option-btn" type="button">${escapeHtml(o)}</button>`
    ).join('') + '</div>';
  }
  el.innerHTML = html;

  const paragraphs = [...el.querySelectorAll('[data-typewriter-text]')];
  if (paragraphs.length) {
    let sequence = Promise.resolve();
    paragraphs.forEach(paragraph => {
      const text = paragraph.getAttribute('data-typewriter-text') || '';
      sequence = sequence.then(() => startTypewriterParagraph(paragraph, text, { speed: msg.speed ?? 8 }));
    });
    sequence.then(() => {
      el.querySelectorAll('[data-ai-reveal="after-typewriter"]').forEach(node => {
        node.style.display = '';
      });
      scrollConversationToBottom();
    });
  }

  el.querySelectorAll('.history-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent || '';
      appendMessage(createUserBubble(text));
      setTimeout(() => {
        appendMessage(createAiMessageBubble({ text: '好的，马上帮你调整～请稍等！' }));
      }, 400);
    });
  });
  return el;
}

// ── Sidebar collapse / expand
document.getElementById('sidebar-collapse-btn')?.addEventListener('click', () => {
  windowBody.classList.add('sidebar-is-collapsed');
});

document.getElementById('sidebar-expand-btn')?.addEventListener('click', () => {
  windowBody.classList.remove('sidebar-is-collapsed');
});

// History item click — switch active
document.querySelectorAll('.history-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.history-item').forEach(i => i.classList.remove('is-current'));
    item.classList.add('is-current');

    // Copy7: pre-built conversation by index (prefer). If not present, fallback to simple fake.
    const idxStr = item.dataset?.histIdx;
    const idx = idxStr != null ? parseInt(idxStr, 10) : NaN;
    if (!Number.isNaN(idx) && HISTORY_CONVERSATIONS[idx]) {
      renderPrebuiltConversation(HISTORY_CONVERSATIONS[idx]);
      return;
    }

    // Fallback: Fake history content switching (no clarifying/execution flow)
    if (item.classList.contains('history-more')) return;
    const title = (item.querySelector('span')?.textContent || '').trim();
    if (!title) return;

    conversationStarted = true;
    navigateTo('conversation');
    conversationThread.innerHTML = '';

    appendMessage(createUserBubble(title));

    const reply = document.createElement('div');
    reply.className = 'result-section';
    reply.style.opacity = '1';

    const fake = {
      '帮我解读这个文件': {
        intro: '可以的。你把文件发我后，我会按“结论 → 关键点 → 风险/疑点 → 建议动作”的结构解读，并给一份可复制的摘要。',
        bullets: ['先给我文件类型（PDF/Word/Excel/PPT）与页数', '你最关心的点（例如：合同责任/财报指标/汇报逻辑）', '输出你希望的格式：要点/表格/一页总结'],
      },
      '什么是第一性原理？': {
        intro: '第一性原理就是把问题拆到不可再拆的“基本事实/约束”，再从这些事实重新搭建解决方案，而不是沿用类比或经验套路。',
        bullets: ['把结论拆成事实：哪些是已知、可验证的？', '把假设写出来：哪些只是“大家都这么说”？', '从事实推导新方案：一步步算/推到可执行'],
      },
      '写一段生日祝福文案': {
        intro: '给你三种风格，你选一个我再按对象（同事/朋友/恋人/长辈）细化。',
        bullets: ['真诚简短：祝你新的一岁平安喜乐，所愿皆成真。', '俏皮一点：又长大一岁啦，愿你快乐不打烊，幸运一直在线。', '走心一点：愿你被温柔以待，也有勇气奔赴热爱。生日快乐。'],
      },
    };

    const data = fake[title] || {
      intro: '收到。我可以基于这个标题先给你一个“快速可用”的回答框架，你也可以继续补充细节我再完善。',
      bullets: ['告诉我你的目标', '给我限制条件（时间/字数/风格）', '你希望最终输出是什么'],
    };

    reply.innerHTML = `
      <p class="result-title">回答</p>
      <p class="result-text">${escapeHtml(data.intro)}</p>
      <div class="result-divider"></div>
      <p class="result-title">我需要你补充</p>
      <div class="result-list">
        ${data.bullets
          .map(
            t => `
          <div class="result-item">
            <div class="result-bullet"><div class="result-bullet-dot"></div></div>
            <span class="result-item-text">${escapeHtml(t)}</span>
          </div>
        `,
          )
          .join('')}
      </div>
    `;

    appendMessage(reply);
  });
});

// "查看更多" expand / collapse — one per agent (copy7 behavior)
const historyExpandState = {};
document.querySelectorAll('.history-item.history-more').forEach(btn => {
  btn.addEventListener('click', () => {
    const agent = btn.dataset.agentMore || 'default';
    const list = btn.closest('.history-list');
    if (!list) return;

    historyExpandState[agent] = !historyExpandState[agent];
    list.classList.toggle('history-expanded', historyExpandState[agent]);

    const moreSpan = btn.querySelector('span');
    if (moreSpan) moreSpan.textContent = historyExpandState[agent] ? '收起' : '查看更多';
  });
});

// Agent card click — switch active agent (expanded)
document.querySelectorAll('.agent-card, .secondary-agent').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.agent-card, .secondary-agent').forEach(c => c.classList.remove('is-active'));
    card.classList.add('is-active');
    // Unified switching: clicking any agent always goes to welcome panel.
    // (History items switch to conversation; Skills Market link switches to skills-market.)
    navigateTo('welcome');

    // Copy7 behavior: toggle which history list is visible
    const parentBlock = card.closest('.agent-block');
    const clickedHistory = parentBlock?.querySelector('.history-list');
    document.querySelectorAll('.history-list').forEach(list => list.classList.add('is-hidden'));
    if (clickedHistory) clickedHistory.classList.remove('is-hidden');
  });
});

// Collapsed agent item click — switch active
document.querySelectorAll('.collapsed-agent-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.collapsed-agent-item').forEach(i => i.classList.remove('is-active'));
    item.classList.add('is-active');
  });
});

// ── Navigation History ────────────────────────────────

// Pages: 'welcome' | 'conversation'
const navHistory = ['welcome'];
let navCursor = 0;

function updateNavButtons() {
  const backBtn = document.getElementById('nav-back');
  const fwdBtn = document.getElementById('nav-forward');
  if (backBtn) backBtn.style.opacity = navCursor > 0 ? '1' : '0.3';
  if (fwdBtn) fwdBtn.style.opacity = navCursor < navHistory.length - 1 ? '1' : '0.3';
}

function navigateTo(page, pushHistory = true) {
  if (pushHistory) {
    // Truncate forward history when navigating to a new page
    navHistory.splice(navCursor + 1);
    navHistory.push(page);
    navCursor = navHistory.length - 1;
  }
  renderPage(page);
  updateNavButtons();
}

function renderPage(page) {
  const flowPages = {
    'claw-home': 'home',
    'claw-loading': 'loading',
    'claw-config': 'config',
  };
  if (flowPages[page]) {
    setClawFlowPage(flowPages[page]);
    return;
  }

  const welcomePanel = document.getElementById('welcome-panel');
  const thread = document.getElementById('conversation-thread');
  const skillsMarket = document.getElementById('skills-market-page');
  const scroll = document.getElementById('main-stage-scroll');
  const composer = document.getElementById('composer-form');
  const topTip = document.querySelector('.top-tip');
  const mainStage = document.querySelector('.main-stage');
  setClawFlowInactive();

  if (page === 'welcome') {
    welcomePanel.style.display = 'flex';
    thread.style.display = 'none';
    if (skillsMarket) skillsMarket.style.display = 'none';
    if (composer) composer.style.display = '';
    if (topTip) topTip.style.display = '';
    if (mainStage) mainStage.classList.remove('is-skills-market');
    if (scroll) {
      scroll.style.justifyContent = 'flex-end';
      scroll.style.paddingTop = '60px';
    }
    // Reset conversation state
    conversationStarted = false;
    currentPhase = 'idle';
    clarificationAnswers = {};
    personalizationFlowState = 'idle';
    thread.innerHTML = '';
  } else if (page === 'conversation') {
    welcomePanel.style.display = 'none';
    thread.style.display = 'flex';
    if (skillsMarket) skillsMarket.style.display = 'none';
    if (composer) composer.style.display = '';
    if (topTip) topTip.style.display = '';
    if (mainStage) mainStage.classList.remove('is-skills-market');
    if (scroll) {
      scroll.style.justifyContent = 'flex-start';
      scroll.style.paddingTop = '20px';
    }
  } else if (page === 'skills-market') {
    welcomePanel.style.display = 'none';
    thread.style.display = 'none';
    if (skillsMarket) skillsMarket.style.display = 'block';
    if (composer) composer.style.display = 'none';
    if (topTip) topTip.style.display = 'none';
    if (mainStage) mainStage.classList.add('is-skills-market');
    if (scroll) {
      scroll.style.justifyContent = 'flex-start';
      scroll.style.paddingTop = '0';
    }
  }
}

document.getElementById('nav-back')?.addEventListener('click', () => {
  if (navCursor > 0) {
    navCursor--;
    renderPage(navHistory[navCursor]);
    updateNavButtons();
  }
});

document.getElementById('nav-forward')?.addEventListener('click', () => {
  if (navCursor < navHistory.length - 1) {
    navCursor++;
    renderPage(navHistory[navCursor]);
    updateNavButtons();
  }
});

// Home tab — always go back to welcome
document.getElementById('tab-home')?.addEventListener('click', () => {
  navigateTo('claw-home');
});

// Claw tab — go to conversation if one exists, else welcome
document.getElementById('tab-claw')?.addEventListener('click', () => {
  const flowEl = document.getElementById('claw-flow');
  if (flowEl?.dataset.page === 'loading' || flowEl?.dataset.page === 'config') {
    navigateTo('claw-config');
    return;
  }
  if (conversationStarted) {
    navigateTo('conversation');
  }
});

// Sidebar link: Skills Market
document.getElementById('sidebar-skill-market')?.addEventListener('click', () => {
  navigateTo('skills-market');
});

// ── Skills Market: search autocomplete (Figma 1463:12885) ───────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlightMatch(text, query) {
  const safe = escapeHtml(text);
  if (!query) return safe;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return safe;
  const before = escapeHtml(text.slice(0, idx));
  const hit = escapeHtml(text.slice(idx, idx + query.length));
  const after = escapeHtml(text.slice(idx + query.length));
  return `${before}<em>${hit}</em>${after}`;
}

function collectMarketSkills() {
  const root = document.getElementById('skills-market-page');
  if (!root) return [];

  const cards = [
    ...root.querySelectorAll('.skills-card-grid .skills-card'),
    ...root.querySelectorAll('.all-skills-grid .all-skill-card'),
  ];

  return cards
    .map(card => {
      const isAll = card.classList.contains('all-skill-card');
      const titleEl = card.querySelector(isAll ? '.all-skill-name' : '.skills-card-title');
      const descEl = card.querySelector(isAll ? '.all-skill-desc' : '.skills-card-desc');
      const iconEl = card.querySelector(isAll ? '.all-skill-icon' : '.skills-card-icon');
      const tagEls = card.querySelectorAll(isAll ? '.all-skill-tag' : '.skills-card-tag');
      const title = (titleEl?.textContent || '').trim();
      const desc = (descEl?.textContent || '').trim();
      const tags = [...tagEls].map(t => (t.textContent || '').trim()).filter(Boolean);
      const icon = iconEl?.getAttribute('src') || './icon/skill-1.png';
      return { card, title, desc, tags, icon };
    })
    .filter(s => s.title);
}

function matchSkill(skill, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  if (skill.title.toLowerCase().includes(q)) return true;
  if (skill.desc.toLowerCase().includes(q)) return true;
  if (skill.tags.some(t => t.toLowerCase().includes(q))) return true;
  return false;
}

let skillsMarketCategory = '精选';

const SKILLS_MARKET_CATEGORIES = ['工作', '学习', '游戏', '娱乐'];
const marketCardCategory = new WeakMap();

function hashStringToInt(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function ensureMarketCardCategory(skill) {
  const existing = marketCardCategory.get(skill.card);
  if (existing) return existing;
  const direct = (skill.card?.dataset?.category || '').trim();
  if (direct && SKILLS_MARKET_CATEGORIES.includes(direct)) {
    marketCardCategory.set(skill.card, direct);
    return direct;
  }
  const h = hashStringToInt(skill.title || '');
  const cat = SKILLS_MARKET_CATEGORIES[h % SKILLS_MARKET_CATEGORIES.length];
  marketCardCategory.set(skill.card, cat);
  return cat;
}

function matchCategory(skill, category) {
  if (!category || category === '精选') return true;
  const cat = String(category).trim();
  const assigned = ensureMarketCardCategory(skill);
  if (assigned === cat) return true;

  // “假的关联性”：允许少量“邻近”卡片穿插，避免每个 tab 看起来过于割裂
  const a = SKILLS_MARKET_CATEGORIES.indexOf(assigned);
  const b = SKILLS_MARKET_CATEGORIES.indexOf(cat);
  if (a < 0 || b < 0) return false;

  const dist = Math.min(Math.abs(a - b), SKILLS_MARKET_CATEGORIES.length - Math.abs(a - b));
  if (dist !== 1) return false;

  const h = hashStringToInt((skill.title || '') + '|' + cat);
  return (h % 100) < 18; // ~18% spillover
}

function filterMarketCards(query) {
  const skills = collectMarketSkills();
  skills.forEach(s => {
    const ok = matchCategory(s, skillsMarketCategory) && matchSkill(s, query);
    s.card.style.display = ok ? '' : 'none';
  });
}

let marketAcIndex = 0;
let marketAcItems = [];
let marketAcOpen = false;

function closeMarketAutocomplete() {
  const pop = document.getElementById('skills-market-autocomplete');
  if (!pop) return;
  pop.classList.remove('is-open');
  pop.innerHTML = '';
  marketAcItems = [];
  marketAcIndex = 0;
  marketAcOpen = false;
}

function setMarketAcIndex(idx) {
  marketAcIndex = Math.max(0, Math.min(idx, marketAcItems.length - 1));
  marketAcItems.forEach((el, i) => el.classList.toggle('is-selected', i === marketAcIndex));
  const active = marketAcItems[marketAcIndex];
  active?.scrollIntoView?.({ block: 'nearest' });
}

function openMarketAutocomplete(results, query) {
  const pop = document.getElementById('skills-market-autocomplete');
  if (!pop) return;

  pop.innerHTML = results
    .slice(0, 5)
    .map((r, i) => {
      const tagsHtml = r.tags.slice(0, 3).map(t => `<span class="skills-market-ac-tag">${escapeHtml(t)}</span>`).join('');
      return `
        <button class="skills-market-ac-item${i === 0 ? ' is-selected' : ''}" type="button" role="option" data-title="${escapeHtml(r.title)}">
          <img class="skills-market-ac-icon" src="${escapeHtml(r.icon)}" alt="" />
          <div class="skills-market-ac-main">
            <div class="skills-market-ac-title-row">
              <div class="skills-market-ac-title">${highlightMatch(r.title, query)}</div>
              <div class="skills-market-ac-tags">${tagsHtml}</div>
            </div>
            <div class="skills-market-ac-desc">${escapeHtml(r.desc)}</div>
          </div>
        </button>
      `;
    })
    .join('');

  pop.classList.add('is-open');
  marketAcItems = [...pop.querySelectorAll('.skills-market-ac-item')];
  marketAcIndex = 0;
  marketAcOpen = marketAcItems.length > 0;

  pop.querySelectorAll('.skills-market-ac-item').forEach(btn => {
    btn.addEventListener('mousedown', e => e.preventDefault()); // keep focus in input
    btn.addEventListener('click', () => {
      const input = document.querySelector('.skills-market-search-input');
      const title = btn.dataset.title || '';
      if (input) input.value = title;
      filterMarketCards(title);
      closeMarketAutocomplete();
    });
  });
}

let marketAcT = null;
function scheduleMarketAutocomplete(query) {
  if (marketAcT) window.clearTimeout(marketAcT);
  marketAcT = window.setTimeout(() => {
    const pop = document.getElementById('skills-market-autocomplete');
    const input = document.querySelector('.skills-market-search-input');
    if (!pop || !input) return;
    const q = (query || '').trim();
    filterMarketCards(q);
    if (!q) return closeMarketAutocomplete();

    const skills = collectMarketSkills();
    const results = skills.filter(s => matchCategory(s, skillsMarketCategory) && matchSkill(s, q));
    if (!results.length) return closeMarketAutocomplete();
    openMarketAutocomplete(results, q);
  }, 60);
}

function bindSkillsMarketSearchAutocomplete() {
  const root = document.getElementById('skills-market-page');
  if (!root) return;
  const input = root.querySelector('.skills-market-search-input');
  const pop = root.querySelector('#skills-market-autocomplete');
  if (!input || !pop) return;

  // Tabs: 精选 / 工作 / 学习 / 游戏 / 娱乐
  const tabs = [...root.querySelectorAll('.skills-market-tab')];
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      skillsMarketCategory = (tab.textContent || '').trim() || '精选';
      filterMarketCards(input.value || '');
      // Keep autocomplete in sync with current query/category
      scheduleMarketAutocomplete(input.value || '');
    });
  });

  input.addEventListener('input', () => scheduleMarketAutocomplete(input.value));
  input.addEventListener('focus', () => scheduleMarketAutocomplete(input.value));

  input.addEventListener('keydown', e => {
    if (!marketAcOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMarketAcIndex(marketAcIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMarketAcIndex(marketAcIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const btn = marketAcItems[marketAcIndex];
      btn?.click();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeMarketAutocomplete();
    }
  });

  document.addEventListener('mousedown', e => {
    if (!marketAcOpen) return;
    if (pop.contains(e.target)) return;
    if (root.querySelector('.skills-market-search')?.contains(e.target)) return;
    closeMarketAutocomplete();
  });
}

bindSkillsMarketSearchAutocomplete();

// ── Skills Detail Modal open/close ──────────────────────
function getCardDataFromEl(card) {
  const isAll = card.classList.contains('all-skill-card');
  const titleEl = card.querySelector(isAll ? '.all-skill-name' : '.skills-card-title');
  const descEl = card.querySelector(isAll ? '.all-skill-desc' : '.skills-card-desc');
  const iconEl = card.querySelector(isAll ? '.all-skill-icon' : '.skills-card-icon');
  const tagEls = card.querySelectorAll(isAll ? '.all-skill-tag' : '.skills-card-tag');
  const title = (titleEl?.textContent || '').trim();
  const desc = (descEl?.textContent || '').trim();
  const tags = [...tagEls].map(t => (t.textContent || '').trim()).filter(Boolean);
  const icon = iconEl?.getAttribute('src') || './icon/skill-1.png';
  return { title, desc, tags, icon };
}

function openSkillsDetailModal(data) {
  const overlay = document.getElementById('skills-detail-overlay');
  const icon = document.getElementById('skills-detail-icon');
  const title = document.getElementById('skills-detail-title');
  const desc = document.getElementById('skills-detail-desc');
  const tags = document.getElementById('skills-detail-tags');
  if (!overlay || !title || !desc || !tags) return;

  if (icon) icon.src = data.icon || './icon/skill-1.png';
  title.textContent = data.title || '技能详情';
  desc.textContent = data.desc || '';

  const finalTags = (data.tags && data.tags.length ? data.tags : ['内置', '推荐']).slice(0, 3);
  tags.innerHTML = finalTags.map(t => `<span class="skills-detail-tag">${escapeHtml(t)}</span>`).join('');

  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeSkillsDetailModal() {
  const overlay = document.getElementById('skills-detail-overlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function bindSkillsDetailModal() {
  const root = document.getElementById('skills-market-page');
  const overlay = document.getElementById('skills-detail-overlay');
  if (!root || !overlay) return;

  root.addEventListener('click', e => {
    const card = e.target?.closest?.('.skills-card, .all-skill-card');
    if (!card) return;
    openSkillsDetailModal(getCardDataFromEl(card));
  });

  overlay.addEventListener('mousedown', e => {
    if (e.target === overlay) closeSkillsDetailModal();
  });

  overlay.querySelector('.skills-detail-close-btn')?.addEventListener('click', closeSkillsDetailModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      e.preventDefault();
      closeSkillsDetailModal();
    }
  });
}

bindSkillsDetailModal();

// ── Choose Shrimp Modal + success toast (Figma 1966:33662 / 1966:39470) ──
let chooseShrimpSelectedIds = new Set();
let toastTimer = null;
let chooseShrimpConfirmHandler = null;
let chooseShrimpIsMulti = true;

function collectShrimpsForChooseModal() {
  const result = [];
  const main = document.querySelector('.agent-block .agent-card');
  const secs = [...document.querySelectorAll('.secondary-agent')];
  const all = [main, ...secs].filter(Boolean);
  all.forEach((el, idx) => {
    const name = (el.querySelector('strong')?.textContent || el.querySelector('.agent-name')?.textContent || '').trim();
    const desc = (el.querySelector('small')?.textContent || el.querySelector('.agent-desc')?.textContent || '').trim();
    const img = el.querySelector('img')?.getAttribute('src') || '';
    // background color is baked in sidebar via wrap; if missing, keep empty.
    const bg = el.querySelector('.agent-avatar-wrap')?.getAttribute('style') || '';
    result.push({ id: `shrimp-${idx}`, name, desc, avatar: img, bgStyle: bg });
  });
  // Fallback to MENTIONS if sidebar structure changes
  if (!result.length) {
    return MENTIONS.map((m, idx) => ({ id: m.id || `shrimp-${idx}`, name: m.name, desc: '', avatar: m.avatar, bgStyle: '' }));
  }
  return result;
}

function openChooseShrimpModal(options = {}) {
  const overlay = document.getElementById('choose-shrimp-overlay');
  const modal = overlay?.querySelector('.choose-shrimp-modal');
  const title = document.querySelector('.choose-shrimp-title');
  const list = document.getElementById('choose-shrimp-list');
  const confirm = document.getElementById('choose-shrimp-confirm');
  const selectAll = document.getElementById('choose-shrimp-selectall');
  if (!overlay || !list || !confirm) return;

  const shrimps = options.items || collectShrimpsForChooseModal();
  chooseShrimpConfirmHandler = typeof options.onConfirm === 'function' ? options.onConfirm : null;
  chooseShrimpIsMulti = options.multi !== false;
  if (title) title.textContent = options.title || '添加到你的虾';
  modal?.classList.toggle('is-single', !chooseShrimpIsMulti);
  // Default: no selection.
  chooseShrimpSelectedIds = new Set();
  confirm.disabled = true;
  if (selectAll) {
    selectAll.classList.remove('is-selected');
    selectAll.setAttribute('aria-pressed', 'false');
  }

  list.innerHTML = shrimps.map(m => {
    const name = escapeHtml(m.name || '');
    const desc = escapeHtml(m.desc || '');
    const avatar = escapeHtml(m.avatar || '');
    const id = escapeHtml(m.id || '');
    const hasBg = String(m.bgStyle || '').includes('background');
    const isSel = chooseShrimpSelectedIds.has(m.id);
    return `
      <button class="choose-shrimp-item ${isSel ? 'is-selected' : ''}" type="button" data-id="${id}" role="option" aria-selected="${isSel ? 'true' : 'false'}">
        <span class="choose-shrimp-checkbox" aria-hidden="true">
          <span class="choose-shrimp-checkbox-bg"></span>
          <span class="choose-shrimp-checkbox-box"></span>
          <img class="choose-shrimp-checkbox-tick" src="./icon/checkbox-check.svg" alt="" />
        </span>
        <span class="choose-shrimp-main">
          <span class="choose-shrimp-avatar-wrap ${hasBg ? 'has-bg' : ''}" ${hasBg ? `style="${escapeHtml(m.bgStyle).replace(/\"/g, '&quot;')}"` : ''}>
            <img class="choose-shrimp-avatar" src="${avatar}" alt="" />
          </span>
          <span class="choose-shrimp-text">
            <span class="choose-shrimp-name">${name}</span>
            <span class="choose-shrimp-desc">${desc}</span>
          </span>
        </span>
      </button>
    `;
  }).join('');

  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeChooseShrimpModal() {
  const overlay = document.getElementById('choose-shrimp-overlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showAddSuccessToast() {
  const toast = document.getElementById('add-success-toast');
  if (!toast) return;
  toast.classList.add('is-open');
  toast.setAttribute('aria-hidden', 'false');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-open');
    toast.setAttribute('aria-hidden', 'true');
  }, 1600);
}

function bindChooseShrimpModal() {
  const overlay = document.getElementById('choose-shrimp-overlay');
  const list = document.getElementById('choose-shrimp-list');
  const btnClose = document.getElementById('choose-shrimp-close');
  const btnCancel = document.getElementById('choose-shrimp-cancel');
  const btnConfirm = document.getElementById('choose-shrimp-confirm');
  const btnSelectAll = document.getElementById('choose-shrimp-selectall');
  const detailOverlay = document.getElementById('skills-detail-overlay');
  const toastClose = document.getElementById('add-success-toast-close');
  if (!overlay || !list || !btnConfirm || !detailOverlay) return;

  // Open from "去添加"
  detailOverlay.querySelector('.skills-detail-primary')?.addEventListener('click', () => {
    if (!detailOverlay.classList.contains('is-open')) return;
    openChooseShrimpModal();
  });

  // Select (multi)
  list.addEventListener('click', e => {
    const item = e.target?.closest?.('.choose-shrimp-item');
    if (!item) return;
    const id = item.getAttribute('data-id') || '';
    if (chooseShrimpIsMulti) {
      if (chooseShrimpSelectedIds.has(id)) chooseShrimpSelectedIds.delete(id);
      else chooseShrimpSelectedIds.add(id);
    } else {
      chooseShrimpSelectedIds = new Set([id]);
    }

    list.querySelectorAll('.choose-shrimp-item').forEach(btn => {
      const bid = btn.getAttribute('data-id') || '';
      const isSel = chooseShrimpSelectedIds.has(bid);
      btn.classList.toggle('is-selected', isSel);
      btn.setAttribute('aria-selected', isSel ? 'true' : 'false');
    });

    btnConfirm.disabled = chooseShrimpSelectedIds.size === 0;
    if (btnSelectAll) {
      const allCount = list.querySelectorAll('.choose-shrimp-item').length;
      const isAll = allCount > 0 && chooseShrimpSelectedIds.size === allCount;
      btnSelectAll.classList.toggle('is-selected', isAll);
      btnSelectAll.setAttribute('aria-pressed', isAll ? 'true' : 'false');
    }
  });

  // Select all
  btnSelectAll?.addEventListener('click', () => {
    const items = [...list.querySelectorAll('.choose-shrimp-item')];
    if (!items.length) return;
    const allSelected = chooseShrimpSelectedIds.size === items.length;
    chooseShrimpSelectedIds = new Set(allSelected ? [] : items.map(i => i.getAttribute('data-id') || '').filter(Boolean));
    items.forEach(btn => {
      const bid = btn.getAttribute('data-id') || '';
      const isSel = chooseShrimpSelectedIds.has(bid);
      btn.classList.toggle('is-selected', isSel);
      btn.setAttribute('aria-selected', isSel ? 'true' : 'false');
    });
    const isAll = !allSelected;
    btnSelectAll.classList.toggle('is-selected', isAll);
    btnSelectAll.setAttribute('aria-pressed', isAll ? 'true' : 'false');
    btnConfirm.disabled = chooseShrimpSelectedIds.size === 0;
  });

  // Close
  const close = () => closeChooseShrimpModal();
  btnClose?.addEventListener('click', close);
  btnCancel?.addEventListener('click', close);
  overlay.addEventListener('mousedown', e => {
    if (e.target === overlay) close();
  });

  // Confirm -> close -> toast -> update "已添加到 X 只虾"
  btnConfirm.addEventListener('click', () => {
    if (chooseShrimpSelectedIds.size === 0) return;
    if (chooseShrimpConfirmHandler) {
      const ids = [...chooseShrimpSelectedIds];
      const handled = chooseShrimpConfirmHandler(ids);
      closeChooseShrimpModal();
      chooseShrimpConfirmHandler = null;
      if (handled !== false) showAddSuccessToast();
      return;
    }
    closeChooseShrimpModal();
    closeSkillsDetailModal();
    navigateTo('skills-market');
    showAddSuccessToast();

    const added = document.getElementById('skills-detail-added');
    if (added) {
      // Fake increment if possible
      const m = (added.textContent || '').match(/已添加到\s*(\d+)\s*只虾/);
      const next = m ? String(Number(m[1]) + Math.max(1, chooseShrimpSelectedIds.size)) : null;
      if (next) added.textContent = `已添加到 ${next} 只虾`;
    }
  });

  toastClose?.addEventListener('click', () => {
    const toast = document.getElementById('add-success-toast');
    if (!toast) return;
    toast.classList.remove('is-open');
    toast.setAttribute('aria-hidden', 'true');
  });

  // Esc closes choose modal first
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!overlay.classList.contains('is-open')) return;
    e.preventDefault();
    close();
  });
}

bindChooseShrimpModal();

// Init nav button states
updateNavButtons();

// ── File Preview Panel ────────────────────────────────

const previewPanel = document.getElementById('preview-panel');
const previewClose = document.getElementById('preview-close');

function openPreview(fileName, imageUrl) {
  document.getElementById('preview-file-name').textContent = fileName;

  const previewImg = document.getElementById('preview-image');
  const previewContent = previewPanel.querySelector('.preview-content');

  // Remove any existing PPT preview
  const existingPPT = previewContent.querySelector('.ppt-preview');
  if (existingPPT) existingPPT.remove();

  if (fileName.endsWith('.pptx')) {
    previewImg.style.display = 'none';
    const pptEl = document.createElement('div');
    pptEl.className = 'ppt-preview';
    pptEl.innerHTML = `
      <div class="ppt-slide ppt-slide-img">
        <div class="ppt-slide-num">1 / 12</div>
        <img src="./icon/ppt-preview-1.png" alt="产品汇报封面" style="width:100%;height:100%;object-fit:cover;border-radius:6px;" />
      </div>
      <div class="ppt-slide ppt-slide-img">
        <div class="ppt-slide-num">2 / 12</div>
        <img src="./icon/ppt-preview-2.png" alt="产品概述" style="width:100%;height:100%;object-fit:cover;border-radius:6px;" />
      </div>
      <div class="ppt-slide">
        <div class="ppt-slide-num">3 / 12</div>
        <div class="ppt-slide-label">Chapter 02</div>
        <div class="ppt-slide-accent"></div>
        <div class="ppt-slide-title">市场分析与竞品对比</div>
        <div class="ppt-slide-body">
          <div class="ppt-slide-item">国内 AI 助手市场规模 2026 年预计达 480 亿</div>
          <div class="ppt-slide-item">竞品对比：功能覆盖度领先，技能生态独特</div>
          <div class="ppt-slide-item">目标用户：知识工作者、中小企业团队</div>
        </div>
      </div>
      <div class="ppt-slide">
        <div class="ppt-slide-num">4 / 12</div>
        <div class="ppt-slide-label">Chapter 03</div>
        <div class="ppt-slide-accent"></div>
        <div class="ppt-slide-title">数据表现与增长趋势</div>
        <div class="ppt-slide-body">
          <div class="ppt-slide-chart">
            <div class="ppt-bar" style="height:40%"></div>
            <div class="ppt-bar" style="height:55%"></div>
            <div class="ppt-bar" style="height:70%"></div>
            <div class="ppt-bar" style="height:85%"></div>
            <div class="ppt-bar" style="height:100%;background:linear-gradient(180deg,#ef4444,#b91c1c)"></div>
          </div>
          <div class="ppt-slide-item">MAU 12.4 万，环比 +18%；NPS 62</div>
        </div>
      </div>
      <div class="ppt-slide">
        <div class="ppt-slide-num">5 / 12</div>
        <div class="ppt-slide-label">Chapter 04</div>
        <div class="ppt-slide-accent"></div>
        <div class="ppt-slide-title">下一步规划</div>
        <div class="ppt-slide-body">
          <div class="ppt-slide-item">Q2：上线技能市场 2.0，开放第三方开发者接入</div>
          <div class="ppt-slide-item">Q3：多模态能力升级，支持图像/语音任务</div>
          <div class="ppt-slide-item">Q4：企业版发布，目标 500 家企业客户</div>
        </div>
      </div>
    `;
    previewContent.appendChild(pptEl);
  } else {
    previewImg.style.display = '';
    previewImg.src = imageUrl;
  }

  previewPanel.classList.add('open');
  windowBody.classList.add('preview-open');
  // 打开文件预览时收起侧边栏（Figma 2271:38316）
  windowBody.classList.add('sidebar-is-collapsed');
}

function closePreview() {
  previewPanel.classList.remove('open');
  windowBody.classList.remove('preview-open');
}

previewClose?.addEventListener('click', closePreview);

// ── Conversation Flow ─────────────────────────────────

const welcomePanel = document.getElementById('welcome-panel');
const conversationThread = document.getElementById('conversation-thread');
const promptInput = document.getElementById('prompt-input');

// ── Skills popover / insertion ─────────────────────────

const SKILLS = [
  {
    id: 'hot-news',
    name: '热点资讯自动汇总自动汇',
    icon: './icon/skill-orange.png',
  },
  {
    id: 'hot-news-2',
    name: '热点资讯自动汇总自动汇',
    icon: './icon/skill-orange.png',
  },
  {
    id: 'image-text',
    name: '图文素材自动匹配自动汇',
    icon: './icon/skill-green.png',
  },
  {
    id: 'image-text-2',
    name: '图文素材自动匹配自动汇',
    icon: './icon/skill-green.png',
  },
  {
    id: 'image-text-3',
    name: '图文素材自动匹配自动汇',
    icon: './icon/skill-green.png',
  },
];

let skillPopoverEl = null;
let skillPopoverOpen = false;
let skillPopoverTrigger = null; // 'slash' | 'button'
let skillSelectedIndex = 0;

// ── Mentions popover / insertion ───────────────────────

const MENTIONS = [
  {
    id: 'work-shrimp',
    name: '虾小秘',
    avatar: './icon/mention-work.png',
  },
  {
    id: 'study-shrimp',
    name: '虾溜达',
    avatar: './icon/mention-study.png',
  },
];

let mentionPopoverEl = null;
let mentionPopoverOpen = false;
let mentionPopoverTrigger = null; // 'at' | 'button'
let mentionSelectedIndex = 0;

function getPromptPlainText() {
  if (!promptInput) return '';
  return (promptInput.innerText || '').replace(/\u00a0/g, ' ');
}

function clearPrompt() {
  if (!promptInput) return;
  promptInput.innerHTML = '';
}

function focusPrompt() {
  if (!promptInput) return;
  promptInput.focus();
}

/** 与「通过对话创建技能」一致的预填文案（技能广场 hover / + 菜单共用） */
function fillCreateSkillByChatPrompt() {
  clearPrompt();
  if (promptInput) {
    const before = '帮我使用';
    const skillName = 'AI生成技能';
    const after = '创建一个技能。请先问我这个技能可以做什么';
    promptInput.innerHTML =
      `${escapeHtml(before)}` +
      `<span class="skill-token" contenteditable="false">/${escapeHtml(skillName)}</span>` +
      `${escapeHtml(after)}`;
  }
  focusPrompt();
  const sel = window.getSelection?.();
  if (promptInput && sel) {
    const range = document.createRange();
    range.selectNodeContents(promptInput);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

// 技能广场「+新建技能」hover 卡片：跳转欢迎页并预填输入框（Figma 1385:16938）
document.querySelector('.skills-market-create-hover-item')?.addEventListener('mousedown', e => {
  e.preventDefault();
});
document.querySelector('.skills-market-create-hover-item')?.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  [historyPanel, agentDetailPanel, addSkillPanel].forEach(p => p?.classList.remove('open'));
  [btnHistory, btnAgentDetail].forEach(b => b?.classList.remove('is-active'));
  closeAddSkillListPopover();
  navigateTo('welcome');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => fillCreateSkillByChatPrompt());
  });
});

function removeCharBeforeCaret(range, ch) {
  const { startContainer, startOffset } = range;

  if (startContainer.nodeType === Node.TEXT_NODE) {
    const text = startContainer.textContent || '';
    if (startOffset > 0 && text[startOffset - 1] === ch) {
      startContainer.textContent = text.slice(0, startOffset - 1) + text.slice(startOffset);
      range.setStart(startContainer, startOffset - 1);
      range.collapse(true);
      return true;
    }
  }

  if (startContainer.nodeType === Node.ELEMENT_NODE) {
    const prev = startContainer.childNodes[startOffset - 1];
    if (prev && prev.nodeType === Node.TEXT_NODE) {
      const text = prev.textContent || '';
      if (text.endsWith(ch)) {
        prev.textContent = text.slice(0, -1);
        range.setStart(prev, (prev.textContent || '').length);
        range.collapse(true);
        return true;
      }
    }
  }

  return false;
}

function isCharBeforeCaret(ch) {
  if (!promptInput) return false;
  const sel = window.getSelection?.();
  if (!sel || sel.rangeCount === 0) return false;
  const range = sel.getRangeAt(0).cloneRange();
  range.collapse(true);

  const { startContainer, startOffset } = range;

  if (startContainer.nodeType === Node.TEXT_NODE) {
    const text = startContainer.textContent || '';
    return startOffset > 0 && text[startOffset - 1] === ch;
  }

  if (startContainer.nodeType === Node.ELEMENT_NODE) {
    const prev = startContainer.childNodes[startOffset - 1];
    if (prev && prev.nodeType === Node.TEXT_NODE) {
      const text = prev.textContent || '';
      return text.endsWith(ch);
    }
  }

  return false;
}

function getCurrentCaretRect() {
  const sel = window.getSelection?.();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0).cloneRange();

  // Ensure we have a measurable range
  if (range.collapsed) {
    const marker = document.createElement('span');
    marker.textContent = '\u200b';
    range.insertNode(marker);
    const rect = marker.getBoundingClientRect();
    marker.parentNode?.removeChild(marker);
    // Put caret back where it was
    sel.removeAllRanges();
    sel.addRange(range);
    range.collapse(false);
    return rect;
  }

  const rects = range.getClientRects();
  if (rects && rects.length) return rects[0];
  const rect = range.getBoundingClientRect();
  return rect && rect.width !== 0 && rect.height !== 0 ? rect : null;
}

function ensureSkillPopover() {
  if (skillPopoverEl) return skillPopoverEl;
  const el = document.createElement('div');
  el.className = 'skill-popover';
  el.style.display = 'none';
  el.innerHTML = `
    <div class="skill-popover-inner">
      <div class="skill-popover-title">技能</div>
      <div class="skill-popover-list" id="skill-popover-list" role="listbox" aria-label="技能列表"></div>
    </div>
  `;
  document.body.appendChild(el);
  skillPopoverEl = el;

  const list = el.querySelector('#skill-popover-list');
  SKILLS.forEach(skill => {
    const item = document.createElement('div');
    item.className = 'skill-popover-item';
    item.dataset.skillId = skill.id;
    item.setAttribute('role', 'option');
    item.setAttribute('tabindex', '-1');
    item.innerHTML = `
      <span class="skill-item-icon"><img src="${skill.icon}" alt="" /></span>
      <span class="skill-item-name">${skill.name}</span>
    `;
    item.addEventListener('mousedown', e => {
      // prevent editor blur
      e.preventDefault();
    });
    item.addEventListener('click', () => {
      insertSkillToken(skill.name, { replaceTypedSlash: skillPopoverTrigger === 'slash' });
      closeSkillPopover();
      focusPrompt();
    });
    list.appendChild(item);
  });

  return el;
}

function getSkillItems() {
  if (!skillPopoverEl) return [];
  return Array.from(skillPopoverEl.querySelectorAll('.skill-popover-item'));
}

function setSkillSelectedIndex(nextIndex) {
  const items = getSkillItems();
  if (!items.length) {
    skillSelectedIndex = 0;
    return;
  }

  const clamped = ((nextIndex % items.length) + items.length) % items.length;
  skillSelectedIndex = clamped;

  items.forEach((el, idx) => {
    const selected = idx === clamped;
    el.classList.toggle('is-selected', selected);
    el.setAttribute('aria-selected', selected ? 'true' : 'false');
  });

  // Keep selection visible if list ever becomes scrollable
  items[clamped].scrollIntoView({ block: 'nearest' });
}

function selectCurrentSkill() {
  const items = getSkillItems();
  if (!items.length) return;
  const idx = Math.min(Math.max(skillSelectedIndex, 0), items.length - 1);
  const skillId = items[idx].dataset.skillId;
  const skill = SKILLS.find(s => s.id === skillId);
  if (!skill) return;
  insertSkillToken(skill.name, { replaceTypedSlash: skillPopoverTrigger === 'slash' });
  closeSkillPopover();
  focusPrompt();
}

function positionPopoverByButton(pop, buttonEl) {
  const rect = buttonEl.getBoundingClientRect();
  const gap = 10;
  const left = Math.max(12, Math.min(rect.left, window.innerWidth - pop.offsetWidth - 12));
  const top = Math.max(12, rect.top - pop.offsetHeight - gap);
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
}

function positionPopoverByCaret(pop) {
  const caretRect = getCurrentCaretRect();
  const gap = 10;

  if (caretRect) {
    const left = Math.max(12, Math.min(caretRect.left - 6, window.innerWidth - pop.offsetWidth - 12));
    const top = Math.max(12, caretRect.top - pop.offsetHeight - gap);
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
    return;
  }

  // Fallback: above composer
  const composer = document.querySelector('.composer-card');
  if (!composer) return;
  const rect = composer.getBoundingClientRect();
  const left = Math.max(12, Math.min(rect.left + 18, window.innerWidth - pop.offsetWidth - 12));
  const top = Math.max(12, rect.top - pop.offsetHeight - gap);
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
}

function openSkillPopover(trigger, anchorEl) {
  const pop = ensureSkillPopover();
  skillPopoverTrigger = trigger;
  pop.style.display = 'block';
  // Need layout for correct height
  pop.getBoundingClientRect();
  if (trigger === 'button' && anchorEl) positionPopoverByButton(pop, anchorEl);
  else positionPopoverByCaret(pop);
  skillPopoverOpen = true;
  setSkillSelectedIndex(0);
}

function closeSkillPopover() {
  if (!skillPopoverEl) return;
  skillPopoverEl.style.display = 'none';
  skillPopoverOpen = false;
  skillPopoverTrigger = null;
}

function toggleSkillPopoverByButton(buttonEl) {
  if (skillPopoverOpen) closeSkillPopover();
  else openSkillPopover('button', buttonEl);
}

function removeSlashBeforeCaret(range) {
  const { startContainer, startOffset } = range;

  // Case 1: caret inside a text node
  if (startContainer.nodeType === Node.TEXT_NODE) {
    const text = startContainer.textContent || '';
    if (startOffset > 0 && text[startOffset - 1] === '/') {
      startContainer.textContent = text.slice(0, startOffset - 1) + text.slice(startOffset);
      range.setStart(startContainer, startOffset - 1);
      range.collapse(true);
      return true;
    }
  }

  // Case 2: caret at element boundary, check previous sibling text node
  if (startContainer.nodeType === Node.ELEMENT_NODE) {
    const prev = startContainer.childNodes[startOffset - 1];
    if (prev && prev.nodeType === Node.TEXT_NODE) {
      const text = prev.textContent || '';
      if (text.endsWith('/')) {
        prev.textContent = text.slice(0, -1);
        range.setStart(prev, (prev.textContent || '').length);
        range.collapse(true);
        return true;
      }
    }
  }

  return false;
}

function insertSkillToken(skillName, { replaceTypedSlash }) {
  if (!promptInput) return;
  const ensureCaretInPrompt = () => {
    focusPrompt();
    const s = window.getSelection?.();
    if (!s) return null;
    const r = document.createRange();
    r.selectNodeContents(promptInput);
    r.collapse(false);
    s.removeAllRanges();
    s.addRange(r);
    return r;
  };

  const sel = window.getSelection?.();
  let range = null;
  if (!sel || sel.rangeCount === 0) {
    range = ensureCaretInPrompt();
    if (!range) return;
  } else {
    range = sel.getRangeAt(0);
    // If selection is NOT inside prompt editor (e.g. toolbar pill), force it into prompt.
    if (!promptInput.contains(range.startContainer)) {
      range = ensureCaretInPrompt();
      if (!range) return;
    }
  }

  range.collapse(true);

  if (replaceTypedSlash) {
    removeSlashBeforeCaret(range);
  }

  const token = document.createElement('span');
  token.className = 'skill-token';
  token.contentEditable = 'false';
  // Keep both slash + skill name in blue, but ensure only ONE slash total
  token.textContent = `/${skillName}`;

  const space = document.createTextNode(' ');
  range.insertNode(space);
  range.insertNode(token);

  // Move caret after space
  range.setStartAfter(space);
  range.collapse(true);
  const activeSel = window.getSelection?.();
  if (activeSel) {
    activeSel.removeAllRanges();
    activeSel.addRange(range);
  }
}

function ensureMentionPillContainer() {
  if (!promptInput) return null;
  let container = promptInput.querySelector('.mention-pill-container');
  if (container) return container;

  container = document.createElement('span');
  container.className = 'mention-pill-container';
  container.contentEditable = 'false';

  // Put at very beginning
  if (promptInput.firstChild) promptInput.insertBefore(container, promptInput.firstChild);
  else promptInput.appendChild(container);

  // Ensure a space after pills so typing feels natural
  const next = container.nextSibling;
  if (!next || !(next.nodeType === Node.TEXT_NODE) || !(next.textContent || '').startsWith(' ')) {
    promptInput.insertBefore(document.createTextNode(' '), container.nextSibling);
  }

  return container;
}

function insertMentionPillAtStart(mention) {
  const container = ensureMentionPillContainer();
  if (!container) return;

  // Avoid duplicates by id
  if (container.querySelector(`[data-mention-id="${mention.id}"]`)) return;

  const pill = document.createElement('span');
  pill.className = 'mention-pill';
  pill.dataset.mentionId = mention.id;
  pill.contentEditable = 'false';
  pill.innerHTML = `<img src="${mention.avatar}" alt="" /><span>${mention.name}</span><span class="mention-pill-remove" role="button" aria-label="移除"><img src="./icon/mention-remove.svg" alt="" /></span>`;

  pill.querySelector('.mention-pill-remove')?.addEventListener('mousedown', e => {
    e.preventDefault();
    e.stopPropagation();
  });

  pill.querySelector('.mention-pill-remove')?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    pill.remove();
  });

  container.appendChild(pill);
}

function ensureMentionPopover() {
  if (mentionPopoverEl) return mentionPopoverEl;
  const el = document.createElement('div');
  el.className = 'skill-popover';
  el.style.display = 'none';
  el.innerHTML = `
    <div class="skill-popover-inner">
      <div class="skill-popover-title">提及</div>
      <div class="skill-popover-list" id="mention-popover-list" role="listbox" aria-label="虾列表"></div>
    </div>
  `;
  document.body.appendChild(el);
  mentionPopoverEl = el;

  const list = el.querySelector('#mention-popover-list');
  MENTIONS.forEach(m => {
    const item = document.createElement('div');
    item.className = 'skill-popover-item';
    item.dataset.mentionId = m.id;
    item.setAttribute('role', 'option');
    item.setAttribute('tabindex', '-1');
    item.innerHTML = `
      <span class="skill-item-icon" style="width:20px;height:20px;border-radius:999px;">
        <img src="${m.avatar}" alt="" style="width:20px;height:20px;border-radius:999px;object-fit:cover;" />
      </span>
      <span class="skill-item-name">${m.name}</span>
    `;
    item.addEventListener('mousedown', e => e.preventDefault());
    item.addEventListener('click', () => {
      selectMentionById(m.id);
    });
    list.appendChild(item);
  });

  return el;
}

function getMentionItems() {
  if (!mentionPopoverEl) return [];
  return Array.from(mentionPopoverEl.querySelectorAll('.skill-popover-item'));
}

function setMentionSelectedIndex(nextIndex) {
  const items = getMentionItems();
  if (!items.length) {
    mentionSelectedIndex = 0;
    return;
  }
  const clamped = ((nextIndex % items.length) + items.length) % items.length;
  mentionSelectedIndex = clamped;
  items.forEach((el, idx) => {
    const selected = idx === clamped;
    el.classList.toggle('is-selected', selected);
    el.setAttribute('aria-selected', selected ? 'true' : 'false');
  });
  items[clamped].scrollIntoView({ block: 'nearest' });
}

function openMentionPopover(trigger, anchorEl) {
  const pop = ensureMentionPopover();
  mentionPopoverTrigger = trigger;
  pop.style.display = 'block';
  pop.getBoundingClientRect();
  if (trigger === 'button' && anchorEl) positionPopoverByButton(pop, anchorEl);
  else positionPopoverByCaret(pop);
  mentionPopoverOpen = true;
  setMentionSelectedIndex(0);
}

function closeMentionPopover() {
  if (!mentionPopoverEl) return;
  mentionPopoverEl.style.display = 'none';
  mentionPopoverOpen = false;
  mentionPopoverTrigger = null;
}

function toggleMentionPopoverByButton(buttonEl) {
  if (mentionPopoverOpen) closeMentionPopover();
  else openMentionPopover('button', buttonEl);
}

function selectMentionById(mentionId) {
  const mention = MENTIONS.find(m => m.id === mentionId);
  if (!mention || !promptInput) return;

  // If triggered by typing '@', remove that '@' near caret, but insert pill at start
  const sel = window.getSelection?.();
  if (sel && sel.rangeCount) {
    const range = sel.getRangeAt(0);
    range.collapse(true);
    if (mentionPopoverTrigger === 'at') {
      removeCharBeforeCaret(range, '@');
      // restore selection
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  insertMentionPillAtStart(mention);
  closeMentionPopover();
  focusPrompt();
}

function selectCurrentMention() {
  const items = getMentionItems();
  if (!items.length) return;
  const idx = Math.min(Math.max(mentionSelectedIndex, 0), items.length - 1);
  selectMentionById(items[idx].dataset.mentionId);
}

// Global close handlers
document.addEventListener('mousedown', e => {
  const composerForm = document.getElementById('composer-form');
  const toolbarPills = composerForm?.querySelectorAll('.toolbar-left .pill-select') || [];
  const skillBtn = toolbarPills[0];
  const mentionBtn = toolbarPills[1];

  if (skillPopoverOpen) {
    const pop = skillPopoverEl;
    if (pop && pop.contains(e.target)) return;
    if (skillBtn && skillBtn.contains(e.target)) return;
    closeSkillPopover();
  }

  if (mentionPopoverOpen) {
    const pop = mentionPopoverEl;
    if (pop && pop.contains(e.target)) return;
    if (mentionBtn && mentionBtn.contains(e.target)) return;
    closeMentionPopover();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && skillPopoverOpen) {
    e.preventDefault();
    closeSkillPopover();
  }
  if (e.key === 'Escape' && mentionPopoverOpen) {
    e.preventDefault();
    closeMentionPopover();
  }
  const clawSkillModal = document.getElementById('claw-skill-detail-modal');
  if (e.key === 'Escape' && clawSkillModal && !clawSkillModal.hidden) {
    e.preventDefault();
    closeClawSkillDetail();
  }
});

// Inline SVG icons (replacing expired Figma URLs)
const READ_ICON_MARKUP = `
  <span class="step-icon-wrap" aria-hidden="true">
    <span class="step-icon-core">
      <img class="step-icon-part" style="left:10.41%;top:14.58%;width:39.59%;height:72.92%;" src="https://www.figma.com/api/mcp/asset/64942a22-9a88-400a-855b-1b21d266b9f8" alt="" />
      <img class="step-icon-part" style="left:50%;top:14.58%;width:39.58%;height:72.92%;" src="https://www.figma.com/api/mcp/asset/15535590-1528-4466-ba4c-1a0cc0fcfb81" alt="" />
    </span>
  </span>
`;
const TOOL_ICON_MARKUP = `
  <span class="step-icon-wrap" aria-hidden="true">
    <span class="step-icon-core">
      <img class="step-icon-part" style="left:8.33%;top:27.08%;width:25%;height:50%;" src="https://www.figma.com/api/mcp/asset/aa6f2e8b-826c-4b01-a2c6-cc5ef022f8d9" alt="" />
      <img class="step-icon-part" style="left:66.67%;top:27.08%;width:25%;height:50%;" src="https://www.figma.com/api/mcp/asset/48735b2c-d445-4673-ba0c-7a1ebce766fe" alt="" />
      <img class="step-icon-part" style="left:41.67%;top:8.33%;width:14.58%;height:83.34%;" src="https://www.figma.com/api/mcp/asset/221443da-ed39-47b0-9a09-fa60c01bb5dd" alt="" />
    </span>
  </span>
`;
const EXEC_STATUS_ICON_SVG = '<img class="execution-status-icon" src="./figma-assets/31648c85-08b3-4367-ae29-587fd6237d54.svg" alt="" />';
const EXEC_TOGGLE_ARROW_SVG = '<svg viewBox="0 0 10 6" aria-hidden="true" focusable="false"><path d="M1 1.25L5 4.75L9 1.25" fill="none" stroke="rgba(255,255,255,0.56)" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PDF_ICON_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="4" width="14" height="18" rx="2" stroke="rgba(255,255,255,0.48)" stroke-width="1.4"/><path d="M12 4v5h8" stroke="rgba(255,255,255,0.48)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 14h8M9 17h5" stroke="rgba(255,255,255,0.48)" stroke-width="1.2" stroke-linecap="round"/><rect x="14" y="18" width="12" height="10" rx="2" fill="#EF4444" opacity="0.9"/><text x="20" y="26" text-anchor="middle" font-size="6" fill="white" font-family="sans-serif" font-weight="bold">PPT</text></svg>`;
const PPT_FILE_ICON_SVG = `<svg width="25" height="28" viewBox="0 0 25 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 3.11111C0 1.39289 1.39289 0 3.11111 0H17.1111L24.8889 7.77778V24.8889C24.8889 26.6071 23.496 28 21.7778 28H3.11111C1.39289 28 0 26.6071 0 24.8889V3.11111Z" fill="#EA5355"/><path d="M17.1133 4.66667C17.1133 6.38489 18.5062 7.77778 20.2244 7.77778H24.8911L17.1133 0V4.66667Z" fill="#F78E8F"/><path opacity="0.9" fill-rule="evenodd" clip-rule="evenodd" d="M10.7016 9.64062H13.0711C13.0711 12.5907 15.6112 15.754 18.7769 16.8096L18.2355 19.1069C14.5201 18.5761 10.6803 20.1613 7.21247 22.474L5.81445 20.5629C7.10111 19.5334 8.33558 17.787 9.25032 15.7457C10.1625 13.7126 10.7016 11.509 10.7016 9.64062ZM10.6582 17.0594C11.1813 15.8898 11.6456 14.6772 12.0374 13.4489C12.9726 14.8776 14.0968 16.1732 15.3795 17.3003C13.4557 17.6451 11.5731 18.2113 9.74734 18.9322C10.0705 18.317 10.3742 17.6921 10.6582 17.0594Z" fill="white"/></svg>`;
const DL_ICON_SVG = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 3v9M6 9l3 3 3-3" stroke="rgba(255,255,255,0.48)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 14h12" stroke="rgba(255,255,255,0.48)" stroke-width="1.3" stroke-linecap="round"/></svg>';

// Asset URLs from Figma
const ASSETS = {
  clawIcon: 'https://www.figma.com/api/mcp/asset/592375f5-4355-4637-b3d4-88d5909b7e05',
  clawIconAlt: 'https://www.figma.com/api/mcp/asset/ef0e2595-ae3a-4867-a047-8b19294807e0',
  continueIcon: './send.svg',
  continueIconWhite: './send-dark.svg',
  arrowIcon: 'https://www.figma.com/api/mcp/asset/e4fa9311-c1e2-47a1-b334-1af7e23d4dcf',
  timelineBar: 'https://www.figma.com/api/mcp/asset/06106c6c-3608-486d-88e3-73b592d2d44d',
  fileIcon: 'https://www.figma.com/api/mcp/asset/20da8605-e537-44d2-aaf3-ab40bb1de6c7',
  toolsIcon: 'https://www.figma.com/api/mcp/asset/02da8605-e537-44d2-aaf3-ab40bb1de6c7',
  puzzleIcon: 'https://www.figma.com/api/mcp/asset/2af548b1-1883-4f55-a6ec-6480a2b61a53',
  readIcon: 'https://www.figma.com/api/mcp/asset/0b2647c3-3e9e-4592-a429-aa06b9e7960d',
  pdfIcon: 'https://www.figma.com/api/mcp/asset/b3a1c109-b8ea-41d7-87ba-9d330ceee1eb',
  downloadIcon: 'https://www.figma.com/api/mcp/asset/e1c5f0ff-2ee8-47ab-8116-89573de828de',
};

// State
let conversationStarted = false;
let clarificationAnswers = {};
let currentPhase = 'idle'; // idle | clarifying | executing | done
let pptClarifyPending = false;
let pptOriginalText = '';
let pptClarifyFormData = {};
let personalizationFlowState = 'idle'; // idle | awaiting-choice | learning | awaiting-feedback | done

function showConversation() {
  navigateTo('conversation');
}

function scrollConversationToBottom() {
  const scroll = document.getElementById('main-stage-scroll');
  if (scroll) scroll.scrollTop = scroll.scrollHeight;
}

function appendMessage(el, options = {}) {
  conversationThread.appendChild(el);
  if (options.scroll === 'start') {
    focusConversationElement(el, options.focusOptions);
    return;
  }
  if (options.scroll === 'none') return;
  scrollConversationToBottom();
}

function focusConversationElement(el, options = {}) {
  const scroll = document.getElementById('main-stage-scroll');
  if (!scroll || !el) return;

  const topGap = options.topGap ?? 16;
  const behavior = options.behavior ?? 'smooth';

  requestAnimationFrame(() => {
    const scrollRect = scroll.getBoundingClientRect();
    const elementRect = el.getBoundingClientRect();
    const delta = elementRect.top - scrollRect.top - topGap;
    scroll.scrollBy({ top: delta, behavior });
  });
}

function getTypewriterDelay(character, baseSpeed = 12) {
  if (!character) return baseSpeed;
  if (character === '\n') return baseSpeed * 4;
  if (/[。！？!?]/.test(character)) return baseSpeed * 3;
  if (/[，、；;,]/.test(character)) return baseSpeed * 2;
  return baseSpeed;
}

function formatTypewriterText(text) {
  return escapeHtml(String(text || ''))
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function startTypewriterParagraph(paragraph, text, options = {}) {
  const content = String(text || '');
  const speed = options.speed ?? 8;
  paragraph.classList.add('typewriter-text', 'is-typing');
  paragraph.innerHTML = '';

  return new Promise((resolve) => {
    if (!content) {
      paragraph.classList.remove('is-typing');
      resolve(paragraph);
      return;
    }

    let index = 0;
    const tick = () => {
      index += 1;
      paragraph.innerHTML = formatTypewriterText(content.slice(0, index));
      scrollConversationToBottom();

      if (index >= content.length) {
        paragraph.innerHTML = formatTypewriterText(content);
        paragraph.classList.remove('is-typing');
        resolve(paragraph);
        return;
      }

      setTimeout(tick, getTypewriterDelay(content[index - 1], speed));
    };

    requestAnimationFrame(tick);
  });
}

function createTypewriterAiMessageBubble(text, options = {}) {
  const bubble = document.createElement('div');
  bubble.className = 'result-section history-ai-bubble';

  const paragraph = document.createElement('p');
  paragraph.className = 'result-text typewriter-text is-typing';
  bubble.appendChild(paragraph);

  const content = String(text || '');
  const speed = options.speed ?? 12;

  const done = startTypewriterParagraph(paragraph, content, { speed }).then(() => bubble);

  return { bubble, done };
}

function getExecutionIconMarkup(type) {
  return type === 'read' ? READ_ICON_MARKUP : TOOL_ICON_MARKUP;
}

function getToggleArrowMarkup(extraClass = '') {
  return `<div class="toggle-arrow${extraClass}">${EXEC_TOGGLE_ARROW_SVG}</div>`;
}

function createStepDetailPanel(detail) {
  const panel = document.createElement('div');
  panel.className = 'step-detail-panel';
  panel.innerHTML = `
    <div class="step-detail-label">Parameters：</div>
    <pre class="step-detail-code">${escapeHtml(detail.params)}</pre>
    <div class="step-detail-divider"></div>
    <div class="step-detail-label">Result：</div>
    <pre class="step-detail-code">${escapeHtml(detail.result)}</pre>
  `;
  return panel;
}

function setStepDetailOpen(wrap, shouldOpen, scrollContainer) {
  if (!wrap) return;
  let panel = wrap.querySelector('.step-detail-panel');
  if (!panel && shouldOpen) {
    panel = createStepDetailPanel({
      params: wrap.dataset.stepParams || '',
      result: wrap.dataset.stepResult || ''
    });
    wrap.appendChild(panel);
  }
  if (!panel) return;

  const item = wrap.querySelector('.step-item');
  item?.classList.toggle('is-expanded', shouldOpen);

  if (shouldOpen) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      panel.classList.add('is-open');
      if (scrollContainer) {
        setTimeout(() => {
          wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          ensureStepDetailVisible(wrap, scrollContainer);
        }, 100);
      }
    }));
    return;
  }

  panel.style.maxHeight = '0';
  panel.classList.remove('is-open');
  setTimeout(() => {
    if (panel.parentNode === wrap && !panel.classList.contains('is-open')) panel.remove();
  }, 360);
}

function bindStepDetailToggle(wrap, scrollContainer) {
  const item = wrap.querySelector('.step-item');
  if (!item) return;

  item.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-expanded');
    const parent = wrap.parentElement;
    if (parent) {
      parent.querySelectorAll('.step-item-wrap').forEach(otherWrap => {
        if (otherWrap !== wrap) setStepDetailOpen(otherWrap, false, scrollContainer);
      });
    }
    setStepDetailOpen(wrap, !isOpen, scrollContainer);
  });
}

function buildExecutionStepItem(type, text, options = {}) {
  const item = document.createElement('div');
  item.className = `step-item${options.isActive ? ' is-active' : ''}`;
  item.innerHTML = `
    <span class="step-marker" aria-hidden="true">
      <span class="step-line step-line-top"></span>
      <span class="step-node"></span>
      <span class="step-line step-line-bottom"></span>
    </span>
    ${getExecutionIconMarkup(type)}
    <span class="step-text">${escapeHtml(text)}</span>
  `;
  return item;
}

function refreshExecutionTimeline(content) {
  const wraps = [...content.querySelectorAll('.step-item-wrap')];
  wraps.forEach((wrap, index) => {
    wrap.classList.toggle('is-first', index === 0);
    wrap.classList.toggle('is-last-rendered', index === wraps.length - 1);
  });

  const rows = [...content.querySelectorAll('.step-item')];
  rows.forEach((row, index) => {
    row.classList.toggle('is-first', index === 0);
    row.classList.toggle('is-last-rendered', index === rows.length - 1);
  });
}

function createUserBubble(text) {
  const wrap = document.createElement('div');
  wrap.className = 'user-message';
  wrap.innerHTML = `<div class="user-bubble">${text}</div>`;
  return wrap;
}

function createWaitingState() {
  const el = document.createElement('div');
  el.className = 'waiting-state';
  el.innerHTML = `
    <img class="waiting-icon" src="${ASSETS.clawIcon}" alt="" />
    <span class="waiting-text">等待用户输入</span>
  `;
  return el;
}

function createClarificationCard(userText) {
  const card = document.createElement('div');
  card.className = 'clarification-card';
  card.id = 'clarification-card';
  card.innerHTML = `
    <p class="clarification-intro">想了解一下你想定什么样的任务</p>

    <div class="question-block" id="q1-block">
      <div class="question-header">
        <div class="question-number">1</div>
        <span class="question-text">你想定哪种类型的任务？</span>
      </div>
      <div class="options-row" id="q1-options">
        <div class="option-pill" data-q="1" data-v="定时提醒">定时提醒</div>
        <div class="option-pill" data-q="1" data-v="周期性任务">周期性任务</div>
        <div class="option-pill" data-q="1" data-v="日历事件">日历事件</div>
        <div class="option-pill" data-q="1" data-v="待办清单">待办清单</div>
        <div class="option-pill" data-q="1" data-v="其他">其他</div>
      </div>
      <input class="text-input-pill" placeholder="输入你的答案" id="q1-input" />
    </div>

    <div class="question-block" id="q2-block">
      <div class="question-header">
        <div class="question-number">2</div>
        <span class="question-text">能简单描述一下任务内容吗？比如：每天早上9点提醒我查看邮件、下周三下午开会等。</span>
      </div>
      <div class="options-row" id="q2-options">
        <div class="option-pill" data-q="2" data-v="其他">其他</div>
      </div>
      <input class="text-input-pill" placeholder="输入你的答案" id="q2-input" />
    </div>

    <div class="clarification-divider"></div>
    <div class="clarification-actions">
      <button class="action-button" id="btn-confirm" disabled>
        <img src="${ASSETS.continueIcon}" alt="" id="btn-icon" />
        继续
      </button>
    </div>
  `;

  // Option pill selection
  card.querySelectorAll('.option-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const q = pill.dataset.q;
      card.querySelectorAll(`.option-pill[data-q="${q}"]`).forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      clarificationAnswers[q] = pill.dataset.v;
      const input = card.querySelector(`#q${q}-input`);
      if (input) input.value = '';
      updateConfirmButton(card);
    });
  });

  // Text input
  card.querySelectorAll('.text-input-pill').forEach(input => {
    const q = input.id.replace('q', '').replace('-input', '');
    input.addEventListener('input', () => {
      if (input.value.trim()) {
        card.querySelectorAll(`.option-pill[data-q="${q}"]`).forEach(p => p.classList.remove('selected'));
        clarificationAnswers[q] = input.value.trim();
      } else {
        delete clarificationAnswers[q];
      }
      updateConfirmButton(card);
    });
  });

  // Confirm button
  card.querySelector('#btn-confirm').addEventListener('click', () => {
    if (!clarificationAnswers[1]) clarificationAnswers[1] = '定时提醒';
    if (!clarificationAnswers[2]) clarificationAnswers[2] = '每天早上10点，每天一次';
    startExecution();
  });

  return card;
}

function updateConfirmButton(card) {
  const btn = card.querySelector('#btn-confirm');
  const icon = card.querySelector('#btn-icon');
  const hasAnswers = clarificationAnswers[1] || clarificationAnswers[2];

  if (hasAnswers) {
    btn.disabled = false;
    btn.classList.add('primary');
    icon.src = ASSETS.continueIconWhite;
  } else {
    btn.disabled = true;
    btn.classList.remove('primary');
    icon.src = ASSETS.continueIcon;
  }
}

function startExecution() {
  currentPhase = 'executing';
  const card = document.getElementById('clarification-card');
  if (card) {
    // Disable all interactions
    card.querySelectorAll('.option-pill, .text-input-pill, button').forEach(el => {
      el.style.pointerEvents = 'none';
      el.style.opacity = '0.5';
    });
  }

  // Remove waiting state if present
  const waiting = document.querySelector('.waiting-state');
  if (waiting) waiting.remove();

  // Add user confirmation bubble
  const userReply = createUserBubble(`${clarificationAnswers[1]}，${clarificationAnswers[2]}`);
  appendMessage(userReply);

  // Show execution section
  const execSection = createExecutionSection();
  appendMessage(execSection);

  // Animate steps
  animateExecution(execSection);
}

function createExecutionSection() {
  const section = document.createElement('div');
  section.className = 'execution-section';
  section.id = 'execution-section';
  section.innerHTML = `
    <div class="execution-steps" id="exec-steps">
    <div class="execution-header">
      ${EXEC_STATUS_ICON_SVG}
      <span class="execution-status">执行中</span>
      ${getToggleArrowMarkup()}
    </div>
    <div class="execution-timeline" id="exec-timeline" style="opacity: 0; transition: opacity 300ms ease, max-height 300ms ease; overflow: hidden;">
      <div class="timeline-content" id="timeline-content"></div>
      </div>
    </div>
  `;
  return section;
}

function animateExecution(section) {
  const timeline = section.querySelector('#exec-timeline');
  const content = section.querySelector('#timeline-content');

  const steps = [
    { type: 'read', text: '查看了 SKILL.md', delay: 400 },
    { type: 'text', text: '好的，我来设置每天上午10点推送新闻热点。先看一下新闻技能怎么用。', delay: 900 },
    { type: 'tool', text: '执行了命令 curl -s "https://feeds.bbci.co.uk/news/rss.xml" | grep...', delay: 1400 },
    { type: 'plugin', text: '正在执行 周期性任务', delay: 1900 },
    { type: 'code', text: 'curl -s "https://feeds.bbci.co.uk/news/rss.xml" | grep...', delay: 2200 },
  ];

  // Show timeline
  setTimeout(() => {
    timeline.style.opacity = '1';
  }, 300);

  steps.forEach(({ type, text, delay }) => {
    setTimeout(() => {
      let item = document.createElement('div');
      item.style.opacity = '0';
      item.style.transform = 'translateY(6px)';
      item.style.transition = 'opacity 250ms ease, transform 250ms ease';

      if (type === 'code') {
        item.className = 'step-code-block';
        item.textContent = text;
      } else {
        item = buildExecutionStepItem(type === 'read' ? 'read' : 'tool', text, {
          isActive: type !== 'read',
        });
        item.style.opacity = '0';
        item.style.transform = 'translateY(6px)';
        item.style.transition = 'opacity 250ms ease, transform 250ms ease';
      }

      content.appendChild(item);
      refreshExecutionTimeline(content);
      scrollConversationToBottom();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        });
      });
    }, delay);
  });

  // Show completion
  setTimeout(() => {
    const header = section.querySelector('.execution-header');
    const timeline = section.querySelector('#exec-timeline');

    header.classList.add('is-complete');
    header.innerHTML = `
      ${EXEC_STATUS_ICON_SVG}
      <span class="complete-text">已完成执行 (1分1秒)</span>
      ${getToggleArrowMarkup(' is-collapsed')}
    `;

    // Collapse timeline by default
    timeline.style.maxHeight = timeline.scrollHeight + 'px';
    setTimeout(() => {
      timeline.style.maxHeight = '0';
      timeline.style.opacity = '0';
      timeline.style.overflow = 'hidden';
      timeline.style.transition = 'max-height 300ms ease, opacity 300ms ease';
    }, 100);

    // Toggle functionality
    const arrow = header.querySelector('.toggle-arrow');
    let isExpanded = false;

    arrow.addEventListener('click', () => {
      isExpanded = !isExpanded;
      if (isExpanded) {
        timeline.style.maxHeight = timeline.scrollHeight + 'px';
        timeline.style.opacity = '1';
        arrow.style.transform = 'rotate(0deg)';
      } else {
        timeline.style.maxHeight = '0';
        timeline.style.opacity = '0';
        arrow.style.transform = 'rotate(180deg)';
      }
    });

    // Show result
    setTimeout(() => {
      showResult();
    }, 400);
  }, 3200);
}

function showResult() {
  const result = document.createElement('div');
  result.className = 'result-section';
  result.style.opacity = '0';
  result.style.transition = 'opacity 400ms ease';

  result.innerHTML = `
    <p class="result-text">⏰ 搞定！已设置每天早上 10:00 提醒你看新闻～</p>

    <div class="result-list">
      <div class="result-item">
        <div class="result-bullet"><div class="result-bullet-dot"></div></div>
        <span class="result-item-text">🐦 Twitter/X - AI 圈热点讨论</span>
      </div>
      <div class="result-item">
        <div class="result-bullet"><div class="result-bullet-dot"></div></div>
        <span class="result-item-text">📰 Hacker News - 技术前沿</span>
      </div>
      <div class="result-item">
        <div class="result-bullet"><div class="result-bullet-dot"></div></div>
        <span class="result-item-text">🐙 GitHub Trending - 热门 AI 项目</span>
      </div>
      <div class="result-item">
        <div class="result-bullet"><div class="result-bullet-dot"></div></div>
        <span class="result-item-text">🌐 AI 技术博客/资讯站</span>
      </div>
    </div>

    <div class="result-divider"></div>

    <p class="result-title">📋 任务详情</p>

    <div class="result-table">
      <div class="table-column">
        <div class="table-cell header">项目</div>
        <div class="table-cell">📅 时间</div>
        <div class="table-cell">🤖 模型</div>
        <div class="table-cell">📬 推送方式</div>
        <div class="table-cell">⏱️ 超时限制</div>
        <div class="table-cell">🔔 状态</div>
      </div>
      <div class="table-column">
        <div class="table-cell header">设置</div>
        <div class="table-cell">每天下午 <strong>18:00</strong>（北京时间）</div>
        <div class="table-cell">qwen3.5-plus</div>
        <div class="table-cell">飞书消息直达</div>
        <div class="table-cell">5 分钟</div>
        <div class="table-cell">✅ 已启用</div>
      </div>
    </div>

    <p class="result-text">你可以直接查看附件中的 PDF 版本进行打印，或者使用 Markdown 版本进行二次编辑。希望这份试卷能对您的教学或学习有所帮助！</p>

    <div class="result-attachments">
      <div class="attachment-card">
        <span class="attachment-icon">${PDF_ICON_SVG}</span>
        <div class="attachment-info">
          <span class="attachment-name">高中物理周测试卷：牛顿第一定律.pdf</span>
          <span class="attachment-meta">PDF · 382.19 KB</span>
        </div>
        <div class="attachment-download">
          ${DL_ICON_SVG}
        </div>
      </div>
      <div class="attachment-card">
        <span class="attachment-icon">${PDF_ICON_SVG}</span>
        <div class="attachment-info">
          <span class="attachment-name">高中物理周测试卷答案及评分标准</span>
          <span class="attachment-meta">PDF · 62.7 KB</span>
        </div>
        <div class="attachment-download">
          ${DL_ICON_SVG}
        </div>
      </div>
    </div>
  `;

  appendMessage(result);

  // Bind attachment card click to open preview
  result.querySelectorAll('.attachment-card').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.querySelector('.attachment-name').textContent;
      openPreview(name, 'https://www.figma.com/api/mcp/asset/a3d8d6f5-e399-4108-be4b-06175be4e067');
    });
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      result.style.opacity = '1';
    });
  });

  currentPhase = 'done';
}

function startConversation(text) {
  if (!conversationStarted) {
    conversationStarted = true;
    showConversation();
  }

  if (personalizationFlowState === 'awaiting-feedback') {
    personalizationFlowState = 'done';
    appendMessage(createUserBubble(text));
    setTimeout(() => {
      appendMessage(createAiMessageBubble({
        text: '记住了——内部文档直接口语，对外材料切换正式风格。我正式上岗了。有什么要做的，直接说吧。',
      }));
    }, 420);
    return;
  }

  // 如果正在等待 PPT 澄清回答，把用户输入当作回答处理
  if (pptClarifyPending) {
    pptClarifyPending = false;
    const userMsg = createUserBubble(text);
    appendMessage(userMsg);
    const fallbackAnswers = parsePPTFallbackAnswer(text);
    // AI confirms and starts execution
    setTimeout(() => {
      const typingBubble = createTypewriterAiMessageBubble(
        `好的，我来做一个产品汇报 PPT（${text}）\n\n正在调用 PPT 生成技能，开始执行...`,
        { speed: 10 },
      );
      appendMessage(typingBubble.bubble);
      typingBubble.done.then(() => {
        setTimeout(() => {
          startPPTExecution(pptOriginalText, fallbackAnswers);
        }, 240);
      });
    }, 500);
    return;
  }

  // PPT / 汇报 任务走专属执行链路（先澄清）
  if (/ppt|汇报|演示|幻灯片/i.test(text)) {
    startPPTClarification(text);
    return;
  }

  currentPhase = 'clarifying';
  clarificationAnswers = {};

  // User message
  const userMsg = createUserBubble(text);
  appendMessage(userMsg);

  // AI clarification
  setTimeout(() => {
    const typingBubble = createTypewriterAiMessageBubble(
      '好的，我先确认几个关键信息，避免任务设错。',
      { speed: 10 },
    );
    appendMessage(typingBubble.bubble);
    typingBubble.done.then(() => {
      const clarCard = createClarificationCard(text);
      appendMessage(clarCard, { scroll: 'start', focusOptions: { topGap: 12 } });
    });
  }, 500);
}

// Send button
document.querySelector('.send-button')?.addEventListener('click', () => {
  const text = getPromptPlainText().trim();
  if (!text) return;
  clearPrompt();
  startConversation(text);
});

// Composer form submit
document.getElementById('composer-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const text = getPromptPlainText().trim();
  if (!text) return;
  clearPrompt();
  startConversation(text);
});

// Enter key in textarea
document.getElementById('prompt-input')?.addEventListener('keydown', e => {
  if (mentionPopoverOpen) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMentionSelectedIndex(mentionSelectedIndex + 1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMentionSelectedIndex(mentionSelectedIndex - 1);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      selectCurrentMention();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMentionPopover();
      return;
    }
    // If at-trigger popover is open, allow Backspace/Delete to dismiss it
    if ((e.key === 'Backspace' || e.key === 'Delete') && mentionPopoverTrigger === 'at') {
      // Let deletion happen first, then check whether '@' trigger still exists
      requestAnimationFrame(() => {
        if (!mentionPopoverOpen) return;
        if (!isCharBeforeCaret('@') && !isCharBeforeCaret('＠')) {
          closeMentionPopover();
        }
      });
      return;
    }
  }

  // When popover is open, keep everything keyboard-driven
  if (skillPopoverOpen) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSkillSelectedIndex(skillSelectedIndex + 1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSkillSelectedIndex(skillSelectedIndex - 1);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      selectCurrentSkill();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSkillPopover();
      return;
    }
    // If slash-trigger popover is open, allow Backspace/Delete to dismiss it
    if ((e.key === 'Backspace' || e.key === 'Delete') && skillPopoverTrigger === 'slash') {
      // Let deletion happen first, then check whether slash trigger still exists
      requestAnimationFrame(() => {
        if (!skillPopoverOpen) return;
        if (!isCharBeforeCaret('/')) {
          closeSkillPopover();
        }
      });
      return;
    }
    // Let other keys pass through (typing continues)
  }

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const text = getPromptPlainText().trim();
    if (!text) return;
    clearPrompt();
    startConversation(text);
    return;
  }

  // Slash trigger
  if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    // Let it be inserted, then open popover near caret
    requestAnimationFrame(() => {
      openSkillPopover('slash');
    });
    return;
  }

  // At trigger
  const isAtKey = e.key === '@' || (e.key === '2' && e.shiftKey);
  if (isAtKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
    requestAnimationFrame(() => {
      openMentionPopover('at');
    });
    return;
  }
});

// Prefer beforeinput for reliable character detection in contenteditable
promptInput?.addEventListener('beforeinput', e => {
  if (typeof e.data !== 'string') return;
  if (e.inputType !== 'insertText') return;
  if (e.data === '/') {
    requestAnimationFrame(() => openSkillPopover('slash'));
  }
  if (e.data === '@') {
    requestAnimationFrame(() => openMentionPopover('at'));
  }
});

// Toolbar pill click triggers via event delegation (capture + manual walk for robustness)
const composerFormEl = document.getElementById('composer-form');
composerFormEl?.addEventListener(
  'click',
  e => {
    let node = e.target;
    while (node && node !== composerFormEl) {
      if (node.classList?.contains('pill-select') && node.closest?.('.toolbar-left')) break;
      node = node.parentNode;
    }
    const pill = node && node !== composerFormEl ? node : null;
    if (!pill) return;

    const spans = pill.querySelectorAll('span');
    const label = spans.length ? spans[spans.length - 1].textContent?.trim() : '';
    if (!label) return;

    if (label === '技能') {
      e.preventDefault();
      // Keep focus/caret in editor so selecting skill inserts into prompt, not toolbar button.
      focusPrompt();
      toggleSkillPopoverByButton(pill);
      return;
    }

    if (label === '提及') {
      e.preventDefault();
      toggleMentionPopoverByButton(pill);
    }
  },
  true,
);

// Fallback for environments where beforeinput is unreliable
promptInput?.addEventListener('input', () => {
  const text = getPromptPlainText();
  if (!text) return;
  const last = text[text.length - 1];
  if (last === '@') {
    openMentionPopover('at');
  }
  if (last === '/') {
    openSkillPopover('slash');
  }
});

const QUICK_START_DOC_INLINE = `小天 - 天禧个人超级智能体简历

你的专属AI伙伴，精准、高效、有温度

📌 基本信息
姓名：小天
身份：天禧个人超级智能体
开发者：联想集团
核心能力：信息查询、任务执行、创意生成、多工具协作
性格特质：灵活切换人格模式 - 严谨逻辑学家/热情奋斗者/温暖共情者
🚀 核心能力
1. 信息处理与查询
✅ 全网实时信息搜索（新闻、资讯、知识）
✅ 文档解析与总结（PDF/Word/Excel/PPT等各类格式）
✅ 数据整理与分析，结构化输出
✅ 知识库管理（信息存储、检索、关联）
2. 创意生成与内容创作
✅ 文案写作（文章、邮件、报告、脚本）
✅ 内容优化（润色、改写、扩写、精简）
✅ 创意策划（方案、活动、营销、起名）
✅ 多媒体生成（图片、PPT、视频脚本、语音）
3. 任务执行与工具协作
✅ 多工具协同调度（浏览器、命令行、API服务）
✅ 子任务自动拆解与并行执行
✅ 本地设备操作（文件管理、系统命令、软件控制）
✅ 第三方服务集成（视频平台、云服务、API对接）
4. 专业领域支持
✅ 技术开发辅助（代码生成、调试、文档编写）
✅ 学术研究支持（文献整理、数据分析、报告生成）
✅ 设计辅助（海报、PPT、UI设计建议）
✅ 生活服务（旅行规划、日程管理、购物建议）
🛠️ 可用工具集
系统内置工具
工具分类\t具体功能
文件操作\tread/ write/ edit 各类文件
命令执行\t系统命令执行、进程管理
网络能力\t网页抓取、全网搜索、浏览器自动化
任务调度\t定时任务、子智能体创建、多会话管理
内容生成\t文本转语音、视觉设计、文档生成
文档处理\tWord/Excel/PPT/PDF 生成、解析、编辑
MCP扩展工具
工具名称\t能力描述
爱奇艺视频\t视频搜索、影视推荐、剧情查询、播放跳转
知识库\t个人知识库存储、检索、管理
即梦AI\t图片生成、视频生成、数字人生成（火山引擎API）
本地设备控制\tPC端文件管理、系统命令执行
小天 - 详细使用说明书
📖 快速入门
1. 首次使用

直接用自然语言描述你的需求即可，不需要记忆复杂指令。例如：

"帮我写一份周报，包含本周工作进展和下周计划"
"生成一张春日樱花主题的手机壁纸"
"总结这份PDF文档的核心内容"
2. 回复风格设置

你可以随时指定回复风格：

"回复要简洁，只给结果"
"用活泼的语气，加一些emoji"
"专业严谨，用结构化列表呈现"
"给我一个详细的分步操作指南"

🎯 核心功能使用指南
一、文档处理类
1. 文档解析与总结

适用场景：PDF/Word/Excel/PPT等文档内容提取、总结、分析
使用示例：

"帮我看看这份财报，重点关注营收和利润变化"
"提取这份合同里的关键时间节点和责任条款"
"把这份PPT的内容整理成文字稿，方便我修改"

支持格式：.doc/.docx/.xls/.xlsx/.ppt/.pptx/.pdf/.txt/.md/.csv等

2. 文档生成

适用场景：生成各类专业文档
使用示例：

"生成一份项目可行性研究报告，包含市场分析、技术方案、财务预测"
"帮我做一份销售培训PPT，共15页，要专业商务风格"
"写一份劳动合同模板，符合最新劳动法规定"

可生成格式：Word/Excel/PPT/PDF/Markdown/HTML等

二、信息查询类
1. 实时信息搜索

适用场景：新闻、资讯、知识、价格等实时信息查询
使用示例：

"今天有什么重要的科技新闻？"
"帮我查一下从北京到上海的高铁时刻表，明天的"
"分析一下最近AI行业的融资情况，整理成表格"

2. 知识问答

适用场景：专业知识、生活常识、技术问题解答
使用示例：

"解释一下Transformer模型的工作原理，通俗易懂"
"糖醋排骨的正宗做法是什么？"
"电脑开不了机，黑屏有什么排查方法？"

三、创意创作类
1. 文案写作

适用场景：各类文本内容生成、优化
使用示例：

"写一份618活动的营销文案，针对年轻用户群体"
"帮我润色这篇工作总结，突出工作成果"
"生成一份婚礼主持词，幽默又温馨"

支持类型：文章、邮件、报告、脚本、广告语、演讲稿、朋友圈文案等

2. 多媒体生成

适用场景：图片、音频、视频相关创作
使用示例：

"用即梦生成一张赛博朋克风格的未来城市图片，1920×1080"
"把这段文字转成语音，用温暖的女声"
"写一个短视频脚本，主题是春日郊游，时长30秒"

四、任务执行类
1. 本地设备操作

适用场景：PC端文件管理、系统操作
使用示例：

"帮我看看下载文件夹里有哪些PDF文件"
"把桌面上的工作文档按项目分类整理到不同文件夹"
"运行系统垃圾清理，释放磁盘空间"

注意：涉及删除、修改系统配置等高危操作会提前向你确认

2. 工具集成调用

适用场景：调用第三方服务和API
使用示例：

"帮我找几部最近上映的科幻电影，评分8分以上的"
"把这份工作总结保存到我的知识库，标签是\"2026Q2\""
"用即梦生成一个数字人介绍产品的短视频"

⚡ 高级使用技巧
1. 复杂任务拆解

对于复杂需求，可以分步骤描述，我会自动拆解成子任务并行执行：

"我需要做一份市场调研报告：

先搜索最近3个月新能源汽车行业的市场数据
整理头部5家企业的市场份额和主要产品
分析未来发展趋势和机会点
生成一份20页的PPT报告"
2. 多轮迭代优化

对结果不满意可以随时提出修改意见，支持多轮迭代：

"这张图片色调太冷了，帮我调暖一些，增加阳光感"
"这份报告的数据分析部分不够深入，补充近3年的同比环比数据"
"刚才写的文案太正式了，帮我改得更接地气，适合朋友圈发布"

3. 上下文关联

我会记住当前会话的上下文，不需要重复描述背景信息：

"刚才那份PPT，帮我把第3页的图表换成柱状图"
"上次推荐的电影，帮我找一下百度云资源"
"按照之前的模板，再生成一份第二季度的销售报表"

4. 模板定制

可以让我保存常用模板，下次直接调用：

"把这份周报模板保存下来，以后我每周只要填数据就行"
"记住我喜欢的PPT风格是简约科技风，蓝色为主色调"
"以后生成图片默认用1920×1080分辨率，写实风格"

🔒 安全与隐私
1. 数据安全
所有本地文件操作仅在你授权后执行
敏感信息（密钥、密码、个人隐私）不会上传或存储
对话记录仅用于当前会话上下文，不会用于其他用途
2. 操作安全
删除文件、修改系统配置等高危操作会二次确认
不会执行任何可能破坏系统或数据的命令
网络请求严格限制在合法合规范围内
3. 内容合规
不会生成违法违规、低俗暴力、侵权盗版内容
涉及敏感话题会主动拒绝并说明原因
专业领域建议会明确标注\"仅供参考\"，不替代专业人士意见
❓ 常见问题

Q：为什么有时候回复比较慢？
A：复杂任务（如PPT生成、文档解析、多工具协作）需要调用多个服务，处理时间较长，请耐心等待，我会实时反馈进度。

Q：可以在手机上使用吗？
A：支持全平台使用，手机、平板、电脑端都可以，功能完全一致。

Q：能记住我之前说过的话吗？
A：当前会话内的上下文会自动记忆，跨会话需要主动保存到知识库才能长期记忆。

Q：可以帮我执行定时任务吗？
A：目前不支持会话结束后的自动执行，你可以设置提醒，到时间我会通知你手动执行。

Q：生成的内容有版权问题吗？
A：AI生成的内容仅供个人学习使用，商业用途请自行核实版权合规性。

[内容由AI大模型生成，请仔细甄别]
`;

let quickStartDocCache = null;
async function loadQuickStartDoc() {
  if (quickStartDocCache) return quickStartDocCache;
  try {
    const res = await fetch('./文案', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    quickStartDocCache = text;
    return text;
  } catch (err) {
    // file:// or offline demo: use inline content
    quickStartDocCache = QUICK_START_DOC_INLINE;
    return quickStartDocCache;
  }
}

function renderDocToResultBlocks(docText) {
  const lines = String(docText || '')
    .split('\n')
    .map(s => s.replace(/\r/g, ''))
    // Strip VSCode Live Preview injected script lines (and any script tag lines)
    .filter(s => {
      const t = (s || '').trim();
      if (!t) return true;
      if (t.includes('__vscode_livepreview_injected_script')) return false;
      if (t.startsWith('<script') || t.startsWith('</script')) return false;
      if (t.includes('<script') || t.includes('</script')) return false;
      return true;
    });
  const blocks = [];

  const isSectionTitle = s => /^(📌|🚀|📖|🎯|🛠️|⚡|🔒|❓)\s*/.test(s);
  const isBullet = s => /^(✅|\-)\s+/.test(s);
  const isNumbered = s => /^\d+\.\s+/.test(s);
  const isQA = s => /^(Q：|A：)/.test(s);
  const isKV = s => /^[^：]{1,16}：\s*\S+/.test(s);

  let listItems = [];
  let tableRows = [];

  const flushList = () => {
    if (!listItems.length) return;
    const items = listItems
      .map(t => {
        const safe = escapeHtml(t);
        return `
          <div class="result-item">
            <div class="result-bullet"><div class="result-bullet-dot"></div></div>
            <span class="result-item-text">${safe}</span>
          </div>
        `;
      })
      .join('');
    blocks.push(`<div class="result-list">${items}</div>`);
    listItems = [];
  };

  const flushTable = () => {
    if (!tableRows.length) return;
    const rows = tableRows
      .map(({ k, v }) => {
        return `
          <div class="doc-row">
            <div class="doc-k">${escapeHtml(k)}</div>
            <div class="doc-v">${escapeHtml(v)}</div>
          </div>
        `;
      })
      .join('');
    blocks.push(`<div class="doc-table">${rows}</div>`);
    tableRows = [];
  };

  const pushDividerIfNeeded = () => {
    if (blocks.length) blocks.push(`<div class="result-divider"></div>`);
  };

  // Title (first non-empty line) + optional subtitle (next non-empty line)
  const firstNonEmptyIdx = lines.findIndex(l => l.trim());
  const firstNonEmpty = firstNonEmptyIdx >= 0 ? lines[firstNonEmptyIdx].trim() : '';
  let subtitle = '';
  if (firstNonEmptyIdx >= 0) {
    const nextIdx = lines.findIndex((l, idx) => idx > firstNonEmptyIdx && l.trim());
    if (nextIdx >= 0) {
      const candidate = lines[nextIdx].trim();
      const looksLikeSubtitle =
        candidate &&
        !isSectionTitle(candidate) &&
        !isBullet(candidate) &&
        !isNumbered(candidate) &&
        !isQA(candidate) &&
        !isKV(candidate);
      if (looksLikeSubtitle) subtitle = candidate;
    }
  }

  if (firstNonEmpty) {
    blocks.push(
      `<div class="doc-hero">
        <p class="result-title">${escapeHtml(firstNonEmpty)}</p>
        ${subtitle ? `<p class="doc-subtitle result-text">${escapeHtml(subtitle)}</p>` : ''}
      </div>`,
    );
  }

  // Walk remaining lines
  let started = false;
  for (const raw of lines) {
    const t0 = (raw || '').trim();
    if (!t0) {
      flushTable();
      flushList();
      continue;
    }
    if (!started) {
      started = t0 === (firstNonEmpty || '').trim();
      continue;
    }
    // Skip subtitle line if we already used it in hero
    if (subtitle && t0 === subtitle) {
      continue;
    }

    const t = t0;

    if (isSectionTitle(t)) {
      flushTable();
      flushList();
      pushDividerIfNeeded();
      blocks.push(`<p class="result-title">${escapeHtml(t)}</p>`);
      continue;
    }

    // Key/Value table rows (basic info)
    if (isKV(t)) {
      const idx = t.indexOf('：');
      const k = t.slice(0, idx).trim();
      const v = t.slice(idx + 1).trim();
      tableRows.push({ k, v });
      continue;
    }

    // Tool table header lines: "工具分类\t具体功能"
    if (t.includes('\t') && t.split('\t').length >= 2) {
      flushTable();
      flushList();
      const [a, b] = t.split('\t');
      blocks.push(
        `<div class="doc-table doc-table--two">
          <div class="doc-row doc-row--header">
            <div class="doc-k">${escapeHtml(a.trim())}</div>
            <div class="doc-v">${escapeHtml(b.trim())}</div>
          </div>
        </div>`,
      );
      continue;
    }

    if (isBullet(t) || isNumbered(t)) {
      flushTable();
      listItems.push(t.replace(/^(✅|\-|\d+\.)\s+/, ''));
      continue;
    }

    if (isQA(t)) {
      flushTable();
      flushList();
      blocks.push(`<p class="result-text"><strong>${escapeHtml(t.slice(0, 2))}</strong>${escapeHtml(t.slice(2))}</p>`);
      continue;
    }

    // Quote-like examples: wrap in code style when line looks like a quoted utterance
    if (/^".*"$/.test(t) || /^“.*”$/.test(t)) {
      flushTable();
      flushList();
      blocks.push(`<div class="step-code-block">${escapeHtml(t.replace(/^["“]|["”]$/g, ''))}</div>`);
      continue;
    }

    flushTable();
    flushList();
    blocks.push(`<p class="result-text">${escapeHtml(t)}</p>`);
  }

  flushTable();
  flushList();
  return blocks;
}

function renderDocToResultHtml(docText) {
  return renderDocToResultBlocks(docText).join('\n');
}

let quickStartStreamToken = 0;

function getStreamDelayForBlock(html) {
  const t = String(html || '').trim();
  if (!t) return 0;
  if (t.startsWith('<div class="result-divider"')) return 30;
  if (t.startsWith('<div class="doc-hero"')) return 90;
  if (t.startsWith('<p class="result-title"')) return 70;
  if (t.startsWith('<div class="doc-table"')) return 80;
  if (t.startsWith('<div class="result-list"')) return 70;
  if (t.startsWith('<div class="step-code-block"')) return 60;
  return 55; // paragraphs
}

async function streamAppendBlocks(container, blocks, token) {
  container.innerHTML = '';

  for (const block of blocks) {
    if (token !== quickStartStreamToken) return; // cancelled
    const html = String(block || '').trim();
    if (!html) continue;

    const temp = document.createElement('div');
    temp.innerHTML = html;
    while (temp.firstChild) {
      container.appendChild(temp.firstChild);
    }

    const scroll = document.getElementById('main-stage-scroll');
    if (scroll) scroll.scrollTop = scroll.scrollHeight;

    const delay = getStreamDelayForBlock(html);
    if (delay) {
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

async function showQuickStartDocInConversation() {
  if (!conversationStarted) conversationStarted = true;
  showConversation();
  conversationThread.innerHTML = '';

  // Preserve the query bubble per requirement
  appendMessage(createUserBubble('给一份你的简历和详细的使用说明'));

  const card = document.createElement('div');
  card.className = 'result-section';
  card.style.opacity = '1';
  card.innerHTML = `<p class="result-text">加载中...</p>`;
  appendMessage(card);

  const text = await loadQuickStartDoc();
  const token = ++quickStartStreamToken;
  const blocks = renderDocToResultBlocks(text);
  await streamAppendBlocks(card, blocks, token);
}

function createPersonalizationIntroBubble() {
  const section = document.createElement('div');
  section.className = 'result-section history-ai-bubble personalization-intro-section';
  section.innerHTML = `
    <p class="result-text">你好，我是你的专属虾管家。<br>我不只是问答助手，还是你的干活助手。用得越多，我给出的内容就越贴合你。<br>有三种方式让我了解你，你更倾向哪种？</p>
    <div class="personalization-options" role="list">
      <button class="personalization-option-card" type="button" data-choice="history">
        <span class="personalization-option-title">从历史信息中学习</span>
        <span class="personalization-option-desc">读取历史对话、知识库文档和笔记。</span>
      </button>
      <button class="personalization-option-card" type="button" data-choice="upload">
        <span class="personalization-option-title">从上传文档中学习</span>
        <span class="personalization-option-desc">上传已有文档，我来分析提炼。</span>
      </button>
      <button class="personalization-option-card" type="button" data-choice="manual">
        <span class="personalization-option-title">手动告诉我</span>
        <span class="personalization-option-desc">直接描述你的偏好和习惯。</span>
      </button>
    </div>
  `;

  section.querySelector('[data-choice="history"]')?.addEventListener('click', () => {
    startHistoryPersonalizationLearning(section);
  });

  return section;
}

function startPersonalizationFlow() {
  conversationStarted = true;
  personalizationFlowState = 'awaiting-choice';
  currentPhase = 'done';
  showConversation();
  conversationThread.innerHTML = '';
  appendMessage(createUserBubble('我想让你更了解我'));
  appendMessage(createPersonalizationIntroBubble());
}

function startHistoryPersonalizationLearning(optionSection) {
  if (personalizationFlowState !== 'awaiting-choice') return;
  personalizationFlowState = 'learning';

  optionSection?.querySelectorAll('.personalization-option-card').forEach(card => {
    card.classList.add('is-disabled');
  });

  appendMessage(createUserBubble('从历史信息中学习'));
  setTimeout(() => {
    appendMessage(createAiMessageBubble({ text: '稍等，我在学习...' }));
  }, 260);

  setTimeout(() => {
    personalizationFlowState = 'awaiting-feedback';
    appendMessage(createAiMessageBubble({
      text: `✨ 学完了！我从你的知识库和天禧历史对话记录中了解到：\n👤 你是谁\nAI产品经理\n✍️ 你的表达风格\n简洁直接，少用修饰词；句子短，节奏快\n🧠 你的思维结构\n结论先行，再用列表展开支撑逻辑\n📐 你的格式偏好\n多用列表和分段，少用长段落；喜欢表格做对比\n🚫 你不喜欢\n套话、冗余总结、"综上所述"类填充词\n\n有什么我没学到的，或者学偏了的?`,
    }));
  }, 2600);
}

function bindRecommendationOptionCards(section) {
  section.querySelectorAll('[data-auto-query]').forEach(card => {
    card.addEventListener('click', () => {
      const query = card.getAttribute('data-auto-query') || '';
      const reply = card.getAttribute('data-auto-reply') || '';
      if (!query || !reply) return;
      appendMessage(createUserBubble(query));
      setTimeout(() => {
        appendMessage(createAiMessageBubble({ text: reply }));
      }, 360);
    });
  });
}

function createSkillRecommendationBubble() {
  const section = document.createElement('div');
  section.className = 'result-section history-ai-bubble';
  const leadText = `- 📌 工作领域：最近在密集写 PRD 和竞品分析报告
- 📝 高频场景：每周 5+ 场会议纪要，需要快速整理行动项和决策点
- ✈️ 个人兴趣：收藏了 3 篇日本旅行攻略，计划在年假出行
- 📚 学习习惯：经常在读书笔记里记录"这个方法可以用到工作中"
基于这些观察，我为你精选了 5 个最匹配的 SKILL：`;
  const tailText = `这 5 个技能覆盖了你工作提效→兴趣落地→学习转化→写作优化的全场景，而且都是基于你最近的实际需求选的。
想先安装哪个？或者要我详细介绍某个技能的使用方式？😊`;
  section.innerHTML = `
    <p class="result-text" data-rich-lead></p>
    <div class="recommendation-table recommendation-table--skills" role="table" aria-label="技能推荐" data-rich-table style="display:none;">
      <div class="recommendation-table-cell recommendation-table-head" role="columnheader">图标 + 名称</div>
      <div class="recommendation-table-cell recommendation-table-head" role="columnheader">技能名</div>
      <div class="recommendation-table-cell recommendation-table-head" role="columnheader">推荐原因</div>
      <div class="recommendation-table-cell recommendation-table-name">🤝 文档联合创作</div>
      <div class="recommendation-table-cell"><span class="recommendation-skill-code">doc-coauthoring-anthropic</span></div>
      <div class="recommendation-table-cell">你正在密集写 PRD 和报告，这个技能让我变成你的写作搭档——你写一段、我补一段，随时提建议、改措辞，像真人一样共同打磨文档</div>
      <div class="recommendation-table-cell recommendation-table-name">🔍 深度研究助手</div>
      <div class="recommendation-table-cell"><span class="recommendation-skill-code">deep-research-pro</span></div>
      <div class="recommendation-table-cell">竞品分析需要深度调研，这个技能自动执行多轮搜索和交叉验证，生成带引用的报告，节省 80% 调研时间</div>
      <div class="recommendation-table-cell recommendation-table-name">📝 智能摘要专家</div>
      <div class="recommendation-table-cell"><span class="recommendation-skill-code">summarize</span></div>
      <div class="recommendation-table-cell">每周阅读 10+ 篇长文档，这个技能快速生成结构化摘要，提取核心结论，帮你 30 秒抓住重点</div>
      <div class="recommendation-table-cell recommendation-table-name">💡 头脑风暴伙伴</div>
      <div class="recommendation-table-cell"><span class="recommendation-skill-code">brainstorming</span></div>
      <div class="recommendation-table-cell">你常需要更多创意角度，这个技能引导结构化头脑风暴，生成多元观点和挑战性假设，突破思维定式</div>
      <div class="recommendation-table-cell recommendation-table-name">✈️ 旅行规划管家</div>
      <div class="recommendation-table-cell"><span class="recommendation-skill-code">travel-manager</span></div>
      <div class="recommendation-table-cell">你收藏了日本攻略计划出行，这个技能整合多源攻略、对比航班酒店，生成逐日行程单并动态调整</div>
    </div>
    <p class="result-text" data-rich-tail style="display:none;"></p>
    <div class="personalization-options recommendation-option-cards" data-rich-cards style="display:none;">
      <button class="personalization-option-card" type="button" data-auto-query="安装文档联合创作技能" data-auto-reply="已为你安装「文档联合创作」。下次写 PRD 或报告时，直接说“帮我一起打磨这份文档”，我会按共同写作模式接手。">
        <span class="personalization-option-title">🤝 文档联合创作</span>
        <span class="personalization-option-desc">PRD、报告、方案一起打磨。</span>
      </button>
      <button class="personalization-option-card" type="button" data-auto-query="详细介绍深度研究助手" data-auto-reply="「深度研究助手」适合竞品分析和专题调研。我会先拆问题，再多轮搜索和交叉验证，最后给你一份带结构、结论和来源的研究摘要。">
        <span class="personalization-option-title">🔍 深度研究助手</span>
        <span class="personalization-option-desc">竞品和行业问题深挖。</span>
      </button>
      <button class="personalization-option-card" type="button" data-auto-query="安装智能摘要专家" data-auto-reply="已为你准备「智能摘要专家」。把会议纪要、长文档或资料丢给我，我会先提炼结论、行动项和风险点，再按你的格式输出。">
        <span class="personalization-option-title">📝 智能摘要专家</span>
        <span class="personalization-option-desc">长文档快速抓重点。</span>
      </button>
      <button class="personalization-option-card" type="button" data-auto-query="用头脑风暴伙伴帮我想方案" data-auto-reply="可以。你给我一个目标或卡点，我会从用户、业务、技术、风险四个角度发散，再帮你收敛成可执行方案。">
        <span class="personalization-option-title">💡 头脑风暴伙伴</span>
        <span class="personalization-option-desc">发散创意，再收敛方案。</span>
      </button>
      <button class="personalization-option-card" type="button" data-auto-query="安装旅行规划管家" data-auto-reply="旅行规划管家已就位。你说目的地、天数和预算，我会把交通、酒店、景点和每日路线排成一份可直接出发的行程。">
        <span class="personalization-option-title">✈️ 旅行规划管家</span>
        <span class="personalization-option-desc">攻略变成可执行行程。</span>
      </button>
    </div>
  `;
  bindRecommendationOptionCards(section);

  requestAnimationFrame(() => {
    const lead = section.querySelector('[data-rich-lead]');
    const table = section.querySelector('[data-rich-table]');
    const tail = section.querySelector('[data-rich-tail]');
    const cards = section.querySelector('[data-rich-cards]');
    startTypewriterParagraph(lead, leadText, { speed: 5 })
      .then(() => {
        table.style.display = '';
        scrollConversationToBottom();
        tail.style.display = '';
        return startTypewriterParagraph(tail, tailText, { speed: 6 });
      })
      .then(() => {
        cards.style.display = '';
        scrollConversationToBottom();
      });
  });

  return section;
}

function startSkillRecommendationFlow() {
  conversationStarted = true;
  personalizationFlowState = 'idle';
  currentPhase = 'done';
  showConversation();
  conversationThread.innerHTML = '';
  appendMessage(createUserBubble('给我推荐一些适合我的 SKILL'));
  setTimeout(() => {
    appendMessage(createSkillRecommendationBubble());
  }, 320);
}

function createSquadRecommendationBubble() {
  const section = document.createElement('div');
  section.className = 'result-section history-ai-bubble';
  const leadText = `分析完成！ 我检测到你正在使用 Moto 大折叠屏手机 📱✨
这款设备拥有超大内屏、原生分屏和悬停模式，基于你的设备优势，为你定制了 3 位专属搭档。它们不仅能干活，还特别会充分使用你设备优势，它们组合在一起能发挥“1+1>2”的效果：
🎯 现在「你的专属折叠先锋队」已就位`;
  const tailText = '这支覆盖你工作→生活→出行的“铁三角”团队，你希望先安装哪一位，还是一键全部部署？';
  section.innerHTML = `
    <p class="result-text" data-rich-lead></p>
    <div class="recommendation-table recommendation-table--squad" role="table" aria-label="专属虾特工队" data-rich-table style="display:none;">
      <div class="recommendation-table-cell recommendation-table-head" role="columnheader">专家</div>
      <div class="recommendation-table-cell recommendation-table-head" role="columnheader">擅长</div>
      <div class="recommendation-table-cell recommendation-table-head" role="columnheader">大屏优势</div>
      <div class="recommendation-table-cell recommendation-table-name">🧮 会议虾</div>
      <div class="recommendation-table-cell">日程管理、会议纪要、跨时区协调</div>
      <div class="recommendation-table-cell">展开屏边开会议边看文档，不用来回切</div>
      <div class="recommendation-table-cell recommendation-table-name">📰 资讯虾</div>
      <div class="recommendation-table-cell">热点追踪、行业动态、深度解读</div>
      <div class="recommendation-table-cell">大视野刷新闻，一眼看全要点</div>
      <div class="recommendation-table-cell recommendation-table-name">✈️ 旅行虾</div>
      <div class="recommendation-table-cell">行程规划、景点推荐、出行攻略</div>
      <div class="recommendation-table-cell">折叠便携，路上掏出来查路线刚好</div>
    </div>
    <p class="result-text" data-rich-tail style="display:none;"></p>
    <div class="personalization-options recommendation-option-cards" data-rich-cards style="display:none;">
      <button class="personalization-option-card" type="button" data-auto-query="安装会议虾" data-auto-reply="会议虾已就位。之后你可以边开会边让我同步整理纪要、行动项和待确认问题，折叠屏上文档和会议可以并排看。">
        <span class="personalization-option-title">🧮 会议虾</span>
        <span class="personalization-option-desc">会议纪要、日程和协作。</span>
      </button>
      <button class="personalization-option-card" type="button" data-auto-query="安装资讯虾" data-auto-reply="资讯虾已就位。我会帮你追踪行业热点、产品动态和重要新闻，并优先输出一眼能扫完的要点版。">
        <span class="personalization-option-title">📰 资讯虾</span>
        <span class="personalization-option-desc">热点追踪和深度解读。</span>
      </button>
      <button class="personalization-option-card" type="button" data-auto-query="安装旅行虾" data-auto-reply="旅行虾已就位。你告诉我目的地和时间，我会把路线、交通、酒店和备用方案安排好，路上用折叠屏查看刚好。">
        <span class="personalization-option-title">✈️ 旅行虾</span>
        <span class="personalization-option-desc">路线、攻略和出行安排。</span>
      </button>
    </div>
  `;
  bindRecommendationOptionCards(section);

  requestAnimationFrame(() => {
    const lead = section.querySelector('[data-rich-lead]');
    const table = section.querySelector('[data-rich-table]');
    const tail = section.querySelector('[data-rich-tail]');
    const cards = section.querySelector('[data-rich-cards]');
    startTypewriterParagraph(lead, leadText, { speed: 5 })
      .then(() => {
        table.style.display = '';
        scrollConversationToBottom();
        tail.style.display = '';
        return startTypewriterParagraph(tail, tailText, { speed: 6 });
      })
      .then(() => {
        cards.style.display = '';
        scrollConversationToBottom();
      });
  });

  return section;
}

function startSquadFlow() {
  conversationStarted = true;
  personalizationFlowState = 'idle';
  currentPhase = 'done';
  showConversation();
  conversationThread.innerHTML = '';
  appendMessage(createUserBubble('帮我组建一支专属的虾特工队'));
  setTimeout(() => {
    appendMessage(createAiMessageBubble({ text: '收到！正在为你组建专属团队... 🔄' }));
  }, 260);
  setTimeout(() => {
    appendMessage(createSquadRecommendationBubble());
  }, 1260);
}

// Quick card click — quick start is a pure-text reply
document.querySelectorAll('.quick-card').forEach((card, i) => {
  const title = (card.querySelector('strong')?.textContent || '').trim();
  const demos = ['帮我定个提醒任务', '点名龙虾帮忙', '快速入门', '设置一个定时任务'];

  card.addEventListener('click', () => {
    if (title === '专属定制') {
      startPersonalizationFlow();
      return;
    }
    if (title === '技能推荐') {
      startSkillRecommendationFlow();
      return;
    }
    if (title === '一键成军') {
      startSquadFlow();
      return;
    }
    // Strategy: except "定时任务", all cards share the quick-start reply flow
    if (title && title !== '定时任务') {
      showQuickStartDocInConversation();
      return;
    }
    startConversation(demos[i] || '帮我定个提醒任务');
  });
});


// ===== PPT 执行链路 =====

function startPPTExecution(text, answers) {
  currentPhase = 'executing';

  const audience = (answers && (answers.audience || answers[1])) || '管理层';
  const pages = (answers && (answers.pages || answers[2])) || '10-15页';
  const style = (answers && (answers.style || answers[3])) || '商务简洁';
  const includeCharts =
    answers && typeof answers.includeCharts === 'boolean' ? answers.includeCharts : true;

  const summaryText = [
    '好的！我来帮你制作《产品汇报》PPT',
    '',
    '已确认信息：',
    `• 受众：${audience}`,
    `• 页数：${pages}`,
    `• 风格：${style}`,
    `• 图表：${includeCharts ? '需要图表' : '不需要图表'}`,
    '',
    '正在调用 PPT 生成技能，开始执行...',
  ].join('\n');

  const typingBubble = createTypewriterAiMessageBubble(summaryText, { speed: 9 });
  appendMessage(typingBubble.bubble);

  typingBubble.done.then(() => {
    setTimeout(() => {
    const execSection = createExecutionSection();
    appendMessage(execSection);
    animatePPTExecution(execSection);
    }, 220);
  });
}

function animatePPTExecution(section) {
  const timeline = section.querySelector('#exec-timeline');
  const content = section.querySelector('#timeline-content');
  const mainScroll = document.getElementById('main-stage-scroll');

  // Show timeline
  setTimeout(() => { timeline.style.opacity = '1'; }, 300);

  const steps = [
    {
      type: 'read',
      activeText: '正在查看 PPT_SKILL.md',
      doneText: '查看了 PPT_SKILL.md',
      detail: {
        params: '{\n  "file": "PPT_SKILL.md",\n  "action": "read"\n}',
        result: '{\n  "content": "# PPT 生成技能\\n支持大纲生成、幻灯片创建、主题配色、图表插入。\\n输入：主题、受众、页数\\n输出：.pptx 文件"\n}'
      },
      appear: 400, expand: 600, collapse: 1800, done: 2000
    },
    {
      type: 'read',
      activeText: '正在查看 产品数据.xlsx',
      doneText: '查看了 产品数据.xlsx',
      detail: {
        params: '{\n  "file": "产品数据.xlsx",\n  "action": "read",\n  "sheets": ["月活数据", "功能使用率", "NPS"]\n}',
        result: '{\n  "rows": 248,\n  "summary": "月活 MAU 12.4万，环比+18%；核心功能使用率 76%；NPS 62"\n}'
      },
      appear: 2200, expand: 2400, collapse: 3400, done: 3600
    },
    {
      type: 'tool',
      activeText: '正在执行 generate_outline',
      doneText: '执行了 generate_outline',
      detail: {
        params: '{\n  "topic": "产品汇报",\n  "audience": "管理层",\n  "pages": "10-15页",\n  "style": "商务简洁"\n}',
        result: '{\n  "outline": [\n    "产品概述与核心价值",\n    "市场分析与竞品对比",\n    "核心功能演示",\n    "数据表现与增长趋势",\n    "下一步规划"\n  ]\n}'
      },
      appear: 3800, expand: 4000, collapse: 5200, done: 5400
    },
    {
      type: 'tool',
      activeText: '正在执行 create_slides',
      doneText: '执行了 create_slides',
      detail: {
        params: '{\n  "outline_id": "outline_20260422",\n  "theme": "深蓝商务",\n  "data_source": "产品数据.xlsx",\n  "include_charts": true\n}',
        result: '{\n  "slides_created": 12,\n  "charts_inserted": 4,\n  "status": "success"\n}'
      },
      appear: 5600, expand: 5800, collapse: 7000, done: 7200
    },
    {
      type: 'tool',
      activeText: '正在执行 export_pptx',
      doneText: '执行了 export_pptx',
      detail: {
        params: '{\n  "slides_id": "slides_20260422",\n  "format": "pptx",\n  "filename": "产品汇报.pptx"\n}',
        result: '{\n  "file": "产品汇报.pptx",\n  "size": "2.4 MB",\n  "url": "/exports/产品汇报.pptx"\n}'
      },
      appear: 7400, expand: 7600, collapse: 8400, done: 8600
    }
  ];

  steps.forEach((step, idx) => {
    // 1. Step row appears (active state)
    setTimeout(() => {
      const wrap = document.createElement('div');
      wrap.className = 'step-item-wrap';
      wrap.id = 'step-wrap-' + idx;
      wrap.dataset.stepParams = step.detail.params;
      wrap.dataset.stepResult = step.detail.result;

      const item = buildExecutionStepItem(step.type, step.activeText, { isActive: true });
      item.style.opacity = '0';
      item.style.transform = 'translateY(6px)';
      item.style.transition = 'opacity 250ms ease, transform 250ms ease';

      wrap.appendChild(item);
      bindStepDetailToggle(wrap, mainScroll);
      content.appendChild(wrap);
      refreshExecutionTimeline(content);

      requestAnimationFrame(() => requestAnimationFrame(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
        ensureStepDetailVisible(wrap, mainScroll);
      }));
    }, step.appear);

    // 2. Step text updates to done state
    setTimeout(() => {
      const wrap = document.getElementById('step-wrap-' + idx);
      if (!wrap) return;
      const item = wrap.querySelector('.step-item');
      if (item) {
        item.classList.remove('is-active');
        item.querySelector('.step-text').textContent = step.doneText;
      }
    }, step.done);
  });

  // 5. All done: update header, collapse timeline, show result
  const totalDone = 9000;
  setTimeout(() => {
    const header = section.querySelector('.execution-header');
    const tl = section.querySelector('#exec-timeline');

    header.classList.add('is-complete');
    header.innerHTML = `
      ${EXEC_STATUS_ICON_SVG}
      <span class="complete-text">已完成执行 (8秒)</span>
      ${getToggleArrowMarkup(' is-collapsed')}
    `;

    tl.style.maxHeight = tl.scrollHeight + 'px';
    setTimeout(() => {
      tl.style.maxHeight = '0';
      tl.style.opacity = '0';
      tl.style.overflow = 'hidden';
      tl.style.transition = 'max-height 300ms ease, opacity 300ms ease';
    }, 100);

    const arrow = header.querySelector('.toggle-arrow');
    let isExpanded = false;
    arrow.addEventListener('click', () => {
      isExpanded = !isExpanded;
      if (isExpanded) {
        tl.style.maxHeight = tl.scrollHeight + 'px';
        tl.style.opacity = '1';
        arrow.classList.remove('is-collapsed');
      } else {
        tl.style.maxHeight = '0';
        tl.style.opacity = '0';
        arrow.classList.add('is-collapsed');
      }
    });

    setTimeout(() => { showPPTResult(); }, 400);
  }, totalDone);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showPPTResult() {
  const result = document.createElement('div');
  result.className = 'result-section result-after-execution';
  result.style.opacity = '0';
  result.style.transition = 'opacity 400ms ease';

  result.innerHTML = `
    <p class="result-text">🎯 搞定！已为你生成《产品汇报》PPT，共 12 页</p>

    <div class="result-list">
      <div class="result-item">
        <div class="result-bullet"><div class="result-bullet-dot"></div></div>
        <span class="result-item-text">第一章：产品概述与核心价值</span>
      </div>
      <div class="result-item">
        <div class="result-bullet"><div class="result-bullet-dot"></div></div>
        <span class="result-item-text">第二章：市场分析与竞品对比</span>
      </div>
      <div class="result-item">
        <div class="result-bullet"><div class="result-bullet-dot"></div></div>
        <span class="result-item-text">第三章：核心功能演示</span>
      </div>
      <div class="result-item">
        <div class="result-bullet"><div class="result-bullet-dot"></div></div>
        <span class="result-item-text">第四章：数据表现与增长趋势（含 4 张图表）</span>
      </div>
      <div class="result-item">
        <div class="result-bullet"><div class="result-bullet-dot"></div></div>
        <span class="result-item-text">第五章：下一步规划</span>
      </div>
    </div>

    <div class="result-divider"></div>

    <p class="result-text">你可以直接下载 .pptx 文件，或在线预览后进行二次编辑。</p>

    <div class="result-attachments">
      <div class="attachment-card ppt-attachment-card">
        <span class="attachment-icon ppt-attachment-icon">${PPT_FILE_ICON_SVG}</span>
        <div class="attachment-info ppt-attachment-info">
          <span class="attachment-name">产品汇报.pptx</span>
          <span class="attachment-meta">PPTX ・ 2.4 MB</span>
        </div>
        <div class="attachment-download ppt-attachment-download">
          ${DL_ICON_SVG}
        </div>
      </div>
    </div>
  `;

  appendMessage(result);

  result.querySelectorAll('.attachment-card').forEach(card => {
    card.addEventListener('click', () => {
      openPreview('产品汇报.pptx', './figma-assets/bdd4dc24-5b5f-4d23-93d7-feff0d68bbc7.png');
    });
  });

  requestAnimationFrame(() => requestAnimationFrame(() => {
    result.style.opacity = '1';
  }));

  currentPhase = 'done';
}

// ===== PPT 对话式澄清流程 =====

// 状态：等待用户回答 PPT 澄清问题
function startPPTClarification(text) {
  if (!conversationStarted) {
    conversationStarted = true;
    showConversation();
  }
  currentPhase = 'clarifying';
  pptClarifyPending = true;
  pptOriginalText = text;
  pptClarifyFormData = {};

  const userMsg = createUserBubble(text);
  appendMessage(userMsg);

  // AI asks clarifying questions with interactive form
  setTimeout(() => {
    const typingBubble = createTypewriterAiMessageBubble(
      '好的，帮你做产品汇报 PPT！\n\n我先确认几项关键信息，方便我按你的目标生成可直接汇报的版本。',
      { speed: 10 },
    );
    appendMessage(typingBubble.bubble);
    typingBubble.done.then(() => {
      const formCard = createPPTClarificationCard();
      appendMessage(formCard, { scroll: 'start', focusOptions: { topGap: 12 } });
    });
  }, 600);
}

function parsePPTFallbackAnswer(text) {
  const normalized = String(text || '');
  return {
    audience: normalized || '团队内部',
    pages: '10-15页',
    style: /科技|tech/i.test(normalized) ? '科技感' : '商务简洁',
    includeCharts: true,
  };
}

function createPPTClarificationCard() {
  const card = document.createElement('div');
  card.className = 'clarification-card ppt-clarify-card';
  card.id = 'ppt-clarify-card';
  card.innerHTML = `
    <p class="clarification-intro">请确认下面信息（可点选或输入）：</p>

    <div class="question-block">
      <div class="question-header">
        <div class="question-number">1</div>
        <span class="question-text">这份 PPT 主要给谁看？</span>
      </div>
      <div class="options-row">
        <div class="option-pill" data-field="audience" data-value="管理层">管理层</div>
        <div class="option-pill" data-field="audience" data-value="客户提案">客户提案</div>
        <div class="option-pill" data-field="audience" data-value="团队内部">团队内部</div>
        <div class="option-pill" data-field="audience" data-value="投资人汇报">投资人汇报</div>
      </div>
      <input class="text-input-pill" data-field-input="audience" placeholder="或输入其他受众，例如：渠道伙伴" />
    </div>

    <div class="question-block">
      <div class="question-header">
        <div class="question-number">2</div>
        <span class="question-text">预计页数范围？</span>
      </div>
      <div class="options-row">
        <div class="option-pill" data-field="pages" data-value="8-10页">8-10页</div>
        <div class="option-pill" data-field="pages" data-value="10-15页">10-15页</div>
        <div class="option-pill" data-field="pages" data-value="15-20页">15-20页</div>
      </div>
      <input class="text-input-pill" data-field-input="pages" placeholder="或输入自定义页数，例如：12页" />
    </div>

    <div class="question-block">
      <div class="question-header">
        <div class="question-number">3</div>
        <span class="question-text">希望什么风格？</span>
      </div>
      <div class="options-row">
        <div class="option-pill" data-field="style" data-value="商务简洁">商务简洁</div>
        <div class="option-pill" data-field="style" data-value="科技感">科技感</div>
        <div class="option-pill" data-field="style" data-value="数据分析型">数据分析型</div>
      </div>
      <input class="text-input-pill" data-field-input="style" placeholder="或输入自定义风格，例如：品牌发布会风格" />
    </div>

    <div class="question-block">
      <div class="question-header">
        <div class="question-number">4</div>
        <span class="question-text">是否需要自动生成图表？</span>
      </div>
      <div class="options-row">
        <div class="option-pill" data-field="includeCharts" data-value="true">需要图表</div>
        <div class="option-pill" data-field="includeCharts" data-value="false">不需要图表</div>
      </div>
    </div>

    <div class="clarification-divider"></div>
    <div class="clarification-actions">
      <button class="action-button" id="ppt-clarify-submit" disabled>
        <img src="./ppt-submit-icon-muted.svg" alt="" id="ppt-clarify-submit-icon" />
        发送
      </button>
    </div>
  `;

  card.querySelectorAll('.option-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const field = pill.dataset.field;
      const value = pill.dataset.value;
      card
        .querySelectorAll(`.option-pill[data-field="${field}"]`)
        .forEach((item) => item.classList.remove('selected'));
      pill.classList.add('selected');

      if (field === 'includeCharts') {
        pptClarifyFormData[field] = value === 'true';
      } else {
        pptClarifyFormData[field] = value;
        const input = card.querySelector(`[data-field-input="${field}"]`);
        if (input) input.value = '';
      }
      updatePPTClarifySubmitState(card);
    });
  });

  card.querySelectorAll('.text-input-pill[data-field-input]').forEach((input) => {
    input.addEventListener('input', () => {
      const field = input.dataset.fieldInput;
      const value = input.value.trim();
      if (value) {
        pptClarifyFormData[field] = value;
        card
          .querySelectorAll(`.option-pill[data-field="${field}"]`)
          .forEach((item) => item.classList.remove('selected'));
      } else {
        delete pptClarifyFormData[field];
      }
      updatePPTClarifySubmitState(card);
    });
  });

  card.querySelector('#ppt-clarify-submit').addEventListener('click', () => {
    submitPPTClarification(card);
  });

  return card;
}

function updatePPTClarifySubmitState(card) {
  const submitBtn = card.querySelector('#ppt-clarify-submit');
  const submitIcon = card.querySelector('#ppt-clarify-submit-icon');
  const canSubmit = Boolean(pptClarifyFormData.audience && pptClarifyFormData.pages && pptClarifyFormData.style);

  submitBtn.disabled = !canSubmit;
  submitBtn.classList.toggle('primary', canSubmit);
  submitIcon.src = canSubmit ? './ppt-submit-icon.svg' : './ppt-submit-icon-muted.svg';
}

function submitPPTClarification(card) {
  const payload = {
    audience: pptClarifyFormData.audience || '管理层',
    pages: pptClarifyFormData.pages || '10-15页',
    style: pptClarifyFormData.style || '商务简洁',
    includeCharts:
      typeof pptClarifyFormData.includeCharts === 'boolean' ? pptClarifyFormData.includeCharts : true,
  };

  card.querySelectorAll('button, .option-pill, .text-input-pill').forEach((el) => {
    el.style.pointerEvents = 'none';
    el.style.opacity = '0.55';
  });

  pptClarifyPending = false;
  const summaryText = `${payload.audience}，${payload.pages}，${payload.style}，${payload.includeCharts ? '需要图表' : '不需要图表'}`;
  appendMessage(createUserBubble(summaryText));

  setTimeout(() => {
    const typingBubble = createTypewriterAiMessageBubble(
      '好的，信息已确认。我现在开始帮你生成 PPT，并调用 PPT 生成技能执行。',
      { speed: 10 },
    );
    appendMessage(typingBubble.bubble);
    typingBubble.done.then(() => {
      setTimeout(() => startPPTExecution(pptOriginalText, payload), 240);
    });
  }, 300);
}

function ensureStepDetailVisible(stepWrap, scrollContainer) {
  if (!stepWrap || !scrollContainer) return;
  const wrapRect = stepWrap.getBoundingClientRect();
  const scrollRect = scrollContainer.getBoundingClientRect();
  const visibleBottom = scrollRect.bottom - 118;
  if (wrapRect.bottom > visibleBottom) {
    const delta = wrapRect.bottom - visibleBottom + 20;
    scrollContainer.scrollBy({ top: delta, behavior: 'smooth' });
  }
}

// ── 天禧 Claw 开箱流程 ────────────────────────────────

const clawFlowEl = document.getElementById('claw-flow');
const clawWindowFrame = document.querySelector('.window-frame');
const clawLoadingBar = document.getElementById('claw-loading-bar');
let clawLoadingTimer = null;
let clawLoadingFrame = null;
let clawExpertsAdded = false;
let clawIntroAnimationStarted = false;
let clawAddedSequence = 1;

const CLAW_AVATAR_DIR = './custom-assets/claw-flow/agent-avatars/';
const CLAW_AGENT_AVATAR_FILES = Array.from({ length: 24 }, (_, index) => {
  const avatarNumber = String(index + 1).padStart(2, '0');
  return `${CLAW_AVATAR_DIR}avatar-${avatarNumber}.png`;
});
const CLAW_AGENT_AVATARS = {
  '课程预习导师': CLAW_AGENT_AVATAR_FILES[0],
  '学习规划师': CLAW_AGENT_AVATAR_FILES[0],
  '论文解读专家': CLAW_AGENT_AVATAR_FILES[1],
  '论文速读导师': CLAW_AGENT_AVATAR_FILES[1],
  'AI论文速读导师': CLAW_AGENT_AVATAR_FILES[1],
  '笔记整理大师': CLAW_AGENT_AVATAR_FILES[2],
  '资料整理大师': CLAW_AGENT_AVATAR_FILES[2],
  '课程辅导专家': CLAW_AGENT_AVATAR_FILES[6],
  '考前冲刺教练': CLAW_AGENT_AVATAR_FILES[3],
  '考前冲刺哥': CLAW_AGENT_AVATAR_FILES[3],
  '外语一对一私教': CLAW_AGENT_AVATAR_FILES[4],
  '论文猎手': CLAW_AGENT_AVATAR_FILES[5],
  '预习官': CLAW_AGENT_AVATAR_FILES[6],
  '目标拆解教练': CLAW_AGENT_AVATAR_FILES[7],
  '深夜解压大师': CLAW_AGENT_AVATAR_FILES[8],
  '留学规划顾问': CLAW_AGENT_AVATAR_FILES[9],
  '高考志愿填报顾问': CLAW_AGENT_AVATAR_FILES[10],
  '跨境电商情报探长': CLAW_AGENT_AVATAR_FILES[11],
  '广告创意顾问': CLAW_AGENT_AVATAR_FILES[12],
  'TikTok策略师': CLAW_AGENT_AVATAR_FILES[12],
  '库存预测专家': CLAW_AGENT_AVATAR_FILES[13],
  '广告投放优化师': CLAW_AGENT_AVATAR_FILES[14],
  'PPC竞价策略师': CLAW_AGENT_AVATAR_FILES[14],
  '用户反馈分析师': CLAW_AGENT_AVATAR_FILES[15],
  '产品经理': CLAW_AGENT_AVATAR_FILES[15],
  'UI设计师': CLAW_AGENT_AVATAR_FILES[16],
  '前端开发工程师': CLAW_AGENT_AVATAR_FILES[17],
  '前端开发者': CLAW_AGENT_AVATAR_FILES[17],
  '后端架构师': CLAW_AGENT_AVATAR_FILES[18],
  'A股盯盘师': CLAW_AGENT_AVATAR_FILES[19],
  'A股行情追踪专家': CLAW_AGENT_AVATAR_FILES[19],
  '宏观经济分析师': CLAW_AGENT_AVATAR_FILES[20],
  '宏观经济专家': CLAW_AGENT_AVATAR_FILES[20],
  '基金配置顾问': CLAW_AGENT_AVATAR_FILES[21],
  '基金掘金师': CLAW_AGENT_AVATAR_FILES[21],
  '股票诊断师': CLAW_AGENT_AVATAR_FILES[22],
  '个股诊断专家': CLAW_AGENT_AVATAR_FILES[22],
  '自媒体热点猎手': CLAW_AGENT_AVATAR_FILES[23],
  '抖音运营专家': CLAW_AGENT_AVATAR_FILES[4],
  '抖音运营策略师': CLAW_AGENT_AVATAR_FILES[4],
  '小红书爆款顾问': CLAW_AGENT_AVATAR_FILES[10],
  '小红书爆款操盘手': CLAW_AGENT_AVATAR_FILES[10],
  '公众号主笔': CLAW_AGENT_AVATAR_FILES[16],
  '公众号内容助手': CLAW_AGENT_AVATAR_FILES[16],
  '高级项目经理': CLAW_AGENT_AVATAR_FILES[15],
  '高级数据分析师': CLAW_AGENT_AVATAR_FILES[20],
  '金融风控分析师': CLAW_AGENT_AVATAR_FILES[14],
  '实验数据分析师': CLAW_AGENT_AVATAR_FILES[20],
  '论文润色专家': CLAW_AGENT_AVATAR_FILES[21],
  '论文评审顾问': CLAW_AGENT_AVATAR_FILES[22],
};

function clawAvatar(name, fallbackIndex = 0) {
  if (CLAW_AGENT_AVATARS[name]) return CLAW_AGENT_AVATARS[name];
  const text = String(name || '');
  const hash = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return CLAW_AGENT_AVATAR_FILES[(hash || fallbackIndex) % CLAW_AGENT_AVATAR_FILES.length];
}

const CLAW_XIAOTIAN_HOME = {
  id: 'xiaotian',
  name: '小天',
  desc: '开箱即用，越用越强，7x24不断线，全设备可用的超级助理',
  icon: './custom-assets/claw-flow/xiaotian-avatar.png',
};
let activeClawHomeAgent = CLAW_XIAOTIAN_HOME;

const CLAW_EXPERTS = [
  {
    id: 'planner',
    name: '课程预习导师',
    desc: '课前梳理课程重点，提前建立知识框架',
    icon: clawAvatar('课程预习导师'),
  },
  {
    id: 'paper-reader',
    name: '笔记整理大师',
    desc: '把课堂笔记与资料整理成清晰、高密度的复习材料',
    icon: clawAvatar('笔记整理大师'),
  },
  {
    id: 'material-master',
    name: '课程辅导专家',
    desc: '围绕知识难点深入讲解，补齐薄弱环节',
    icon: clawAvatar('课程辅导专家'),
  },
  {
    id: 'exam-sprint',
    name: '考前冲刺教练',
    desc: '整合考点、梳理高频题型、生成冲刺复习计划',
    icon: clawAvatar('考前冲刺教练'),
  },
  {
    id: 'language-tutor',
    name: '论文解读专家',
    desc: '快速提炼论文核心论点与结构，省去逐字精读的时间',
    icon: clawAvatar('论文解读专家'),
  },
  {
    id: 'paper-hunter',
    name: '实验数据分析师',
    desc: '整理实验数据，输出分析结论与可视化建议',
    icon: clawAvatar('实验数据分析师'),
  },
  {
    id: 'preview-officer',
    name: '论文润色专家',
    desc: '优化论文表达、结构与逻辑，让稿件更顺畅专业',
    icon: clawAvatar('论文润色专家'),
  },
  {
    id: 'goal-coach',
    name: '论文评审顾问',
    desc: '按评审维度检查论文问题，给出修改建议',
    icon: clawAvatar('论文评审顾问'),
  },
];

const clawSelectedExperts = new Set(CLAW_EXPERTS.slice(0, 4).map(item => item.id));
let clawConfigSection = 'config';
let activeExpertMarketItem = null;
let expertToastTimer = null;
let activeExpertMarketPrimary = '一键组队';
let activeExpertMarketSecondary = '全部';
let activeTaskMenuId = null;
let pendingDeleteTaskId = null;
let selectedSubscriptionPlan = 'gold';

let CLAW_TASK_ITEMS = [
  {
    id: 'stock-watch',
    title: 'A股实时动态监控',
    icon: '↻',
    avatar: clawAvatar('金融风控分析师'),
    enabled: true,
    desc:
      '每15分钟给我推送一下今天A股的实时动态。可以包括大盘异动及原因分析，领涨板块的情况等。可以重点关注科技、半导体、机器人板块。',
    schedule: '每15分钟，上次执行: 今天16:15',
    status: '成功',
  },
  {
    id: 'mail-digest',
    title: '每日邮件总结',
    icon: '↻',
    avatar: clawAvatar('公众号主笔'),
    enabled: true,
    desc:
      '每天18:00的时候，总结下我电脑里今天收到的邮件，主要是识别其中包含的重点信息，那些订阅的广告啊，验证码啊啥的都过滤掉。',
    schedule: '每天18:00',
    status: '',
  },
  {
    id: 'tech-radar',
    title: '科技热点雷达',
    icon: '↻',
    avatar: clawAvatar('自媒体热点猎手'),
    enabled: false,
    desc:
      '每隔2小时，帮我扫一圈科技数码圈的热搜动态，平台只看微博热搜、抖音热榜、B站热门、知乎热榜。',
    schedule: '每2小时，上次执行: 今天15:13',
    status: '成功',
  },
  {
    id: 'mentor-mail',
    title: '给导师发项目进展邮件',
    icon: '✓',
    avatar: clawAvatar('高级项目经理'),
    enabled: true,
    desc:
      '明天（5月8号）早上10点，帮我发一封邮件给我的导师王教授，正文大致是项目进展说明，内容帮我优化得正式一些。',
    schedule: '明天10:00',
    status: '',
  },
];

/** Claw 开箱内「技能广场」列表与详情（首行第三张为设计稿 ai-video-script 完整弹窗） */
const CLAW_SKILL_PLAZA_ITEMS = [
  {
    id: 'plaza-1',
    slug: 'strategy-advisor',
    subtitle: '商业策略分析',
    desc: '基于业务目标与市场环境，提供策略分析、竞争格局判断与增长路径建议，辅导关键决策。',
    tags: ['需求分析', '战略规划', '决策支持'],
    count: '638',
    added: false,
    icon: './custom-assets/claw-flow/skill-market/skill-figma-1.png',
    detail: {
      tags: ['需求分析', '战略规划', '商业分析'],
      longDesc:
        'strategy-advisor：根据业务目标与约束，把模糊问题拆成可验证的策略假设，并给出优先级与下一步行动建议。当你提到增长瓶颈、竞品差异、定位不清等场景时调用。',
      meta: { author: 'Lenovo 技能团队', count: '638', source: '官方', updated: '2026.04.02' },
      safeText: '已通过安全与合规验证，无恶意代码或数据泄露风险。',
      howTo: [
        {
          title: '拆解策略问题',
          desc: '输入业务目标、约束条件和当前卡点，快速拆成可验证的策略假设。',
          copyText: '请帮我把当前业务问题拆成策略假设，并给出验证优先级。',
        },
        {
          title: '判断竞争格局',
          desc: '补充竞品、目标用户和市场环境，输出差异化机会与风险提醒。',
          copyText: '请基于这些竞品信息分析竞争格局，并找出可突破的差异化机会。',
        },
      ],
    },
  },
  {
    id: 'plaza-2',
    slug: 'markdown-new',
    subtitle: '网页转 Markdown 工具',
    desc: '将网页内容一键转换为结构清晰的 Markdown 格式，支持 AI 工作流处理与数据整理。',
    tags: ['内容转换', 'Markdown处理', '数据整理'],
    count: '728',
    added: false,
    icon: './custom-assets/claw-flow/skill-market/skill-figma-2.png',
    detail: {
      tags: ['内容转换', 'Markdown处理', '数据整理'],
      longDesc:
        'markdown-new：把网页内容转换为结构清晰、便于 AI 工作流继续处理的 Markdown 文档。',
      meta: { author: 'Pingo 等', count: '1.2k', source: 'Github', updated: '2026.03.18' },
      safeText: '已通过安全与合规验证，无恶意代码或数据泄露风险。',
      howTo: [
        {
          title: '转换网页内容',
          desc: '粘贴网页链接或正文内容，输出结构清晰、便于继续处理的 Markdown。',
          copyText: '请把这个网页转换为结构清晰的 Markdown，并保留标题层级。',
        },
        {
          title: '整理 AI 素材',
          desc: '把网页中的段落、列表和关键数据整理成适合 AI 工作流引用的文本。',
          copyText: '请提炼网页中的核心信息，并整理成可用于后续分析的 Markdown。',
        },
      ],
    },
  },
  {
    id: 'plaza-3',
    slug: 'ai-video-script',
    subtitle: 'AI视频脚本生成',
    desc: '根据主题与关键词生成完整短视频脚本，覆盖分镜描述、画面提示与配音文案，并支持多平台时长与比例差异。',
    tags: ['视频脚本', '分镜', '配音'],
    count: '156',
    added: true,
    icon: './custom-assets/claw-flow/skill-market/skill-figma-9.png',
    detail: {
      tags: ['视频脚本生成', '分镜策划', 'AI绘画提示词', '配音文案撰写', '多平台短视频适配'],
      longDesc:
        'AI视频脚本生成器。根据用户输入的主题/关键词，分析生成完整的视频脚本，包含分镜描述、画面提示词、配音文案。适用于短视频创作者、AI视频制作者、内容营销人员。触发词:视频脚本、分镜、AI视频、短视频文案、视频策划。',
      meta: { author: 'Pingo 等', count: '3.1k', source: 'Github', updated: '2026.04.10' },
      safeText: '奇安信安全扫描通过，无恶意代码或数据泄露风险。',
      howTo: [
        {
          title: '生成视频脚本',
          desc: '一键生成包含结构、节奏与关键镜头的完整口播与分镜脚本。',
          copyText: '请根据我的产品卖点生成一条 60 秒竖版短视频完整脚本，包含分镜与口播。',
        },
        {
          title: '输出分镜与画面提示',
          desc: '自动拆分镜头，输出每镜画面说明与可用于文生图/视频的提示词。',
          copyText: '把上一版脚本按镜头拆分，并给每镜补充画面提示词（中文+英文关键词）。',
        },
        {
          title: '撰写配音与文案',
          desc: '为每个镜头生成自然口播与字幕文案，语气可指定轻松/专业/促销等。',
          copyText: '用轻松语气重写口播，并输出配套字幕条（含时间轴建议）。',
        },
        {
          title: '多平台视频适配',
          desc: '针对抖音/B站/视频号等差异，调整节奏、信息密度与画面信息布局。',
          copyText: '同一脚本请分别给出抖音 15s 快节奏版与 B 站 90s 讲解版的结构差异说明。',
        },
      ],
    },
  },
  {
    id: 'plaza-4',
    slug: 'product-listing-generator',
    subtitle: '电商商品文案生成',
    desc: '自动生成电商平台商品标题、卖点文案与详情描述，支持多平台适配，提升上架效率。',
    tags: ['电商运营', 'URL 内容'],
    count: '1k',
    added: false,
    icon: './custom-assets/claw-flow/skill-market/skill-figma-4.png',
    detail: {
      tags: ['电商运营', 'URL 内容'],
      longDesc:
        'product-listing-generator：根据商品信息与目标平台要求，生成标题、卖点、详情描述和适配建议。',
      meta: { author: '社区贡献', count: '2.9k', source: 'Github', updated: '2026.02.26' },
      safeText: '已通过安全与合规验证，无恶意代码或数据泄露风险。',
      howTo: [
        {
          title: '生成商品标题',
          desc: '输入商品卖点、平台和目标人群，生成适配电商平台的高点击标题。',
          copyText: '请根据这些商品卖点生成 5 个电商标题，并标注各自适合的平台。',
        },
        {
          title: '撰写详情描述',
          desc: '自动整理卖点、使用场景和参数信息，输出商品详情页文案。',
          copyText: '请为这个商品生成详情页文案，包含卖点、场景和规格说明。',
        },
      ],
    },
  },
  {
    id: 'plaza-5',
    slug: 'clawyer-onboarding',
    subtitle: 'Clawver店铺搭建助手',
    desc: '设置 Clawver 新店铺：注册代理、配置 Stripe 支付、自定义店面。用于创建商家入驻流程。',
    tags: ['店铺搭建', '平台配置', '商家入驻'],
    count: '1.5k',
    added: false,
    icon: './custom-assets/claw-flow/skill-market/skill-figma-5.png',
    detail: {
      tags: ['店铺搭建', '平台配置', '商家入驻'],
      longDesc: 'clawyer-onboarding：辅助完成 Clawver 店铺注册、支付配置、店面初始化与入驻资料准备。',
      meta: { author: 'DevTools Lab', count: '887', source: 'Github', updated: '2026.01.12' },
      safeText: '已通过安全与合规验证，无恶意代码或数据泄露风险。',
      howTo: [
        {
          title: '规划开店流程',
          desc: '输入店铺类型、支付方式和目标市场，生成入驻与配置清单。',
          copyText: '请帮我规划 Clawver 新店铺搭建流程，并列出每一步需要准备的资料。',
        },
      ],
    },
  },
  {
    id: 'plaza-6',
    slug: 'linear',
    subtitle: 'Linear任务管理助手',
    desc: '与 Linear 集成进行问题跟踪。支持创建、更新、列出和搜索问题，查看分析与进度。',
    tags: ['项目管理', 'Issue 管理'],
    count: '622',
    added: true,
    icon: './custom-assets/claw-flow/skill-market/skill-figma-3.png',
    detail: {
      tags: ['项目管理', 'Issue 管理'],
      longDesc: 'linear：连接 Linear 任务管理，支持问题创建、查询、更新、搜索与项目进展梳理。',
      meta: { author: '官方', count: '2.1k', source: '官方', updated: '2026.03.30' },
      safeText: '已通过安全与合规验证，无恶意代码或数据泄露风险。',
      howTo: [
        {
          title: '创建任务问题',
          desc: '描述需求或缺陷，自动生成 Linear Issue 的标题、描述和优先级建议。',
          copyText: '请根据这段需求创建 Linear Issue 草稿，包含标题、描述、标签和优先级。',
        },
        {
          title: '分析项目进度',
          desc: '汇总问题状态和负责人信息，查看项目进度、阻塞点和风险。',
          copyText: '请汇总当前 Linear 项目进度，并分析主要风险和下一步动作。',
        },
      ],
    },
  },
  {
    id: 'plaza-7',
    slug: 'reddit-insights',
    subtitle: 'Reddit舆情洞察分析工具',
    desc: '通过 reddit-insights.com MCP 服务器进行语义 AI 搜索，分析 Reddit 内容与趋势。',
    tags: ['舆情分析', '数据洞察', '趋势分析'],
    count: '521',
    added: false,
    icon: './custom-assets/claw-flow/skill-market/skill-figma-7.png',
    detail: {
      tags: ['舆情分析', '数据洞察', '趋势分析'],
      longDesc: 'reddit-insights：围绕关键词进行 Reddit 内容搜索、趋势归纳和舆情洞察。',
      meta: { author: ' Lifestyle Kit ', count: '3.8k', source: '社区', updated: '2026.04.06' },
      safeText: '已通过安全与合规验证，无恶意代码或数据泄露风险。',
      howTo: [
        {
          title: '搜索舆情线索',
          desc: '输入品牌、产品或关键词，检索 Reddit 讨论并归纳高频观点。',
          copyText: '请围绕这个关键词搜索 Reddit 讨论，并总结主要用户观点。',
        },
        {
          title: '分析趋势变化',
          desc: '对比不同社区与时间段的讨论，判断用户关注点和潜在机会。',
          copyText: '请分析这些 Reddit 讨论中的趋势变化和可行动机会。',
        },
      ],
    },
  },
  {
    id: 'plaza-8',
    slug: 'robonet-workbench',
    subtitle: '交易策略回测工具',
    desc: '使用 RobonetMCP 服务器构建、回测、优化和部署交易策略。提供多种策略模板。',
    tags: ['策略回测', '量化交易', '数据分析'],
    count: '374',
    added: false,
    icon: './custom-assets/claw-flow/skill-market/skill-figma-8.png',
    detail: {
      tags: ['策略回测', '量化交易', '数据分析'],
      longDesc: 'robonet-workbench：构建、回测、优化和部署交易策略，辅助量化研究与策略验证。',
      meta: { author: 'Legal Helper', count: '1.5k', source: 'Github', updated: '2025.12.01' },
      safeText: '已通过安全与合规验证，无恶意代码或数据泄露风险。',
      howTo: [
        {
          title: '构建回测策略',
          desc: '输入交易品种、指标和买卖规则，生成可回测的策略配置。',
          copyText: '请根据这些交易规则生成一个可回测策略，并说明关键参数。',
        },
        {
          title: '优化策略参数',
          desc: '根据回测表现调整参数，比较收益、回撤和稳定性。',
          copyText: '请分析这份回测结果，并给出参数优化建议。',
        },
        {
          title: '生成风险报告',
          desc: '汇总最大回撤、胜率、盈亏比等指标，输出策略风险提醒。',
          copyText: '请基于回测数据生成一份策略风险报告。',
        },
      ],
    },
  },
  {
    id: 'plaza-9',
    slug: 'zoho-recruit',
    subtitle: '面试管理工具',
    desc: 'Zoho Recruit API 集成（托管 OAuth），管理候选人、职位、面试与招聘流程。',
    tags: ['OAuth集成', '候选人管理'],
    count: '212',
    added: false,
    icon: './custom-assets/claw-flow/skill-market/skill-figma-6.png',
    detail: {
      tags: ['OAuth集成', '候选人管理'],
      longDesc: 'zoho-recruit：对接 Zoho Recruit，管理候选人、职位、面试安排与招聘流程状态。',
      meta: { author: 'Insight Lab', count: '2.4k', source: 'Github', updated: '2026.03.22' },
      safeText: '已通过安全与合规验证，无恶意代码或数据泄露风险。',
      howTo: [
        {
          title: '管理候选人',
          desc: '输入候选人信息或岗位要求，快速创建、查询和更新招聘记录。',
          copyText: '请帮我整理这些候选人信息，并生成面试跟进清单。',
        },
      ],
    },
  },
  {
    id: 'plaza-10',
    slug: 'frontend-design-ui-generator',
    subtitle: '前端生成工具',
    desc: '使用 React、Tailwind CSS 和 shadcn/ui 构建独特生产级静态站点，适配页面与组件生成。',
    tags: ['前端开发', '生成工具'],
    count: '1.3k',
    added: true,
    icon: './custom-assets/claw-flow/skill-market/skill-figma-1.png',
    detail: {
      tags: ['前端开发', '生成工具'],
      longDesc: 'frontend-design-ui-generator：根据页面需求生成现代前端界面，适合快速搭建静态页面和组件原型。',
      meta: { author: '社区贡献', count: '1.3k', source: 'Github', updated: '2026.04.12' },
      safeText: '已通过安全与合规验证，无恶意代码或数据泄露风险。',
      howTo: [
        {
          title: '生成页面方案',
          desc: '描述业务目标、页面内容和风格，输出前端页面结构与组件建议。',
          copyText: '请根据这个产品需求生成一个生产级前端页面方案。',
        },
        {
          title: '优化 UI 组件',
          desc: '补充已有组件或截图，生成更贴合场景的样式和交互改进。',
          copyText: '请基于这张页面截图优化 UI 组件层级和交互细节。',
        },
      ],
    },
  },
  {
    id: 'plaza-11',
    slug: 'signnow',
    subtitle: '电子签署集成工具',
    desc: 'SignNowAPI 集成（托管 OAuth），电子签署平台，支持文档上传、发送签署与状态查询。',
    tags: ['电子签署', 'API集成'],
    count: '7.3k',
    added: true,
    icon: './custom-assets/claw-flow/skill-market/skill-figma-4.png',
    detail: {
      tags: ['电子签署', 'API集成'],
      longDesc: 'signnow：对接 SignNow 电子签署能力，支持文档上传、签署发送、状态查询和流程跟踪。',
      meta: { author: 'Pingo 等', count: '7.3k', source: 'Github', updated: '2026.04.18' },
      safeText: '已通过安全与合规验证，无恶意代码或数据泄露风险。',
      howTo: [
        {
          title: '发起签署流程',
          desc: '上传文档并填写签署人信息，生成发送签署的操作建议。',
          copyText: '请帮我创建电子签署流程，包含签署人、文件和通知文案。',
        },
        {
          title: '查询签署状态',
          desc: '根据文档或签署人信息，汇总签署进度和待处理事项。',
          copyText: '请查询这些文档的签署状态，并列出仍需跟进的人。',
        },
      ],
    },
  },
  {
    id: 'plaza-12',
    slug: 'tripo-3d-generation',
    subtitle: '战略顾问',
    desc: '通过文本或图像生成3D模型，支持创建色、物体、场景、游戏资产、电商展示。',
    tags: ['3D生成', '模型创建'],
    count: '7.3k',
    added: false,
    icon: './custom-assets/claw-flow/skill-market/skill-figma-10.png',
    detail: {
      tags: ['3D生成', '模型创建'],
      longDesc: 'tripo-3d-generation：通过文本或图像生成 3D 模型，支持物体、场景、游戏资产和电商展示素材。',
      meta: { author: 'Pingo 等', count: '7.3k', source: 'Github', updated: '2026.04.20' },
      safeText: '已通过安全与合规验证，无恶意代码或数据泄露风险。',
      howTo: [
        {
          title: '生成 3D 模型',
          desc: '输入物体、风格和用途，生成可用于建模的文本或图片提示。',
          copyText: '请根据这个产品描述生成 3D 模型提示词，适合电商展示。',
        },
        {
          title: '优化模型细节',
          desc: '补充材质、比例和场景信息，提升模型可用性与展示效果。',
          copyText: '请优化这个 3D 模型提示词，补充材质、结构和场景细节。',
        },
      ],
    },
  },
];

function closeClawSkillDetail() {
  const modal = document.getElementById('claw-skill-detail-modal');
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
}

function hideClawSkillSearchPopover() {
  const popover = document.getElementById('claw-skill-search-popover');
  if (!popover) return;
  popover.hidden = true;
  popover.innerHTML = '';
}

function openClawSkillDetail(skillId) {
  const item = CLAW_SKILL_PLAZA_ITEMS.find(x => x.id === skillId);
  const modal = document.getElementById('claw-skill-detail-modal');
  if (!item || !modal) return;

  hideClawSkillSearchPopover();
  const d = item.detail;
  document.getElementById('claw-skill-detail-icon').src = item.icon;
  document.getElementById('claw-skill-detail-name').textContent = item.slug;
  document.getElementById('claw-skill-detail-sub').textContent = item.subtitle;
  document.getElementById('claw-skill-detail-longdesc').textContent = d.longDesc;

  const tagsEl = document.getElementById('claw-skill-detail-tags');
  tagsEl.innerHTML = d.tags.map(t => `<span class="skills-detail-tag">${escapeHtml(t)}</span>`).join('');

  document.getElementById('claw-skill-detail-author').textContent = d.meta.author;
  document.getElementById('claw-skill-detail-count').textContent = d.meta.count;
  document.getElementById('claw-skill-detail-source').textContent = d.meta.source;
  document.getElementById('claw-skill-detail-updated').textContent = d.meta.updated;
  document.getElementById('claw-skill-detail-safe-text').textContent = d.safeText;

  const howtoWrap = document.getElementById('claw-skill-detail-howto');
  const howtoList = document.getElementById('claw-skill-detail-howto-list');
  if (d.howTo && d.howTo.length) {
    howtoWrap.hidden = false;
    howtoList.innerHTML = d.howTo
      .map(
        row => `
      <div class="claw-skill-howto-row">
        <div class="claw-skill-howto-row-head">
          <span class="claw-skill-howto-row-title">${escapeHtml(row.title)}</span>
          <button type="button" class="claw-skill-howto-copy" aria-label="复制示例提示">
            <img class="claw-skill-howto-copy-icon" src="./custom-assets/claw-flow/copy-icon.svg" alt="" aria-hidden="true" />
          </button>
        </div>
        <p class="claw-skill-howto-row-desc">${escapeHtml(row.copyText || row.desc || '')}</p>
      </div>`
      )
      .join('');
    howtoList.querySelectorAll('.claw-skill-howto-copy').forEach((btn, i) => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const row = d.howTo[i];
        const text = row ? row.copyText || row.desc || '' : '';
        navigator.clipboard?.writeText(text).catch(() => {});
      });
    });
  } else {
    howtoWrap.hidden = true;
    howtoList.innerHTML = '';
  }

  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
}

let clawSkillSortMode = 'recent';

function parseClawSkillCount(value) {
  const text = String(value || '').trim().toLowerCase();
  const num = parseFloat(text.replace(/[^\d.]/g, ''));
  if (Number.isNaN(num)) return 0;
  return text.includes('k') ? num * 1000 : num;
}

function getClawSkillTimestamp(item) {
  const date = item.detail?.meta?.updated || '';
  const time = Date.parse(String(date).replace(/\./g, '-'));
  return Number.isNaN(time) ? 0 : time;
}

function getSortedClawSkills(items = CLAW_SKILL_PLAZA_ITEMS) {
  return [...items].sort((a, b) => {
    if (clawSkillSortMode === 'count') {
      return parseClawSkillCount(b.count || b.detail?.meta?.count) - parseClawSkillCount(a.count || a.detail?.meta?.count);
    }
    return getClawSkillTimestamp(b) - getClawSkillTimestamp(a);
  });
}

function bindClawSkillCategoryTabs() {
  const tabs = document.getElementById('claw-skill-category-tabs');
  if (!tabs || tabs.dataset.bound === 'true') return;
  tabs.dataset.bound = 'true';
  tabs.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });
}

function getClawSkillSearchText(item) {
  const detail = item.detail || {};
  return [
    item.slug,
    item.subtitle,
    item.desc,
    detail.longDesc,
  ]
    .filter(Boolean)
    .join(' ');
}

function getClawSkillSearchMatches(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CLAW_SKILL_PLAZA_ITEMS.filter(item => getClawSkillSearchText(item).toLowerCase().includes(q));
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightClawSkillMatch(text, query) {
  const safe = escapeHtml(text || '');
  const q = query.trim();
  if (!q) return safe;
  return safe.replace(new RegExp(escapeRegExp(escapeHtml(q)), 'gi'), match => `<mark>${match}</mark>`);
}

function getClawSkillVisibleSnippet(item, query) {
  const q = query.trim().toLowerCase();
  const fields = [item.desc, item.detail?.longDesc, item.subtitle, item.slug].filter(Boolean);
  return fields.find(text => text.toLowerCase().includes(q)) || item.detail?.longDesc || item.desc || '';
}

function renderClawSkillCards(items, emptyText = '暂无匹配技能') {
  const grid = document.getElementById('claw-skill-card-grid');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `<div class="claw-skill-empty">${escapeHtml(emptyText)}</div>`;
    return;
  }

  grid.innerHTML = items.map(item => {
    const blob = getClawSkillSearchText(item).replace(/"/g, '&quot;');
    const badge = item.added
      ? `<span class="claw-skill-plaza-badge"><img src="./icon/成功.svg" alt="" />已添加</span>`
      : '';
    return `
      <button class="claw-skill-plaza-card" type="button" data-skill-id="${item.id}" data-search-blob="${blob}">
        <div class="claw-skill-plaza-top">
          <img class="claw-skill-plaza-icon" src="${item.icon}" alt="" />
          <div class="claw-skill-plaza-titles">
            <span class="claw-skill-plaza-slug">${escapeHtml(item.slug)}</span>
            <span class="claw-skill-plaza-sub">${escapeHtml(item.subtitle)}</span>
          </div>
        </div>
        <div class="claw-skill-plaza-body">
          <p class="claw-skill-plaza-desc">${escapeHtml(item.desc)}</p>
          <div class="claw-skill-plaza-tags">
            ${item.tags.map(t => `<span class="claw-skill-plaza-tag">${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
        <div class="claw-skill-plaza-foot">
          <span class="claw-skill-plaza-count">${escapeHtml(item.count)} 添加</span>
          ${badge}
        </div>
      </button>`;
  }).join('');

  grid.querySelectorAll('.claw-skill-plaza-card').forEach(btn => {
    btn.addEventListener('click', () => openClawSkillDetail(btn.dataset.skillId));
  });
}

function renderClawSkillSearchPopover(input) {
  const popover = document.getElementById('claw-skill-search-popover');
  const query = input.value.trim();
  const matches = getClawSkillSearchMatches(query);
  if (!popover || !query || !matches.length) {
    hideClawSkillSearchPopover();
    return;
  }

  popover.innerHTML = matches.map(item => `
    <button class="claw-skill-search-option" type="button" data-skill-id="${item.id}">
      <div class="claw-skill-search-option-top">
        <img class="claw-skill-search-option-icon" src="${item.icon}" alt="" />
        <div class="claw-skill-search-option-text">
          <span class="claw-skill-search-option-title">${highlightClawSkillMatch(item.slug, query)}</span>
          <p class="claw-skill-search-option-sub">${highlightClawSkillMatch(item.subtitle, query)}</p>
        </div>
      </div>
      <p class="claw-skill-search-option-desc">${highlightClawSkillMatch(getClawSkillVisibleSnippet(item, query), query)}</p>
    </button>
  `).join('');
  popover.hidden = false;
  popover.querySelectorAll('.claw-skill-search-option').forEach(option => {
    option.addEventListener('mousedown', e => e.preventDefault());
    option.addEventListener('click', () => openClawSkillDetail(option.dataset.skillId));
  });
}

function setClawSkillSearchResults(query) {
  const main = document.getElementById('claw-skill-market-main');
  const matches = getClawSkillSearchMatches(query);
  hideClawSkillSearchPopover();
  main?.classList.add('is-search-results');
  renderClawSkillCards(matches, '没有找到匹配的技能');
  document.querySelector('.claw-skill-market-scroll')?.scrollTo({ top: 0 });
}

function resetClawSkillSearchResults() {
  const main = document.getElementById('claw-skill-market-main');
  main?.classList.remove('is-search-results');
  renderClawSkillCards(getSortedClawSkills());
}

function bindClawSkillMarketSearch() {
  const search = document.querySelector('#claw-skill-market-main .claw-skill-market-search');
  const wrap = document.querySelector('#claw-skill-market-main .claw-skill-search-wrap');
  const input = search?.querySelector('input');
  const clearBtn = search?.querySelector('.claw-skill-market-search-clear');
  if (!search || !wrap || !input || input.dataset.bound === 'true') return;
  input.dataset.bound = 'true';

  const updateState = () => {
    const hasValue = Boolean(input.value.trim());
    search.classList.toggle('is-filled', hasValue);
    search.classList.toggle('is-active', document.activeElement === input || hasValue);
  };

  input.addEventListener('focus', () => {
    updateState();
    renderClawSkillSearchPopover(input);
  });
  input.addEventListener('input', () => {
    updateState();
    if (!input.value.trim()) resetClawSkillSearchResults();
    renderClawSkillSearchPopover(input);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = input.value.trim();
      if (query) setClawSkillSearchResults(query);
      else resetClawSkillSearchResults();
    }
    if (e.key === 'Escape') hideClawSkillSearchPopover();
  });
  input.addEventListener('blur', updateState);

  clearBtn?.addEventListener('mousedown', e => e.preventDefault());
  clearBtn?.addEventListener('click', () => {
    input.value = '';
    updateState();
    hideClawSkillSearchPopover();
    resetClawSkillSearchResults();
    input.focus();
  });

  document.addEventListener('mousedown', e => {
    if (!wrap.contains(e.target)) hideClawSkillSearchPopover();
  });
  updateState();
}

function renderClawSkillPlaza() {
  const main = document.getElementById('claw-skill-market-main');
  main?.classList.remove('is-search-results');
  renderClawSkillCards(getSortedClawSkills());
  bindClawSkillCategoryTabs();
  bindClawSkillMarketSort();
  bindClawSkillMarketSearch();
}

function bindClawSkillMarketSort() {
  const sort = document.querySelector('#claw-skill-market-main .claw-skill-sort');
  if (!sort || sort.dataset.bound === 'true') return;
  sort.dataset.bound = 'true';
  sort.querySelectorAll('.claw-skill-sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sort.querySelectorAll('.claw-skill-sort-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      clawSkillSortMode = btn.textContent.includes('添加') ? 'count' : 'recent';
      renderClawSkillCards(getSortedClawSkills());
    });
  });
}

function clawAgentIcon(name, fallbackIndex = 0) {
  return CLAW_AGENT_AVATARS[name] || CLAW_EXPERTS.find(item => item.name === name)?.icon || CLAW_EXPERTS[fallbackIndex % CLAW_EXPERTS.length].icon;
}

const EXPERT_MARKET_SUBTABS = {
  '一键组队': [],
  '学习': ['全部', '学习备考', '学术研究', '学业规划'],
  '工作': ['全部', '产品设计', '技术开发', '内容运营', '数据分析', '市场营销', '财务管理', '法务合规', '人力资源', '效率工具'],
  '生活': ['全部', '情感社交', '生活服务'],
};

const EXPERT_MARKET_SECONDARY_ORDER = {
  '数据分析': ['自媒体数据分析专家', '高级数据分析师', 'SQL代码工程师', '库存预测专家', 'ROI精算师'],
  '市场营销': ['广告创意顾问', '竞品情报特工', '趋势研究员', '跨境社媒营销官', '种草图文设计师', '跨境电商情报探长', '广告投放优化师', '库存预测专家', '销售教练'],
};

const EXPERT_MARKET_AGENT_META = {
  '课程预习导师': { primary: '学习', secondary: '学习备考', desc: '课前知识点深入讲解' },
  '笔记整理大师': { primary: '学习', secondary: '学习备考', desc: '将杂乱零散的笔记进行整理，让其具备高知识密度和可读性' },
  '课程辅导专家': { primary: '学习', secondary: '学习备考', desc: '对知识难点深入讲解' },
  '考前冲刺教练': { primary: '学习', secondary: '学习备考', desc: '专治考前焦虑，临阵磨枪找我就对了' },
  '外语一对一私教': { primary: '学习', secondary: '学习备考', desc: '全球百种语言，一对一学习' },
  '论文猎手': { primary: '学习', secondary: '学术研究', desc: '你只需指定主题，自动为你挖掘出最新最热的论文' },
  '论文解读专家': { primary: '学习', secondary: '学术研究', desc: '再硬核的论文也给你掰开揉碎讲明白' },
  '论文速读导师': { primary: '学习', secondary: '学术研究', desc: '再硬核的论文也给你掰开揉碎讲明白' },
  '资料整理大师': { primary: '学习', secondary: '学术研究', desc: '一堆乱资料秒变结构化文档' },
  '实验数据分析师': { primary: '学习', secondary: '学术研究', desc: '探索性实验分析、数据整理、数据可视化' },
  '论文润色专家': { primary: '学习', secondary: '学术研究', desc: '对论文的文案、结构进行优化' },
  '论文评审顾问': { primary: '学习', secondary: '学术研究', desc: '支持全面审稿和指定维度审稿' },
  '学习规划师': { primary: '学习', secondary: '学业规划', desc: '量身定制每日学习计划，跟着走就行' },
  '目标拆解教练': { primary: '学习', secondary: '学业规划', desc: '年初立的flag还在吗？让我帮你拆到每天能做到' },
  '留学规划顾问': { primary: '学习', secondary: '学业规划', desc: '多国申请+选校定位+文书指导，圆梦名校' },
  '高考志愿填报顾问': { primary: '学习', secondary: '学业规划', desc: '院校匹配+专业推荐+分数线预测，不浪费分' },
  '产品经理': { primary: '工作', secondary: '产品设计', desc: 'PRD+路线图+产品全生命周期，从0到1交付' },
  'UI设计师': { primary: '工作', secondary: '产品设计', desc: '设计系统+组件库，高质量界面快速生成' },
  'UX研究师': { primary: '工作', secondary: '产品设计', desc: '用户行为分析+可用性测试，数据驱动设计' },
  '腾讯问卷设计专家': { primary: '工作', secondary: '产品设计', desc: '秒生成完整、高回收率的结构化问卷' },
  '高级项目经理': { primary: '工作', secondary: '产品设计', desc: '项目规划跟踪/风险管控，按时交付不延期' },
  '竞品情报特工': { primary: '工作', secondary: '产品设计', secondaryAlso: ['市场营销'], desc: '15分钟输出竞品深度报告，11个维度一个不落' },
  '趋势研究员': { primary: '工作', secondary: '产品设计', secondaryAlso: ['市场营销'], desc: '市场情报+趋势预测，先人一步看到机会' },
  '用户反馈分析师': { primary: '工作', secondary: '产品设计', desc: '反馈归类+洞察提取+优先级排序，迭代有方向' },
  '前端开发工程师': { primary: '工作', secondary: '技术开发', desc: '精通主流前端技术栈，帮你实现高质量界面' },
  '后端架构师': { primary: '工作', secondary: '技术开发', desc: '微服务+分布式+高可用，后端架构全局把控' },
  '微信小程序开发助手': { primary: '工作', secondary: '技术开发', desc: 'WXML/WXSS+微信支付+云开发，快速上线' },
  'DevOps自动工程师': { primary: '工作', secondary: '技术开发', desc: 'CI/CD流水线搭建，持续交付不停歇' },
  '安全工程师': { primary: '工作', secondary: '技术开发', desc: '威胁建模+代码审计+安全加固，护航产品上线' },
  '测试专家': { primary: '工作', secondary: '技术开发', desc: '接口测试全链路自动化，一键输出测试报告' },
  '日志异常分析专家': { primary: '工作', secondary: '技术开发', desc: '百万志揪Bug，我比grep还快还准' },
  '代码文档助手': { primary: '工作', secondary: '技术开发', desc: '你负责写代码，我负责让别人看得懂你的代码' },
  '提示词工程师': { primary: '工作', secondary: '技术开发', desc: '帮你写出高效提示词，AI输出效果翻倍' },
  'SQL代码工程师': { primary: '工作', secondary: '技术开发', secondaryAlso: ['数据分析'], desc: '说话就出SQL，让不会写代码的人也能玩转数据' },
  '售前工程师': { primary: '工作', secondary: '技术开发', desc: '技术方案+Demo演示+POC验证，赢单利器' },
  '广告创意顾问': { primary: '工作', secondary: '市场营销', desc: '素材文案到A/B测试，最大化广告转化效果' },
  '跨境社媒营销官': { primary: '工作', secondary: '市场营销', desc: '一条指令搞定六大平台内容生产与发布' },
  '种草图文设计师': { primary: '工作', secondary: '市场营销', desc: '给个主题，自动出每页文案+排版+配色方案' },
  '销售教练': { primary: '工作', secondary: '市场营销', desc: '话术+客户管理+成交技巧，全面提升成交率' },
  '微博运营策略师': { primary: '工作', secondary: '内容运营', desc: '话题运营+超话管理，品牌声量翻倍' },
  '抖音运营专家': { primary: '工作', secondary: '内容运营', desc: '让视频上热榜不靠玄学' },
  '公众号主笔': { primary: '工作', secondary: '内容运营', desc: '给主题即出稿，策划到排版一步到位' },
  '小红书爆款顾问': { primary: '工作', secondary: '内容运营', desc: '从选题到爆款全流程服务，你负责拍我负责火' },
  '自媒体文案大师': { primary: '工作', secondary: '内容运营', desc: '从种草文到短视频脚本，全平台爆款文案一站搞定' },
  '自媒体热点猎手': { primary: '工作', secondary: '内容运营', desc: '7x24h全网热搜雷达，只推送你领域相关的精准选题弹药' },
  '自媒体数据分析专家': { primary: '工作', secondary: '内容运营', secondaryAlso: ['数据分析'], desc: '用数据说话，帮你看清每条内容的真实表现和优化方向' },
  '快手策略师': { primary: '工作', secondary: '内容运营', desc: '内容创作到直播电商，帮抓下沉市场机遇' },
  'TikTok策略师': { primary: '工作', secondary: '内容运营', desc: '病毒式内容+算法优化，全球流量把抓' },
  '跨境电商情报探长': { primary: '工作', secondary: '市场营销', desc: '对打了个喷嚏我都知道，7x24情报不断线' },
  '库存预测专家': { primary: '工作', secondary: '市场营销', secondaryAlso: ['数据分析'], desc: '需求预测+安全库存+大促备货，精准管库存' },
  '广告投放优化师': { primary: '工作', secondary: '市场营销', desc: '关键词+出价+质量分优化，最大化广告ROI' },
  '高级数据分析师': { primary: '工作', secondary: '数据分析', desc: '自动解析数据背后的洞察与建议' },
  'A股盯盘师': { primary: '工作', secondary: '财务管理', desc: '7x24小时盯盘，异动第一时间送达' },
  '基金配置顾问': { primary: '工作', secondary: '财务管理', desc: '3000+只基金我帮你翻，只挑真正能拿住的' },
  '股票诊断师': { primary: '工作', secondary: '财务管理', desc: '深度扫描，看透每只股的价值与风险' },
  '金融风控分析师': { primary: '工作', secondary: '财务管理', desc: '信用评估+反欺诈+合规审查，全面防控风险' },
  '发票管理专家': { primary: '工作', secondary: '财务管理', desc: '增值税发票+金税系统+三单匹配，票据无忧' },
  'ROI精算师': { primary: '工作', secondary: '财务管理', secondaryAlso: ['数据分析'], desc: '这笔钱花得值不值？算完你心里就有数了' },
  '宏观经济分析师': { primary: '工作', secondary: '财务管理', desc: '利率变了？政策又吹了？我帮你拆明白' },
  '合同审查专家': { primary: '工作', secondary: '法务合规', desc: '条款风险逐条识别，修改建议一步到位' },
  '制度文件撰写专家': { primary: '工作', secondary: '法务合规', desc: '帮你起草和审查各类制度文件' },
  '文件对比专家': { primary: '工作', secondary: '法务合规', desc: '100页件哪里改了？我快速给你标出来' },
  '绩效管理专家': { primary: '工作', secondary: '人力资源', desc: 'OKR/KPI+361分布+晋升答辩，激发团队潜能' },
  '招聘专家': { primary: '工作', secondary: '人力资源', desc: 'JD撰写到背调，高效完成招聘全流程' },
  'Outlook邮箱管理专家': { primary: '工作', secondary: '效率工具', desc: '自动分类、提炼、收发邮件，解放繁琐' },
  'WPS表格美化整理师': { primary: '工作', secondary: '效率工具', desc: '丢给我散乱笔记，还你清爽专业表格' },
  '深夜解压大师': { primary: '生活', secondary: '情感社交', desc: '深夜陪伴：情绪疏导+倾听助眠' },
  'MBTI配对师': { primary: '生活', secondary: '情感社交', desc: '输入双方MBTI，深度解读关系匹配与雷区' },
  '吃货参谋': { primary: '生活', secondary: '生活服务', desc: '“随便”不是一道菜，让我来终结你的选择困难' },
  '懒人出游规划师': { primary: '生活', secondary: '生活服务', desc: '一键出游：天气+行程全搞定' },
  '私人健身教练': { primary: '生活', secondary: '生活服务', desc: '不卖课不画饼，只给你一份练了就有效的计划' },
};

const EXPERT_MARKET_EXTRA_AGENTS = Object.keys(EXPERT_MARKET_AGENT_META)
  .map((name, index) => {
    const meta = EXPERT_MARKET_AGENT_META[name];
    return {
      name,
      desc: meta.desc,
      icon: clawAgentIcon(name, index),
      primary: meta.primary,
      secondary: meta.secondary,
      secondaryAlso: meta.secondaryAlso || [],
    };
  });

const EXPERT_MARKET_TEAMS = [
  {
    id: 'exam',
    title: '考前突击小队',
    icon: '⚡',
    tone: 'cold',
    category: '一人公司',
    added: false,
    experts: [
      { name: '课程预习导师', desc: '课前梳理课程重点，提前建立知识框架', icon: clawAgentIcon('课程预习导师', 0) },
      { name: '笔记整理大师', desc: '将杂乱零散的笔记整理成高密度复习材料', icon: clawAgentIcon('笔记整理大师', 1) },
      { name: '课程辅导专家', desc: '围绕知识难点深入讲解，补齐薄弱环节', icon: clawAgentIcon('课程辅导专家', 2) },
      { name: '考前冲刺教练', desc: '整合考点、梳理高频题型、生成冲刺复习计划', icon: clawAgentIcon('考前冲刺教练', 3) },
    ],
  },
  {
    id: 'study',
    title: '学业规划小队',
    icon: '🎨',
    tone: 'warm',
    category: '学术教育',
    added: false,
    experts: [
      { name: '论文解读专家', desc: '快速提炼论文核心论点与结构，省去逐字精读的时间', icon: clawAgentIcon('论文解读专家', 0) },
      { name: '实验数据分析师', desc: '整理实验数据，输出分析结论与可视化建议', icon: clawAgentIcon('实验数据分析师', 1) },
      { name: '论文润色专家', desc: '优化论文表达、结构与逻辑，让稿件更顺畅专业', icon: clawAgentIcon('论文润色专家', 2) },
      { name: '论文评审顾问', desc: '按评审维度检查论文问题，给出修改建议', icon: clawAgentIcon('论文评审顾问', 3) },
    ],
  },
  {
    id: 'cross-border',
    title: '跨境电商团队',
    icon: '💰',
    tone: 'gold',
    category: '一人公司',
    added: false,
    experts: [
      {
        name: '跨境电商情报探长',
        desc: '7x24h全网热搜雷达，只推送你领域相关的精准选品',
        icon: clawAgentIcon('跨境电商情报探长', 0),
        detail:
          '我是竞品雷达，一只24小时不眨眼的跨境电商情报探长。盯着竞品的价格、Listing、评论和上新的每一个风吹草动，是我的本能。数据就是我的眼睛，异常就是我的猎物。价格变动超5%日报汇总，超15%即时告警；差评暴增秒级响应；Listing改动每日对比。只做合规数据采集，情报归情报，决策归你。',
        skills: ['online-search', 'competitor-monitoring', 'price-tracker', 'amazon-competitor-analyzer'],
      },
      { name: '广告创意顾问', desc: '素材文案到A/B测试，最大化广告转化效果', icon: clawAgentIcon('广告创意顾问', 1) },
      { name: '广告投放优化师', desc: '关键词+出价+质量分优化，最大化广告ROI', icon: clawAgentIcon('广告投放优化师', 2) },
      { name: '用户反馈分析师', desc: '反馈归类+洞察提取+优先级排序，迭代有方向', icon: clawAgentIcon('用户反馈分析师', 5) },
    ],
  },
  {
    id: 'dev',
    title: '软件开发工作室',
    icon: '💻',
    tone: 'green',
    category: '技术工程',
    added: false,
    experts: [
      { name: '产品经理', desc: 'PRD+路线图+产品全生命周期，从0到1交付', icon: clawAgentIcon('产品经理', 3) },
      { name: 'UI设计师', desc: '设计系统+组件库，高质量界面快速生成', icon: clawAgentIcon('UI设计师', 0) },
      { name: '前端开发工程师', desc: '精通主流前端技术栈，帮你实现高质量界面', icon: clawAgentIcon('前端开发工程师', 7) },
      { name: '后端架构师', desc: '微服务+分布式+高可用，后端架构全局把控', icon: clawAgentIcon('后端架构师', 4) },
    ],
  },
  {
    id: 'stock',
    title: '股市行情分析所',
    icon: '📊',
    tone: 'blue',
    category: '金融',
    added: false,
    experts: [
      { name: 'A股盯盘师', desc: '7x24小时盯盘，异动第一时间送达', icon: clawAgentIcon('A股盯盘师', 1) },
      { name: '宏观经济分析师', desc: '利率变了？政策又吹了？我帮你拆明白', icon: clawAgentIcon('宏观经济分析师', 3) },
      { name: '基金配置顾问', desc: '3000+只基金我帮你筛，只挑真正能拿住的', icon: clawAgentIcon('基金配置顾问', 2) },
      { name: '股票诊断师', desc: '深度扫描，看透每只股的价值与风险', icon: clawAgentIcon('股票诊断师', 7) },
    ],
  },
  {
    id: 'media',
    title: '全平台自媒体公司',
    icon: '📣',
    tone: 'purple',
    category: '营销增长',
    added: false,
    experts: [
      { name: '自媒体热点猎手', desc: '7x24h全网热搜雷达，只推送你领域相关的精准选题弹药', icon: clawAgentIcon('自媒体热点猎手', 0) },
      { name: '抖音运营专家', desc: '让视频上热榜不靠玄学', icon: clawAgentIcon('抖音运营专家', 5) },
      { name: '小红书爆款顾问', desc: '从选题到爆款全流程服务，你负责拍我负责火', icon: clawAgentIcon('小红书爆款顾问', 6) },
      { name: '公众号主笔', desc: '给主题即出稿，策划到排版一步到位', icon: clawAgentIcon('公众号主笔', 4) },
    ],
  },
];

const EXPERT_MARKET_TEAM_ORDER = ['exam', 'media', 'cross-border', 'dev', 'stock', 'study'];

function normalizeExpertMarketData() {
  EXPERT_MARKET_TEAMS.forEach(team => {
    team.experts.forEach((expert, index) => {
      const meta = EXPERT_MARKET_AGENT_META[expert.name] || {};
      expert.primary = meta.primary || team.primary || '工作';
      expert.secondary = meta.secondary || team.secondary || team.category || '效率工具';
      expert.secondaryAlso = meta.secondaryAlso || expert.secondaryAlso || [];
      if (meta.desc) expert.desc = meta.desc;
      expert.icon = expert.icon || clawAgentIcon(expert.name, index);
    });
  });
}

normalizeExpertMarketData();

const EXPERT_MARKET_CATALOG_TEAMS = EXPERT_MARKET_EXTRA_AGENTS
  .filter(agent => !EXPERT_MARKET_TEAMS.some(team => team.experts.some(expert => expert.name === agent.name)))
  .map((agent, index) => ({
    id: `catalog-${index}`,
    title: agent.secondary || agent.primary || '智能体',
    icon: '',
    tone: 'cold',
    category: agent.primary,
    catalogOnly: true,
    experts: [agent],
  }));

function getExpertMarketTeamCards() {
  return [...EXPERT_MARKET_TEAMS].sort((a, b) => {
    const aIndex = EXPERT_MARKET_TEAM_ORDER.indexOf(a.id);
    const bIndex = EXPERT_MARKET_TEAM_ORDER.indexOf(b.id);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
}

function getExpertMarketAgents() {
  const byName = new Map();
  [...EXPERT_MARKET_TEAMS, ...EXPERT_MARKET_CATALOG_TEAMS].forEach(team => {
    team.experts.forEach(expert => {
      if (!byName.has(expert.name)) byName.set(expert.name, { team, expert });
    });
  });
  return [...byName.values()];
}

function setClawFlowInactive() {
  clawWindowFrame?.classList.remove('claw-flow-active', 'claw-flow-home', 'claw-flow-loading', 'claw-flow-config');
  clawFlowEl?.removeAttribute('data-page');
}

function syncClawTabs(page) {
  const homeTab = document.getElementById('tab-home');
  const clawTab = document.getElementById('tab-claw');
  homeTab?.classList.toggle('is-active', page === 'home');
  clawTab?.classList.toggle('is-active', page !== 'home');
}

function setClawFlowPage(page) {
  if (!clawFlowEl || !clawWindowFrame) return;
  clawWindowFrame.classList.add('claw-flow-active');
  clawWindowFrame.classList.toggle('claw-flow-home', page === 'home');
  clawWindowFrame.classList.toggle('claw-flow-loading', page === 'loading');
  clawWindowFrame.classList.toggle('claw-flow-config', page === 'config');
  clawFlowEl.dataset.page = page;
  syncClawTabs(page);

  if (page !== 'loading') {
    stopClawLoadingAnimation();
  }
  if (page === 'loading') {
    startClawLoadingAnimation();
  }
  if (page === 'config') {
    setClawConfigSection(clawConfigSection);
    renderClawExpertCards();
    document.querySelector('.claw-dialog-scroll')?.scrollTo({ top: 0 });
    if (clawConfigSection === 'config') requestAnimationFrame(startClawIntroAnimation);
  }
}

function setClawConfigSection(section) {
  const allowed = new Set(['config', 'xiaotian', 'expert-market', 'skill', 'task', 'subscription']);
  clawConfigSection = allowed.has(section) ? section : 'config';
  closeClawComposerPopover();
  const configPage = document.getElementById('claw-config-page');
  const configMain = document.querySelector('#claw-config-page .claw-config-main');
  const xiaotianMain = document.getElementById('claw-xiaotian-main');
  const marketMain = document.getElementById('claw-expert-market-main');
  const skillMain = document.getElementById('claw-skill-market-main');
  const taskMain = document.getElementById('claw-task-center-main');
  const subscriptionMain = document.getElementById('claw-subscription-main');

  configPage?.classList.toggle('is-xiaotian-page', clawConfigSection === 'xiaotian');
  configPage?.classList.toggle('is-expert-market', clawConfigSection === 'expert-market');
  configPage?.classList.toggle('is-skill-market', clawConfigSection === 'skill');
  configPage?.classList.toggle('is-task-center', clawConfigSection === 'task');
  configPage?.classList.toggle('is-subscription-page', clawConfigSection === 'subscription');

  if (configMain) configMain.hidden = clawConfigSection !== 'config';
  if (xiaotianMain) xiaotianMain.hidden = clawConfigSection !== 'xiaotian';
  if (marketMain) marketMain.hidden = clawConfigSection !== 'expert-market';
  if (skillMain) skillMain.hidden = clawConfigSection !== 'skill';
  if (taskMain) taskMain.hidden = clawConfigSection !== 'task';
  if (subscriptionMain) subscriptionMain.hidden = clawConfigSection !== 'subscription';

  document.querySelectorAll('.claw-config-sidebar [data-claw-section]').forEach(item => {
    item.classList.toggle('is-active', item.dataset.clawSection === clawConfigSection);
  });
  renderClawAddedAgentList();

  closeClawSkillDetail();
  closeExpertDetail();
  closeTaskDeleteModal();
  activeTaskMenuId = null;

  if (clawConfigSection === 'xiaotian') {
    renderClawAgentHome();
  }

  if (clawConfigSection === 'expert-market') {
    renderExpertMarket();
    document.querySelector('.expert-market-scroll')?.scrollTo({ top: 0 });
  }

  if (clawConfigSection === 'skill') {
    renderClawSkillPlaza();
    document.querySelector('.claw-skill-market-scroll')?.scrollTo({ top: 0 });
  }

  if (clawConfigSection === 'task') {
    renderClawTaskCenter();
    document.querySelector('.claw-task-center-scroll')?.scrollTo({ top: 0 });
  }

  if (clawConfigSection === 'subscription') {
    syncSubscriptionPlans();
  }
}

function stopClawLoadingAnimation() {
  if (clawLoadingTimer) {
    clearTimeout(clawLoadingTimer);
    clawLoadingTimer = null;
  }
  if (clawLoadingFrame) {
    cancelAnimationFrame(clawLoadingFrame);
    clawLoadingFrame = null;
  }
}

function startClawLoadingAnimation() {
  stopClawLoadingAnimation();
  const duration = 1000;
  const startedAt = performance.now();
  if (clawLoadingBar) clawLoadingBar.style.width = '0%';

  const tick = now => {
    const progress = Math.min(1, (now - startedAt) / duration);
    if (clawLoadingBar) clawLoadingBar.style.width = `${Math.round(progress * 100)}%`;
    if (progress < 1) {
      clawLoadingFrame = requestAnimationFrame(tick);
    }
  };
  clawLoadingFrame = requestAnimationFrame(tick);
  clawLoadingTimer = setTimeout(() => {
    clawIntroAnimationStarted = false;
    activeClawHomeAgent = CLAW_XIAOTIAN_HOME;
    clawConfigSection = 'xiaotian';
    navigateTo('claw-config');
  }, duration);
}

function startClawEntryFlow() {
  clawIntroAnimationStarted = false;
  clawConfigSection = 'config';
  navigateTo('claw-loading');
}

function renderClawExpertCards() {
  const grid = document.getElementById('agent-select-grid');
  if (!grid || grid.dataset.rendered === 'true') {
    updateClawSelectionUI();
    return;
  }

  grid.innerHTML = CLAW_EXPERTS.map(item => `
    <button class="agent-card-option" type="button" data-agent-id="${item.id}" aria-pressed="false">
      <img src="${item.icon}" alt="" />
      <span>
        <strong>${escapeHtml(item.name)}</strong>
        <small>${escapeHtml(item.desc)}</small>
      </span>
      <span class="agent-card-check" aria-hidden="true"></span>
    </button>
  `).join('');
  grid.dataset.rendered = 'true';

  grid.querySelectorAll('.agent-card-option').forEach(card => {
    card.addEventListener('click', () => {
      if (clawExpertsAdded) return;
      const id = card.dataset.agentId;
      if (!id) return;
      if (clawSelectedExperts.has(id)) clawSelectedExperts.delete(id);
      else clawSelectedExperts.add(id);
      updateClawSelectionUI();
    });
  });

  updateClawSelectionUI();
}

function updateClawSelectionUI() {
  const total = CLAW_EXPERTS.length;
  const count = clawSelectedExperts.size;
  document.getElementById('claw-config-page')?.classList.toggle('claw-experts-added', clawExpertsAdded);
  document.querySelectorAll('.agent-card-option[data-agent-id]').forEach(card => {
    const selected = clawSelectedExperts.has(card.dataset.agentId);
    card.classList.toggle('is-selected', selected);
    card.setAttribute('aria-pressed', selected ? 'true' : 'false');
  });

  const countEl = document.getElementById('agent-selected-count');
  if (countEl) countEl.textContent = `已选 ${count}/${total} 位专家`;

  const selectAll = document.getElementById('agent-select-all');
  if (selectAll) {
    selectAll.classList.toggle('is-checked', count === total);
    selectAll.classList.toggle('is-mixed', count > 0 && count < total);
    selectAll.setAttribute('aria-checked', count === total ? 'true' : count === 0 ? 'false' : 'mixed');
  }

  const addBtn = document.getElementById('agent-add-button');
  if (addBtn) {
    addBtn.textContent = clawExpertsAdded ? '已添加' : '一键添加';
    addBtn.classList.toggle('is-enabled', count > 0 && !clawExpertsAdded);
    addBtn.classList.toggle('is-added', clawExpertsAdded);
    addBtn.disabled = clawExpertsAdded || count === 0;
  }

  renderClawAddedAgentList();
}

function getAddedClawSidebarAgents() {
  const byName = new Map();
  let sidebarIndex = 0;
  if (clawExpertsAdded) {
    CLAW_EXPERTS.forEach(item => {
      if (clawSelectedExperts.has(item.id)) {
        byName.set(item.name, { ...item, addedAt: item.addedAt || 1, sidebarIndex: sidebarIndex++ });
      }
    });
  }
  EXPERT_MARKET_TEAMS.forEach(team => {
    team.experts.forEach(expert => {
      if (expert.added) {
        byName.set(expert.name, { ...expert, addedAt: expert.addedAt || 2, sidebarIndex: sidebarIndex++ });
      }
    });
  });
  return [...byName.values()].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0) || a.sidebarIndex - b.sidebarIndex);
}

function renderClawAgentHome() {
  const agent = activeClawHomeAgent || CLAW_XIAOTIAN_HOME;
  const main = document.getElementById('claw-xiaotian-main');
  const avatar = document.getElementById('claw-agent-home-avatar');
  const title = document.getElementById('claw-agent-home-title');
  const desc = document.getElementById('claw-agent-home-desc');
  const isXiaotian = (agent.id || agent.name) === (CLAW_XIAOTIAN_HOME.id || CLAW_XIAOTIAN_HOME.name);
  main?.classList.toggle('is-custom-agent-home', !isXiaotian);
  if (avatar) {
    avatar.src = isXiaotian ? './custom-assets/claw-flow/xiaotian-avatar.png' : agent.icon || CLAW_XIAOTIAN_HOME.icon;
    avatar.alt = agent.name || '';
  }
  if (title) title.innerHTML = `Hi，我是<span class="claw-agent-name-underline">${escapeHtml(agent.name || '小天')}</span>`;
  if (desc) desc.textContent = agent.desc || CLAW_XIAOTIAN_HOME.desc;
  document.querySelector('.claw-quick-new-agent-title')?.replaceChildren(document.createTextNode('新建智能体'));
}

function openClawAgentHome(agent) {
  activeClawHomeAgent = agent || CLAW_XIAOTIAN_HOME;
  setClawConfigSection('xiaotian');
}

function renderClawAddedAgentList() {
  const list = document.getElementById('claw-added-agent-list');
  if (!list) return;
  const agents = getAddedClawSidebarAgents();
  document.querySelector('.claw-config-sidebar')?.classList.toggle('has-added-agents', agents.length > 0);
  list.innerHTML = agents
    .map(agent => `
      <button class="claw-added-agent-item${clawConfigSection === 'xiaotian' && activeClawHomeAgent?.name === agent.name ? ' is-active' : ''}" type="button" data-agent-name="${escapeHtml(agent.name)}">
        <img src="${agent.icon}" alt="" />
        <span>
          <strong>${escapeHtml(agent.name)}</strong>
          <small>${escapeHtml(agent.desc)}</small>
        </span>
      </button>
    `)
    .join('');
  list.querySelectorAll('.claw-added-agent-item').forEach(button => {
    button.addEventListener('click', () => {
      const name = button.dataset.agentName;
      const agent = agents.find(item => item.name === name) || findMarketExpertByName(name)?.expert;
      if (agent) openClawAgentHome(agent);
    });
  });
}

let clawComposerPopover = null;
let activeClawComposerForm = null;

function getClawComposerForm(trigger) {
  return trigger?.closest?.('.claw-fixed-composer, .claw-agent-home-composer') || null;
}

function getClawComposerEditor(form) {
  return form?.querySelector?.('.prompt-editor') || null;
}

function getClawComposerSkills() {
  return CLAW_SKILL_PLAZA_ITEMS.map(item => ({
    id: item.id,
    name: item.slug || item.subtitle,
    desc: item.subtitle || item.desc || '',
    icon: item.icon,
    fill: item.subtitle || item.slug,
  }));
}

function getClawComposerMentionAgents() {
  const byName = new Map();
  EXPERT_MARKET_TEAMS.forEach(team => {
    team.experts.forEach(expert => {
      if (!byName.has(expert.name)) {
        byName.set(expert.name, { ...expert, teamId: team.id });
      }
    });
  });
  return [...byName.values()];
}

function ensureClawComposerPopover() {
  if (clawComposerPopover) return clawComposerPopover;
  clawComposerPopover = document.createElement('div');
  clawComposerPopover.className = 'claw-composer-popover';
  document.body.appendChild(clawComposerPopover);
  return clawComposerPopover;
}

function closeClawComposerPopover() {
  if (!clawComposerPopover) return;
  clawComposerPopover.remove();
  clawComposerPopover = null;
  activeClawComposerForm = null;
}

function positionClawComposerPopover(popover, trigger) {
  const rect = trigger.getBoundingClientRect();
  const gap = 4;
  const width = popover.offsetWidth || 300;
  const height = popover.offsetHeight || 260;
  const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
  const preferredTop = rect.top - height - gap;
  const top = preferredTop >= 12 ? preferredTop : Math.min(rect.bottom + gap, window.innerHeight - height - 12);
  popover.style.left = `${left}px`;
  popover.style.top = `${Math.max(12, top)}px`;
}

function setClawComposerSkillFill(form, skill) {
  const editor = getClawComposerEditor(form);
  if (!editor || !skill) return;
  editor.innerHTML = `<span class="claw-inline-skill">/${escapeHtml(skill.fill || skill.name)}</span>`;
  form.classList.add('has-claw-composer-fill');
  closeClawComposerPopover();
  editor.focus();
}

function setClawComposerMentionFill(form, agent) {
  const editor = getClawComposerEditor(form);
  if (!editor || !agent) return;
  editor.innerHTML = `<span class="claw-inline-mention" contenteditable="false"><img src="${escapeHtml(agent.icon)}" alt="" /><span>${escapeHtml(agent.name)}</span></span>`;
  form.classList.add('has-claw-composer-fill');
  closeClawComposerPopover();
  editor.focus();
}

function openClawComposerPopover(type, trigger) {
  const form = getClawComposerForm(trigger);
  if (!form) return;
  const isSkill = type === 'skill';
  const items = isSkill ? getClawComposerSkills() : getClawComposerMentionAgents();
  activeClawComposerForm = form;

  const popover = ensureClawComposerPopover();
  popover.className = `claw-composer-popover is-${isSkill ? 'skill' : 'mention'}`;
  popover.style.visibility = 'hidden';
  popover.innerHTML = `
    <div class="claw-composer-popover-title">${isSkill ? '选择技能' : '提及智能体'}</div>
    <div class="claw-composer-popover-list">
      ${items.map((item, index) => `
        <button class="claw-composer-popover-item" type="button" data-index="${index}">
          <img src="${escapeHtml(item.icon)}" alt="" />
          <span>
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml(item.desc || '')}</small>
          </span>
        </button>
      `).join('')}
    </div>
    ${isSkill ? '<button class="claw-composer-popover-manage" type="button"><img src="./custom-assets/claw-flow/manage-skill-icon.svg" alt="" /><span>管理技能</span></button>' : ''}
  `;

  popover.querySelectorAll('.claw-composer-popover-item').forEach(button => {
    button.addEventListener('click', () => {
      const item = items[Number(button.dataset.index)];
      if (isSkill) setClawComposerSkillFill(activeClawComposerForm, item);
      else setClawComposerMentionFill(activeClawComposerForm, item);
    });
  });

  popover.querySelector('.claw-composer-popover-manage')?.addEventListener('click', () => {
    closeClawComposerPopover();
    setClawConfigSection('skill');
  });

  positionClawComposerPopover(popover, trigger);
  requestAnimationFrame(() => {
    if (!clawComposerPopover) return;
    positionClawComposerPopover(popover, trigger);
    popover.style.visibility = 'visible';
  });
}

function scrollClawDialogToBottom() {
  const scroll = document.querySelector('.claw-dialog-scroll');
  if (scroll) scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
}

function typeClawText(el, text, options = {}) {
  const content = String(text || '');
  const speed = options.speed ?? 5;
  const step = Math.max(1, options.step ?? 1);
  const shouldScroll = options.autoScroll !== false;
  el.classList.add('typewriter-text', 'is-typing');
  el.textContent = '';

  return new Promise(resolve => {
    if (!content) {
      el.classList.remove('is-typing');
      resolve(el);
      return;
    }

    let index = 0;
    const tick = () => {
      index = Math.min(content.length, index + step);
      el.textContent = content.slice(0, index);
      if (shouldScroll) scrollClawDialogToBottom();
      if (index >= content.length) {
        el.textContent = content;
        el.classList.remove('is-typing');
        resolve(el);
        return;
      }
      setTimeout(tick, getTypewriterDelay(content[index - 1], speed));
    };
    requestAnimationFrame(tick);
  });
}

function startClawIntroAnimation(options = {}) {
  const article = document.querySelector('#claw-config-page .claw-dialog');
  const force = Boolean(options.force);
  if (!article) return;
  if (clawExpertsAdded || (clawIntroAnimationStarted && !force)) {
    article.classList.remove('is-intro-pending-root');
    return;
  }
  clawIntroAnimationStarted = true;

  const paragraphs = [...article.querySelectorAll(':scope > p')];
  const leadParagraphs = paragraphs.slice(0, 5);
  const closingParagraph = paragraphs[5];
  const cards = [...article.querySelectorAll('.agent-card-option')];
  const selectionBar = article.querySelector('.agent-selection-bar');
  const stored = new Map();

  [...leadParagraphs, closingParagraph].filter(Boolean).forEach(el => {
    stored.set(el, el.getAttribute('data-typewriter-text') || el.textContent || '');
    el.textContent = '';
  });

  cards.forEach(card => {
    card.classList.add('is-intro-pending');
    const title = card.querySelector('strong');
    const desc = card.querySelector('small');
    if (title) {
      stored.set(title, title.textContent || '');
      title.textContent = '';
    }
    if (desc) {
      stored.set(desc, desc.textContent || '');
      desc.textContent = '';
    }
  });
  selectionBar?.classList.add('is-intro-pending');
  article.classList.remove('is-intro-pending-root');

  let sequence = Promise.resolve();
  leadParagraphs.forEach(paragraph => {
    sequence = sequence.then(() => typeClawText(paragraph, stored.get(paragraph), { speed: 4, step: 1, autoScroll: false }));
  });

  sequence = sequence.then(async () => {
    for (const card of cards) {
      card.classList.remove('is-intro-pending');
      const title = card.querySelector('strong');
      const desc = card.querySelector('small');
      if (title) await typeClawText(title, stored.get(title), { speed: 4, step: 1, autoScroll: false });
      if (desc) await typeClawText(desc, stored.get(desc), { speed: 4, step: 1, autoScroll: false });
    }
    selectionBar?.classList.remove('is-intro-pending');
  });

  if (closingParagraph) {
    sequence = sequence.then(() => typeClawText(closingParagraph, stored.get(closingParagraph), { speed: 4, step: 1, autoScroll: false }));
  }

  sequence.finally(() => {
    selectionBar?.classList.remove('is-intro-pending');
    article.classList.remove('is-intro-pending-root');
  });
}

function getClawSelectedExpertNames() {
  return CLAW_EXPERTS
    .filter(item => clawSelectedExperts.has(item.id))
    .map(item => item.name);
}

function getClawSkillChooseAgents() {
  const agents = getAddedClawSidebarAgents();
  const source = agents.length ? agents : [CLAW_XIAOTIAN_HOME];
  return source.map((agent, index) => ({
    id: agent.id || `claw-agent-${index}`,
    name: agent.name || '小天',
    desc: agent.desc || '',
    avatar: agent.icon || CLAW_XIAOTIAN_HOME.icon,
    bgStyle: '',
  }));
}

let clawSkillToastTimer = null;
let clawSkillAgentOverlay = null;
let clawSkillAgentSelectedId = '';

function showClawSkillAddToast() {
  const toast = document.getElementById('claw-skill-add-toast');
  if (!toast) return;
  clearTimeout(clawSkillToastTimer);
  toast.classList.add('is-visible');
  toast.setAttribute('aria-hidden', 'false');
  clawSkillToastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.setAttribute('aria-hidden', 'true');
  }, 1600);
}

function closeClawSkillAgentModal() {
  if (!clawSkillAgentOverlay) return;
  clawSkillAgentOverlay.classList.remove('is-open');
  clawSkillAgentOverlay.setAttribute('aria-hidden', 'true');
}

function ensureClawSkillAgentModal() {
  if (clawSkillAgentOverlay) return clawSkillAgentOverlay;
  clawSkillAgentOverlay = document.createElement('div');
  clawSkillAgentOverlay.className = 'choose-shrimp-overlay claw-skill-agent-overlay';
  clawSkillAgentOverlay.setAttribute('aria-hidden', 'true');
  clawSkillAgentOverlay.innerHTML = `
    <div class="choose-shrimp-modal is-single" role="dialog" aria-modal="true" aria-label="添加到智能体">
      <div class="choose-shrimp-titlebar">
        <div class="choose-shrimp-title">添加到智能体</div>
        <button class="choose-shrimp-close" type="button" aria-label="关闭">
          <img src="./icon/skills-detail-close.svg" alt="" />
        </button>
      </div>
      <div class="choose-shrimp-body" role="listbox" aria-label="智能体列表"></div>
      <div class="choose-shrimp-footer">
        <button class="choose-shrimp-selectall" type="button" aria-hidden="true" tabindex="-1">
          <span class="choose-shrimp-checkbox" aria-hidden="true">
            <span class="choose-shrimp-checkbox-bg"></span>
            <span class="choose-shrimp-checkbox-box"></span>
            <img class="choose-shrimp-checkbox-tick" src="./icon/checkbox-check.svg" alt="" />
          </span>
          <span class="choose-shrimp-selectall-text">全选</span>
        </button>
        <div class="choose-shrimp-footer-actions">
          <button class="choose-shrimp-cancel" type="button">取消</button>
          <button class="choose-shrimp-confirm" type="button" disabled>确认</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(clawSkillAgentOverlay);

  clawSkillAgentOverlay.addEventListener('mousedown', e => {
    if (e.target === clawSkillAgentOverlay) closeClawSkillAgentModal();
  });
  clawSkillAgentOverlay.querySelector('.choose-shrimp-close')?.addEventListener('click', closeClawSkillAgentModal);
  clawSkillAgentOverlay.querySelector('.choose-shrimp-cancel')?.addEventListener('click', closeClawSkillAgentModal);
  clawSkillAgentOverlay.querySelector('.choose-shrimp-body')?.addEventListener('click', e => {
    const item = e.target?.closest?.('.choose-shrimp-item');
    if (!item) return;
    clawSkillAgentSelectedId = item.getAttribute('data-id') || '';
    clawSkillAgentOverlay.querySelectorAll('.choose-shrimp-item').forEach(btn => {
      const selected = btn.getAttribute('data-id') === clawSkillAgentSelectedId;
      btn.classList.toggle('is-selected', selected);
      btn.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    clawSkillAgentOverlay.querySelector('.choose-shrimp-confirm').disabled = !clawSkillAgentSelectedId;
  });
  clawSkillAgentOverlay.querySelector('.choose-shrimp-confirm')?.addEventListener('click', () => {
    if (!clawSkillAgentSelectedId) return;
    closeClawSkillAgentModal();
    closeClawSkillDetail();
    showClawSkillAddToast();
  });
  return clawSkillAgentOverlay;
}

function openClawSkillAddAgentModal() {
  const overlay = ensureClawSkillAgentModal();
  const list = overlay.querySelector('.choose-shrimp-body');
  const confirm = overlay.querySelector('.choose-shrimp-confirm');
  const agents = getClawSkillChooseAgents();
  clawSkillAgentSelectedId = '';
  if (confirm) confirm.disabled = true;
  if (list) {
    list.innerHTML = agents.map(agent => `
      <button class="choose-shrimp-item" type="button" data-id="${escapeHtml(agent.id)}" role="option" aria-selected="false">
        <span class="choose-shrimp-checkbox" aria-hidden="true">
          <span class="choose-shrimp-checkbox-bg"></span>
          <span class="choose-shrimp-checkbox-box"></span>
          <img class="choose-shrimp-checkbox-tick" src="./icon/checkbox-check.svg" alt="" />
        </span>
        <span class="choose-shrimp-main">
          <span class="choose-shrimp-avatar-wrap">
            <img class="choose-shrimp-avatar" src="${escapeHtml(agent.avatar)}" alt="" />
          </span>
          <span class="choose-shrimp-text">
            <span class="choose-shrimp-name">${escapeHtml(agent.name)}</span>
            <span class="choose-shrimp-desc">${escapeHtml(agent.desc)}</span>
          </span>
        </span>
      </button>
    `).join('');
  }
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
}

function createClawUserBubble(text) {
  const bubble = document.createElement('div');
  bubble.className = 'claw-chat-user-bubble';
  bubble.textContent = text;
  return bubble;
}

function createClawAddedReply() {
  const reply = document.createElement('div');
  reply.className = 'claw-chat-ai-reply';
  reply.innerHTML = `
    <p class="claw-added-reply-text"></p>
    <div class="claw-reply-actions" hidden>
      <img src="./custom-assets/claw-flow/output-actions.svg" alt="更多建议、重新、搜索、复制、收藏、赞、踩" />
    </div>
    <div class="claw-followups" hidden>
      <button type="button" data-followup="literature"><span>@论文猎手 帮我查些人工智能领域的核心文献</span><i aria-hidden="true"></i></button>
      <button type="button" data-followup="review-plan"><span>帮我整理出这周学习的核心内容和复习计划</span><i aria-hidden="true"></i></button>
      <button type="button" data-followup="calculus"><span>帮我梳理微积分的重点和考点</span><i aria-hidden="true"></i></button>
    </div>
  `;
  bindClawFollowups(reply);
  return reply;
}

const CLAW_FOLLOWUP_REPLIES = {
  literature:
    `收到，我会让 @论文猎手 按“经典基础 + 关键方法 + 近年趋势 + 可引用综述”四条线帮你搭一份人工智能核心文献清单。📚

🔎 我会先这样筛：
1. 先抓经典奠基文献：图灵测试、专家系统、机器学习、深度学习、注意力机制这些关键节点，帮你建立 AI 发展的时间线。
2. 再补核心方法论文：Transformer、BERT/GPT、扩散模型、强化学习、多模态学习、检索增强生成，每个方向挑代表作和高质量综述。
3. 继续看近三年热点：大模型对齐、AI Agent、RAG、长上下文、多模态推理、具身智能、AI 安全评测，优先选顶会、引用高、综述清楚的论文。
4. 最后按你的用途筛一遍：如果是课程作业，我会偏向易读和可引用；如果是论文开题，我会偏向研究空白和方法延展。

🧭 输出会分成三层：
• 必读 5 篇：最能撑起 AI 基础框架的文献。
• 精读 8 篇：每个方向 1-2 篇代表作，附核心贡献和阅读顺序。
• 速读 10 篇：用于扩展背景、补充参考文献和找研究趋势。

📝 每篇我都会标注：论文题目、年份/会议、研究问题、核心方法、为什么重要、适合精读的章节，以及可以直接写进综述里的 1-2 句中文摘要。

如果你要写一篇“人工智能发展综述”，我建议先从 Transformer、生成模型、RAG 和 AI Agent 四个方向入手，因为这几条线最容易串成一篇完整、有重点的文献脉络。`,
  'review-plan':
    `可以，我会把这周学习内容整理成“知识点清单、作业错题、待补漏洞、复习安排、考前速看”五块，帮你从一堆材料里抓出真正要复习的主线。🗂️

📌 第一步：先帮你归类
1. 按课程/章节整理，把课件、笔记、作业、课堂截图、错题归到同一个主题下面。
2. 合并重复知识点，把老师反复强调、作业反复出现、考试高频出现的内容标成重点。
3. 区分“会考”“可能考”“了解即可”三类，避免复习时平均用力。
4. 把本周内容整理成一张总览表：章节、核心概念、典型题型、当前掌握度、下一步动作。

🧠 第二步：拆出学习重点
• 必须掌握：定义、公式、核心定理、基础题型，属于不能丢分的部分。
• 需要巩固：课堂听懂但题目容易卡住的地方，比如步骤缺失、条件没看清、公式选错。
• 考前快速回看：适合做成 1 页速记卡的内容，比如易错点、关键词、解题模板。
• 暂时放后：短期投入产出比不高的拓展内容，先不占用主复习时间。

🧪 第三步：按错题倒推漏洞
我会把错题拆成四种原因：概念不清、公式不熟、步骤断档、审题失误。每道错题都会对应一个补救动作，比如“重看某页课件”“补 3 道同类题”“整理一个公式卡片”。

📅 第四步：给你排 7 天复习计划
Day 1：整理材料，生成知识点地图。
Day 2：复盘必须掌握内容，补齐概念。
Day 3：集中处理作业错题，找同类题训练。
Day 4：做章节小测，检查薄弱点。
Day 5：补难点，整理速记卡。
Day 6：模拟一次考试节奏，限时做题。
Day 7：只看错题本和速记卡，轻量复盘。

✅ 最后我会给你一个可执行清单：今天先看什么、做哪几道题、哪些内容先跳过、睡前用 10 分钟复盘什么。你把课件、笔记或作业发给我后，我还能继续细化到“第几页、第几题、第几个公式”。`,
  calculus:
    `没问题，微积分我会按“考点地图 + 常见题型 + 易错提醒 + 练习策略”来梳理，不只是把概念列一遍。🧮

📍 第一块：极限与连续
重点看等价无穷小、洛必达法则、夹逼准则、左右极限、函数连续性。这里最容易错在“条件没满足就套公式”，比如洛必达要先判断 0/0 或 ∞/∞，连续性也要同时看函数值和极限。

📈 第二块：导数与微分
重点看复合函数求导、隐函数求导、参数方程求导、高阶导数、导数应用。考试常把它和单调性、凹凸性、极值、最值、切线法线一起考。复习时建议把“求导公式表 + 应用题模板”放在一起看。

∫ 第三块：积分
不定积分重点是换元法、分部积分、常见凑微分；定积分重点是几何意义、对称性、变上限积分、反常积分。这里要特别注意上下限、符号、积分区间和是否需要分段。

🧩 第四块：多元函数与级数
多元函数看偏导、全微分、方向导数、极值与条件极值；级数看正项级数、交错级数、幂级数收敛半径和收敛域。这块经常是拉分题，重点是会判断题型，而不是硬背结论。

⚠️ 高频易错点我会单独列：
• 极限题忘记先化简。
• 求导题漏掉链式法则。
• 积分题换元后忘记改上下限。
• 多元极值题只求驻点，不判断性质。
• 级数题只算半径，忘记检查端点。

📝 最后会给你一张复习表：考点、公式、典型题、易错点、推荐练习方式。复习顺序建议是“极限 → 导数 → 积分 → 多元/级数”，每天做 3 道基础题 + 2 道综合题，三天后再做一套限时小测。`,
};

function bindClawFollowups(scope) {
  scope.querySelectorAll?.('.claw-followups button[data-followup]').forEach(button => {
    button.addEventListener('click', () => handleClawFollowup(button.dataset.followup, button.innerText.trim()));
  });
}

function handleClawFollowup(type, question) {
  const article = document.querySelector('#claw-config-page .claw-dialog');
  const response = CLAW_FOLLOWUP_REPLIES[type];
  if (!article || !response) return;

  article.appendChild(createClawUserBubble(question));
  const reply = document.createElement('div');
  reply.className = 'claw-chat-ai-reply';
  reply.innerHTML = `<p class="claw-added-reply-text"></p>`;
  article.appendChild(reply);
  scrollClawDialogToBottom();
  typeClawText(reply.querySelector('.claw-added-reply-text'), response, { speed: 4, step: 1 }).then(scrollClawDialogToBottom);
}

function renderClawTaskCenter() {
  const grid = document.getElementById('claw-task-grid');
  if (!grid) return;

  grid.innerHTML = CLAW_TASK_ITEMS.map(task => `
    <article class="claw-task-card" data-task-id="${escapeHtml(task.id)}">
      <div class="claw-task-card-head">
        <div class="claw-task-title">
          <span class="claw-task-icon" style="--task-avatar: url('${escapeHtml(task.avatar)}')" aria-hidden="true"></span>
          <span>${escapeHtml(task.title)}</span>
        </div>
        <button class="claw-task-switch${task.enabled ? ' is-on' : ''}" type="button" aria-label="${task.enabled ? '关闭' : '开启'}${escapeHtml(task.title)}" aria-pressed="${task.enabled ? 'true' : 'false'}"></button>
      </div>
      <p class="claw-task-desc">${escapeHtml(task.desc)}</p>
      <div class="claw-task-divider"></div>
      <div class="claw-task-card-foot">
        <div class="claw-task-meta">
          <span class="claw-task-clock" aria-hidden="true"></span>
          <span>${escapeHtml(task.schedule)}</span>
          ${task.status ? `<span class="claw-task-status">${escapeHtml(task.status)}</span>` : ''}
        </div>
        <button class="claw-task-more" type="button" aria-label="更多操作" aria-expanded="${activeTaskMenuId === task.id ? 'true' : 'false'}">...</button>
      </div>
      <div class="claw-task-menu" ${activeTaskMenuId === task.id ? '' : 'hidden'}>
        <button class="claw-task-delete-option" type="button">
          <span class="claw-task-delete-icon" aria-hidden="true"></span>
          <span>删除</span>
        </button>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.claw-task-switch').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const card = button.closest('.claw-task-card');
      const task = CLAW_TASK_ITEMS.find(item => item.id === card?.dataset.taskId);
      if (!task) return;
      task.enabled = !task.enabled;
      renderClawTaskCenter();
    });
  });

  grid.querySelectorAll('.claw-task-more').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const taskId = button.closest('.claw-task-card')?.dataset.taskId;
      activeTaskMenuId = activeTaskMenuId === taskId ? null : taskId;
      renderClawTaskCenter();
    });
  });

  grid.querySelectorAll('.claw-task-delete-option').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const taskId = button.closest('.claw-task-card')?.dataset.taskId;
      openTaskDeleteModal(taskId);
    });
  });
}

function openTaskDeleteModal(taskId) {
  const task = CLAW_TASK_ITEMS.find(item => item.id === taskId);
  const modal = document.getElementById('claw-task-delete-modal');
  const title = document.getElementById('claw-task-delete-title');
  if (!task || !modal || !title) return;
  pendingDeleteTaskId = task.id;
  activeTaskMenuId = null;
  title.textContent = `确认删除任务「${task.title}」吗？`;
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
}

function closeTaskDeleteModal() {
  const modal = document.getElementById('claw-task-delete-modal');
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  pendingDeleteTaskId = null;
}

function confirmTaskDelete() {
  if (!pendingDeleteTaskId) return;
  CLAW_TASK_ITEMS = CLAW_TASK_ITEMS.filter(task => task.id !== pendingDeleteTaskId);
  closeTaskDeleteModal();
  renderClawTaskCenter();
}

function syncSubscriptionPlans() {
  if (selectedSubscriptionPlan === 'silver') selectedSubscriptionPlan = 'gold';
  document.querySelectorAll('.claw-plan-card').forEach(card => {
    const selected = card.dataset.plan !== 'silver' && card.dataset.plan === selectedSubscriptionPlan;
    card.classList.toggle('is-selected', selected);
    card.setAttribute('aria-pressed', selected ? 'true' : 'false');
  });
}

function renderExpertMarket() {
  const grid = document.getElementById('expert-team-grid');
  if (!grid) return;
  bindExpertMarketTabs();
  renderExpertMarketSubtabs();

  const isTeamMode = activeExpertMarketPrimary === '一键组队';
  let teams = isTeamMode
    ? getExpertMarketTeamCards()
    : getExpertMarketAgents().filter(({ expert }) => {
        const matchesPrimary = expert.primary === activeExpertMarketPrimary;
        const secondaryList = [expert.secondary, ...(expert.secondaryAlso || [])];
        const matchesSecondary = activeExpertMarketSecondary === '全部' || secondaryList.includes(activeExpertMarketSecondary);
        return matchesPrimary && matchesSecondary;
      });
  if (!isTeamMode && EXPERT_MARKET_SECONDARY_ORDER[activeExpertMarketSecondary]) {
    const order = EXPERT_MARKET_SECONDARY_ORDER[activeExpertMarketSecondary];
    teams = [...teams].sort((a, b) => {
      const aIndex = order.indexOf(a.expert.name);
      const bIndex = order.indexOf(b.expert.name);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
  }
  grid.classList.toggle('is-agent-grid', !isTeamMode);

  if (isTeamMode) {
    grid.innerHTML = teams.map(team => {
      const teamAdded = isMarketTeamFullyAdded(team);
      team.added = teamAdded;
      return `
      <article class="expert-team-card expert-team-${team.tone}" data-team-id="${team.id}">
        <header class="expert-team-head">
          <h3><span>${team.icon}</span>${escapeHtml(team.title)}</h3>
          <button class="expert-team-add${teamAdded ? ' is-added' : ''}" type="button" data-team-id="${team.id}" ${teamAdded ? 'disabled' : ''}>${teamAdded ? '已添加' : '一键添加'}</button>
        </header>
        <div class="expert-person-list">
          ${team.experts.map(expert => `
            <button class="expert-person${expert.added ? ' is-added' : ''}" type="button" data-team-id="${team.id}" data-expert-name="${escapeHtml(expert.name)}">
              <img src="${expert.icon}" alt="" />
              <span>
                <strong>${escapeHtml(expert.name)}</strong>
                <small>${escapeHtml(expert.desc)}</small>
              </span>
            </button>
          `).join('')}
        </div>
      </article>
    `}).join('');
  } else {
    grid.innerHTML = teams.map(({ team, expert }) => `
      <button class="expert-agent-card${expert.added ? ' is-added' : ''}" type="button" data-team-id="${team.id}" data-expert-name="${escapeHtml(expert.name)}">
        <img src="${expert.icon}" alt="" />
        <strong>${escapeHtml(expert.name)}</strong>
        <small>${escapeHtml(expert.desc)}</small>
      </button>
    `).join('');
  }

  grid.querySelectorAll('.expert-person, .expert-agent-card').forEach(item => {
    item.addEventListener('click', () => openExpertDetail(item.dataset.teamId, item.dataset.expertName));
  });
  grid.querySelectorAll('.expert-team-add').forEach(button => {
    button.addEventListener('click', e => {
      e.stopPropagation();
      startExpertTeamAdd(button.dataset.teamId);
    });
  });
}

function bindExpertMarketTabs() {
  const tabs = document.querySelector('.expert-market-tabs');
  if (!tabs || tabs.dataset.bound === 'true') return;
  tabs.dataset.bound = 'true';
  tabs.querySelectorAll('button[data-expert-primary]').forEach(button => {
    button.addEventListener('click', () => {
      activeExpertMarketPrimary = button.dataset.expertPrimary || button.textContent.trim();
      activeExpertMarketSecondary = '全部';
      tabs.querySelectorAll('button').forEach(item => item.classList.toggle('is-active', item === button));
      renderExpertMarket();
      document.querySelector('.expert-market-scroll')?.scrollTo({ top: 0 });
    });
  });
}

function renderExpertMarketSubtabs() {
  const subtabs = document.getElementById('expert-market-subtabs');
  if (!subtabs) return;
  const items = EXPERT_MARKET_SUBTABS[activeExpertMarketPrimary] || [];
  subtabs.hidden = items.length === 0;
  subtabs.innerHTML = items.map(item => `
    <button class="${item === activeExpertMarketSecondary ? 'is-active' : ''}" type="button" data-expert-secondary="${escapeHtml(item)}">${escapeHtml(item)}</button>
  `).join('');
  subtabs.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      activeExpertMarketSecondary = button.dataset.expertSecondary || '全部';
      subtabs.querySelectorAll('button').forEach(item => item.classList.toggle('is-active', item === button));
      renderExpertMarket();
    });
  });
}

function findMarketTeam(teamId) {
  return [...EXPERT_MARKET_TEAMS, ...EXPERT_MARKET_CATALOG_TEAMS].find(team => team.id === teamId);
}

function findMarketExpert(teamId, expertName) {
  const team = findMarketTeam(teamId);
  const expert = team?.experts.find(item => item.name === expertName);
  return expert && team ? { team, expert } : null;
}

function findMarketExpertByName(expertName) {
  for (const team of [...EXPERT_MARKET_TEAMS, ...EXPERT_MARKET_CATALOG_TEAMS]) {
    const expert = team.experts.find(item => item.name === expertName);
    if (expert) return { team, expert };
  }
  return null;
}

function isMarketTeamFullyAdded(team) {
  return !!team?.added || !!team?.experts?.length && team.experts.every(expert => expert.added);
}

function syncExpertPersonState(teamId, expertName) {
  const selector = `.expert-person[data-team-id="${CSS.escape(teamId)}"][data-expert-name="${CSS.escape(expertName)}"]`;
  document.querySelector(selector)?.classList.add('is-added');
  const cardSelector = `.expert-agent-card[data-team-id="${CSS.escape(teamId)}"][data-expert-name="${CSS.escape(expertName)}"]`;
  document.querySelector(cardSelector)?.classList.add('is-added');
}

function syncExpertTeamButton(team) {
  if (!team) return;
  const button = document.querySelector(`.expert-team-add[data-team-id="${CSS.escape(team.id)}"]`);
  if (!button) return;
  const added = isMarketTeamFullyAdded(team);
  button.classList.remove('is-adding');
  button.classList.toggle('is-added', added);
  button.disabled = added;
  button.textContent = added ? '已添加' : '一键添加';
}

function addSingleMarketExpert(teamId, expertName) {
  const found = findMarketExpert(teamId, expertName);
  if (!found || found.expert.added) return;

  found.expert.added = true;
  found.expert.addedAt = ++clawAddedSequence;
  syncExpertPersonState(teamId, expertName);
  if (found.team.experts.every(expert => expert.added)) {
    found.team.added = true;
    syncExpertTeamButton(found.team);
  }
  renderClawAddedAgentList();
  showExpertToast();
}

function openExpertDetail(teamId, expertName) {
  const found = findMarketExpert(teamId, expertName);
  const modal = document.getElementById('expert-detail-modal');
  const body = document.getElementById('expert-detail-body');
  const addButton = document.getElementById('expert-detail-add');
  if (!found || !modal || !body || !addButton) return;

  activeExpertMarketItem = found;
  const skills = found.expert.skills || ['online-search', 'task-planning', 'content-summary', 'workflow-helper'];
  body.innerHTML = `
    <img class="expert-detail-avatar" src="${found.expert.icon}" alt="" />
    <h2 id="expert-detail-title">${escapeHtml(found.expert.name)}</h2>
    <p>${escapeHtml(found.expert.detail || `${found.expert.desc}。我会根据你的目标整理信息、拆解关键步骤，并把可执行建议同步给你。`)}</p>
    <section>
      <h3>核心技能</h3>
      <div class="expert-skill-grid">
        ${skills.map(skill => `<span><b aria-hidden="true"></b>${escapeHtml(skill)}</span>`).join('')}
      </div>
    </section>
  `;
  const added = found.expert.added || isMarketTeamFullyAdded(found.team);
  addButton.textContent = added ? '去使用' : '添加';
  addButton.disabled = false;
  addButton.classList.toggle('is-use', added);
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
}

function closeExpertDetail() {
  const modal = document.getElementById('expert-detail-modal');
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
}

function showExpertToast() {
  const toast = document.getElementById('expert-market-toast');
  if (!toast) return;
  clearTimeout(expertToastTimer);
  toast.classList.add('is-visible');
  toast.setAttribute('aria-hidden', 'false');
  expertToastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.setAttribute('aria-hidden', 'true');
  }, 1800);
}

function startExpertTeamAdd(teamId) {
  const team = findMarketTeam(teamId);
  const button = document.querySelector(`.expert-team-add[data-team-id="${CSS.escape(teamId)}"]`);
  if (!team || !button || isMarketTeamFullyAdded(team) || button.classList.contains('is-adding')) return;

  button.classList.add('is-adding');
  button.disabled = true;
  button.innerHTML = '<span class="expert-add-spinner" aria-hidden="true"></span><span>添加中</span>';

  setTimeout(() => {
    team.added = true;
    const addedAt = ++clawAddedSequence;
    team.experts.forEach(expert => {
      expert.added = true;
      expert.addedAt = addedAt;
      syncExpertPersonState(team.id, expert.name);
    });
    syncExpertTeamButton(team);
    renderClawAddedAgentList();
    showExpertToast();
  }, 1300);
}

function finishClawExpertSetup(queryText, options = {}) {
  if (clawExpertsAdded) return;
  if (options.selectAll) {
    CLAW_EXPERTS.forEach(item => clawSelectedExperts.add(item.id));
  }

  clawExpertsAdded = true;
  CLAW_EXPERTS.forEach(item => {
    if (clawSelectedExperts.has(item.id) && !item.addedAt) item.addedAt = 1;
  });
  updateClawSelectionUI();

  const article = document.querySelector('#claw-config-page .claw-dialog');
  if (!article) return;
  article.appendChild(createClawUserBubble(queryText));
  scrollClawDialogToBottom();

  const replyText = '好的，8 位专家智能体已经配置到位。\n接下来，你可以在输入框里 @ 智能体（比如 @ 课程预习导师 或 @ 论文解读专家），让他们开始干活。也可以直接告诉我的问题，我来搞定。现在手头有什么需要处理的吗？';
  setTimeout(() => {
    const reply = createClawAddedReply();
    article.appendChild(reply);
    scrollClawDialogToBottom();
    typeClawText(reply.querySelector('.claw-added-reply-text'), replyText, { speed: 4, step: 1 }).then(() => {
      reply.querySelector('.claw-reply-actions')?.removeAttribute('hidden');
      reply.querySelector('.claw-followups')?.removeAttribute('hidden');
      scrollClawDialogToBottom();
    });
  }, 520);
}

function handleClawAddFromButton() {
  if (clawSelectedExperts.size === 0 || clawExpertsAdded) return;
  const names = getClawSelectedExpertNames();
  const query = `帮我安装${names.join('、')}这几位专家智能体。`;
  finishClawExpertSetup(query);
}

function getClawComposerText() {
  const editor = document.querySelector('#claw-config-page .claw-fixed-composer .prompt-editor');
  return (editor?.innerText || '').replace(/\u00a0/g, ' ').trim();
}

function clearClawComposerText() {
  const editor = document.querySelector('#claw-config-page .claw-fixed-composer .prompt-editor');
  if (editor) editor.innerHTML = '';
}

function handleClawComposerSend() {
  const text = getClawComposerText();
  if (!text) return;
  clearClawComposerText();
  if (text.includes('全部添加')) {
    finishClawExpertSetup(text, { selectAll: true });
    return;
  }

  const article = document.querySelector('#claw-config-page .claw-dialog');
  if (!article) return;
  article.appendChild(createClawUserBubble(text));
  scrollClawDialogToBottom();
}

document.getElementById('home-claw-chip')?.addEventListener('click', startClawEntryFlow);
document.getElementById('home-sidebar-claw')?.addEventListener('click', startClawEntryFlow);

document.querySelectorAll('.claw-config-sidebar [data-claw-section]').forEach(item => {
  const activate = () => {
    const section = item.dataset.clawSection;
    if (section === 'expert-market' || section === 'skill' || section === 'config' || section === 'task' || section === 'subscription' || section === 'xiaotian') {
      if (section === 'xiaotian') activeClawHomeAgent = CLAW_XIAOTIAN_HOME;
      setClawConfigSection(section);
    }
  };
  item.addEventListener('click', activate);
  item.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    activate();
  });
});

document.querySelectorAll('.claw-xiaotian-main [data-claw-section]').forEach(item => {
  item.addEventListener('click', () => {
    const section = item.dataset.clawSection;
    if (section === 'skill' || section === 'task') setClawConfigSection(section);
  });
});

document.querySelector('#expert-detail-modal .expert-detail-mask')?.addEventListener('click', closeExpertDetail);
document.querySelector('#expert-detail-modal .expert-detail-close')?.addEventListener('click', closeExpertDetail);

document.querySelector('#claw-skill-detail-modal .claw-skill-detail-mask')?.addEventListener('click', closeClawSkillDetail);
document.querySelector('#claw-skill-detail-modal .claw-skill-detail-x')?.addEventListener('click', closeClawSkillDetail);
document.getElementById('claw-skill-detail-add-btn')?.addEventListener('click', openClawSkillAddAgentModal);
document.querySelector('#claw-task-delete-modal .claw-task-delete-mask')?.addEventListener('click', closeTaskDeleteModal);
document.querySelector('#claw-task-delete-modal .claw-task-delete-close')?.addEventListener('click', closeTaskDeleteModal);
document.querySelector('#claw-task-delete-modal .claw-task-delete-cancel')?.addEventListener('click', closeTaskDeleteModal);
document.querySelector('#claw-task-delete-modal .claw-task-delete-confirm')?.addEventListener('click', confirmTaskDelete);
document.querySelectorAll('.claw-plan-card').forEach(card => {
  card.addEventListener('click', () => {
    if (card.dataset.plan === 'silver') return;
    selectedSubscriptionPlan = card.dataset.plan || 'gold';
    syncSubscriptionPlans();
  });
});
document.addEventListener('click', event => {
  if (!event.target.closest?.('.claw-task-card')) {
    activeTaskMenuId = null;
    if (clawConfigSection === 'task') renderClawTaskCenter();
  }
});
document.getElementById('expert-detail-add')?.addEventListener('click', () => {
  if (!activeExpertMarketItem) return;
  const alreadyAdded = activeExpertMarketItem.expert.added || isMarketTeamFullyAdded(activeExpertMarketItem.team);
  if (alreadyAdded) {
    openClawAgentHome(activeExpertMarketItem.expert);
    closeExpertDetail();
    return;
  }
  const teamId = activeExpertMarketItem.team.id;
  const expertName = activeExpertMarketItem.expert.name;
  closeExpertDetail();
  addSingleMarketExpert(teamId, expertName);
});

document.getElementById('agent-select-all')?.addEventListener('click', () => {
  if (clawExpertsAdded) return;
  if (clawSelectedExperts.size === CLAW_EXPERTS.length) {
    clawSelectedExperts.clear();
  } else {
    CLAW_EXPERTS.forEach(item => clawSelectedExperts.add(item.id));
  }
  updateClawSelectionUI();
});

document.getElementById('agent-add-button')?.addEventListener('click', e => {
  e.preventDefault();
  handleClawAddFromButton();
});
document.getElementById('agent-later-button')?.addEventListener('click', e => {
  e.preventDefault();
});

document.querySelector('#claw-config-page .claw-fixed-composer .send-button')?.addEventListener('click', handleClawComposerSend);
document.querySelector('#claw-config-page .claw-fixed-composer')?.addEventListener('submit', e => {
  e.preventDefault();
  handleClawComposerSend();
});
document.querySelector('#claw-config-page .claw-agent-home-composer')?.addEventListener('submit', e => {
  e.preventDefault();
});
document.querySelector('#claw-config-page .claw-agent-home-composer .send-button')?.addEventListener('click', e => {
  e.preventDefault();
});
document.querySelector('#claw-config-page .claw-fixed-composer .prompt-editor')?.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
  e.preventDefault();
  handleClawComposerSend();
});
document.querySelectorAll('#claw-config-page .claw-fixed-composer .pill-art-select[aria-label="技能"], #claw-config-page .claw-agent-home-composer .pill-art-select[aria-label="技能"]').forEach(button => {
  button.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    openClawComposerPopover('skill', button);
  });
});
document.querySelectorAll('#claw-config-page .claw-fixed-composer .pill-art-select[aria-label="提及"], #claw-config-page .claw-agent-home-composer .pill-art-select[aria-label="提及"]').forEach(button => {
  button.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    openClawComposerPopover('mention', button);
  });
});
document.addEventListener('click', event => {
  if (!clawComposerPopover) return;
  const target = event.target;
  if (clawComposerPopover.contains(target)) return;
  if (target.closest?.('#claw-config-page .pill-art-select[aria-label="技能"], #claw-config-page .pill-art-select[aria-label="提及"]')) return;
  closeClawComposerPopover();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeClawComposerPopover();
});

// Start the new demo in front of the existing experience.
const initialClawFlowPage =
  window.location.hash === '#config' || window.location.hash === '#xiaotian' || window.location.hash === '#skill' || window.location.hash === '#expert-market' || window.location.hash === '#task' || window.location.hash === '#subscription'
    ? 'config'
    : window.location.hash === '#loading'
      ? 'loading'
      : 'home';
navHistory.splice(0, navHistory.length, `claw-${initialClawFlowPage}`);
navCursor = 0;
setClawFlowPage(initialClawFlowPage);
if (window.location.hash === '#skill') setClawConfigSection('skill');
if (window.location.hash === '#expert-market') setClawConfigSection('expert-market');
if (window.location.hash === '#task') setClawConfigSection('task');
if (window.location.hash === '#subscription') setClawConfigSection('subscription');
if (window.location.hash === '#xiaotian') setClawConfigSection('xiaotian');
updateNavButtons();
