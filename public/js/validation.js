// public/js/validation.js
document.addEventListener('DOMContentLoaded', () => {
    const validationMetrics = document.getElementById('validationMetrics');
    
    if (validationMetrics && window.DISCOVERY_DATA) {
        const validation = DISCOVERY_DATA.validation;

        validationMetrics.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border); text-align: center;">
                    <h3 style="font-size: 2rem; color: var(--primary); margin: 0 0 0.5rem 0;">${validation.total_reviews_analyzed}</h3>
                    <p style="margin: 0; color: var(--text-secondary);">Total Reviews Analyzed</p>
                </div>
                <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border); text-align: center;">
                    <h3 style="font-size: 2rem; color: var(--accent); margin: 0 0 0.5rem 0;">${(validation.cross_source_agreement * 100).toFixed(1)}%</h3>
                    <p style="margin: 0; color: var(--text-secondary);">Cross-Source Agreement</p>
                </div>
                <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border); text-align: center;">
                    <h3 style="font-size: 2rem; color: var(--positive); margin: 0 0 0.5rem 0;">${(validation.spot_check_accuracy * 100).toFixed(1)}%</h3>
                    <p style="margin: 0; color: var(--text-secondary);">Spot-Check Accuracy</p>
                </div>
                <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border); text-align: center;">
                    <h3 style="font-size: 2rem; color: var(--text-primary); margin: 0 0 0.5rem 0;">${validation.themes_validated}</h3>
                    <p style="margin: 0; color: var(--text-secondary);">Themes Validated</p>
                </div>
            </div>

            ${validation.bias_flags && validation.bias_flags.length > 0 ? `
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--negative); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h3 style="color: var(--negative); margin-top: 0; display: flex; align-items: center; gap: 0.5rem;">
                    <i data-lucide="alert-triangle"></i> Bias Flags Detected
                </h3>
                <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-primary);">
                    ${validation.bias_flags.map(flag => `<li><strong>${flag.source}</strong>: ${flag.warning}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border);">
                <h3 style="margin-top: 0; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                    <i data-lucide="info"></i> Methodology
                </h3>
                <p style="margin: 0; color: var(--text-secondary); line-height: 1.6;">${validation.methodology}</p>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
    }
});
