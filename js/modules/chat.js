const ChatModule = (() => {
  let danmakuSpeed = 'normal';
  let danmakuOpacity = 0.9;
  let showDanmaku = true;
  let mutedUsers = [];
  let eventsBound = false;

  function init() {
    const state = store.getState();
    mutedUsers = state.audiences.filter(u => u.isMuted).map(u => u.id);
    bindEvents();
    
    store.subscribe(() => {
      const newState = store.getState();
      mutedUsers = newState.audiences.filter(u => u.isMuted).map(u => u.id);
      updateMessageList();
      updateMuteList();
    });
  }

  function render() {
    const container = document.getElementById('module-chat');
    if (!container) return;

    const state = store.getState();

    container.innerHTML = `
      <div class="chat-header">
        <h1 class="chat-header__title">聊天室</h1>
        <div class="chat-header__stats">
          <div class="chat-stat">
            <span class="chat-stat__icon">👥</span>
            <span class="chat-stat__value">${state.viewerCount}</span>
            <span style="color:var(--text-muted)">在线</span>
          </div>
          <div class="chat-stat">
            <span class="chat-stat__icon">💬</span>
            <span class="chat-stat__value">${state.messages.length}</span>
            <span style="color:var(--text-muted)">弹幕</span>
          </div>
        </div>
      </div>
      
      <div class="chat__layout">
        <div class="chat__main">
          <div class="chat-messages" id="chatMessages"></div>
          
          <div class="chat-input-area">
            <div class="chat-input-wrapper">
              <textarea 
                class="chat-input" 
                id="chatInput" 
                placeholder="发送弹幕..."
                rows="1"
              ></textarea>
              <button class="chat-send-btn" id="sendBtn">发送</button>
            </div>
            <div class="chat-tools">
              <button class="chat-tool-btn" title="表情">😊</button>
              <button class="chat-tool-btn" title="礼物">🎁</button>
              <button class="chat-tool-btn" title="图片">🖼️</button>
              <button class="chat-tool-btn" title=" @">@</button>
              <div style="flex:1"></div>
              <button class="chat-tool-btn" title="清屏" id="clearChatBtn">🧹</button>
              <button class="chat-tool-btn ${showDanmaku ? '' : 'active'}" title="弹幕开关" id="danmakuToggle">
                ${showDanmaku ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
        </div>
        
        <div class="chat__sidebar">
          <div class="sidebar-panel">
            <div class="sidebar-panel__header">
              <span class="sidebar-panel__title">🔇 关键词屏蔽</span>
              <span class="sidebar-panel__count">${state.blockedWords.length}个</span>
            </div>
            <div class="sidebar-panel__body">
              <div class="blocked-words-list" id="blockedWordsList">
                ${state.blockedWords.map(word => `
                  <span class="blocked-word">
                    <span>${word}</span>
                    <span class="blocked-word__remove" data-word="${word}">×</span>
                  </span>
                `).join('')}
              </div>
              <div class="add-blocked-input">
                <input type="text" id="blockedWordInput" placeholder="添加关键词">
                <button class="add-blocked-btn" id="addBlockedBtn">添加</button>
              </div>
            </div>
          </div>
          
          <div class="sidebar-panel">
            <div class="sidebar-panel__header">
              <span class="sidebar-panel__title">🚫 禁言管理</span>
              <span class="sidebar-panel__count">${mutedUsers.length}人</span>
            </div>
            <div class="sidebar-panel__body">
              <div class="moderation-list" id="mutedList">
                ${renderMutedList()}
              </div>
            </div>
          </div>
          
          <div class="sidebar-panel">
            <div class="sidebar-panel__header">
              <span class="sidebar-panel__title">⚙️ 弹幕设置</span>
            </div>
            <div class="sidebar-panel__body">
              <div class="setting-row">
                <span class="setting-label">显示弹幕</span>
                <div class="toggle ${showDanmaku ? 'active' : ''}" id="danmakuToggle2"></div>
              </div>
              <div class="setting-row">
                <span class="setting-label">弹幕速度</span>
                <div class="danmaku-speed">
                  <button class="danmaku-speed-btn ${danmakuSpeed === 'slow' ? 'active' : ''}" data-speed="slow">慢</button>
                  <button class="danmaku-speed-btn ${danmakuSpeed === 'normal' ? 'active' : ''}" data-speed="normal">中</button>
                  <button class="danmaku-speed-btn ${danmakuSpeed === 'fast' ? 'active' : ''}" data-speed="fast">快</button>
                </div>
              </div>
              <div class="setting-row">
                <span class="setting-label">透明度</span>
                <input type="range" class="opacity-slider" id="opacitySlider" min="0" max="100" value="${danmakuOpacity * 100}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    renderMessages();
  }

  function renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const state = store.getState();
    const mutedUserIds = state.audiences.filter(u => u.isMuted).map(u => u.id);
    const messages = state.messages
      .filter(msg => !mutedUserIds.includes(msg.userId) || msg.type === 'system' || msg.type === 'gift')
      .slice(-100);

    container.innerHTML = messages.map(msg => renderMessage(msg)).join('');
    
    container.scrollTop = container.scrollHeight;
  }

  function renderMessage(msg) {
    const avatarColor = utils.getAvatarColor(msg.userName);
    const avatarText = utils.getInitials(msg.userName);

    if (msg.type === 'gift') {
      return `
        <div class="message-item message-gift" data-id="${msg.id}">
          <div class="message-avatar" style="background: ${avatarColor}">${avatarText}</div>
          <div class="message-gift">
            <span class="message-gift__icon">${msg.giftInfo?.icon || '🎁'}</span>
            <div class="message-gift__info">
              <div class="message-gift__sender">${msg.userName} 送出</div>
              <div class="message-gift__name">${msg.giftInfo?.name || '礼物'} x${msg.giftInfo?.count || 1}</div>
            </div>
          </div>
        </div>
      `;
    }

    if (msg.type === 'system') {
      return `
        <div class="message-item message-system" data-id="${msg.id}">
          <span class="message-system__text">${msg.content}</span>
        </div>
      `;
    }

    const badges = [];
    if (msg.isVip) {
      badges.push('<span class="message-badge vip">VIP</span>');
    }
    if (msg.isAdmin) {
      badges.push('<span class="message-badge admin">房管</span>');
    }

    return `
      <div class="message-item" data-id="${msg.id}" data-user-id="${msg.userId || ''}" data-user-name="${msg.userName || ''}">
        <div class="message-avatar" style="background: ${avatarColor}">${avatarText}</div>
        <div class="message-body">
          <div class="message-header">
            ${badges.join('')}
            <span class="message-user ${msg.isVip ? 'vip' : ''}">${msg.userName}</span>
            <span class="message-level">LV.${msg.userLevel || 1}</span>
          </div>
          <div class="message-content">${escapeHtml(msg.content)}</div>
        </div>
        <div class="message-actions">
          <button class="message-action-btn" data-action="delete" data-msg-id="${msg.id}" title="删除消息">🗑️</button>
          <button class="message-action-btn" data-action="mute" data-user-id="${msg.userId}" data-user-name="${msg.userName}" title="禁言">🚫</button>
        </div>
      </div>
    `;
  }

  function renderMutedList() {
    const state = store.getState();
    const muted = state.audiences.filter(u => u.isMuted);
    
    if (muted.length === 0) {
      return '<div style="text-align:center;padding:20px 0;color:var(--text-muted);font-size:13px;">暂无禁言用户</div>';
    }

    return muted.map(user => {
      const avatarColor = utils.getAvatarColor(user.name);
      const avatarText = utils.getInitials(user.name);
      return `
        <div class="moderation-item" data-user-id="${user.id}">
          <div class="moderation-info">
            <div class="moderation-avatar" style="background: ${avatarColor}">${avatarText}</div>
            <span class="moderation-name">${user.name}</span>
          </div>
          <button class="moderation-action unmute" data-user-id="${user.id}">解除禁言</button>
        </div>
      `;
    }).join('');
  }

  function bindEvents() {
    if (eventsBound) return;
    eventsBound = true;

    document.addEventListener('click', (e) => {
      if (e.target.id === 'sendBtn') {
        sendMessage();
      }

      if (e.target.id === 'clearChatBtn') {
        clearChat();
      }

      if (e.target.id === 'danmakuToggle' || e.target.id === 'danmakuToggle2') {
        toggleDanmaku();
      }

      if (e.target.id === 'addBlockedBtn') {
        addBlockedWord();
      }

      if (e.target.classList.contains('blocked-word__remove')) {
        const word = e.target.dataset.word;
        removeBlockedWord(word);
      }

      if (e.target.classList.contains('danmaku-speed-btn')) {
        const speed = e.target.dataset.speed;
        setDanmakuSpeed(speed);
      }

      if (e.target.classList.contains('moderation-action')) {
        const userId = e.target.dataset.userId;
        unmuteUser(userId);
      }

      const actionBtn = e.target.closest('.message-action-btn');
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        if (action === 'delete') {
          const msgId = actionBtn.dataset.msgId;
          deleteMessage(msgId);
        } else if (action === 'mute') {
          const userId = actionBtn.dataset.userId;
          const userName = actionBtn.dataset.userName;
          if (confirm(`确定要禁言 ${userName} 吗？`)) {
            muteUser(userId);
          }
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.target.id === 'chatInput' && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }

      if (e.target.id === 'blockedWordInput' && e.key === 'Enter') {
        addBlockedWord();
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.id === 'opacitySlider') {
        danmakuOpacity = e.target.value / 100;
      }
    });

    store.on('chat:message', (msg) => {
      appendMessage(msg);
    });

    store.on('gift:new', (gift) => {
      const giftMsg = {
        id: 'msg_' + utils.generateId(),
        userId: gift.senderId,
        userName: gift.sender,
        userLevel: 15,
        isVip: true,
        content: '',
        type: 'gift',
        giftInfo: {
          name: gift.name,
          icon: gift.icon,
          count: gift.count,
          value: gift.value
        },
        timestamp: Date.now()
      };
      appendMessage(giftMsg);
    });
  }

  function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;

    const content = input.value.trim();
    if (!content) return;

    const state = store.getState();
    
    if (utils.containsBlockedWord(content, state.blockedWords)) {
      utils.showNotification('发送失败', '消息包含违禁词', 'error');
      return;
    }

    const msg = {
      id: 'msg_' + utils.generateId(),
      userId: state.user.id,
      userName: state.user.name,
      userLevel: state.user.level,
      isVip: false,
      isAdmin: true,
      content: content,
      type: 'normal',
      timestamp: Date.now()
    };

    store.dispatch('ADD_MESSAGE', msg);
    input.value = '';
    input.style.height = 'auto';
  }

  function appendMessage(msg) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const msgEl = document.createElement('div');
    msgEl.innerHTML = renderMessage(msg);
    const msgElement = msgEl.firstElementChild;
    container.appendChild(msgEl.firstElementChild);
    
    container.scrollTop = container.scrollHeight;

    if (container.children.length > 200) {
      container.removeChild(container.firstElementChild);
    }
  }

  function clearChat() {
    if (confirm('确定要清空聊天记录吗？')) {
      const container = document.getElementById('chatMessages');
      if (container) {
        container.innerHTML = '';
      }
      store.setState({ messages: [] });
      utils.showNotification('已清空', '聊天记录已清空', 'success');
    }
  }

  function toggleDanmaku() {
    showDanmaku = !showDanmaku;
    
    const btn = document.getElementById('danmakuToggle');
    if (btn) {
      btn.textContent = showDanmaku ? '👁️' : '👁️‍🗨️';
    }
    
    const toggle = document.getElementById('danmakuToggle2');
    if (toggle) {
      toggle.classList.toggle('active', showDanmaku);
    }

    const messages = document.getElementById('chatMessages');
    if (messages) {
      messages.style.opacity = showDanmaku ? '1' : '0.3';
    }
  }

  function addBlockedWord() {
    const input = document.getElementById('blockedWordInput');
    if (!input) return;

    const word = input.value.trim();
    if (!word) return;

    const state = store.getState();
    if (state.blockedWords.includes(word)) {
      utils.showNotification('提示', '该关键词已存在', 'warning');
      return;
    }

    store.dispatch('ADD_BLOCKED_WORD', word);
    input.value = '';
    
    const list = document.getElementById('blockedWordsList');
    if (list) {
      const wordEl = document.createElement('span');
      wordEl.className = 'blocked-word';
      wordEl.innerHTML = `
        <span>${word}</span>
        <span class="blocked-word__remove" data-word="${word}">×</span>
      `;
      list.appendChild(wordEl);
    }

    const countEl = document.querySelector('.sidebar-panel__count');
    if (countEl) {
      countEl.textContent = store.getState().blockedWords.length + '个';
    }

    utils.showNotification('已添加', `已添加屏蔽词：${word}`, 'success');
  }

  function removeBlockedWord(word) {
    store.dispatch('REMOVE_BLOCKED_WORD', word);
    
    const list = document.getElementById('blockedWordsList');
    if (list) {
      const items = list.querySelectorAll('.blocked-word__remove');
      items.forEach(item => {
        if (item.dataset.word === word) {
          item.parentElement.remove();
        }
      });
    }

    const countEl = document.querySelector('.sidebar-panel__count');
    if (countEl) {
      countEl.textContent = store.getState().blockedWords.length + '个';
    }

    utils.showNotification('已移除', `已移除屏蔽词：${word}`, 'info');
  }

  function setDanmakuSpeed(speed) {
    danmakuSpeed = speed;
    
    const btns = document.querySelectorAll('.danmaku-speed-btn');
    btns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.speed === speed);
    });
  }

  function deleteMessage(msgId) {
    store.dispatch('DELETE_MESSAGE', msgId);
    utils.showNotification('已删除', '该消息已被删除', 'success');
  }

  function muteUser(userId) {
    store.dispatch('MUTE_AUDIENCE', userId);
    
    const user = store.getState().audiences.find(u => u.id === userId);
    if (user) {
      utils.showNotification('已禁言', `${user.name} 已被禁言`, 'success');
      updateMutedList();
    }
  }

  function unmuteUser(userId) {
    store.dispatch('UNMUTE_AUDIENCE', userId);
    
    const user = store.getState().audiences.find(u => u.id === userId);
    if (user) {
      utils.showNotification('已解禁', `${user.name} 已解除禁言`, 'success');
      updateMutedList();
    }
  }

  function updateMutedList() {
    const list = document.getElementById('mutedList');
    if (list) {
      list.innerHTML = renderMutedList();
    }
    
    const state = store.getState();
    mutedUsers = state.audiences.filter(u => u.isMuted).map(u => u.id);
    
    const countEl = document.querySelectorAll('.sidebar-panel__count');
    if (countEl[1]) {
      countEl[1].textContent = mutedUsers.length + '人';
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function show() {
    render();
  }

  function hide() {
  }

  return {
    init,
    render,
    show,
    hide,
    muteUser,
    unmuteUser
  };
})();

window.ChatModule = ChatModule;
