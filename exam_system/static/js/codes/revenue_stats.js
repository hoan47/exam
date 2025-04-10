let chart;

let labels = [];
let revenues = [];
let counts = [];
let chartTitle = '';
let nextView = '';
let nextParam = '';
let selectedYear = null;
let selectedMonth = null;
let viewType = 'year';
let packages = null;
let users = null

function showTables() {
    // Gói
    const packageTable = document.querySelector('.package-table tbody');
    packageTable.innerHTML = '';
    packages.forEach(pkg => {
        const row = `<tr>
            <td>${pkg.duration}</td>
            <td class="number-cell">${pkg.total.toLocaleString()}</td>
            <td class="percent-cell"><span class="percent-text">${pkg.percent.toFixed(2)}</span></td>
        </tr>`;
        packageTable.innerHTML += row;
    });

    // User
    const userTable = document.querySelector('.user-table tbody');
    userTable.innerHTML = '';
    users.forEach(user => {
        const row = `<tr>
            <td>
                <div class="user-cell">
                    <div class="user-avatar">${user.email[0].toUpperCase()}</div>
                    ${user.email}
                </div>
            </td>
            <td class="number-cell">${user.total_revenue.toLocaleString()}</td>
        </tr>`;
        userTable.innerHTML += row;
    });
}


// Hàm gọi API và cập nhật dữ liệu
function updateChartData(view, year = null, month = null) {
    const params = new URLSearchParams();
    params.append('view', view);
    if (year) params.append('year', year);
    if (month) params.append('month', month);

    fetch(`/admin/codes/get_revenue_stats/?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Cập nhật biến dữ liệu từ response
                labels = data.chart_labels;
                revenues = data.chart_revenues;
                counts = data.chart_counts;
                chartTitle = data.chart_title;
                nextView = data.next_view;
                nextParam = data.next_param;
                selectedYear = data.selected_year;
                selectedMonth = data.selected_month;
                viewType = data.view_type;
                users = data.users;
                packages = data.packages
                showTables();
                updateChart();
            } else {
                console.error('Lỗi khi lấy dữ liệu biểu đồ');
            }
        })
        .catch(error => {
            console.error('Có lỗi xảy ra:', error);
        });
}

updateChartData(viewType);

// Navigation back function
function goBack() {
    if (selectedMonth){
        selectedMonth = null
        nextView = 'month'
    }
    else if (selectedYear){
        selectedYear = null
        nextView = 'year'
    }
    updateChartData(nextView, selectedYear, selectedMonth);
}

function updateChart() {
    document.getElementById('lastUpdate').textContent = new Date().toLocaleDateString('vi-VN');


    // Calculate totals for summary stats
    const totalRev = revenues.reduce((sum, val) => sum + val, 0);
    const totalCount = counts.reduce((sum, val) => sum + val, 0);
    const avgValue = totalCount > 0 ? totalRev / totalCount : 0;

    document.getElementById('section-title').innerText = chartTitle;

    const backButton = document.querySelector('.back-button');
    if (viewType === 'year') {
        backButton.style.display = 'none';
    } else {
        backButton.style.display = 'block';
    }
    
    // Update summary cards
    document.getElementById('totalRevenue').textContent = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(totalRev);

    document.getElementById('totalTransactions').textContent = totalCount.toLocaleString('vi-VN');

    document.getElementById('avgValue').textContent = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(avgValue);

    // Find most popular package (assuming the first one in the list is the most popular)
    if (document.getElementById('popularPackage')) {
        document.getElementById('popularPackage').textContent = packages[0]?.duration + ' tháng' || '-';
    }

    // Fill date selectors if needed
    if (viewType === 'month' || viewType === 'day') {
        // Populate with available years (example data)
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= currentYear - 3; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (selectedYear == i) option.selected = true;
        }
    }

    // Chart configuration with improved styling
    if (chart) {
        chart.destroy();
    }

    const ctx = document.getElementById('revenueChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: "Doanh thu (VNĐ)",
                data: revenues,
                backgroundColor: 'rgba(67, 97, 238, 0.7)',
                borderColor: 'rgba(67, 97, 238, 1)',
                borderWidth: 1,
                borderRadius: 6,
                yAxisID: 'y-revenue'
            }, {
                label: 'Số lượng',
                data: counts,
                backgroundColor: 'rgba(255, 158, 0, 0.7)',
                borderColor: 'rgba(255, 158, 0, 1)',
                borderWidth: 1,
                borderRadius: 6,
                yAxisID: 'y-count'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            family: "'Montserrat', sans-serif",
                            size: 12
                        },
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#2b2d42',
                    bodyColor: '#2b2d42',
                    borderColor: '#e9ecef',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        family: "'Montserrat', sans-serif",
                        weight: 'bold',
                        size: 14
                    },
                    bodyFont: {
                        family: "'Montserrat', sans-serif",
                        size: 13
                    },
                    callbacks: {
                        title: function(context) {
                            if (viewType === 'year')
                                return 'Năm: ' + context[0].label;
                            if (viewType === 'month')
                                return 'Tháng ' + context[0].label + '/' + selectedYear;
                            if (viewType == 'day')
                                return 'Ngày ' + context[0].label + '/' + selectedMonth + '/' + selectedYear;
                        },
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                if (context.dataset.yAxisID === 'y-revenue') {
                                    label += new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                        maximumFractionDigits: 0
                                    }).format(context.parsed.y);
                                } else {
                                    label += context.parsed.y;
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Montserrat', sans-serif",
                            size: 11
                        },
                        padding: 8
                    }
                },
                'y-revenue': {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.03)',
                        drawBorder: false
                    },
                    border: {
                        display: false
                    },
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('vi-VN', { 
                                style: 'currency', 
                                currency: 'VND',
                                notation: 'compact',
                                compactDisplay: 'short',
                                maximumFractionDigits: 1
                            }).format(value);
                        },
                        font: {
                            family: "'Montserrat', sans-serif",
                            size: 11
                        },
                        padding: 10
                    }
                },
                'y-count': {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                        drawBorder: false
                    },
                    border: {
                        display: false
                    },
                    ticks: {
                        precision: 0,
                        font: {
                            family: "'Montserrat', sans-serif",
                            size: 11
                        },
                        padding: 10
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const label = chart.data.labels[index];
                    if (nextView) {
                        if (nextView == 'month'){
                            selectedYear = label
                        }
                        else if (nextView == 'day') {
                            selectedMonth = label
                        }

                        updateChartData(nextView, selectedYear, selectedMonth);
                    }
                }
            }
        }
    });
}