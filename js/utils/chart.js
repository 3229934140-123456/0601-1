const chart = {
  drawLineChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    const padding = options.padding || { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const maxValue = Math.max(...data.map(d => d.value)) * 1.2;
    const minValue = 0;
    
    ctx.clearRect(0, 0, width, height);
    
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      const value = Math.round(maxValue - (maxValue / gridLines) * i);
      ctx.fillStyle = '#64748B';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(value.toString(), padding.left - 8, y + 4);
    }
    
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    
    const stepX = chartWidth / (data.length - 1);
    
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    
    data.forEach((d, i) => {
      const x = padding.left + stepX * i;
      const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight;
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.beginPath();
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    data.forEach((d, i) => {
      const x = padding.left + stepX * i;
      const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    data.forEach((d, i) => {
      const x = padding.left + stepX * i;
      const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#8B5CF6';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.day, x, height - 10);
    });
  },

  drawBarChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    const padding = options.padding || { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const maxValue = Math.max(...data.map(d => d.value)) * 1.2;
    
    ctx.clearRect(0, 0, width, height);
    
    const barWidth = (chartWidth / data.length) * 0.6;
    const gap = (chartWidth / data.length) * 0.4;
    
    data.forEach((d, i) => {
      const x = padding.left + (chartWidth / data.length) * i + gap / 2;
      const barHeight = (d.value / maxValue) * chartHeight;
      const y = padding.top + chartHeight - barHeight;
      
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#06B6D4');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 4);
      ctx.fill();
      
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label || d.day, x + barWidth / 2, height - 10);
      
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(d.value.toString(), x + barWidth / 2, y - 6);
    });
  },

  drawWaveform(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, width, height);
    
    const barCount = data.length;
    const barWidth = (width / barCount) * 0.7;
    const gap = (width / barCount) * 0.3;
    const centerY = height / 2;
    
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#8B5CF6');
    gradient.addColorStop(1, '#06B6D4');
    
    data.forEach((value, i) => {
      const barHeight = value * height * 0.8;
      const x = (width / barCount) * i + gap / 2;
      const y = centerY - barHeight / 2;
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    });
  }
};

window.chart = chart;
