const mockData = {
  categories: [
    { id: 'entertainment', name: '娱乐', icon: '🎮' },
    { id: 'music', name: '音乐', icon: '🎵' },
    { id: 'game', name: '游戏', icon: '🎯' },
    { id: 'life', name: '生活', icon: '🌈' },
    { id: 'tech', name: '科技', icon: '💻' },
    { id: 'education', name: '教育', icon: '📚' },
    { id: 'sports', name: '体育', icon: '⚽' },
    { id: 'food', name: '美食', icon: '🍜' }
  ],

  gifts: [
    { id: 'flower', name: '鲜花', icon: '🌹', value: 1 },
    { id: 'heart', name: '爱心', icon: '❤️', value: 5 },
    { id: 'rocket', name: '火箭', icon: '🚀', value: 100 },
    { id: 'crown', name: '皇冠', icon: '👑', value: 500 },
    { id: 'castle', name: '城堡', icon: '🏰', value: 1000 },
    { id: 'diamond', name: '钻石', icon: '💎', value: 50 },
    { id: 'star', name: '星星', icon: '⭐', value: 10 },
    { id: 'cake', name: '蛋糕', icon: '🎂', value: 20 }
  ],

  mockUserNames: [
    '追风少年', '月光下的猫', '星辰大海', '梦想家', '快乐小鱼',
    '阳光灿烂', '雨后彩虹', '冬日暖阳', '夏日清风', '秋叶飘零',
    '春风十里', '漫步云端', '守望星空', '微笑向暖', '淡淡茶香',
    '花开半夏', '岁月静好', '浅笑安然', '一念之间', '浮生若梦'
  ],

  mockMessages: [
    '主播好棒！',
    '666',
    '来了来了',
    '今天播什么呀',
    '主播唱歌真好听',
    '第一次来，关注了',
    '哈哈哈哈笑死我了',
    '主播辛苦了',
    '明天还播吗',
    '这个游戏好玩吗',
    '主播晚上好',
    '支持主播',
    '冲冲冲！',
    '太强了吧',
    '学到了学到了'
  ],

  scenes: [
    {
      id: 'scene_camera',
      name: '摄像头',
      type: 'camera',
      active: true,
      sources: [
        { id: 'cam_main', name: '主摄像头', type: 'camera', visible: true, volume: 100 }
      ]
    },
    {
      id: 'scene_screen',
      name: '屏幕分享',
      type: 'screen',
      active: false,
      sources: [
        { id: 'screen_main', name: '主屏幕', type: 'screen', visible: true, volume: 80 }
      ]
    },
    {
      id: 'scene_game',
      name: '游戏场景',
      type: 'game',
      active: false,
      sources: [
        { id: 'game_capture', name: '游戏捕获', type: 'game', visible: true, volume: 90 },
        { id: 'cam_corner', name: '摄像头(小)', type: 'camera', visible: true, volume: 100 }
      ]
    },
    {
      id: 'scene_picture',
      name: '图片轮播',
      type: 'image',
      active: false,
      sources: [
        { id: 'img_slideshow', name: '图片轮播', type: 'image', visible: true, volume: 0 }
      ]
    }
  ],

  checkItems: [
    { id: 'network', name: '网络状态', status: 'success', desc: '网络连接正常，上行带宽 20Mbps' },
    { id: 'camera', name: '摄像头', status: 'success', desc: '已检测到高清摄像头' },
    { id: 'microphone', name: '麦克风', status: 'warning', desc: '音量偏低，建议调高麦克风音量' },
    { id: 'stream_url', name: '推流地址', status: 'success', desc: '推流地址已配置' },
    { id: 'encoding', name: '编码设置', status: 'success', desc: 'H.264 编码，1080p 30fps' }
  ],

  giftRanking: [
    { rank: 1, userName: '土豪大哥', avatar: '', totalValue: 2580, level: 35 },
    { rank: 2, userName: '月光女神', avatar: '', totalValue: 1890, level: 28 },
    { rank: 3, userName: '快乐粉丝', avatar: '', totalValue: 1250, level: 22 },
    { rank: 4, userName: '新人小白', avatar: '', totalValue: 680, level: 15 },
    { rank: 5, userName: '路过看看', avatar: '', totalValue: 320, level: 8 }
  ],

  incomeTrend: [
    { day: '周一', value: 320 },
    { day: '周二', value: 450 },
    { day: '周三', value: 280 },
    { day: '周四', value: 520 },
    { day: '周五', value: 680 },
    { day: '周六', value: 890 },
    { day: '周日', value: 750 }
  ],

  replays: [
    {
      id: 'replay_001',
      title: '【精彩回顾】周末游戏大作战',
      cover: '',
      duration: 7200,
      startTime: Date.now() - 86400000,
      views: 3562,
      likes: 128,
      status: 'published'
    },
    {
      id: 'replay_002',
      title: '唱歌聊天欢乐多',
      cover: '',
      duration: 5400,
      startTime: Date.now() - 172800000,
      views: 2890,
      likes: 95,
      status: 'published'
    },
    {
      id: 'replay_003',
      title: '新游戏尝鲜体验',
      cover: '',
      duration: 8100,
      startTime: Date.now() - 259200000,
      views: 4120,
      likes: 156,
      status: 'published'
    },
    {
      id: 'replay_004',
      title: '深夜聊天室',
      cover: '',
      duration: 3600,
      startTime: Date.now() - 345600000,
      views: 1850,
      likes: 72,
      status: 'processing'
    },
    {
      id: 'replay_005',
      title: '美食制作分享',
      cover: '',
      duration: 4500,
      startTime: Date.now() - 432000000,
      views: 2340,
      likes: 89,
      status: 'draft'
    }
  ],

  admins: [
    { id: 'admin_001', name: '房管小王', avatar: '', level: 30, joinTime: Date.now() - 2592000000 },
    { id: 'admin_002', name: '场控小李', avatar: '', level: 25, joinTime: Date.now() - 1728000000 }
  ],

  loginRecords: [
    { id: 1, device: 'Windows 10 PC', location: '北京市', time: Date.now(), status: 'success' },
    { id: 2, device: 'iPhone 14', location: '北京市', time: Date.now() - 86400000, status: 'success' },
    { id: 3, device: 'Windows 11 PC', location: '上海市', time: Date.now() - 172800000, status: 'failed' },
    { id: 4, device: 'MacBook Pro', location: '北京市', time: Date.now() - 259200000, status: 'success' }
  ]
};

window.mockData = mockData;
