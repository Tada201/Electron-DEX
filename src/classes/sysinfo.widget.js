// SysInfoWidget - System Information Widget for eDEX-UI
class SysInfoWidget extends Widget {
    constructor(options = {}) {
        super({
            ...options,
            name: 'System Info',
            id: 'sysinfo-widget'
        });
    }

    // Create widget DOM element
    createElement() {
        super.createElement();
        
        // Update content
        if (this.element) {
            this.element.querySelector('.widget-title').textContent = 'System Information';
            this.element.querySelector('.widget-content').innerHTML = `
                <div class="sysinfo-grid">
                    <div class="sysinfo-item">
                        <span class="sysinfo-label">CPU:</span>
                        <span class="sysinfo-value" id="cpu-usage">--%</span>
                    </div>
                    <div class="sysinfo-item">
                        <span class="sysinfo-label">Memory:</span>
                        <span class="sysinfo-value" id="memory-usage">--%</span>
                    </div>
                    <div class="sysinfo-item">
                        <span class="sysinfo-label">Network:</span>
                        <span class="sysinfo-value" id="network-usage">-- MB/s</span>
                    </div>
                    <div class="sysinfo-item">
                        <span class="sysinfo-label">Disk:</span>
                        <span class="sysinfo-value" id="disk-usage">--%</span>
                    </div>
                </div>
            `;
        }
    }

    // Update widget content with system information
    async update() {
        try {
            // In a real implementation, this would fetch actual system info
            // For now, we'll use mock data
            const cpuUsage = Math.floor(Math.random() * 100);
            const memoryUsage = Math.floor(Math.random() * 100);
            const networkUsage = (Math.random() * 10).toFixed(2);
            const diskUsage = Math.floor(Math.random() * 100);
            
            // Update DOM elements
            const cpuElement = this.element?.querySelector('#cpu-usage');
            const memoryElement = this.element?.querySelector('#memory-usage');
            const networkElement = this.element?.querySelector('#network-usage');
            const diskElement = this.element?.querySelector('#disk-usage');
            
            if (cpuElement) cpuElement.textContent = `${cpuUsage}%`;
            if (memoryElement) memoryElement.textContent = `${memoryUsage}%`;
            if (networkElement) networkElement.textContent = `${networkUsage} MB/s`;
            if (diskElement) diskElement.textContent = `${diskUsage}%`;
            
            // Update colors based on usage
            this.updateUsageColors(cpuElement, cpuUsage);
            this.updateUsageColors(memoryElement, memoryUsage);
            this.updateUsageColors(diskElement, diskUsage);
            
        } catch (error) {
            console.error('Error updating SysInfoWidget:', error);
        }
    }

    // Update colors based on usage percentage
    updateUsageColors(element, usage) {
        if (!element) return;
        
        if (usage > 80) {
            element.style.color = 'var(--color_red)';
        } else if (usage > 60) {
            element.style.color = 'var(--color_yellow)';
        } else {
            element.style.color = 'rgb(var(--color_r), var(--color_g), var(--color_b))';
        }
    }

    // Handle keyboard events specific to this widget
    handleKeydown(event) {
        // Call parent handler first
        super.handleKeydown(event);
        
        // Handle widget-specific keys
        switch (event.key) {
            case 'r':
                // Refresh on 'r' key
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.update();
                }
                break;
                
            case 'i':
                // Show detailed info on 'i' key
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.showDetailedInfo();
                }
                break;
        }
    }

    // Show detailed system information
    showDetailedInfo() {
        // In a real implementation, this would show a detailed modal
        console.log('Showing detailed system information');
    }
}

// Export the SysInfoWidget class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SysInfoWidget;
} else {
    window.SysInfoWidget = SysInfoWidget;
}