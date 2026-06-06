const SettingsModule = (() => {
  let activeSection = 'profile';
  let eventsBound = false;

  function init() {
    bindEvents();
  }

  function render() {
    const container = document.getElementById('module-settings');
    if (!container) return;

    const state = store.getState();
    const admins = mockData.admins;

    container.innerHTML = `
      <div class="settings-header">
        <h1 class="settings-header__title">账号设置</h1>
        <button class="btn btn--primary btn--sm" id="saveAllBtn">保存全部</button>
      </div>
      
      <div class="settings-layout">
        <nav class="settings-nav">
          <div class="settings-nav-item ${activeSection === 'profile' ? 'active' : ''}" data-section="profile">
            <span class="settings-nav-item__icon">👤</span>
            <span>个人资料</span>
          </div>
          <div class="settings-nav-item ${activeSection === 'notice' ? 'active' : ''}" data-section="notice">
            <span class="settings-nav-item__icon">📢</span>
            <span>直播公告</span>
          </div>
          <div class="settings-nav-item ${activeSection === 'admin' ? 'active' : ''}" data-section="admin">
            <span class="settings-nav-item__icon">🛡️</span>
            <span>房管管理</span>
          </div>
          <div class="settings-nav-item ${activeSection === 'security' ? 'active' : ''}" data-section="security">
            <span class="settings-nav-item__icon">🔒</span>
            <span>安全设置</span>
          </div>
          <div class="settings-nav-item ${activeSection === 'preference' ? 'active' : ''}" data-section="preference">
            <span class="settings-nav-item__icon">⚙️</span>
            <span>偏好设置</span>
          </div>
        </nav>
        
        <div class="settings-content">
          <div class="settings-section ${activeSection === 'profile' ? 'active' : ''}" id="section-profile">
            <h2 class="settings-section__title">个人资料</h2>
            
            <div class="profile-section">
              <div class="profile-avatar" id="avatarUpload">
                ${utils.getInitials(state.user.name)}
              </div>
              
              <div class="profile-form">
                <div class="profile-form-item">
                  <label class="profile-form-label">昵称</label>
                  <input type="text" class="profile-form-input" id="userNameInput" value="${state.user.name}" maxlength="20">
                </div>
                <div class="profile-form-item">
                  <label class="profile-form-label">主播等级</label>
                  <input type="text" class="profile-form-input" value="LV.${state.user.level}" readonly style="opacity: 0.7;">
                </div>
                <div class="profile-form-item full">
                  <label class="profile-form-label">个人简介</label>
                  <textarea class="profile-form-textarea" id="userDescInput" maxlength="200">${state.user.description}</textarea>
                </div>
              </div>
            </div>
            
            <div class="profile-stats">
              <div class="profile-stat">
                <div class="profile-stat__value">${utils.formatNumber(state.user.followers)}</div>
                <div class="profile-stat__label">粉丝数</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat__value">${utils.formatNumber(state.totalIncome)}</div>
                <div class="profile-stat__label">累计收益</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat__value">${state.replays ? state.replays.length : mockData.replays.length}</div>
                <div class="profile-stat__label">回放数量</div>
              </div>
            </div>
          </div>
          
          <div class="settings-section ${activeSection === 'notice' ? 'active' : ''}" id="section-notice">
            <h2 class="settings-section__title">直播公告</h2>
            
            <div class="notice-editor">
              <label class="notice-editor__label">公告内容</label>
              <textarea class="notice-textarea" id="noticeInput" maxlength="500">${state.notice}</textarea>
            </div>
            
            <div class="notice-preview">
              <div class="notice-preview__label">预览效果</div>
              <div class="notice-preview__content" id="noticePreview">${state.notice}</div>
            </div>
            
            <div class="notice-actions">
              <button class="btn btn--primary btn--sm" id="saveNoticeBtn">保存公告</button>
              <button class="btn btn--secondary btn--sm" id="resetNoticeBtn">重置</button>
            </div>
          </div>
          
          <div class="settings-section ${activeSection === 'admin' ? 'active' : ''}" id="section-admin">
            <div class="admin-section__header">
              <h2 class="settings-section__title" style="margin-bottom:0;padding:0;border:none;">房管管理</h2>
              <button class="admin-add-btn" id="addAdminBtn">+ 添加房管</button>
            </div>
            
            <div class="admin-list" id="adminList">
              ${renderAdminList(admins)}
            </div>
          </div>
          
          <div class="settings-section ${activeSection === 'security' ? 'active' : ''}" id="section-security">
            <h2 class="settings-section__title">安全设置</h2>
            
            <div class="settings-item">
              <div class="settings-item__info">
                <div class="settings-item__title">异常登录提醒</div>
                <div class="settings-item__desc">检测到异常登录时发送通知</div>
              </div>
              <div class="toggle ${state.settings.exceptionAlert ? 'active' : ''}" id="exceptionAlertToggle"></div>
            </div>
            
            <div class="settings-item">
              <div class="settings-item__info">
                <div class="settings-item__title">开播提醒</div>
                <div class="settings-item__desc">开播时推送通知到手机</div>
              </div>
              <div class="toggle active" id="liveAlertToggle"></div>
            </div>
            
            <div class="settings-item">
              <div class="settings-item__info">
                <div class="settings-item__title">礼物特效</div>
                <div class="settings-item__desc">显示礼物动画特效</div>
              </div>
              <div class="toggle ${state.settings.showGiftEffect ? 'active' : ''}" id="giftEffectToggle"></div>
            </div>
            
            <div class="login-records">
              <h3 class="login-records__title">最近登录记录</h3>
              <div class="login-record-list">
                ${renderLoginRecords()}
              </div>
            </div>
            
            <div class="data-reset">
              <h3 class="data-reset__title">数据管理</h3>
              <div class="data-reset__desc">恢复所有数据到初始演示状态，包括标题、封面、屏蔽词、房管、回放、礼物记录等</div>
              <button class="btn btn--danger" id="resetDataBtn">恢复默认数据</button>
            </div>
          </div>
          
          <div class="settings-section ${activeSection === 'preference' ? 'active' : ''}" id="section-preference">
            <h2 class="settings-section__title">偏好设置</h2>
            
            <div class="settings-item">
              <div class="settings-item__info">
                <div class="settings-item__title">自动开播</div>
                <div class="settings-item__desc">到设定时间自动开始直播</div>
              </div>
              <div class="toggle ${state.settings.autoStart ? 'active' : ''}" id="autoStartToggle"></div>
            </div>
            
            <div class="settings-item">
              <div class="settings-item__info">
                <div class="settings-item__title">观众入场提示</div>
                <div class="settings-item__desc">有观众进入时显示提示</div>
              </div>
              <div class="toggle ${state.settings.showViewerEntry ? 'active' : ''}" id="viewerEntryToggle"></div>
            </div>
            
            <div class="settings-item">
              <div class="settings-item__info">
                <div class="settings-item__title">弹幕透明度</div>
                <div class="settings-item__desc">调整弹幕显示的透明度</div>
              </div>
              <input type="range" class="opacity-slider" style="width: 120px;" id="danmakuOpacitySlider" min="20" max="100" value="${state.settings.danmakuOpacity * 100}">
            </div>
            
            <div class="settings-item">
              <div class="settings-item__info">
                <div class="settings-item__title">弹幕速度</div>
                <div class="settings-item__desc">调整弹幕滚动速度</div>
              </div>
              <select class="select-sm" id="danmakuSpeedSelect" style="width: 120px;">
                <option value="slow" ${state.settings.danmakuSpeed === 'slow' ? 'selected' : ''}>慢速</option>
                <option value="normal" ${state.settings.danmakuSpeed === 'normal' ? 'selected' : ''}>中速</option>
                <option value="fast" ${state.settings.danmakuSpeed === 'fast' ? 'selected' : ''}>快速</option>
              </select>
            </div>
            
            <div class="settings-item">
              <div class="settings-item__info">
                <div class="settings-item__title">默认音量</div>
                <div class="settings-item__desc">启动时的默认音量</div>
              </div>
              <input type="range" class="opacity-slider" style="width: 120px;" id="volumeSlider" min="0" max="100" value="${state.settings.volume}">
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderAdminList(admins) {
    const state = store.getState();
    return admins.map(admin => {
      const avatarColor = utils.getAvatarColor(admin.name);
      const avatarText = utils.getInitials(admin.name);
      const perms = state.adminPermissions[admin.id] || {};
      const permLabels = [];
      if (perms.muteUser) permLabels.push('禁言');
      if (perms.deleteMessage) permLabels.push('删弹幕');
      if (perms.handleMic) permLabels.push('连麦');
      if (perms.manageNotice) permLabels.push('公告');
      
      return `
        <div class="admin-card" data-admin-id="${admin.id}">
          <div class="admin-avatar" style="background: ${avatarColor}">${avatarText}</div>
          <div class="admin-info">
            <div class="admin-name">
              ${admin.name}
              <span class="admin-badge">房管</span>
            </div>
            <div class="admin-meta">LV.${admin.level} · 任职 ${formatDays(admin.joinTime)}</div>
            <div class="admin-perms">${permLabels.length > 0 ? permLabels.join(' · ') : '无权限'}</div>
          </div>
          <button class="admin-perms-btn" data-admin-id="${admin.id}" data-action="editPerms">权限</button>
          <button class="admin-remove" data-admin-id="${admin.id}">移除</button>
        </div>
      `;
    }).join('');
  }

  function renderLoginRecords() {
    return mockData.loginRecords.map(record => `
      <div class="login-record-item">
        <div class="login-record-icon">💻</div>
        <div class="login-record-info">
          <div class="login-record-device">${record.device}</div>
          <div class="login-record-location">📍 ${record.location}</div>
        </div>
        <span class="login-record-status ${record.status}">${record.status === 'success' ? '成功' : '失败'}</span>
        <span class="login-record-time">${utils.formatDate(record.time)}</span>
      </div>
    `).join('');
  }

  function bindEvents() {
    if (eventsBound) return;
    eventsBound = true;

    document.addEventListener('click', (e) => {
      const navItem = e.target.closest('.settings-nav-item');
      if (navItem) {
        const section = navItem.dataset.section;
        switchSection(section);
      }

      if (e.target.id === 'saveAllBtn') {
        saveAllSettings();
      }

      if (e.target.id === 'resetDataBtn') {
        if (confirm('确定要恢复所有默认数据吗？此操作不可撤销。')) {
          store.resetToDefault();
          utils.showNotification('已恢复', '所有数据已恢复为默认值', 'success');
          render();
        }
      }

      if (e.target.id === 'avatarUpload') {
        utils.showNotification('提示', '头像上传功能演示中', 'info');
      }

      if (e.target.id === 'saveNoticeBtn') {
        saveNotice();
      }

      if (e.target.id === 'resetNoticeBtn') {
        resetNotice();
      }

      if (e.target.id === 'addAdminBtn') {
        addAdmin();
      }

      const removeBtn = e.target.closest('.admin-remove');
      if (removeBtn) {
        const adminId = removeBtn.dataset.adminId;
        removeAdmin(adminId);
      }

      const permsBtn = e.target.closest('.admin-perms-btn');
      if (permsBtn) {
        const adminId = permsBtn.dataset.adminId;
        editAdminPerms(adminId);
      }

      const toggle = e.target.closest('.toggle');
      if (toggle && toggle.id) {
        toggleSetting(toggle.id);
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.id === 'noticeInput') {
        const preview = document.getElementById('noticePreview');
        if (preview) {
          preview.textContent = e.target.value || '暂无公告';
        }
      }
    });
  }

  function switchSection(section) {
    activeSection = section;
    
    const navItems = document.querySelectorAll('.settings-nav-item');
    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.section === section);
    });
    
    const sections = document.querySelectorAll('.settings-section');
    sections.forEach(sec => {
      sec.classList.toggle('active', sec.id === `section-${section}`);
    });
  }

  function saveAllSettings() {
    const state = store.getState();
    
    const nameInput = document.getElementById('userNameInput');
    const descInput = document.getElementById('userDescInput');
    
    if (nameInput && descInput) {
      store.setState({
        user: {
          ...state.user,
          name: nameInput.value,
          description: descInput.value
        }
      });
    }
    
    utils.showNotification('保存成功', '所有设置已保存', 'success');
  }

  function saveNotice() {
    const input = document.getElementById('noticeInput');
    if (!input) return;
    
    const notice = input.value.trim();
    store.dispatch('UPDATE_NOTICE', notice);
    
    utils.showNotification('保存成功', '直播公告已更新', 'success');
  }

  function resetNotice() {
    const input = document.getElementById('noticeInput');
    const preview = document.getElementById('noticePreview');
    
    if (input) input.value = '欢迎来到直播间，喜欢的话点个关注吧~';
    if (preview) preview.textContent = '欢迎来到直播间，喜欢的话点个关注吧~';
  }

  function addAdmin() {
    const name = prompt('请输入要添加房管的用户名：');
    if (!name) return;
    
    const newAdmin = {
      id: 'admin_' + utils.generateId(),
      name: name,
      level: utils.randomInt(10, 30),
      joinTime: Date.now(),
      isAdmin: true
    };
    
    store.dispatch('ADD_ADMIN', {
      userId: newAdmin.id,
      permissions: {
        muteUser: true,
        deleteMessage: true,
        handleMic: false,
        manageNotice: false
      }
    });
    
    mockData.admins.push(newAdmin);
    
    const list = document.getElementById('adminList');
    if (list) {
      list.innerHTML = renderAdminList(mockData.admins);
    }
    
    utils.showNotification('添加成功', `${name} 已成为房管`, 'success');
  }

  function editAdminPerms(adminId) {
    const state = store.getState();
    const admin = mockData.admins.find(a => a.id === adminId);
    if (!admin) return;
    
    const perms = state.adminPermissions[adminId] || {
      muteUser: false,
      deleteMessage: false,
      handleMic: false,
      manageNotice: false
    };
    
    const muteChecked = perms.muteUser ? 'checked' : '';
    const deleteChecked = perms.deleteMessage ? 'checked' : '';
    const micChecked = perms.handleMic ? 'checked' : '';
    const noticeChecked = perms.manageNotice ? 'checked' : '';
    
    const html = `
      <div style="background: var(--bg-card); border-radius: 12px; padding: 24px; width: 320px;">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; color: var(--text-primary);">编辑房管权限 - ${admin.name}</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-primary);">
            <input type="checkbox" id="perm-mute" ${muteChecked}>
            <span>禁言用户</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-primary);">
            <input type="checkbox" id="perm-delete" ${deleteChecked}>
            <span>删除弹幕</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-primary);">
            <input type="checkbox" id="perm-mic" ${micChecked}>
            <span>处理连麦</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-primary);">
            <input type="checkbox" id="perm-notice" ${noticeChecked}>
            <span>管理公告</span>
          </label>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button id="perm-cancel" style="flex: 1; padding: 10px; border: 1px solid var(--border-light); background: transparent; color: var(--text-primary); border-radius: 6px; cursor: pointer;">取消</button>
          <button id="perm-save" style="flex: 1; padding: 10px; background: var(--accent-primary); color: white; border: none; border-radius: 6px; cursor: pointer;">保存</button>
        </div>
      </div>
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;';
    modal.innerHTML = html;
    document.body.appendChild(modal);
    
    modal.querySelector('#perm-cancel').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    modal.querySelector('#perm-save').onclick = () => {
      const newPerms = {
        muteUser: modal.querySelector('#perm-mute').checked,
        deleteMessage: modal.querySelector('#perm-delete').checked,
        handleMic: modal.querySelector('#perm-mic').checked,
        manageNotice: modal.querySelector('#perm-notice').checked
      };
      
      store.dispatch('UPDATE_ADMIN_PERMISSIONS', {
        userId: adminId,
        permissions: newPerms
      });
      
      const list = document.getElementById('adminList');
      if (list) {
        list.innerHTML = renderAdminList(mockData.admins);
      }
      
      modal.remove();
      utils.showNotification('保存成功', '房管权限已更新', 'success');
    };
  }

  function removeAdmin(adminId) {
    const admin = mockData.admins.find(a => a.id === adminId);
    if (!admin) return;
    
    if (confirm(`确定要移除 ${admin.name} 的房管权限吗？`)) {
      mockData.admins = mockData.admins.filter(a => a.id !== adminId);
      store.dispatch('REMOVE_ADMIN', adminId);
      
      const list = document.getElementById('adminList');
      if (list) {
        list.innerHTML = renderAdminList(mockData.admins);
      }
      
      utils.showNotification('已移除', `${admin.name} 的房管权限已移除`, 'info');
    }
  }

  function toggleSetting(toggleId) {
    const toggle = document.getElementById(toggleId);
    if (!toggle) return;
    
    toggle.classList.toggle('active');
    
    const settingMap = {
      'exceptionAlertToggle': 'exceptionAlert',
      'liveAlertToggle': 'liveAlert',
      'giftEffectToggle': 'showGiftEffect',
      'autoStartToggle': 'autoStart',
      'viewerEntryToggle': 'showViewerEntry'
    };
    
    const state = store.getState();
    const settingKey = settingMap[toggleId];
    if (settingKey) {
      store.setState({
        settings: {
          ...state.settings,
          [settingKey]: toggle.classList.contains('active')
        }
      });
    }
  }

  function formatDays(timestamp) {
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    if (days === 0) return '今天';
    if (days < 30) return days + '天';
    if (days < 365) return Math.floor(days / 30) + '个月';
    return Math.floor(days / 365) + '年';
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
    hide
  };
})();

window.SettingsModule = SettingsModule;
