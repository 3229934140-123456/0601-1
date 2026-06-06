const AudienceModule = (() => {
  let searchQuery = '';
  let sortBy = 'joinTime';

  function init() {
    generateMicRequests();
  }

  function render() {
    const container = document.getElementById('module-audience');
    if (!container) return;

    const state = store.getState();
    const vipCount = state.audiences.filter(u => u.isVip).length;
    const micRequestCount = state.micRequests.length;

    container.innerHTML = `
      <div class="audience-header">
        <h1 class="audience-header__title">观众列表</h1>
        <div class="audience-header__stats">
          <div class="audience-stat">
            <span class="audience-stat__icon">👥</span>
            <div>
              <div class="audience-stat__value">${state.audiences.length}</div>
              <div class="audience-stat__label">在线观众</div>
            </div>
          </div>
          <div class="audience-stat">
            <span class="audience-stat__icon">👑</span>
            <div>
              <div class="audience-stat__value">${vipCount}</div>
              <div class="audience-stat__label">VIP用户</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="audience-main-grid">
        <div class="audience-list-section">
          <div class="audience-list-section__header">
            <span class="audience-list-section__title">在线观众</span>
            <div class="audience-search">
              <input type="text" id="audienceSearch" placeholder="搜索观众...">
            </div>
          </div>
          <div class="audience-list" id="audienceList">
            ${renderAudienceList()}
          </div>
        </div>
        
        <div class="mic-requests-section">
          <div class="mic-requests">
            <div class="mic-requests__header">
              <span class="mic-requests__title">
                🎤 连麦申请
                ${micRequestCount > 0 ? `<span class="mic-requests__badge">${micRequestCount}</span>` : ''}
              </span>
            </div>
            <div class="mic-requests__list" id="micRequestsList">
              ${renderMicRequests()}
            </div>
          </div>
          
          <div class="connected-mics">
            <div class="connected-mics__header">
              <span class="connected-mics__title">✅ 已连麦 (${state.connectedMics.length})</span>
            </div>
            <div class="connected-mics__list" id="connectedMicsList">
              ${renderConnectedMics()}
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents();
    startSimulatingMicRequests();
  }

  function renderAudienceList() {
    const state = store.getState();
    let audiences = [...state.audiences];

    if (searchQuery) {
      audiences = audiences.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'level') {
      audiences.sort((a, b) => b.level - a.level);
    } else {
      audiences.sort((a, b) => b.joinTime - a.joinTime);
    }

    if (audiences.length === 0) {
      return `
        <div class="no-requests" style="padding: 40px;">
          <div class="no-requests__icon">👥</div>
          <div>暂无观众</div>
        </div>
      `;
    }

    return audiences.map(user => {
      const avatarColor = utils.getAvatarColor(user.name);
      const avatarText = utils.getInitials(user.name);
      
      const badges = [];
      if (user.isVip) badges.push('<span class="audience-badge vip">VIP</span>');
      if (user.isAdmin) badges.push('<span class="audience-badge admin">房管</span>');
      if (user.isMuted) badges.push('<span class="audience-badge muted">禁言</span>');

      return `
        <div class="audience-card" data-user-id="${user.id}">
          <div class="audience-avatar" style="background: ${avatarColor}">${avatarText}</div>
          <div class="audience-info">
            <div class="audience-name">
              ${user.name}
              <span class="audience-badges">
                ${badges.join('')}
              </span>
            </div>
            <div class="audience-meta">
              <span class="audience-level">LV.${user.level}</span>
              <span>·</span>
              <span>${formatJoinTime(user.joinTime)}</span>
            </div>
          </div>
          <div class="audience-actions">
            <button class="audience-action-btn" title="私信" data-action="message">💬</button>
            <button class="audience-action-btn" title="禁言" data-action="mute">🔇</button>
            <button class="audience-action-btn danger" title="踢出" data-action="kick">🚫</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderMicRequests() {
    const state = store.getState();
    const requests = state.micRequests;

    if (requests.length === 0) {
      return `
        <div class="no-requests">
          <div class="no-requests__icon">🎤</div>
          <div>暂无连麦申请</div>
        </div>
      `;
    }

    return requests.map(req => {
      const avatarColor = utils.getAvatarColor(req.userName);
      const avatarText = utils.getInitials(req.userName);
      return `
        <div class="mic-request-item" data-request-id="${req.id}">
          <div class="mic-request-avatar" style="background: ${avatarColor}">${avatarText}</div>
          <div class="mic-request-info">
            <div class="mic-request-name">${req.userName}</div>
            <div class="mic-request-time">申请时间: ${formatJoinTime(req.time)}</div>
          </div>
          <div class="mic-request-actions">
            <button class="mic-accept-btn" data-action="accept" data-request-id="${req.id}">接受</button>
            <button class="mic-reject-btn" data-action="reject" data-request-id="${req.id}">拒绝</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderConnectedMics() {
    const state = store.getState();
    const connected = state.connectedMics;

    if (connected.length === 0) {
      return `
        <div class="no-requests" style="padding: 16px 0;">
          <div style="font-size: 12px; opacity: 0.6;">暂无连麦用户</div>
        </div>
      `;
    }

    return connected.map(userId => {
      const user = store.getState().audiences.find(u => u.id === userId);
      if (!user) return '';
      
      const avatarColor = utils.getAvatarColor(user.name);
      const avatarText = utils.getInitials(user.name);
      return `
        <div class="connected-mic-item" data-user-id="${userId}">
          <div class="connected-mic-avatar" style="background: ${avatarColor}">${avatarText}</div>
          <span class="connected-mic-name">${user.name}</span>
          <span class="connected-mic-status">连麦中</span>
          <button class="mic-volume" title="挂断" data-action="hangup" data-user-id="${userId}">📴</button>
        </div>
      `;
    }).join('');
  }

  function bindEvents() {
    document.addEventListener('click', (e) => {
      const searchInput = e.target.closest('#audienceSearch');
      if (e.target.id === 'audienceSearch') return;

      if (e.target.closest('.audience-action-btn')) {
        const btn = e.target.closest('.audience-action-btn');
        const card = btn.closest('.audience-card');
        const userId = card?.dataset.userId;
        const action = btn.dataset.action;
        
        if (userId && action) {
          handleAudienceAction(userId, action);
        }
      }

      if (e.target.closest('.mic-accept-btn') || e.target.closest('.mic-reject-btn')) {
        const btn = e.target.closest('.mic-accept-btn') || e.target.closest('.mic-reject-btn');
        const requestId = btn.dataset.requestId;
        const action = btn.dataset.action;
        
        if (requestId && action) {
          handleMicRequest(requestId, action);
        }
      }

      if (e.target.closest('.mic-volume') && e.target.dataset.action === 'hangup') {
        const userId = e.target.dataset.userId;
        if (userId) {
          hangupMic(userId);
        }
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.id === 'audienceSearch') {
        searchQuery = e.target.value;
        updateAudienceList();
      }
    });

    store.on('audience:join', () => {
      updateAudienceList();
    });

    store.on('audience:leave', () => {
      updateAudienceList();
    });

    store.on('mic:request', () => {
      updateMicRequests();
    });
  }

  function handleAudienceAction(userId, action) {
    const user = store.getState().audiences.find(u => u.id === userId);
    if (!user) return;

    switch (action) {
      case 'message':
        utils.showNotification('私信', '向 ' + user.name + ' 发送私信', 'info');
        break;
      case 'mute':
        if (user.isMuted) {
          ChatModule.unmuteUser(userId);
        } else {
          ChatModule.muteUser(userId);
        }
        break;
      case 'kick':
        if (confirm('确定要将 ' + user.name + ' 踢出房间吗？')) {
          store.dispatch('REMOVE_AUDIENCE', userId);
          utils.showNotification('已踢出', user.name + ' 已被踢出房间', 'success');
        }
        break;
    }
  }

  function handleMicRequest(requestId, action) {
    const request = store.getState().micRequests.find(r => r.id === requestId);
    if (!request) return;

    if (action === 'accept') {
      store.dispatch('ACCEPT_MIC_REQUEST', requestId);
      utils.showNotification('已接受', request.userName + ' 的连麦申请已接受', 'success');
    } else {
      store.dispatch('REJECT_MIC_REQUEST', requestId);
      utils.showNotification('已拒绝', '已拒绝 ' + request.userName + ' 的连麦申请', 'info');
    }

    updateMicRequests();
    updateConnectedMics();
  }

  function hangupMic(userId) {
    const state = store.getState();
    const connectedMics = state.connectedMics.filter(id => id !== userId);
    store.setState({ connectedMics });
    
    const user = state.audiences.find(u => u.id === userId);
    if (user) {
      utils.showNotification('已挂断', '已与 ' + user.name + ' 断开连麦', 'info');
    }
    
    updateConnectedMics();
  }

  function updateAudienceList() {
    const list = document.getElementById('audienceList');
    if (list) {
      list.innerHTML = renderAudienceList();
    }
  }

  function updateMicRequests() {
    const list = document.getElementById('micRequestsList');
    const badge = document.querySelector('.mic-requests__badge');
    
    const state = store.getState();
    const count = state.micRequests.length;
    
    if (list) {
      list.innerHTML = renderMicRequests();
    }
    
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  function updateConnectedMics() {
    const list = document.getElementById('connectedMicsList');
    if (list) {
      list.innerHTML = renderConnectedMics();
    }
  }

  function generateMicRequests() {
    const users = store.getState().audiences.slice(0, 3);
    const requests = users.map((user, index) => ({
      id: 'mic_req_' + utils.generateId(),
      userId: user.id,
      userName: user.name,
      time: Date.now() - (index + 1) * 60000
    }));
    store.setState({ micRequests: requests });
  }

  let simInterval = null;

  function startSimulatingMicRequests() {
    if (simInterval) return;
    
    simInterval = setInterval(() => {
      const state = store.getState();
      if (!state.isLive) return;
      
      if (Math.random() > 0.92) {
        const randomUser = utils.randomFromArray(state.audiences);
        if (randomUser && !state.micRequests.find(r => r.userId === randomUser.id) && !state.connectedMics.includes(randomUser.id)) {
          const request = {
            id: 'mic_req_' + utils.generateId(),
            userId: randomUser.id,
            userName: randomUser.name,
            time: Date.now()
          };
          store.dispatch('ADD_MIC_REQUEST', request);
          updateMicRequests();
        }
      }
    }, 5000);
  }

  function formatJoinTime(timestamp) {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return hours + '小时前';
    if (minutes > 0) return minutes + '分钟前';
    return '刚刚';
  }

  function show() {
    render();
  }

  function hide() {
    if (simInterval) {
      clearInterval(simInterval);
      simInterval = null;
    }
  }

  return {
    init,
    render,
    show,
    hide
  };
})();

window.AudienceModule = AudienceModule;
