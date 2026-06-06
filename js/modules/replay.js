const ReplayModule = (() => {
  let currentFilter = 'all';
  let editingReplayId = null;
  let editingCover = '';
  let eventsBound = false;

  function init() {
    const state = store.getState();
    if (state.replays.length === 0) {
      store.setState({ replays: mockData.replays });
    }
    bindEvents();
  }

  function render() {
    const container = document.getElementById('module-replay');
    if (!container) return;

    const state = store.getState();
    let replays = [...state.replays];

    if (currentFilter !== 'all') {
      replays = replays.filter(r => r.status === currentFilter);
    }

    replays.sort((a, b) => b.startTime - a.startTime);

    container.innerHTML = `
      <div class="replay-header">
        <h1 class="replay-header__title">回放管理</h1>
        <div class="replay-header__actions">
          <button class="btn btn--secondary btn--sm" id="refreshReplaysBtn">
            🔄 刷新
          </button>
        </div>
      </div>
      
      <div class="replay-filters">
        <button class="replay-filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">全部</button>
        <button class="replay-filter-btn ${currentFilter === 'published' ? 'active' : ''}" data-filter="published">已发布</button>
        <button class="replay-filter-btn ${currentFilter === 'processing' ? 'active' : ''}" data-filter="processing">处理中</button>
        <button class="replay-filter-btn ${currentFilter === 'draft' ? 'active' : ''}" data-filter="draft">草稿</button>
      </div>
      
      <div class="replay-grid" id="replayGrid">
        ${replays.length === 0 ? renderEmptyState() : replays.map(replay => renderReplayCard(replay)).join('')}
      </div>
      
      <div class="replay-editor" id="replayEditor">
        <div class="replay-editor__modal">
          <div class="replay-editor__header">
            <span class="replay-editor__title">📝 编辑回放</span>
            <button class="replay-editor__close" id="closeEditorBtn">×</button>
          </div>
          <div class="replay-editor__body" id="editorBody">
            ${renderEditorContent()}
          </div>
          <div class="replay-editor__footer">
            <button class="btn btn--secondary" id="cancelEditBtn">取消</button>
            <button class="btn btn--primary" id="saveEditBtn">保存修改</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderReplayCard(replay) {
    const statusText = {
      published: '已发布',
      processing: '处理中',
      draft: '草稿'
    };

    return `
      <div class="replay-card" data-replay-id="${replay.id}">
        <div class="replay-cover">
          ${replay.cover ? `<img src="${replay.cover}" class="replay-cover__img" alt="${replay.title}">` : `<div class="replay-cover__icon">🎬</div>`}
          <span class="replay-status ${replay.status}">${statusText[replay.status]}</span>
          <span class="replay-duration">${utils.formatDuration(replay.duration)}</span>
          <div class="replay-play-btn">▶</div>
        </div>
        <div class="replay-info">
          <div class="replay-title">${replay.title}</div>
          <div class="replay-meta">
            <span class="replay-meta-item">
              <span>👁️</span>
              <span>${utils.formatNumber(replay.views)}</span>
            </span>
            <span class="replay-meta-item">
              <span>👍</span>
              <span>${utils.formatNumber(replay.likes)}</span>
            </span>
          </div>
          <div class="replay-date">${utils.formatDate(replay.startTime)}</div>
        </div>
        <div class="replay-actions">
          <button class="replay-action-btn" data-action="edit" data-replay-id="${replay.id}">
            ✏️ 编辑
          </button>
          <button class="replay-action-btn danger" data-action="delete" data-replay-id="${replay.id}">
            🗑️ 删除
          </button>
        </div>
      </div>
    `;
  }

  function renderEmptyState() {
    return `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">🎬</div>
        <div class="empty-state__title">暂无回放</div>
        <div class="empty-state__desc">开始直播后，系统会自动生成回放</div>
      </div>
    `;
  }

  function renderEditorContent() {
    const replay = store.getState().replays.find(r => r.id === editingReplayId);
    if (!replay) return '';

    return `
      <div class="editor-preview">
        <div class="editor-preview__content">
          ${editingCover ? `<img src="${editingCover}" class="editor-preview__img" alt="封面预览">` : `
            <div class="editor-preview__icon">🎬</div>
            <div>回放预览</div>
          `}
        </div>
      </div>
      
      <div class="editor-timeline">
        <div class="editor-timeline__label">剪辑范围</div>
        <div class="editor-timeline__bar" id="timelineBar">
          <div class="editor-timeline__progress" style="width: 100%;"></div>
          <div class="editor-timeline__markers">
            <div class="timeline-marker start" style="left: 0%;" data-type="start"></div>
            <div class="timeline-marker end" style="left: 100%;" data-type="end"></div>
          </div>
        </div>
        <div class="editor-timeline__time">
          <span>00:00</span>
          <span>${utils.formatTime(replay.duration)}</span>
        </div>
      </div>
      
      <div class="editor-form">
        <div class="editor-form-group full">
          <label class="editor-form-label">回放标题</label>
          <input type="text" class="editor-form-input" id="replayTitleInput" value="${replay.title}" maxlength="50">
        </div>
        
        <div class="editor-form-group">
          <label class="editor-form-label">封面设置</label>
          <div class="editor-cover-upload" id="coverUpload">
            ${editingCover ? `<img src="${editingCover}" class="editor-cover-upload__img" alt="封面">` : `
              <div class="editor-cover-upload__icon">🖼️</div>
              <div class="editor-cover-upload__text">点击上传封面图</div>
            `}
          </div>
        </div>
        
        <div class="editor-form-group">
          <label class="editor-form-label">状态</label>
          <select class="editor-form-input" id="replayStatusSelect">
            <option value="published" ${replay.status === 'published' ? 'selected' : ''}>已发布</option>
            <option value="draft" ${replay.status === 'draft' ? 'selected' : ''}>草稿</option>
          </select>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    if (eventsBound) return;
    eventsBound = true;

    document.addEventListener('click', (e) => {
      const filterBtn = e.target.closest('.replay-filter-btn');
      if (filterBtn) {
        const filter = filterBtn.dataset.filter;
        setFilter(filter);
      }

      if (e.target.id === 'refreshReplaysBtn') {
        refreshReplays();
      }

      const actionBtn = e.target.closest('.replay-action-btn');
      if (actionBtn) {
        e.stopPropagation();
        const action = actionBtn.dataset.action;
        const replayId = actionBtn.dataset.replayId;
        
        if (action === 'edit') {
          openEditor(replayId);
        } else if (action === 'delete') {
          deleteReplay(replayId);
        }
      }

      if (e.target.id === 'closeEditorBtn' || e.target.id === 'cancelEditBtn') {
        closeEditor();
      }

      if (e.target.id === 'saveEditBtn') {
        saveEdit();
      }

      if (e.target.closest('#coverUpload')) {
        utils.selectImage((dataUrl) => {
          editingCover = dataUrl;
          updateEditorCover(dataUrl);
        });
      }

      const card = e.target.closest('.replay-card');
      if (card && !e.target.closest('.replay-action-btn')) {
        const replayId = card.dataset.replayId;
        const replay = store.getState().replays.find(r => r.id === replayId);
        if (replay && replay.status === 'published') {
          utils.showNotification('播放回放', `正在播放: ${replay.title}`, 'info');
        } else if (replay && replay.status === 'processing') {
          utils.showNotification('提示', '回放正在处理中，请稍后', 'warning');
        }
      }
    });

    document.getElementById('replayEditor')?.addEventListener('click', (e) => {
      if (e.target.id === 'replayEditor') {
        closeEditor();
      }
    });
  }

  function setFilter(filter) {
    currentFilter = filter;
    
    const btns = document.querySelectorAll('.replay-filter-btn');
    btns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    const grid = document.getElementById('replayGrid');
    if (grid) {
      const state = store.getState();
      let replays = [...state.replays];
      
      if (filter !== 'all') {
        replays = replays.filter(r => r.status === filter);
      }
      
      replays.sort((a, b) => b.startTime - a.startTime);
      
      grid.innerHTML = replays.length === 0 
        ? renderEmptyState() 
        : replays.map(replay => renderReplayCard(replay)).join('');
    }
  }

  function openEditor(replayId) {
    editingReplayId = replayId;
    const replay = store.getState().replays.find(r => r.id === replayId);
    editingCover = replay ? replay.cover : '';
    
    const editor = document.getElementById('replayEditor');
    const body = document.getElementById('editorBody');
    
    if (editor) {
      editor.classList.add('active');
    }
    if (body) {
      body.innerHTML = renderEditorContent();
    }
  }

  function closeEditor() {
    editingReplayId = null;
    editingCover = '';
    
    const editor = document.getElementById('replayEditor');
    if (editor) {
      editor.classList.remove('active');
    }
  }

  function updateEditorCover(coverUrl) {
    const uploadEl = document.getElementById('coverUpload');
    const previewContent = document.querySelector('.editor-preview__content');
    
    if (uploadEl) {
      if (coverUrl) {
        uploadEl.innerHTML = `<img src="${coverUrl}" class="editor-cover-upload__img" alt="封面">`;
      } else {
        uploadEl.innerHTML = `
          <div class="editor-cover-upload__icon">🖼️</div>
          <div class="editor-cover-upload__text">点击上传封面图</div>
        `;
      }
    }
    
    if (previewContent) {
      if (coverUrl) {
        previewContent.innerHTML = `<img src="${coverUrl}" class="editor-preview__img" alt="封面预览">`;
      } else {
        previewContent.innerHTML = `
          <div class="editor-preview__icon">🎬</div>
          <div>回放预览</div>
        `;
      }
    }
  }

  function saveEdit() {
    if (!editingReplayId) return;

    const titleInput = document.getElementById('replayTitleInput');
    const statusSelect = document.getElementById('replayStatusSelect');
    
    const title = titleInput?.value || '';
    const status = statusSelect?.value || 'draft';

    store.dispatch('UPDATE_REPLAY', { 
      id: editingReplayId, 
      data: { title, status, cover: editingCover } 
    });
    
    utils.showNotification('保存成功', '回放信息已更新', 'success');
    closeEditor();
    render();
  }

  function deleteReplay(replayId) {
    const replay = store.getState().replays.find(r => r.id === replayId);
    if (!replay) return;

    if (confirm(`确定要删除回放 "${replay.title}" 吗？此操作不可恢复。`)) {
      store.dispatch('DELETE_REPLAY', replayId);
      utils.showNotification('已删除', '回放已删除', 'success');
      render();
    }
  }

  function refreshReplays() {
    utils.showNotification('刷新中', '正在获取回放列表...', 'info');
    
    setTimeout(() => {
      utils.showNotification('刷新完成', '回放列表已更新', 'success');
      render();
    }, 1000);
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

window.ReplayModule = ReplayModule;
