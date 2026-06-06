const ConsoleModule = (() => {
  let timerInterval = null;
  let currentDuration = 0;

  function init() {
    render();
    bindEvents();
    initData();
  }

  function render() {
    const container = document.getElementById('module-console');
    const state = store.getState();
    
    container.innerHTML = `
      <div class="console-header">
        <h1 class="console-header__title">开播控制台</h1>
        <div class="console-header__status">
          <span class="status-dot ${state.isLive ? 'live' : ''}"></span>
          <span class="status-text ${state.isLive ? 'live' : ''}">${state.isLive ? '直播中' : '未开播'}</span>
        </div>
      </div>
      
      <div class="console__grid">
        <div class="console__left">
          <div class="live-control-panel ${state.isLive ? 'live' : ''}" id="liveControlPanel">
            <div class="duration-display">
              <div class="duration-label">直播时长</div>
              <div class="duration-time" id="durationTime">${utils.formatTime(state.duration || 0)}</div>
            </div>
            <button class="live-button ${state.isLive ? 'live' : ''}" id="liveButton">
              ${state.isLive ? '结束直播' : '开始直播'}
            </button>
            <div class="stats-row">
              <div class="stat-item">
                <div class="stat-value" id="viewerCount">${utils.formatNumber(state.viewerCount)}</div>
                <div class="stat-label">观看人数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value" id="likeCount">${utils.formatNumber(state.likeCount)}</div>
                <div class="stat-label">点赞数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value" id="msgCount">${state.messages.length}</div>
                <div class="stat-label">弹幕数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value" id="incomeCount">¥${state.todayIncome.toFixed(0)}</div>
                <div class="stat-label">今日收益</div>
              </div>
            </div>
          </div>
          
          <div class="check-panel">
            <div class="check-panel__header">
              <span class="check-panel__title">
                <span class="check-panel__icon">🔍</span>
                开播检查
              </span>
              <span class="check-panel__action" id="recheckBtn">重新检测</span>
            </div>
            <div class="check-list" id="checkList"></div>
          </div>
        </div>
        
        <div class="console__right">
          <div class="info-panel">
            <div class="info-panel__header">
              <span class="info-panel__title">📝 直播信息</span>
            </div>
            <div class="info-panel__body">
              <div class="form-group">
                <label class="form-label">直播标题</label>
                <input type="text" class="title-input" id="titleInput" 
                       value="${state.title}" placeholder="请输入直播标题" maxlength="50">
              </div>
              <div class="form-group">
                <label class="form-label">分类</label>
                <select class="category-select" id="categorySelect">
                  ${mockData.categories.map(cat => 
                    `<option value="${cat.id}" ${state.category === cat.name ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">直播封面</label>
                <div class="cover-upload" id="coverUpload">
                  ${state.cover ? `<img src="${state.cover}" class="cover-upload__img" alt="封面">` : `
                    <span class="cover-upload__icon">🖼️</span>
                    <span class="cover-upload__text">点击上传封面</span>
                  `}
                </div>
              </div>
            </div>
          </div>
          
          <div class="quick-stats">
            <div class="quick-stat">
              <div class="quick-stat__value">${utils.formatNumber(state.user.followers)}</div>
              <div class="quick-stat__label">粉丝数</div>
            </div>
            <div class="quick-stat">
              <div class="quick-stat__value">${utils.formatNumber(state.totalIncome)}</div>
              <div class="quick-stat__label">累计收益</div>
            </div>
          </div>
          
          <div class="shortcuts-panel">
            <div class="shortcuts-panel__header">
              <span class="shortcuts-panel__title">⌨️ 快捷键</span>
            </div>
            <div class="shortcuts-list">
              <div class="shortcut-item">
                <span class="shortcut-name">开始/停止直播</span>
                <span class="shortcut-key">Ctrl + S</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-name">切换场景</span>
                <span class="shortcut-key">Ctrl + 1-4</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-name">静音麦克风</span>
                <span class="shortcut-key">Ctrl + M</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-name">开启/关闭弹幕</span>
                <span class="shortcut-key">Ctrl + D</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    renderCheckList();
  }

  function renderCheckList() {
    const list = document.getElementById('checkList');
    if (!list) return;
    
    list.innerHTML = mockData.checkItems.map(item => `
      <div class="check-item">
        <div class="check-icon ${item.status}">
          ${item.status === 'success' ? '✓' : item.status === 'warning' ? '!' : '✕'}
        </div>
        <div class="check-content">
          <div class="check-name">${item.name}</div>
          <div class="check-desc">${item.desc}</div>
        </div>
      </div>
    `).join('');
  }

  function bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'liveButton') {
        toggleLive();
      }
      
      if (e.target.id === 'recheckBtn') {
        recheck();
      }
      
      if (e.target.closest('#coverUpload')) {
        utils.selectImage((dataUrl) => {
          store.dispatch('UPDATE_LIVE_INFO', {
            title: store.getState().title,
            category: store.getState().category,
            cover: dataUrl
          });
          updateCoverPreview(dataUrl);
          utils.showNotification('上传成功', '直播封面已更新', 'success');
        });
      }
    });
    
    document.addEventListener('input', (e) => {
      if (e.target.id === 'titleInput') {
        store.dispatch('UPDATE_LIVE_INFO', { 
          title: e.target.value,
          category: store.getState().category,
          cover: store.getState().cover
        });
      }
    });
    
    document.addEventListener('change', (e) => {
      if (e.target.id === 'categorySelect') {
        const cat = mockData.categories.find(c => c.id === e.target.value);
        store.dispatch('UPDATE_LIVE_INFO', { 
          title: store.getState().title,
          category: cat ? cat.name : '娱乐',
          cover: store.getState().cover
        });
      }
    });
    
    store.subscribe((state) => {
      updateLiveStatus(state);
      updateStats(state);
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        toggleLive();
      }
    });
  }

  function initData() {
    const audiences = generateMockAudiences(15);
    audiences.forEach(user => {
      store.setState({ audiences: [...store.getState().audiences, user] });
    });
    store.setState({ viewerCount: audiences.length });
    
    const messages = generateMockMessages(10);
    messages.forEach(msg => {
      store.setState({ messages: [...store.getState().messages, msg] });
    });
    
    const gifts = generateMockGifts(5);
    let income = 0;
    gifts.forEach(gift => {
      store.setState({ giftHistory: [...store.getState().giftHistory, gift] });
      income += gift.value * gift.count;
    });
    store.setState({ todayIncome: income });
  }

  function toggleLive() {
    const state = store.getState();
    
    if (state.isLive) {
      stopLive();
    } else {
      startLive();
    }
  }

  function startLive() {
    const checkResults = mockData.checkItems;
    const hasError = checkResults.some(item => item.status === 'error');
    
    if (hasError) {
      utils.showNotification('无法开播', '请先解决开播检查中的错误项', 'error');
      return;
    }
    
    store.dispatch('START_LIVE');
    utils.showNotification('开播成功', '直播已开始，祝直播顺利！', 'success');
    
    startTimer();
    startSimulation();
    
    updateSidebarStatus(true);
  }

  function stopLive() {
    if (confirm('确定要结束直播吗？')) {
      store.dispatch('STOP_LIVE');
      stopTimer();
      stopSimulation();
      
      const state = store.getState();
      const replay = {
        id: 'replay_' + utils.generateId(),
        title: state.title,
        cover: '',
        duration: state.duration,
        startTime: state.startTime,
        views: 0,
        likes: 0,
        status: 'processing'
      };
      store.dispatch('ADD_REPLAY', replay);
      
      utils.showNotification('直播结束', `本次直播时长 ${utils.formatDuration(state.duration)}，收益 ¥${state.todayIncome.toFixed(2)}`, 'info');
      
      updateSidebarStatus(false);
    }
  }

  function startTimer() {
    if (timerInterval) return;
    
    const startTime = store.getState().startTime || Date.now();
    
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      store.dispatch('UPDATE_DURATION', elapsed);
      
      const durationEl = document.getElementById('durationTime');
      if (durationEl) {
        durationEl.textContent = utils.formatTime(elapsed);
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  let simInterval = null;
  
  function startSimulation() {
    if (simInterval) return;
    
    simInterval = setInterval(() => {
      const state = store.getState();
      if (!state.isLive) return;
      
      const rand = Math.random();
      
      if (rand < 0.3) {
        const msg = generateRandomMessage();
        store.dispatch('ADD_MESSAGE', msg);
      }
      
      if (rand > 0.3 && rand < 0.45) {
        const gift = generateRandomGift();
        store.dispatch('ADD_GIFT', gift);
        utils.showGiftToast(gift);
      }
      
      if (rand > 0.9) {
        store.dispatch('ADD_LIKE');
      }
      
      if (rand > 0.92) {
        const change = Math.random() > 0.5 ? 1 : -1;
        if (change > 0) {
          store.dispatch('ADD_VIEWER');
        } else {
          store.dispatch('REMOVE_VIEWER');
        }
      }
      
      if (rand > 0.97) {
        const user = generateMockAudience();
        store.dispatch('ADD_AUDIENCE', user);
      }
    }, 2000);
  }

  function stopSimulation() {
    if (simInterval) {
      clearInterval(simInterval);
      simInterval = null;
    }
  }

  function recheck() {
    const recheckBtn = document.getElementById('recheckBtn');
    if (recheckBtn) {
      recheckBtn.textContent = '检测中...';
    }
    
    setTimeout(() => {
      mockData.checkItems.forEach((item, index) => {
        if (Math.random() > 0.7) {
          mockData.checkItems[index].status = 'success';
          mockData.checkItems[index].desc = '检测通过';
        }
      });
      renderCheckList();
      if (recheckBtn) {
        recheckBtn.textContent = '重新检测';
      }
      utils.showNotification('检测完成', '开播检查已更新', 'success');
    }, 1500);
  }

  function updateLiveStatus(state) {
    const panel = document.getElementById('liveControlPanel');
    const btn = document.getElementById('liveButton');
    const statusDot = document.querySelector('.console-header__status .status-dot');
    const statusText = document.querySelector('.console-header__status .status-text');
    
    if (panel) {
      panel.classList.toggle('live', state.isLive);
    }
    if (btn) {
      btn.classList.toggle('live', state.isLive);
      btn.textContent = state.isLive ? '结束直播' : '开始直播';
    }
    if (statusDot) {
      statusDot.classList.toggle('live', state.isLive);
    }
    if (statusText) {
      statusText.classList.toggle('live', state.isLive);
      statusText.textContent = state.isLive ? '直播中' : '未开播';
    }
  }

  function updateStats(state) {
    const viewerEl = document.getElementById('viewerCount');
    const likeEl = document.getElementById('likeCount');
    const msgEl = document.getElementById('msgCount');
    const incomeEl = document.getElementById('incomeCount');
    
    if (viewerEl) viewerEl.textContent = utils.formatNumber(state.viewerCount);
    if (likeEl) likeEl.textContent = utils.formatNumber(state.likeCount);
    if (msgEl) msgEl.textContent = state.messages.length;
    if (incomeEl) incomeEl.textContent = '¥' + state.todayIncome.toFixed(0);
  }

  function updateCoverPreview(coverUrl) {
    const uploadEl = document.getElementById('coverUpload');
    if (!uploadEl) return;
    
    if (coverUrl) {
      uploadEl.innerHTML = `<img src="${coverUrl}" class="cover-upload__img" alt="封面">`;
    } else {
      uploadEl.innerHTML = `
        <span class="cover-upload__icon">🖼️</span>
        <span class="cover-upload__text">点击上传封面</span>
      `;
    }
  }

  function updateSidebarStatus(isLive) {
    const statusEl = document.getElementById('liveStatus');
    if (!statusEl) return;
    
    statusEl.classList.toggle('live', isLive);
    const textEl = statusEl.querySelector('.live-text');
    if (textEl) {
      textEl.textContent = isLive ? '直播中' : '未开播';
    }
  }

  function generateMockAudiences(count) {
    const audiences = [];
    const usedNames = new Set();
    
    for (let i = 0; i < count; i++) {
      let name;
      do {
        name = utils.randomFromArray(mockData.mockUserNames);
      } while (usedNames.has(name));
      usedNames.add(name);
      
      audiences.push({
        id: 'user_' + utils.generateId(),
        name: name,
        level: utils.randomInt(1, 40),
        isVip: Math.random() > 0.8,
        isMuted: false,
        isAdmin: false,
        joinTime: Date.now() - utils.randomInt(60000, 1800000)
      });
    }
    
    return audiences;
  }

  function generateMockAudience() {
    const name = utils.randomFromArray(mockData.mockUserNames);
    return {
      id: 'user_' + utils.generateId(),
      name: name,
      level: utils.randomInt(1, 40),
      isVip: Math.random() > 0.85,
      isMuted: false,
      isAdmin: false,
      joinTime: Date.now()
    };
  }

  function generateMockMessages(count) {
    const messages = [];
    const state = store.getState();
    const audiences = state.audiences.length > 0 ? state.audiences : generateMockAudiences(5);
    
    for (let i = 0; i < count; i++) {
      const user = utils.randomFromArray(audiences);
      messages.push({
        id: 'msg_' + utils.generateId(),
        userId: user.id,
        userName: user.name,
        userLevel: user.level,
        isVip: user.isVip,
        content: utils.randomFromArray(mockData.mockMessages),
        type: 'normal',
        timestamp: Date.now() - (count - i) * 5000
      });
    }
    
    return messages;
  }

  function generateRandomMessage() {
    const state = store.getState();
    const audiences = state.audiences;
    if (audiences.length === 0) return null;
    
    const user = utils.randomFromArray(audiences);
    let content = utils.randomFromArray(mockData.mockMessages);
    
    if (utils.containsBlockedWord(content, state.blockedWords)) {
      content = utils.filterMessage(content, state.blockedWords);
    }
    
    return {
      id: 'msg_' + utils.generateId(),
      userId: user.id,
      userName: user.name,
      userLevel: user.level,
      isVip: user.isVip,
      content: content,
      type: 'normal',
      timestamp: Date.now()
    };
  }

  function generateRandomGift() {
    const state = store.getState();
    const audiences = state.audiences;
    if (audiences.length === 0) return null;
    
    const user = utils.randomFromArray(audiences);
    const gift = utils.randomFromArray(mockData.gifts);
    const count = utils.randomInt(1, 10);
    
    return {
      id: 'gift_' + utils.generateId(),
      giftId: gift.id,
      name: gift.name,
      icon: gift.icon,
      value: gift.value,
      count: count,
      sender: user.name,
      senderId: user.id,
      time: Date.now()
    };
  }

  function generateMockGifts(count) {
    const gifts = [];
    for (let i = 0; i < count; i++) {
      gifts.push(generateRandomGift());
    }
    return gifts.filter(g => g !== null);
  }

  return {
    init,
    render
  };
})();

window.ConsoleModule = ConsoleModule;
