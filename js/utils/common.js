const utils = {
  formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  },

  formatDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}小时${m}分${s}秒`;
    }
    if (m > 0) {
      return `${m}分${s}秒`;
    }
    return `${s}秒`;
  },

  formatNumber(num) {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  },

  formatMoney(num) {
    return '¥' + num.toFixed(2);
  },

  generateId() {
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  },

  randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  showNotification(title, message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notif = document.createElement('div');
    notif.className = `notification notification--${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    notif.innerHTML = `
      <div class="notification__icon">${icons[type] || icons.info}</div>
      <div class="notification__content">
        <div class="notification__title">${title}</div>
        <div class="notification__msg">${message}</div>
      </div>
    `;

    container.appendChild(notif);

    setTimeout(() => {
      notif.style.opacity = '0';
      notif.style.transform = 'translateY(-20px)';
      notif.style.transition = 'all 0.3s ease';
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  },

  showGiftToast(gift) {
    const container = document.getElementById('giftToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'gift-toast';
    toast.innerHTML = `
      <div class="gift-toast__icon">${gift.icon || '🎁'}</div>
      <div class="gift-toast__info">
        <span class="gift-toast__sender">${gift.sender}</span>
        <span class="gift-toast__gift">送出 ${gift.name} x${gift.count}</span>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  },

  getAvatarColor(name) {
    const colors = [
      'linear-gradient(135deg, #8B5CF6, #06B6D4)',
      'linear-gradient(135deg, #F43F5E, #8B5CF6)',
      'linear-gradient(135deg, #10B981, #06B6D4)',
      'linear-gradient(135deg, #F59E0B, #F43F5E)',
      'linear-gradient(135deg, #8B5CF6, #EC4899)',
      'linear-gradient(135deg, #06B6D4, #10B981)'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  },

  getInitials(name) {
    return name.charAt(0);
  },

  containsBlockedWord(text, blockedWords) {
    return blockedWords.some(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );
  },

  filterMessage(text, blockedWords) {
    let filtered = text;
    blockedWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    return filtered;
  }
};

window.utils = utils;
