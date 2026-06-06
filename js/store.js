class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
    this.eventHandlers = {};
  }

  getState() {
    return { ...this.state };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
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
        this.setState({ duration: seconds });
      },
      ADD_VIEWER: () => {
        this.setState({ viewerCount: this.state.viewerCount + 1 });
      },
      REMOVE_VIEWER: () => {
        const count = Math.max(0, this.state.viewerCount - 1);
        this.setState({ viewerCount: count });
      },
      ADD_LIKE: () => {
        this.setState({ likeCount: this.state.likeCount + 1 });
      },
      ADD_MESSAGE: (msg) => {
        const messages = [...this.state.messages, msg];
        if (messages.length > 200) {
          messages.shift();
        }
        this.setState({ messages });
        this.emit('chat:message', msg);
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
        this.setState({ audiences });
        this.emit('audience:join', user);
      },
      REMOVE_AUDIENCE: (userId) => {
        const audiences = this.state.audiences.filter(u => u.id !== userId);
        this.setState({ audiences });
        this.emit('audience:leave', userId);
      },
      MUTE_AUDIENCE: (userId) => {
        const audiences = this.state.audiences.map(u => 
          u.id === userId ? { ...u, isMuted: true } : u
        );
        this.setState({ audiences });
      },
      UNMUTE_AUDIENCE: (userId) => {
        const audiences = this.state.audiences.map(u => 
          u.id === userId ? { ...u, isMuted: false } : u
        );
        this.setState({ audiences });
      },
      ADD_ADMIN: (userId) => {
        const admins = [...this.state.admins, userId];
        this.setState({ admins });
      },
      REMOVE_ADMIN: (userId) => {
        const admins = this.state.admins.filter(id => id !== userId);
        this.setState({ admins });
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
        this.setState({ micRequests });
        this.emit('mic:request', request);
      },
      ACCEPT_MIC_REQUEST: (requestId) => {
        const micRequests = this.state.micRequests.filter(r => r.id !== requestId);
        const connectedMics = [...this.state.connectedMics, requestId];
        this.setState({ micRequests, connectedMics });
      },
      REJECT_MIC_REQUEST: (requestId) => {
        const micRequests = this.state.micRequests.filter(r => r.id !== requestId);
        this.setState({ micRequests });
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
      UPDATE_REPLAY: (id, data) => {
        const replays = this.state.replays.map(r => 
          r.id === id ? { ...r, ...data } : r
        );
        this.setState({ replays });
      },
      DELETE_REPLAY: (id) => {
        const replays = this.state.replays.filter(r => r.id !== id);
        this.setState({ replays });
      }
    };

    if (actions[action]) {
      actions[action](payload);
    }
  }
}

const store = new Store({
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
});

window.store = store;
