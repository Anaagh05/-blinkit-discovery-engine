document.addEventListener('DOMContentLoaded', () => {
    const explorerGrid = document.getElementById('explorerGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    if (explorerGrid && window.DISCOVERY_DATA) {
        const reviews = DISCOVERY_DATA.reviews;

        function renderReviews(filter) {
            const filtered = filter === 'all' 
                ? reviews 
                : reviews.filter(r => (r.source || '').toLowerCase().includes(filter.toLowerCase()));
            
            explorerGrid.innerHTML = filtered.map(r => {
                let sentClass = r.sentiment === 'positive' ? 'sent-positive' : (r.sentiment === 'negative' ? 'sent-negative' : 'sent-neutral');
                return `
                <div class="review-card">
                    <div class="review-header">
                        <span class="r-source"><i data-lucide="${r.source && r.source.includes('apple') ? 'apple' : 'smartphone'}" style="width:12px; vertical-align:middle;"></i> ${r.source || 'Unknown'}</span>
                        <span class="r-sentiment ${sentClass}">${(r.sentiment || 'neutral').toUpperCase()}</span>
                    </div>
                    <div style="margin-bottom:0.5rem; color: var(--accent);">
                        ${'★'.repeat(r.rating || 3)}${'☆'.repeat(5 - (r.rating || 3))}
                    </div>
                    <p style="font-size: 0.95rem;">"${r.text}"</p>
                    ${r.relevance === 'high' ? `<div style="margin-top:1rem; font-size:0.75rem; color:var(--primary-light);"><i data-lucide="target" style="width:12px; vertical-align:middle;"></i> High Relevance Signal</div>` : ''}
                </div>
            `}).join('');
            
            if (window.lucide) window.lucide.createIcons();
        }

        renderReviews('all');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderReviews(e.target.dataset.filter);
            });
        });

        // Populate source count cards
        const stats = DISCOVERY_DATA.sourceStats || {};
        const mapping = {
            'srcPlay': stats.play_store || 0,
            'srcApp': stats.app_store || 0,
            'srcReddit': stats.reddit || 0,
            'srcFacebook': stats.facebook || 0,
            'srcInstagram': stats.instagram || 0,
            'srcOthers': (stats.quora || 0) + (stats.blog || 0) + (stats.twitter || 0) + (stats.others || 0)
        };
        Object.keys(mapping).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = mapping[id].toLocaleString();
        });
    }
});
