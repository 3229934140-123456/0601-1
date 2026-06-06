const App = (() => {
  let currentModule = 'console';
  const modules = {
    console: ConsoleModule,
    scene: SceneModule,
    chat: ChatModule,
    gift: GiftModule,
    audience: AudienceModule,
    replay: ReplayModule,
    settings: SettingsModule
  };

  function init() {
    ConsoleModule.init();
    SceneModule.init();
    ChatModule.init();
    GiftModule.init();
    AudienceModule.init();
    ReplayModule.init();
    SettingsModule.init();

    switchModule('console');
    bindNavEvents();
    
    const state = store.getState();
    if (!state.replays || state.replays.length === 0) {
      store.setState({ replays: mockData.replays });
    }
    if (!state.admins || state.admins.length === 0) {
      store.setState({ admins: mockData.admins.map(a => a.id) });
      const adminPermissions = {};
      mockData.admins.forEach(admin => {
        adminPermissions[admin.id] = {
          muteUser: true,
          deleteMessage: true,
          handleMic: true,
          manageNotice: false
        };
      });
      store.setState({ adminPermissions });
    }
    
    console.log('🎬 直播控制台已启动');
    console.log('提示: 点击开始直播按钮体验完整功能');
  }

  function bindNavEvents() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const moduleName = item.dataset.module;
        if (moduleName && modules[moduleName]) {
          switchModule(moduleName);
        }
      });
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        switchModule('console');
      }
      if (e.ctrlKey && e.key === '2') {
        e.preventDefault();
        switchModule('scene');
      }
      if (e.ctrlKey && e.key === '3') {
        e.preventDefault();
        switchModule('chat');
      }
      if (e.ctrlKey && e.key === '4') {
        e.preventDefault();
        switchModule('gift');
      }
      if (e.ctrlKey && e.key === '5') {
        e.preventDefault();
        switchModule('audience');
      }
      if (e.ctrlKey && e.key === '6') {
        e.preventDefault();
        switchModule('replay');
      }
      if (e.ctrlKey && e.key === '7') {
        e.preventDefault();
        switchModule('settings');
      }
    });
  }

  function switchModule(moduleName) {
    if (!modules[moduleName]) return;
    
    const moduleEl = document.getElementById('module-' + moduleName);
    const navEl = document.querySelector('.nav-item[data-module="' + moduleName + '"]');
    
    if (currentModule === moduleName && moduleEl && moduleEl.classList.contains('active')) {
      return;
    }
    
    if (currentModule !== moduleName) {
      if (modules[currentModule] && typeof modules[currentModule].hide === 'function') {
        modules[currentModule].hide();
      }
      
      const oldModuleEl = document.getElementById('module-' + currentModule);
      const oldNavEl = document.querySelector('.nav-item[data-module="' + currentModule + '"]');
      if (oldModuleEl) oldModuleEl.classList.remove('active');
      if (oldNavEl) oldNavEl.classList.remove('active');
    }
    
    currentModule = moduleName;
    
    if (moduleEl) moduleEl.classList.add('active');
    if (navEl) navEl.classList.add('active');
    
    if (modules[moduleName] && typeof modules[moduleName].show === 'function') {
      modules[moduleName].show();
    }
  }

  function getCurrentModule() {
    return currentModule;
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    init,
    switchModule,
    getCurrentModule
  };
})();

window.App = App;
