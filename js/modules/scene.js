const SceneModule = (() => {
  let scenes = [];
  let currentSceneId = null;
  let selectedSourceId = null;
  let volumes = {
    mic: 70,
    system: 60,
    bgm: 30
  };
  let muted = {
    mic: false,
    system: false,
    bgm: false
  };
  let waveformInterval = null;
  let eventsBound = false;

  function init() {
    scenes = JSON.parse(JSON.stringify(mockData.scenes));
    currentSceneId = scenes[0]?.id || null;
    bindEvents();
  }

  function render() {
    const container = document.getElementById('module-scene');
    if (!container) return;

    container.innerHTML = `
      <div class="scene-header mb-4">
        <h1 class="scene-header__title">画面管理</h1>
        <div class="tab-buttons" style="width: auto; min-width: 200px;">
          <button class="tab-btn active" data-source-type="video">视频源</button>
          <button class="tab-btn" data-source-type="audio">音频</button>
        </div>
      </div>
      
      <div class="scene__layout">
        <div class="scene__main">
          <div class="preview-container">
            <div class="preview-header">
              <span class="preview-title" id="currentSceneName">摄像头</span>
              <span class="preview-badge">LIVE</span>
            </div>
            <div class="preview-content" id="previewContent">
              <div class="preview-placeholder">
                <div class="preview-placeholder__icon">🎥</div>
                <div class="preview-placeholder__text">预览画面</div>
                <div class="preview-placeholder__desc">当前场景：摄像头</div>
              </div>
            </div>
            <div class="preview-footer">
              <div class="preview-info">
                <div class="preview-info-item">
                  <span>📹</span>
                  <span>1920×1080</span>
                </div>
                <div class="preview-info-item">
                  <span>⏱️</span>
                  <span>30fps</span>
                </div>
                <div class="preview-info-item">
                  <span>💾</span>
                  <span>6000 Kbps</span>
                </div>
              </div>
              <div class="preview-actions">
                <button class="preview-btn" id="fullscreenBtn" title="全屏">⛶</button>
                <button class="preview-btn" id="snapshotBtn" title="截图">📷</button>
              </div>
            </div>
          </div>
          
          <div class="source-settings" id="sourceSettings">
            <div class="source-settings__title">源设置</div>
            <div class="source-setting-item">
              <div class="source-setting-item__label">设备</div>
              <select class="select-sm">
                <option>主摄像头 (HD Webcam)</option>
                <option>USB 摄像头</option>
              </select>
            </div>
            <div class="source-setting-item">
              <div class="source-setting-item__label">分辨率</div>
              <select class="select-sm">
                <option>1920×1080 (1080p)</option>
                <option>1280×720 (720p)</option>
                <option>854×480 (480p)</option>
              </select>
            </div>
            <div class="source-setting-item">
              <div class="source-setting-item__label">帧率</div>
              <select class="select-sm">
                <option>30 fps</option>
                <option>60 fps</option>
                <option>24 fps</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="scene__sidebar">
          <div class="scene-panel">
            <div class="scene-panel__header">
              <span class="scene-panel__title">场景</span>
              <button class="scene-panel__add" id="addSceneBtn" title="添加场景">+</button>
            </div>
            <div class="scene-list" id="sceneList"></div>
          </div>
          
          <div class="sources-panel">
            <div class="sources-panel__header">
              <span class="sources-panel__title">来源</span>
              <button class="scene-panel__add" id="addSourceBtn" title="添加来源">+</button>
            </div>
            <div class="sources-list" id="sourcesList"></div>
          </div>
          
          <div class="audio-panel">
            <div class="audio-panel__header">
              <span class="audio-panel__title">音频混音</span>
            </div>
            <div class="audio-list">
              <div class="audio-item">
                <div class="audio-item__header">
                  <span class="audio-item__name">
                    <span class="audio-item__icon">🎤</span>
                    麦克风
                  </span>
                  <button class="audio-item__mute ${muted.mic ? 'active' : ''}" data-audio="mic" title="静音">
                    ${muted.mic ? '🔇' : '🔊'}
                  </button>
                </div>
                <div class="volume-slider" data-audio="mic">
                  <div class="volume-slider__fill" style="width: ${volumes.mic}%"></div>
                  <div class="volume-slider__thumb" style="left: ${volumes.mic}%"></div>
                </div>
                <canvas class="waveform-canvas" id="micWaveform"></canvas>
                <div class="volume-value">${volumes.mic}%</div>
              </div>
              
              <div class="audio-item">
                <div class="audio-item__header">
                  <span class="audio-item__name">
                    <span class="audio-item__icon">🔊</span>
                    系统音量
                  </span>
                  <button class="audio-item__mute ${muted.system ? 'active' : ''}" data-audio="system" title="静音">
                    ${muted.system ? '🔇' : '🔊'}
                  </button>
                </div>
                <div class="volume-slider" data-audio="system">
                  <div class="volume-slider__fill" style="width: ${volumes.system}%"></div>
                  <div class="volume-slider__thumb" style="left: ${volumes.system}%"></div>
                </div>
                <canvas class="waveform-canvas" id="systemWaveform"></canvas>
                <div class="volume-value">${volumes.system}%</div>
              </div>
              
              <div class="audio-item">
                <div class="audio-item__header">
                  <span class="audio-item__name">
                    <span class="audio-item__icon">🎵</span>
                    背景音乐
                  </span>
                  <button class="audio-item__mute ${muted.bgm ? 'active' : ''}" data-audio="bgm" title="静音">
                    ${muted.bgm ? '🔇' : '🎵'}
                  </button>
                </div>
                <div class="volume-slider" data-audio="bgm">
                  <div class="volume-slider__fill" style="width: ${volumes.bgm}%"></div>
                  <div class="volume-slider__thumb" style="left: ${volumes.bgm}%"></div>
                </div>
                <div class="volume-value">${volumes.bgm}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    renderSceneList();
    renderSourcesList();
    startWaveformAnimation();
  }

  function renderSceneList() {
    const list = document.getElementById('sceneList');
    if (!list) return;

    const sceneIcons = {
      camera: '📷',
      screen: '🖥️',
      game: '🎮',
      image: '🖼️'
    };

    list.innerHTML = scenes.map(scene => `
      <div class="scene-item ${scene.id === currentSceneId ? 'active' : ''}" data-scene-id="${scene.id}">
        <div class="scene-item__icon">${sceneIcons[scene.type] || '📹'}</div>
        <div class="scene-item__info">
          <div class="scene-item__name">${scene.name}</div>
          <div class="scene-item__desc">${scene.sources.length} 个来源</div>
        </div>
        <div class="scene-item__actions">
          <button class="audio-item__mute" style="width:24px;height:24px;font-size:11px;">⚙</button>
        </div>
      </div>
    `).join('');
  }

  function renderSourcesList() {
    const list = document.getElementById('sourcesList');
    if (!list) return;

    const currentScene = scenes.find(s => s.id === currentSceneId);
    if (!currentScene) return;

    const sourceIcons = {
      camera: '📷',
      screen: '🖥️',
      game: '🎮',
      image: '🖼️'
    };

    list.innerHTML = currentScene.sources.map(source => `
      <div class="source-item ${source.id === selectedSourceId ? 'selected' : ''}" data-source-id="${source.id}">
        <div class="source-item__visibility ${source.visible ? 'visible' : ''}" data-source-id="${source.id}">
          ${source.visible ? '👁️' : '👁️‍🗨️'}
        </div>
        <div class="source-item__icon">${sourceIcons[source.type] || '📹'}</div>
        <span class="source-item__name">${source.name}</span>
        <div class="source-item__drag">⋮⋮</div>
      </div>
    `).join('');
  }

  function bindEvents() {
    if (eventsBound) return;
    eventsBound = true;

    document.addEventListener('click', (e) => {
      const sceneItem = e.target.closest('.scene-item');
      if (sceneItem) {
        const sceneId = sceneItem.dataset.sceneId;
        switchScene(sceneId);
      }

      const visibilityBtn = e.target.closest('.source-item__visibility');
      if (visibilityBtn) {
        e.stopPropagation();
        const sourceId = visibilityBtn.dataset.sourceId;
        toggleSourceVisibility(sourceId);
      }

      const sourceItem = e.target.closest('.source-item');
      if (sourceItem && !e.target.closest('.source-item__visibility')) {
        const sourceId = sourceItem.dataset.sourceId;
        selectSource(sourceId);
      }

      const muteBtn = e.target.closest('.audio-item__mute');
      if (muteBtn) {
        const audioType = muteBtn.dataset.audio;
        toggleMute(audioType);
      }

      if (e.target.id === 'addSceneBtn') {
        addScene();
      }

      if (e.target.id === 'addSourceBtn') {
        addSource();
      }

      if (e.target.id === 'fullscreenBtn') {
        utils.showNotification('提示', '全屏模式演示中', 'info');
      }

      if (e.target.id === 'snapshotBtn') {
        utils.showNotification('截图成功', '已保存到截图文件夹', 'success');
      }

      const tabBtn = e.target.closest('.tab-btn');
      if (tabBtn) {
        const type = tabBtn.dataset.sourceType;
        switchTab(type);
      }
    });

    document.addEventListener('mousedown', (e) => {
      const slider = e.target.closest('.volume-slider');
      if (slider) {
        const audioType = slider.dataset.audio;
        handleVolumeChange(slider, e, audioType);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (index < scenes.length) {
          switchScene(scenes[index].id);
        }
      }
      
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        toggleMute('mic');
      }
    });
  }

  function switchScene(sceneId) {
    currentSceneId = sceneId;
    const scene = scenes.find(s => s.id === sceneId);
    
    const nameEl = document.getElementById('currentSceneName');
    if (nameEl && scene) {
      nameEl.textContent = scene.name;
    }

    const descEl = document.querySelector('.preview-placeholder__desc');
    if (descEl && scene) {
      descEl.textContent = '当前场景：' + scene.name;
    }
    
    const iconEl = document.querySelector('.preview-placeholder__icon');
    if (iconEl && scene) {
      const icons = { camera: '📷', screen: '🖥️', game: '🎮', image: '🖼️' };
      iconEl.textContent = icons[scene.type] || '📹';
    }

    renderSceneList();
    renderSourcesList();
    selectedSourceId = null;
  }

  function selectSource(sourceId) {
    selectedSourceId = sourceId;
    renderSourcesList();
  }

  function toggleSourceVisibility(sourceId) {
    const currentScene = scenes.find(s => s.id === currentSceneId);
    if (!currentScene) return;

    const source = currentScene.sources.find(s => s.id === sourceId);
    if (source) {
      source.visible = !source.visible;
      renderSourcesList();
    }
  }

  function toggleMute(audioType) {
    muted[audioType] = !muted[audioType];
    
    const btn = document.querySelector(`.audio-item__mute[data-audio="${audioType}"]`);
    if (btn) {
      btn.classList.toggle('active', muted[audioType]);
      const icons = {
        mic: muted.mic ? '🔇' : '🔊',
        system: muted.system ? '🔇' : '🔊',
        bgm: muted.bgm ? '🔇' : '🎵'
      };
      btn.textContent = icons[audioType];
    }
  }

  function handleVolumeChange(slider, e, audioType) {
    const rect = slider.getBoundingClientRect();
    
    function updateVolume(clientX) {
      let percentage = ((clientX - rect.left) / rect.width) * 100;
      percentage = Math.max(0, Math.min(100, percentage));
      percentage = Math.round(percentage);
      
      volumes[audioType] = percentage;
      
      const fill = slider.querySelector('.volume-slider__fill');
      const thumb = slider.querySelector('.volume-slider__thumb');
      const valueEl = slider.parentElement.querySelector('.volume-value');
      
      if (fill) fill.style.width = percentage + '%';
      if (thumb) thumb.style.left = percentage + '%';
      if (valueEl) valueEl.textContent = percentage + '%';
    }
    
    updateVolume(e.clientX);
    
    function onMouseMove(e) {
      updateVolume(e.clientX);
    }
    
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function addScene() {
    const newScene = {
      id: 'scene_' + utils.generateId(),
      name: '新场景 ' + (scenes.length + 1),
      type: 'camera',
      active: false,
      sources: []
    };
    scenes.push(newScene);
    renderSceneList();
    utils.showNotification('场景已添加', newScene.name, 'success');
  }

  function addSource() {
    const currentScene = scenes.find(s => s.id === currentSceneId);
    if (!currentScene) return;

    const newSource = {
      id: 'source_' + utils.generateId(),
      name: '新来源 ' + (currentScene.sources.length + 1),
      type: 'camera',
      visible: true,
      volume: 100
    };
    currentScene.sources.push(newSource);
    renderSourcesList();
    utils.showNotification('来源已添加', newSource.name, 'success');
  }

  function switchTab(type) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.sourceType === type);
    });
  }

  function startWaveformAnimation() {
    const micCanvas = document.getElementById('micWaveform');
    const systemCanvas = document.getElementById('systemWaveform');
    
    if (waveformInterval) {
      clearInterval(waveformInterval);
    }

    waveformInterval = setInterval(() => {
      if (micCanvas) {
        const data = generateWaveformData(30, muted.mic ? 0.05 : 0.4);
        chart.drawWaveform(micCanvas, data);
      }
      if (systemCanvas) {
        const data = generateWaveformData(30, muted.system ? 0.05 : 0.3);
        chart.drawWaveform(systemCanvas, data);
      }
    }, 100);
  }

  function generateWaveformData(count, amplitude) {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push(amplitude * (0.3 + Math.random() * 0.7));
    }
    return data;
  }

  function show() {
    render();
  }

  function hide() {
    if (waveformInterval) {
      clearInterval(waveformInterval);
      waveformInterval = null;
    }
  }

  return {
    init,
    render,
    show,
    hide
  };
})();

window.SceneModule = SceneModule;
