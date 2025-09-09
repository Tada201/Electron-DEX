// ProcessListWidget - Process List Widget for eDEX-UI
class ProcessListWidget extends Widget {
    constructor(options = {}) {
        super({
            ...options,
            name: 'Process List',
            id: 'processlist-widget',
            updateInterval: 3000 // Update every 3 seconds
        });
        
        this.sortColumn = 'cpu';
        this.sortDirection = 'desc';
    }

    // Create widget DOM element
    createElement() {
        super.createElement();
        
        // Update content
        if (this.element) {
            this.element.querySelector('.widget-title').textContent = 'Process List';
            this.element.querySelector('.widget-content').innerHTML = `
                <div class="process-list-container">
                    <table class="process-table">
                        <thead>
                            <tr>
                                <th data-sort="pid" tabindex="0">PID</th>
                                <th data-sort="name" tabindex="0">Name</th>
                                <th data-sort="cpu" tabindex="0">CPU%</th>
                                <th data-sort="mem" tabindex="0">MEM%</th>
                            </tr>
                        </thead>
                        <tbody id="process-table-body">
                            <!-- Process rows will be populated here -->
                        </tbody>
                    </table>
                </div>
            `;
            
            // Add sort event listeners
            const headers = this.element.querySelectorAll('th[data-sort]');
            headers.forEach(header => {
                header.addEventListener('click', () => {
                    this.sortBy(header.dataset.sort);
                });
                
                header.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        this.sortBy(header.dataset.sort);
                    }
                });
            });
        }
    }

    // Sort processes by column
    sortBy(column) {
        if (this.sortColumn === column) {
            // Toggle sort direction
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // Set new sort column
            this.sortColumn = column;
            this.sortDirection = 'desc';
        }
        
        // Update UI to show sort direction
        const headers = this.element.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (header.dataset.sort === column) {
                header.classList.add(this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });
        
        // Refresh the display
        this.update();
    }

    // Update widget content with process list
    async update() {
        try {
            // In a real implementation, this would fetch actual process data
            // For now, we'll use mock data
            const processes = this.generateMockProcesses();
            
            // Sort processes
            const sortedProcesses = this.sortProcesses(processes);
            
            // Update DOM
            const tbody = this.element?.querySelector('#process-table-body');
            if (tbody) {
                tbody.innerHTML = '';
                
                sortedProcesses.slice(0, 10).forEach(process => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${process.pid}</td>
                        <td>${process.name}</td>
                        <td>${process.cpu.toFixed(1)}</td>
                        <td>${process.mem.toFixed(1)}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
            
        } catch (error) {
            console.error('Error updating ProcessListWidget:', error);
        }
    }

    // Generate mock process data
    generateMockProcesses() {
        const processNames = [
            'systemd', 'kthreadd', 'ksoftirqd', 'migration', 'rcu_gp', 'kworker', 
            'chrome', 'vscode', 'node', 'electron', 'docker', 'mysql', 'nginx',
            'python', 'git', 'bash', 'ssh', 'firefox', 'spotify', 'slack'
        ];
        
        return Array.from({ length: 20 }, (_, i) => ({
            pid: Math.floor(1000 + Math.random() * 9000),
            name: processNames[Math.floor(Math.random() * processNames.length)],
            cpu: Math.random() * 100,
            mem: Math.random() * 50
        }));
    }

    // Sort processes based on current sort settings
    sortProcesses(processes) {
        return [...processes].sort((a, b) => {
            let valueA = a[this.sortColumn];
            let valueB = b[this.sortColumn];
            
            // Handle string comparisons
            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }
            
            if (this.sortDirection === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });
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
                
            case 'f':
                // Focus search on 'f' key
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.focusSearch();
                }
                break;
        }
    }

    // Focus search functionality
    focusSearch() {
        // In a real implementation, this would focus a search input
        console.log('Focusing process search');
    }
}

// Export the ProcessListWidget class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProcessListWidget;
} else {
    window.ProcessListWidget = ProcessListWidget;
}