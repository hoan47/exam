document.addEventListener('DOMContentLoaded', function () {
    // Hiển thị lịch sử khi tải trang
    console.log(history_exams)
    renderHistory();
});

// Hàm hiển thị lịch sử
function renderHistory() {
    if (history_exams.length === 0) {
        historyContainer.innerHTML = `
            <div class="history-list">
                <div class="text-center py-12 px-4 max-w-md mx-auto">
                    <div class="mb-6 animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-medium text-gray-700 mb-3">Chưa có lịch sử thi nào</h3>
                    <p class="text-gray-500 mb-6">Bạn chưa tham gia bài thi nào. Hãy bắt đầu ngay để xem kết quả tại đây!</p>
                    <a href="/warehouse" class="relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                        <span>Khám phá kho đề thi</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </a>
                    <div class="mt-8 text-sm text-gray-400">
                        Bạn sẽ thấy lịch sử thi của mình xuất hiện tại đây
                    </div>
                </div>
            </div>
        `;
        return;
    }

    historyContainer.innerHTML = `
        <div class="history-list">
            <div class="grid grid-cols-1 gap-6">
                ${history_exams.map((history_exam, idx) => `
                    <div class="exam-item bg-white rounded-xl p-5 cursor-pointer shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-indigo-300 group"
                        onclick="openExam('${history_exam.exam.id}')">
                        <div class="flex items-start gap-4">
                            <div class="flex-1 min-w-0">
                                <h3 class="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors mb-1">${history_exam.exam.title}</h3>
                                <div class="flex flex-wrap items-center gap-2 mt-3">
                                    <!-- Số lượt thi đã thực hiện -->
                                    <span class="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1">
                                        <i class="fas fa-question-circle text-blue-500"></i> ${history_exam.exam.total_attemped} lượt
                                    </span>
                                    
                                    <!-- Số lần người dùng đã làm bài -->
                                    <span class="text-xs bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full flex items-center gap-1">
                                        <i class="fas fa-repeat text-yellow-500"></i> Đã làm ${history_exam.exam.user_exam_attempts} lần
                                    </span>
                                    
                                    <!-- Số người tham gia thi -->
                                    <span class="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1">
                                        <i class="fas fa-users text-purple-500"></i> ${history_exam.exam.total_participants} người
                                    </span>

                                    <!-- Thời gian làm bài -->
                                    <span class="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full flex items-center gap-1">
                                        <i class="fas fa-clock text-amber-500"></i> ${history_exam.exam.max_duration} phút
                                    </span>

                                    <!-- Số câu hỏi trong bài thi -->
                                    <span class="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full flex items-center gap-1">
                                        <i class="fas fa-list-ol text-teal-500"></i> ${history_exam.exam.total_questions} câu
                                    </span>

                                    <!-- Các phần thi -->
                                    ${history_exam.exam.parts.map(part => `
                                        <span class="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full flex items-center gap-1">
                                            <i class="fas fa-layer-group text-indigo-500"></i> Part ${part}
                                        </span>`).join('')}

                                    <!-- Tình trạng miễn phí hoặc Premium -->
                                    ${history_exam.exam.access === "free" ? `
                                        <span class="text-xs bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 border border-green-200">
                                            <i class="fas fa-unlock-alt text-green-500"></i> Miễn phí
                                        </span>
                                    ` : `
                                        <span class="text-xs bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center gap-1 border border-amber-200 shadow-sm">
                                            <i class="fas fa-crown text-amber-500"></i> Premium
                                        </span>
                                    `}

                                    <!-- Thời điểm bắt đầu thi -->
                                    <span class="text-xs bg-orange-50 text-orange-700 px-3 py-1 rounded-full flex items-center gap-1">
                                        <i class="fas fa-play-circle text-orange-500"></i> Làm lúc ${new Date(history_exam.started_at).toLocaleString('vi-VN')}
                                    </span>

                                    <!-- Thời điểm nộp bài -->
                                    <span class="text-xs bg-lime-50 text-lime-700 px-3 py-1 rounded-full flex items-center gap-1">
                                        <i class="fas fa-check-circle text-lime-500"></i> Nộp lúc ${new Date(history_exam.completed_at).toLocaleString('vi-VN')}
                                    </span>

                                    <!-- Điểm (nếu có) -->
                                    <span class="text-xs bg-pink-50 text-pink-700 px-3 py-1 rounded-full flex items-center gap-1">
                                        <i class="fas fa-star text-pink-500"></i> ${history_exam.score} điểm
                                    </span>
                                </div>
                            </div>
                            <div class="flex-shrink-0 text-gray-400 group-hover:text-indigo-500 transition-colors self-center">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Hàm xử lý khi nhấn vào một đề
function openExam(id) {
    window.location = '/exam_detail/?id=' + id;
}