document.addEventListener('DOMContentLoaded', () => {
    showInfo();
    switchTab('practice');

    // Gán sự kiện
    document.getElementById('practiceBtn').addEventListener('click', () => switchTab('practice'));
    document.getElementById('mockBtn').addEventListener('click', () => switchTab('mock'));



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

function viewQuestionDetail(button) {
    // Vô hiệu hóa cuộn trang chính
    document.body.style.overflow = 'hidden';

    const history_answer = JSON.parse(button.getAttribute('data-question'))
    const selectedOption = history_answer.selected_option
    const q = history_answer.question;
    const [number, content] = splitQuestion(q.text);
    const modal = document.getElementById('questionModal');

    const modalContent = modal.querySelector('.transform');
    if (q.part == 5){
        modalContent.style.maxWidth = '1000px';
    }
    else{
        modalContent.style.maxWidth = '1450px';
    }
    // Điền dữ liệu vào modal
    document.getElementById('questionNumber').textContent = number;
    document.getElementById('partNumber').textContent = q.part;
    document.getElementById('questionContent').textContent = content
        ? q.text.substring(q.text.indexOf('.') + 1).trim()
        : q.text;

    // Điền đáp án
    document.getElementById('optionA').textContent = q.option_A;
    document.getElementById('optionB').textContent = q.option_B;
    document.getElementById('optionC').textContent = q.option_C;
    document.getElementById('optionD').textContent = q.option_D;

    // Điền giải thích
    document.getElementById('questionExplanation').innerText = q.explanation;

    // Điền thống kê
    const correctPercent = q.stats.user.correct_percent || 0;
    document.getElementById('correctPercent').textContent = `${correctPercent}%`;
    document.getElementById('correctPercentBar').style.width = `${correctPercent}%`;
    // Điền thống kê
    const wrongPercent = q.stats.user.wrong_percent || 0;
    const wrong = q.stats.user.wrong || 0;
    const total = q.stats.user.total || 0;
    document.getElementById('userWrongStats').textContent = `${wrong}/${total}`;
    document.getElementById('userWrongBar').style.width = `${wrongPercent}%`;

    // Xóa hết màu sắc trước đó (các lớp màu đỏ và xanh cũ)
    const optionContainers = document.querySelectorAll('.option-container');
    optionContainers.forEach(container => {
        container.classList.remove('border-red-200', 'bg-red-50', 'text-red-600');
        container.classList.remove('border-green-200', 'bg-green-50', 'text-green-600');
        
        const containerDiv = container.querySelector('div');
        if (containerDiv) {
            containerDiv.classList.replace('bg-green-100', 'bg-gray-100');
            containerDiv.classList.replace('bg-red-100', 'bg-gray-100');
        }
    });

    // Xử lý đáp án đúng/sai
    resetAnswerStyles();

    const correctOption = q.correct_answer; // Đáp án đúng
    const correctContainer = document.getElementById(`option${correctOption}-container`);
    if (correctContainer) {
        // Hiển thị đáp án đúng
        correctContainer.classList.add('border-green-500', 'bg-green-100');
        const correctDiv = correctContainer.querySelector('div');
        if (correctDiv) {
            correctDiv.classList.replace('bg-gray-100', 'bg-green-100');
        }
        const correctSpan = correctContainer.querySelector('span');
        if (correctSpan) {
            correctSpan.classList.add('text-green-600', 'font-medium');
        }
    }

    // Nếu người dùng chọn sai đáp án
    if (selectedOption && selectedOption !== correctOption && selectedOption !== "X") {
        const userContainer = document.getElementById(`option${selectedOption}-container`);
        if (userContainer) {
            // Hiển thị đáp án sai
            userContainer.classList.add('border-red-500', 'bg-red-100');
            const userDiv = userContainer.querySelector('div');
            if (userDiv) {
                userDiv.classList.replace('bg-gray-100', 'bg-red-100');
            }
            const userSpan = userContainer.querySelector('span');
            if (userSpan) {
                userSpan.classList.add('text-red-600');
            }
        }
    }

    // Xử lý đoạn văn (nếu có)
    const passageContainer = document.getElementById('questionPassageContainer');
    if (q.passage) {
        passageContainer.classList.remove('hidden');
        document.getElementById('questionPassage').innerHTML = q.passage.text;
    } else {
        passageContainer.classList.add('hidden');
    }

    // Hiển thị modal với hiệu ứng
    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

// Hàm reset tất cả các màu và lớp cho các đáp án
function resetAnswerStyles() {
    const options = ['A', 'B', 'C', 'D']; // Các đáp án A, B, C, D
    options.forEach(option => {
        const optionContainer = document.getElementById(`option${option}-container`);
        if (optionContainer) {
            // Xóa các lớp màu sắc cũ
            optionContainer.classList.remove(
                'border-green-500', 'bg-green-100', 'text-green-600', 'font-medium',
                'border-red-500', 'bg-red-100', 'text-red-600', 
                'border-gray-200', 'bg-white'
            );
            
            const optionDiv = optionContainer.querySelector('div');
            if (optionDiv) {
                optionDiv.classList.remove('bg-gray-100', 'bg-green-100', 'bg-red-100');
            }

            const optionSpan = optionContainer.querySelector('span');
            if (optionSpan) {
                optionSpan.classList.remove('text-green-600', 'text-red-600', 'font-medium');
            }
        }
    });
}

// Close question modal
function closeQuestionModal() {
    // Khôi phục cuộn trang chính
    document.body.style.overflow = '';
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
                alert('Đã có lỗi xãy ra');
                location.reload();
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

const groupedByMode = history_exams.reduce((acc, history_exam) => {
    const mode = history_exam.mode;

    if (!acc[mode]) {
        acc[mode] = {
            stats: {
                dates: [],
                correct: [],
                wrong: [],
                unknown: [],
                noAnswer: [],
                totalTime: 0,  // tổng thời gian làm
                highestScore: 0,  // điểm cao nhất
                averageTime: 0,  // thời gian trung bình
                totalScore: 0,  // tổng điểm (để tính điểm trung bình)
            },
            groupedQuestions: {}  // nơi gom nhóm câu hỏi
        };
    }

    // Tính các giá trị như đúng, sai, không trả lời, thời gian làm
    const correct = history_exam.history_answers.filter(answer => answer.selected_option === answer.question.correct_answer).length;
    const wrong = history_exam.history_answers.filter(answer => answer.selected_option !== "X" && answer.selected_option !== null && answer.selected_option !== answer.question.correct_answer).length;
    const unknown = history_exam.history_answers.filter(answer => answer.selected_option === "X").length;
    const noAnswer = history_exam.history_answers.filter(answer => answer.selected_option === null).length;

    // Tính thời gian làm (thời gian bắt đầu và kết thúc)
    const examTime = new Date(history_exam.completed_at) - new Date(history_exam.started_at);  // Thời gian làm bài tính bằng ms
    const score = correct;  // Điểm (có thể thay đổi nếu cần, ví dụ nhân hệ số)

    // Cập nhật stats
    acc[mode].stats.dates.push(formatDate(history_exam.started_at));
    acc[mode].stats.correct.push(correct);
    acc[mode].stats.wrong.push(wrong);
    acc[mode].stats.unknown.push(unknown);
    acc[mode].stats.noAnswer.push(noAnswer);
    acc[mode].stats.totalTime += examTime;  // Cộng dồn thời gian làm bài
    acc[mode].stats.highestScore = Math.max(acc[mode].stats.highestScore, score);  // Cập nhật điểm cao nhất
    acc[mode].stats.totalScore += score;  // Cộng dồn tổng điểm để tính điểm trung bình

    // Cập nhật thời gian trung bình
    acc[mode].stats.averageTime = acc[mode].stats.totalTime / acc[mode].stats.dates.length;

    // Cập nhật điểm trung bình
    acc[mode].stats.averageScore = acc[mode].stats.totalScore / acc[mode].stats.dates.length;

    // Nhóm câu hỏi: Sử dụng `map` để lọc ra các câu hỏi có điểm sai > 40%
    history_exam.history_answers.map(answer => {
        const q = answer.question;
        if (!q) return;
        if (!q.stats || q.stats.user.wrong_percent < 40) return;

        const key = JSON.stringify({
            part: q.part,
            text: q.text,
            option_A: q.option_A,
            option_B: q.option_B,
            option_C: q.option_C,
            option_D: q.option_D,
            correct_answer: q.correct_answer,
            passage_text: q.passage?.text || null
        });

        acc[mode].groupedQuestions[key] = answer;
    });

    return acc;
}, {});


console.log(history_exams);
console.log(groupedByMode);

const dataConfig = {
    practice: {
        highestScore: groupedByMode.practice?.stats?.highestScore ?? 0,
        // Tính averageTime (chuyển từ ms sang phút)
        averageTime: isNaN(groupedByMode.practice?.stats?.averageTime / (1000 * 60)) ? 0 : (groupedByMode.practice?.stats?.averageTime / (1000 * 60)).toFixed(2),
        // Tính averageScore
        averageScore: isNaN(groupedByMode.practice?.stats?.correct.reduce((sum, score) => sum + score, 0) / groupedByMode.practice?.stats?.correct.length) ? 0 : (groupedByMode.practice?.stats?.correct.reduce((sum, score) => sum + score, 0) / groupedByMode.practice?.stats?.correct.length).toFixed(2),
        // Tính avgTime (thời gian trung bình làm)
        avgTime: groupedByMode.practice?.stats?.averageTimeInMinutes ?? 0,
        chart: {
            labels: groupedByMode.practice?.stats?.dates ?? [],
            correct: groupedByMode.practice?.stats?.correct ?? [],
            wrong: groupedByMode.practice?.stats?.wrong ?? [],
            unknown: groupedByMode.practice?.stats?.unknown ?? [],
            noAnswer: groupedByMode.practice?.stats?.noAnswer ?? []
        },
        weakQuestions: Object.values(groupedByMode.practice?.groupedQuestions ?? {})
    },
    test: {
        highestScore: groupedByMode.test?.stats?.highestScore ?? 0,
        // Tính averageTime (chuyển từ ms sang phút)
        averageTime: isNaN(groupedByMode.test?.stats?.averageTime / (1000 * 60)) ? 0 : (groupedByMode.test?.stats?.averageTime / (1000 * 60)).toFixed(2),
        // Tính averageScore
        averageScore: isNaN(groupedByMode.test?.stats?.correct.reduce((sum, score) => sum + score, 0) / groupedByMode.test?.stats?.correct.length) ? 0 : (groupedByMode.test?.stats?.correct.reduce((sum, score) => sum + score, 0) / groupedByMode.test?.stats?.correct.length).toFixed(2),
        // Tính avgTime (thời gian trung bình làm)
        avgTime: groupedByMode.test?.stats?.averageTimeInMinutes ?? 0,
        chart: {
            labels: groupedByMode.test?.stats?.dates ?? [],
            correct: groupedByMode.test?.stats?.correct ?? [],
            wrong: groupedByMode.test?.stats?.wrong ?? [],
            unknown: groupedByMode.test?.stats?.unknown ?? [],
            noAnswer: groupedByMode.test?.stats?.noAnswer ?? []
        },
        weakQuestions: Object.values(groupedByMode.test?.groupedQuestions ?? {})
    }
};



function renderSection(dataConfig) {
    const {highestScore, averageTime, averageScore, avgTime, chart, weakQuestions } = dataConfig;
    const totalAttempts = chart.labels.length; // Tính tổng số lần làm dựa vào labels

    const html = `
    <div class="stats-section space-y-4">
    <!-- Thống kê nhanh -->
        <!-- Thống kê nhanh -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- Total Attempts Card -->
        <div class="stats-card bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex items-center">
            <div class="icon bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
            <i class="fas fa-calendar-check text-indigo-600 text-lg"></i>
            </div>
            <div>
            <div class="stats-label text-gray-500 text-sm font-medium">Tổng số lần làm</div>
            <div class="stats-value text-2xl font-bold text-gray-800 mt-1">${totalAttempts}</div>
            </div>
        </div>
        
        <!-- Average Time Card -->
        <div class="stats-card bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex items-center">
            <div class="icon bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
            <i class="fas fa-stopwatch text-purple-600 text-lg"></i>
            </div>
            <div>
            <div class="stats-label text-gray-500 text-sm font-medium">Thời gian TB</div>
            <div class="stats-value text-2xl font-bold text-gray-800 mt-1">${averageTime}<span class="text-gray-500 font-normal ml-1 text-base">phút</span></div>
            </div>
        </div>

        <!-- Highest Score Card -->
        <div class="stats-card bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex items-center">
            <div class="icon bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
            <i class="fas fa-trophy text-emerald-600 text-lg"></i>
            </div>
            <div>
            <div class="stats-label text-gray-500 text-sm font-medium">Điểm cao nhất</div>
            <div class="stats-value text-2xl font-bold text-gray-800 mt-1">${highestScore}<span class="text-gray-500 font-normal ml-1 text-base">/10</span></div>
            </div>
        </div>

        <!-- Average Score Card -->
        <div class="stats-card bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex items-center">
            <div class="icon bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
            <i class="fas fa-chart-line text-blue-600 text-lg"></i>
            </div>
            <div>
            <div class="stats-label text-gray-500 text-sm font-medium">Điểm trung bình</div>
            <div class="stats-value text-2xl font-bold text-gray-800 mt-1">${averageScore}<span class="text-gray-500 font-normal ml-1 text-base">/10</span></div>
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
        <tbody class="divide-y divide-gray-100">
  ${weakQuestions.map(item => {
    const q = item.question;
    const [number, content] = splitQuestion(q.text);
    const wrongPercent = q.stats.user.wrong_percent;
    const isCritical = wrongPercent >= 60;
    
    return `
    <tr class="hover:bg-gray-50 transition-colors">
      <!-- Số thứ tự -->
      <td class="pl-6 pr-3 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-lg ${isCritical ? 'bg-red-500/10 text-red-600' : 'bg-blue-500/10 text-blue-600'} flex items-center justify-center font-medium text-sm">
            ${number}
          </div>
        </div>
      </td>
      
      <!-- Nội dung câu hỏi -->
      <td class="px-3 py-4">
        <div class="flex flex-col">
          <p class="text-gray-800 font-medium line-clamp-2 leading-snug">${content || "_____"}</p>
          <span class="text-xs text-gray-400 mt-1">Phần ${q.part}</span>
        </div>
      </td>
      <!-- Tỉ lệ sai -->
      <td class="px-3 py-4 whitespace-nowrap">
        <div class="flex flex-col items-end">
          <div class="flex items-center">
            <div class="w-20 h-1.5 bg-gray-200 rounded-full mr-2">
              <div class="h-1.5 rounded-full ${isCritical ? 'bg-red-500' : 'bg-amber-400'}" style="width: ${wrongPercent}%"></div>
            </div>
            <span class="text-sm font-medium ${isCritical ? 'text-red-600' : 'text-amber-600'}">${wrongPercent}%</span>
          </div>
        </div>
      </td>
      
      <!-- Nút hành động -->
      <td class="pr-6 pl-3 py-4 whitespace-nowrap text-right">
        <button onclick="viewQuestionDetail(this)"
                data-question='${JSON.stringify(item).replace(/'/g, "&apos;")}'
                class="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo-300 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 transition-all">
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

function splitQuestion(rawText) {
    const match = rawText.match(/^(\d+)\.\s+(.*)/);
    if (match) {
        const number = match[1];
        const content = match[2];
        return [number, content];
    }
    return [null, rawText]; // nếu không khớp thì trả về null và toàn bộ chuỗi
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
    const practiceBtn = document.getElementById('practiceBtn');
    const mockBtn = document.getElementById('mockBtn');
    practiceBtn.classList.toggle('active', activeTab === 'practice');
    mockBtn.classList.toggle('active', activeTab === 'mock');


    // Hiển thị nội dung tương ứng
    if (activeTab === 'practice') {
        renderSection(dataConfig.practice);
    } else {
        renderSection(dataConfig.test);
    }
}


function toggleQuestionDetails(id) {
    const details = document.getElementById(`details-${id}`);
    const icon = document.getElementById(`icon-${id}`);

    console.log(details);
}


function splitQuestion(rawText) {
    const match = rawText.match(/^(\d+)\.\s+(.*)/);
    if (match) {
        const number = match[1];
        const content = match[2];
        return [number, content];
    }
    return [null, rawText]; // nếu không khớp thì trả về null và toàn bộ chuỗi
}
