// public/js/charts.js
document.addEventListener('DOMContentLoaded', () => {
    if (!window.DISCOVERY_DATA || typeof Chart === 'undefined') return;
    
    // We need containers for the charts
    // Inject them into the themes section if they don't exist
    const themesSection = document.getElementById('themes');
    if (themesSection) {
        const header = themesSection.querySelector('.section-header');
        
        const chartsWrapper = document.createElement('div');
        chartsWrapper.style.display = 'grid';
        chartsWrapper.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
        chartsWrapper.style.gap = '2rem';
        chartsWrapper.style.marginBottom = '2rem';
        
        chartsWrapper.innerHTML = `
            <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border);">
                <h3 style="margin-top: 0; color: var(--text-primary); text-align: center;">Theme Frequency</h3>
                <canvas id="themeFrequencyChart"></canvas>
            </div>
            <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border);">
                <h3 style="margin-top: 0; color: var(--text-primary); text-align: center;">Source Distribution</h3>
                <canvas id="sourceDistributionChart"></canvas>
            </div>
        `;
        
        // Insert after header
        header.parentNode.insertBefore(chartsWrapper, header.nextSibling);
        
        // Theme Frequency Chart
        const freqCtx = document.getElementById('themeFrequencyChart').getContext('2d');
        const themes = window.DISCOVERY_DATA.themes;
        new Chart(freqCtx, {
            type: 'bar',
            data: {
                labels: themes.map(t => t.name.length > 15 ? t.name.substring(0, 15) + '...' : t.name),
                datasets: [{
                    label: 'Mentions',
                    data: themes.map(t => t.frequency),
                    backgroundColor: '#0C831F',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#27272a' }, ticks: { color: '#a1a1aa' } },
                    x: { grid: { display: false }, ticks: { color: '#a1a1aa' } }
                }
            }
        });
        
        // Source Distribution Chart
        const sourceCtx = document.getElementById('sourceDistributionChart').getContext('2d');
        const sources = window.DISCOVERY_DATA.sourceStats;
        new Chart(sourceCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(sources),
                datasets: [{
                    data: Object.values(sources),
                    backgroundColor: ['#0C831F', '#FFD60A', '#3b82f6', '#ef4444', '#8b5cf6', '#f97316'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#e4e4e7' } }
                }
            }
        });
    }
});
