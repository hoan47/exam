document.addEventListener('DOMContentLoaded', () => {
    showInfo();
});

function showInfo() {
    const titleEl = document.getElementById("examTitle");
    const accessEl = document.getElementById("examAccess");
    const durationEl = document.getElementById("examDuration");

    // Gán tiêu đề đề thi
    titleEl.textContent = exam.title;

    // Gán trạng thái truy cập
    if (exam.access === "free") {
        accessEl.innerHTML = `<i class="fas fa-unlock mr-1"></i> Miễn phí`;
        accessEl.classList.remove("text-yellow-300");
        accessEl.classList.add("text-green-100");
    } else {
        accessEl.innerHTML = `<i class="fas fa-crown mr-1"></i> Premium`;
        accessEl.classList.remove("text-green-100");
        accessEl.classList.add("text-yellow-300");
    }

    // Gán thời gian làm bài
    durationEl.innerHTML = `<i class="fas fa-clock mr-1"></i> ${exam.max_duration} phút`;

    document.getElementById("examQuestions").innerHTML =
        `<i class="fas fa-question-circle mr-1 text-white/80"></i> ${exam.stats.total_questions} câu`;

    const examPartsContainer = document.getElementById("examPartsContainer");
    examPartsContainer.innerHTML = ""; // Clear nếu có sẵn

    exam.stats.parts.forEach(part => {
        const span = document.createElement("span");
        span.className = "bg-white/10 px-3 py-1 rounded-full";
        span.innerHTML = `<i class="fas fa-layer-group mr-1 text-white/80"></i> Part ${part}`;
        examPartsContainer.appendChild(span);
    });
}

// Tab navigation
function showTab(tabName) {
    document.getElementById('statsSection').classList.add('hidden');
    document.getElementById('historySection').classList.add('hidden');

    document.getElementById('statsTab').classList.remove('tab-active');
    document.getElementById('historyTab').classList.remove('tab-active');

    document.getElementById(tabName + 'Section').classList.remove('hidden');
    document.getElementById(tabName + 'Tab').classList.add('tab-active');
}

// View question detail
function viewQuestionDetail(questionId) {
    document.getElementById('questionModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close question modal
function closeQuestionModal() {
    document.getElementById('questionModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// View history detail
function viewHistoryDetail(historyId) {
    document.getElementById('historyList').classList.add('hidden');
    document.getElementById('historyDetail').classList.remove('hidden');
}

// Back to history list
function backToHistoryList() {
    document.getElementById('historyDetail').classList.add('hidden');
    document.getElementById('historyList').classList.remove('hidden');
}

// Start practice
function startPractice() {
    confirmStartExam('practice');
}

// Start mock test
function startMockTest() {
    confirmStartExam('test');
}

function confirmStartExam(mode) {
    const isConfirmed = confirm(`Bạn có chắc muốn bắt đầu ${mode}?`);

    if (isConfirmed) {
        fetch('/insert_history_exam/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'user_id': user.id,
                'exam_id': exam.id,
                'mode': mode
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log('Tạo thành công!');
                    window.location.href = `/${mode}_mode/`;
                } else {
                    console.log('Thất bại: ' + data.message);
                }
            })
            .catch(() => {
                alert('Lỗi kết nối server!');
                loadFolders();
            });
    }
}
function formatDate(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
}


const groupedByMode = history_exams.reduce((acc, item) => {
    const mode = item.mode;
    if (!acc[mode]) acc[mode] = {
        dates: [],
        weakQuestions: [],
        correct: [],
        wrong: [],
        unknown: [],
        noAnswer: [],
    };
    const wrongQuestions = item.history_answers.filter(ans => ans.question?.stats?.all?.wrong_percent >= 40);
    const correct = item.history_answers.filter(answer => answer.selected_option === answer.question.correct_answer).length;
    const wrong = item.history_answers.filter(answer => answer.selected_option != "X" && answer.selected_option != null && answer.selected_option !== answer.question.correct_answer).length;
    const unknown = item.history_answers.filter(answer => answer.selected_option === "X").length;
    const noAnswer = item.history_answers.filter(answer => answer.selected_option === null).length;

    acc[mode].dates.push(formatDate(item.started_at));
    acc[mode].weakQuestions.push(wrongQuestions);
    acc[mode].correct.push(correct);
    acc[mode].wrong.push(wrong);
    acc[mode].unknown.push(unknown);
    acc[mode].noAnswer.push(noAnswer);
    

    return acc;
}, {});

console.log(history_exams);
console.log(groupedByMode);

document.addEventListener('DOMContentLoaded', function () {
    // ========== CẤU HÌNH DỮ LIỆU ==========
    const dataConfig = {
        practice: {
            avgTime: 38,
            chart: {
                labels: groupedByMode.practice.dates,
                correct: groupedByMode.practice.correct,
                wrong: groupedByMode.practice.wrong,
                unknown: groupedByMode.practice.unknown,
                noAnswer: groupedByMode.practice.noAnswer
            },
            weakQuestions: [
                { id: 7, content: "Đọc hiểu đoạn văn practice", part: "Phần 7", wrongPercentage: 70, wrongTimes: 4, totalAttempts: 5 },
            ]
        },
        test: {
            avgTime: 38,
            chart: {
                labels: groupedByMode.test.dates,
                correct: groupedByMode.test.correct,
                wrong: groupedByMode.test.wrong,
                unknown: groupedByMode.test.unknown,
                noAnswer: groupedByMode.test.noAnswer
            },
            weakQuestions: [
                { id: 7, content: "Đọc hiểu đoạn văn test", part: "Phần 5", wrongPercentage: 80, wrongTimes: 4, totalAttempts: 5 },
            ]
        }
    };

    // ========== HÀM TẠO GIAO DIỆN ==========
    function renderSection(dataConfig) {
        const { avgTime, chart, weakQuestions} = dataConfig;
        const totalAttempts = chart.labels.length; // Tính tổng số lần làm dựa vào labels

        const html = `
        <div class="stats-section space-y-6">
        <!-- Thống kê nhanh -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="stats-card bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex items-center">
            <div class="icon bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <i class="fas fa-calendar-check text-indigo-600 text-lg"></i>
            </div>
            <div>
                <div class="stats-label text-gray-500 text-sm font-medium">Tổng số lần làm</div>
                <div class="stats-value text-2xl font-bold text-gray-800 mt-1">${totalAttempts}</div>
            </div>
            </div>
            
            <div class="stats-card bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex items-center">
            <div class="icon bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <i class="fas fa-stopwatch text-purple-600 text-lg"></i>
            </div>
            <div>
                <div class="stats-label text-gray-500 text-sm font-medium">Thời gian TB</div>
                <div class="stats-value text-2xl font-bold text-gray-800 mt-1">${avgTime}<span class="text-gray-500 font-normal ml-1 text-base">phút</span></div>
            </div>
            </div>
        </div>

        <!-- Biểu đồ -->
        <div class="chart-container bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Tiến trình luyện tập</h3>
            
            <!-- Filter Controls -->
            <div class="chart-filters flex flex-wrap gap-4 mb-4 p-3 rounded-lg">
                <label class="filter-option flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" id="correctToggle" checked 
                        class="appearance-none w-5 h-5 border-2 border-green-500 rounded transition-all"
                        style="background-color: #10B981;">
                    <span class="text-green-600 font-medium">Câu đúng</span>
                </label>
                
                <label class="filter-option flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" id="wrongToggle" checked 
                        class="appearance-none w-5 h-5 border-2 border-red-500 rounded transition-all"
                        style="background-color: #EF4444;">
                    <span class="text-red-600 font-medium">Câu sai</span>
                </label>
                
                <label class="filter-option flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" id="unknownToggle" checked 
                        class="appearance-none w-5 h-5 border-2 border-yellow-500 rounded transition-all"
                        style="background-color: #FBBF24;">
                    <span class="text-yellow-600 font-medium">Không biết làm</span>
                </label>
                
                <label class="filter-option flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" id="noAnswerToggle" checked 
                        class="appearance-none w-5 h-5 border-2 border-gray-400 rounded transition-all"
                        style="background-color: #9CA3AF;">
                    <span class="text-gray-600 font-medium">Không chọn đáp án</span>
                </label>
            </div>

            <!-- Chart Canvas -->
            <div class="chart-wrapper" style="position: relative; height: 400px; width: 100%;">
                <canvas id="progressChart" height="400"></canvas>
            </div>
        </div>

        <!-- Câu hỏi yếu -->
        <div class="weak-questions bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800">Câu hỏi cần cải thiện</h3>
            <span class="text-sm text-gray-500">${weakQuestions.length} câu hỏi</span>
            </div>
            
            <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50">
                <tr class="text-left text-gray-500 text-sm">
                    <th class="px-4 py-3 font-medium rounded-l-lg">Câu hỏi</th>
                    <th class="px-4 py-3 font-medium">Phần</th>
                    <th class="px-4 py-3 font-medium">Tỉ lệ sai</th>
                    <th class="px-4 py-3 font-medium rounded-r-lg">Thao tác</th>
                </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                ${weakQuestions.map(q => {
            return `
                    <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3">
                        <div class="flex items-center">
                        <div class="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">${q.id}</div>
                        <div class="font-medium text-gray-800">${q.content}</div>
                        </div>
                    </td>
                    <td class="px-4 py-3 text-gray-600">${q.part}</td>
                    <td class="px-4 py-3">
                        <div class="flex items-center">
                        <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div class="bg-red-500 h-2 rounded-full" style="width: ${q.wrongPercentage}%"></div>
                        </div>
                        <span class="text-sm font-medium ${q.wrongPercentage > 50 ? 'text-red-600' : 'text-gray-600'}">${q.wrongPercentage}%</span>
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <button onclick="viewDetail(${q.id})" class="text-indigo-600 hover:text-indigo-800 font-medium text-sm px-3 py-1 rounded-md hover:bg-indigo-50 transition-colors">
                        Xem
                        </button>
                    </td>
                    </tr>
                    `;
        }).join('')}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    `;

        document.getElementById('contentContainer').innerHTML = html;

        const toggles = [
            { id: "correctToggle", color: "#10B981" }, // green
            { id: "wrongToggle", color: "#EF4444" },   // red
            { id: "unknownToggle", color: "#F59E0B" }, // yellow
            { id: "noAnswerToggle", color: "#9CA3AF" } // gray
        ];
    
        toggles.forEach(({ id, color }) => {
            const checkbox = document.getElementById(id);
            if (!checkbox) return;
    
            // Gán màu ban đầu
            checkbox.style.backgroundColor = checkbox.checked ? color : "transparent";
    
            // Bắt sự kiện toggle
            checkbox.addEventListener("change", function () {
                this.style.backgroundColor = this.checked ? color : "transparent";
                renderChart(dataConfig.chart);
            });
        });

        renderChart(dataConfig.chart);
    }

    // ========== HÀM VẼ BIỂU ĐỒ ==========
    let myChart = null;
    function renderChart(dataConfig) {
        const ctx = document.getElementById('progressChart').getContext('2d');
        const { labels, correct, wrong, unknown, noAnswer } = dataConfig;
        const datasets = [];

        if (document.getElementById('correctToggle')?.checked) {
            datasets.push({
                label: 'Câu đúng',
                data: correct,
                borderColor: '#10B981',
                borderWidth: 3,
                tension: 0.3,
                pointBackgroundColor: '#10B981',
                pointRadius: 5,
                pointHoverRadius: 8
            });
        }

        if (document.getElementById('wrongToggle')?.checked) {
            datasets.push({
                label: 'Câu sai',
                data: wrong,
                borderColor: '#EF4444',
                borderWidth: 3,
                tension: 0.3,
                pointBackgroundColor: '#EF4444',
                pointRadius: 5,
                pointHoverRadius: 8
            });
        }

        if (document.getElementById('unknownToggle')?.checked) {
            datasets.push({
                label: 'Không biết làm',
                data: unknown,
                borderColor: '#FBBF24',
                borderWidth: 3,
                tension: 0.3,
                pointBackgroundColor: '#FBBF24',
                pointRadius: 5,
                pointHoverRadius: 8
            });
        }

        if (document.getElementById('noAnswerToggle')?.checked) {
            datasets.push({
                label: 'Không chọn đáp án',
                data: noAnswer,
                borderColor: '#9CA3AF',
                borderWidth: 3,
                tension: 0.3,
                pointBackgroundColor: '#9CA3AF',
                pointRadius: 5,
                pointHoverRadius: 8
            });
        }

        // ✅ Xóa biểu đồ cũ trước khi tạo biểu đồ mới
        if (myChart) {
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#1F2937',
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 },
                        padding: 12
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        suggestedMax: 10,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            stepSize: 2,
                            font: {
                                size: 12
                            }
                        },
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            maxRotation: 45,
                            minRotation: 30
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }


    // ========== XỬ LÝ SỰ KIỆN ==========
    function switchTab(activeTab) {
        // Đổi style nút
        document.getElementById('practiceBtn').classList.toggle('active', activeTab === 'practice');
        document.getElementById('mockBtn').classList.toggle('active', activeTab === 'mock');

        // Hiển thị nội dung tương ứng
        if (activeTab === 'practice') {
            renderSection(dataConfig.practice);
        } else {
            renderSection(dataConfig.test);
        }
    }

    // Gán sự kiện
    document.getElementById('practiceBtn').addEventListener('click', () => switchTab('practice'));
    document.getElementById('mockBtn').addEventListener('click', () => switchTab('mock'));

    // Khởi tạo ban đầu
    switchTab('practice');

    // Hàm global để xem chi tiết (có thể mở modal/popup)
    window.viewDetail = (id) => {
        alert(`Xem chi tiết câu hỏi #${id}`);
    };
});
