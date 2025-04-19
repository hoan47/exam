const ExamDetail = (function () {
    function render(){
        showChart();
        showInfo();
        
    }
    
    function showInfo(){
        const titleEl = document.getElementById("examTitle");
        const accessEl = document.getElementById("examAccess");
        const durationEl = document.getElementById("examDuration");

        // Gán tiêu đề đề thi
        titleEl.textContent = current_exam.title;

        // Gán trạng thái truy cập
        if (current_exam.access === "free") {
            accessEl.innerHTML = `<i class="fas fa-unlock mr-1"></i> Miễn phí`;
            accessEl.classList.remove("text-yellow-300");
            accessEl.classList.add("text-green-100");
        } else {
            accessEl.innerHTML = `<i class="fas fa-crown mr-1"></i> Premium`;
            accessEl.classList.remove("text-green-100");
            accessEl.classList.add("text-yellow-300");
        }

        // Gán thời gian làm bài
        durationEl.innerHTML = `<i class="fas fa-clock mr-1"></i> ${current_exam.max_duration} phút`;
    }
    function showChart() {
        // Section Accuracy Chart
        const sectionCtx = document.getElementById('sectionChart').getContext('2d');
        new Chart(sectionCtx, {
            type: 'bar',
            data: {
                labels: ['Phần 5', 'Phần 6', 'Phần 7'],
                datasets: [{
                    label: 'Tỉ lệ đúng',
                    data: [58, 72, 60],
                    backgroundColor: '#4f46e5',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function (value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });

        // Progress Over Time Chart
        const progressCtx = document.getElementById('progressChart').getContext('2d');
        new Chart(progressCtx, {
            type: 'line',
            data: {
                labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
                datasets: [{
                    label: 'Điểm số',
                    data: [5.5, 6.2, 6.8, 7.1, 7.5, 8.0],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.05)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 5,
                        max: 10
                    }
                }
            }
        });

        // Detail Section Chart
        const detailSectionCtx = document.getElementById('detailSectionChart').getContext('2d');
        new Chart(detailSectionCtx, {
            type: 'radar',
            data: {
                labels: ['Phần 5', 'Phần 6', 'Phần 7'],
                datasets: [{
                    label: 'Kết quả',
                    data: [70, 85, 75],
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    borderColor: '#4f46e5',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
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

    function confirmStartExam(type) {
        const isConfirmed = confirm(`Bạn có chắc muốn bắt đầu ${type}?`);
        if (isConfirmed) {
            if (type === 'practice') {
                window.location = '/practice_mode/?id=' + ""
            }
            else{
                window.location = '/test_mode/?id=' + ""
            }
        } else {
            alert('Bạn đã hủy thao tác.');
        }
    }

    // Return các hàm cần thiết
    return {
        render,
        showChart,
        showTab,
        viewQuestionDetail,
        closeQuestionModal,
        viewHistoryDetail,
        backToHistoryList,
        startPractice,
        startMockTest
    };
})();