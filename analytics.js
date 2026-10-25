// Lightweight Canvas Charts
const AnalyticsEngine = {
    renderCharts() {
        this.drawBarChart();
        this.drawPieChart();
    },

    drawBarChart() {
        const canvas = document.getElementById('weeklyBarChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const stats = StorageService.getStats();
        const data = stats.weeklyLog || [3, 4, 2, 5, 4, 6, 3];
        const maxVal = Math.max(...data, 8);

        const startX = 40;
        const startY = 220;
        const barWidth = 32;
        const gap = 18;

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX - 10, startY);
        ctx.lineTo(startX + (barWidth + gap) * 7, startY);
        ctx.stroke();

        data.forEach((val, i) => {
            const barHeight = (val / maxVal) * 160;
            const x = startX + i * (barWidth + gap);
            const y = startY - barHeight;

            ctx.fillStyle = '#2563eb';
            ctx.fillRect(x, y, barWidth, barHeight);

            ctx.fillStyle = '#64748b';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(val, x + barWidth / 2, y - 6);
            ctx.fillText(days[i], x + barWidth / 2, startY + 16);
        });
    },

    drawPieChart() {
        const canvas = document.getElementById('priorityPieChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const tasks = StorageService.getTasks();
        let high = 0, med = 0, low = 0;
        tasks.forEach(t => {
            if (t.priorityScore >= 8.0) high++;
            else if (t.priorityScore >= 5.0) med++;
            else low++;
        });

        const total = tasks.length || 1;
        const slices = [
            { count: high, color: '#ef4444', label: `High (${high})` },
            { count: med, color: '#f59e0b', label: `Med (${med})` },
            { count: low, color: '#2563eb', label: `Low (${low})` }
        ];

        let startAngle = 0;
        const centerX = 130;
        const centerY = 130;
        const radius = 80;

        slices.forEach(slice => {
            const sliceAngle = (slice.count / total) * 2 * Math.PI;
            ctx.fillStyle = slice.color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            startAngle += sliceAngle;
        });

        let legendY = 80;
        slices.forEach(slice => {
            ctx.fillStyle = slice.color;
            ctx.fillRect(250, legendY - 10, 14, 14);
            ctx.fillStyle = '#334155';
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(slice.label, 275, legendY + 2);
            legendY += 30;
        });
    }
};
