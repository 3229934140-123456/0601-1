const DEFAULT_STATE = {
  isLive: false,
  title: '欢迎来到我的直播间',
  category: '娱乐',
  cover: '',
  startTime: null,
  duration: 0,
  viewerCount: 0,
  likeCount: 0,
  
  messages: [],
  blockedWords: ['广告', '加微信', '刷钻'],
  
  audiences: [],
  admins: [],
  adminPermissions: {},
  micRequests: [],
  connectedMics: [],
  
  todayIncome: 0,
  totalIncome: 12580,
  giftHistory: [],
  
  replays: [],
  
  notice: '欢迎来到直播间，喜欢的话点个关注吧~',
  
  user: {
    id: 'host_001',
    name: '主播小明',
    avatar: '',
    level: 28,
    followers: 15680,
    description: '一个热爱直播的主播'
  },
  
  settings: {
    autoStart: false,
    showGiftEffect: true,
    showViewerEntry: true,
    danmakuOpacity: 0.9,
    danmakuSpeed: 'normal',
    volume: 80,
    micVolume: 70,
    bgmVolume: 30,
    exceptionAlert: true
  }
};

const STORAGE_KEY = 'live_studio_data';

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (e) {
    console.warn('读取本地存储失败:', e);
  }
  return { ...DEFAULT_STATE };
}

function saveToStorage(state) {
  try {
    const toSave = {
      title: state.title,
      category: state.category,
      cover: state.cover,
      blockedWords: state.blockedWords,
      admins: state.admins,
      adminPermissions: state.adminPermissions,
      replays: state.replays,
      giftHistory: state.giftHistory,
      todayIncome: state.todayIncome,
      notice: state.notice,
      user: state.user,
      settings: state.settings,
      totalIncome: state.totalIncome
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('保存本地存储失败:', e);
  }
}

class Store {
  constructor(initialState = {}) {
    this.defaultState = { ...DEFAULT_STATE };
    this.state = { ...this.defaultState, ...initialState };
    this.listeners = [];
    this.eventHandlers = {};
  }

  getState() {
    return { ...this.state };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    saveToStorage(this.state);
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    this.listeners.forEach(callback => callback(this.state));
  }

  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
    return () => {
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
    };
  }

  emit(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => handler(data));
    }
  }

  resetToDefault() {
    const liveStatus = this.state.isLive;
    this.state = JSON.parse(JSON.stringify(this.defaultState));
    this.state.isLive = liveStatus;
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
    this.emit('store:reset');
  }

  dispatch(action, payload) {
    const actions = {
      START_LIVE: () => {
        this.setState({
          isLive: true,
          startTime: Date.now(),
          duration: 0
        });
        this.emit('live:start');
      },
      STOP_LIVE: () => {
        this.setState({
          isLive: false,
          startTime: null,
          duration: 0
        });
        this.emit('live:stop');
      },
      UPDATE_DURATION: (seconds) => {
        this.state.duration = seconds;
        this.notify();
      },
      ADD_VIEWER: () => {
        this.state.viewerCount += 1;
        this.notify();
      },
      REMOVE_VIEWER: () => {
        const count = Math.max(0, this.state.viewerCount - 1);
        this.state.viewerCount = count;
        this.notify();
      },
      ADD_LIKE: () => {
        this.state.likeCount += 1;
        this.notify();
      },
      ADD_MESSAGE: (msg) => {
        const messages = [...this.state.messages, msg];
        if (messages.length > 200) {
          messages.shift();
        }
        this.state.messages = messages;
        this.notify();
        this.emit('chat:message', msg);
      },
      DELETE_MESSAGE: (msgId) => {
        const messages = this.state.messages.filter(m => m.id !== msgId);
        this.state.messages = messages;
        this.notify();
        this.emit('chat:delete', msgId);
      },
      ADD_GIFT: (gift) => {
        const gifts = [...this.state.giftHistory, gift];
        const todayIncome = this.state.todayIncome + (gift.value * gift.count);
        this.setState({ 
          giftHistory: gifts,
          todayIncome 
        });
        this.emit('gift:new', gift);
      },
      ADD_AUDIENCE: (user) => {
        const audiences = [...this.state.audiences, user];
        this.state.audiences = audiences;
        this.notify();
        this.emit('audience:join', user);
      },
      REMOVE_AUDIENCE: (userId) => {
        const audiences = this.state.audiences.filter(u => u.id !== userId);
        this.state.audiences = audiences;
        this.notify();
        this.emit('audience:leave', userId);
      },
      MUTE_AUDIENCE: (userId) => {
        const audiences = this.state.audiences.map(u => 
          u.id === userId ? { ...u, isMuted: true } : u
        );
        this.state.audiences = audiences;
        this.notify();
        this.emit('audience:mute', userId);
      },
      UNMUTE_AUDIENCE: (userId) => {
        const audiences = this.state.audiences.map(u => 
          u.id === userId ? { ...u, isMuted: false } : u
        );
        this.state.audiences = audiences;
        this.notify();
        this.emit('audience:unmute', userId);
      },
      ADD_ADMIN: (payload) => {
        const { userId, permissions } = payload;
        const admins = [...this.state.admins, userId];
        const adminPermissions = { 
          ...this.state.adminPermissions,
          [userId]: permissions || {
            muteUser: true,
            deleteMessage: true,
            handleMic: false,
            manageNotice: false
          }
        };
        this.setState({ admins, adminPermissions });
      },
      REMOVE_ADMIN: (userId) => {
        const admins = this.state.admins.filter(id => id !== userId);
        const adminPermissions = { ...this.state.adminPermissions };
        delete adminPermissions[userId];
        this.setState({ admins, adminPermissions });
      },
      UPDATE_ADMIN_PERMISSIONS: (payload) => {
        const { userId, permissions } = payload;
        const adminPermissions = { 
          ...this.state.adminPermissions,
          [userId]: permissions 
        };
        this.setState({ adminPermissions });
      },
      ADD_BLOCKED_WORD: (word) => {
        const blockedWords = [...this.state.blockedWords, word];
        this.setState({ blockedWords });
      },
      REMOVE_BLOCKED_WORD: (word) => {
        const blockedWords = this.state.blockedWords.filter(w => w !== word);
        this.setState({ blockedWords });
      },
      ADD_MIC_REQUEST: (request) => {
        const micRequests = [...this.state.micRequests, request];
        this.state.micRequests = micRequests;
        this.notify();
        this.emit('mic:request', request);
      },
      ACCEPT_MIC_REQUEST: (requestId) => {
        const request = this.state.micRequests.find(r => r.id === requestId);
        const micRequests = this.state.micRequests.filter(r => r.id !== requestId);
        let connectedMics = [...this.state.connectedMics];
        if (request && !connectedMics.includes(request.userId)) {
          connectedMics.push(request.userId);
        }
        this.state.micRequests = micRequests;
        this.state.connectedMics = connectedMics;
        this.notify();
      },
      REJECT_MIC_REQUEST: (requestId) => {
        const micRequests = this.state.micRequests.filter(r => r.id !== requestId);
        this.state.micRequests = micRequests;
        this.notify();
      },
      DISCONNECT_MIC: (userId) => {
        const connectedMics = this.state.connectedMics.filter(id => id !== userId);
        this.state.connectedMics = connectedMics;
        this.notify();
      },
      UPDATE_LIVE_INFO: (info) => {
        this.setState({
          title: info.title,
          category: info.category,
          cover: info.cover
        });
      },
      UPDATE_NOTICE: (notice) => {
        this.setState({ notice });
      },
      ADD_REPLAY: (replay) => {
        const replays = [replay, ...this.state.replays];
        this.setState({ replays });
      },
      UPDATE_REPLAY: (payload) => {
        const { id, data } = payload;
        const replays = this.state.replays.map(r => 
          r.id === id ? { ...r, ...data } : r
        );
        this.setState({ replays });
      },
      DELETE_REPLAY: (id) => {
        const replays = this.state.replays.filter(r => r.id !== id);
        this.setState({ replays });
      },
      UPDATE_USER: (userData) => {
        this.setState({
          user: { ...this.state.user, ...userData }
        });
      },
      UPDATE_SETTINGS: (settingsData) => {
        this.setState({
          settings: { ...this.state.settings, ...settingsData }
        });
      }
    };

    if (actions[action]) {
      actions[action](payload);
    }
  }
}

const initialState = loadFromStorage();
const store = new Store(initialState);

window.store = store;
