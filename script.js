document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            views.forEach(v => v.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            if (targetId === 'dashboard') {
                updateChartColumns();
            }
        });
    });

    // Upload & Clean
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadStatus = document.getElementById('uploadStatus');
    const cleaningSection = document.getElementById('cleaningSection');
    const dataShape = document.getElementById('dataShape');

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.background = 'rgba(255, 255, 255, 0.9)';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.background = 'rgba(255, 255, 255, 0.4)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.background = 'rgba(255, 255, 255, 0.4)';
        if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });

    async function handleFileUpload(file) {
        uploadStatus.innerHTML = '<span class="spinner"></span> Uploading...';
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            
            if (response.ok) {
                uploadStatus.innerHTML = `<p style="color: green;"><i class="fa-solid fa-check"></i> ${result.message}</p>`;
                cleaningSection.classList.remove('hidden');
                dataShape.innerText = `Rows: ${result.rows} | Columns: ${result.cols}`;
            } else {
                uploadStatus.innerHTML = `<p style="color: red;">Error: ${result.detail}</p>`;
            }
        } catch (error) {
            uploadStatus.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    }

    // Data Cleaning
    const applyCleanBtn = document.getElementById('applyCleanBtn');
    const cleanAction = document.getElementById('cleanAction');
    const cleanStatus = document.getElementById('cleanStatus');

    applyCleanBtn.addEventListener('click', async () => {
        cleanStatus.innerHTML = '<span class="spinner"></span> Applying...';
        try {
            const response = await fetch(`/api/clean?action=${cleanAction.value}`, { method: 'POST' });
            const result = await response.json();
            
            if (response.ok) {
                cleanStatus.innerHTML = `<p style="color: green;">${result.message}</p>`;
                dataShape.innerText = `Rows: ${result.rows} | Columns: ${result.cols}`;
            } else {
                cleanStatus.innerHTML = `<p style="color: red;">Error: ${result.detail}</p>`;
            }
        } catch (error) {
            cleanStatus.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    });

    // Dashboard & EDA
    async function updateChartColumns() {
        try {
            const response = await fetch('/api/data_info');
            const data = await response.json();
            
            if (data.has_data) {
                const xSelect = document.getElementById('xAxis');
                const ySelect = document.getElementById('yAxis');
                
                xSelect.innerHTML = '';
                ySelect.innerHTML = '';
                
                data.columns.forEach(col => {
                    xSelect.innerHTML += `<option value="${col}">${col}</option>`;
                });
                
                data.numeric_columns.forEach(col => {
                    ySelect.innerHTML += `<option value="${col}">${col}</option>`;
                });
            }
        } catch (e) {
            console.error('Failed to fetch data info', e);
        }
    }

    document.getElementById('generateChartBtn').addEventListener('click', async () => {
        const type = document.getElementById('chartType').value;
        const x = document.getElementById('xAxis').value;
        const y = document.getElementById('yAxis').value;
        
        try {
            const response = await fetch('/api/chart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chart_type: type, x_axis: x, y_axis: y })
            });
            
            if (response.ok) {
                const data = await response.json();
                const fig = JSON.parse(data.chart_json);
                
                // Use Plotly to render
                Plotly.newPlot('plotlyChart', fig.data, fig.layout, {responsive: true});
            } else {
                alert("Failed to generate chart. Make sure dataset is uploaded.");
            }
        } catch (error) {
            console.error(error);
        }
    });

    // SQL Engine
    document.getElementById('runSqlBtn').addEventListener('click', async () => {
        const query = document.getElementById('sqlQuery').value;
        const status = document.getElementById('sqlStatus');
        
        try {
            const response = await fetch('/api/sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });
            
            const result = await response.json();
            if (response.ok) {
                status.innerText = `Returned ${result.rows} rows.`;
                
                // Build Table
                const head = document.getElementById('sqlResultsHead');
                const body = document.getElementById('sqlResultsBody');
                
                head.innerHTML = result.columns.map(c => `<th>${c}</th>`).join('');
                body.innerHTML = result.data.map(row => {
                    return `<tr>${result.columns.map(c => `<td>${row[c]}</td>`).join('')}</tr>`;
                }).join('');
            } else {
                status.innerHTML = `<span style="color:red">Error: ${result.detail}</span>`;
            }
        } catch (error) {
            console.error(error);
        }
    });

    // AI Insights
    document.getElementById('generateAiBtn').addEventListener('click', async () => {
        const apiKey = document.getElementById('apiKey').value;
        if (!apiKey) {
            alert('Please enter your API Key');
            return;
        }
        
        const loading = document.getElementById('aiLoading');
        const results = document.getElementById('aiResults');
        
        loading.classList.remove('hidden');
        results.classList.add('hidden');
        
        try {
            const response = await fetch('/api/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: apiKey })
            });
            
            const result = await response.json();
            loading.classList.add('hidden');
            
            if (response.ok) {
                results.innerHTML = result.insights_html;
                results.classList.remove('hidden');
            } else {
                alert(`Error: ${result.detail}`);
            }
        } catch (error) {
            loading.classList.add('hidden');
            console.error(error);
        }
    });
});
