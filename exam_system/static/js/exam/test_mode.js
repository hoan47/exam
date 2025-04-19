// scripts/test.js
document.addEventListener('DOMContentLoaded', function() {
    const examData = parseExamData();
    if (!examData) return;

    const examTitleEl = document.getElementById('exam-title');
    const tabsContainer = document.getElementById('part-tabs');
    const questionArea = document.getElementById('question-area');
    const navContainer = document.getElementById('question-nav');
    const timerDisplay = document.getElementById('timerDisplay');
    const submitModal = document.getElementById('submit-modal');
    const confirmSubmit = document.getElementById('confirm-submit');
    const cancelSubmit = document.getElementById('cancel-submit');
    const scoreDisplay = document.getElementById('score-display');

    let answeredQuestions = new Set();
    let timerInterval = null;
    let minutes = examData.exam.max_duration;
    let seconds = 0;

    examTitleEl.textContent = examData.exam.title;

    function startTimer() {
        timerInterval = setInterval(function() {
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(timerInterval);
                    submitModal.style.display = 'flex';
                    scoreDisplay.style.display = 'block';
                    scoreDisplay.textContent = `Hết giờ! Điểm của bạn: ${calculateScore()}/${examData.questions.length}`;
                    confirmSubmit.style.display = 'none';
                    cancelSubmit.textContent = 'Đóng';
                    return;
                }
                minutes--;
                seconds = 59;
            } else {
                seconds--;
            }
            const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
            const displaySeconds = seconds < 10 ? `0${seconds}` : seconds;
            timerDisplay.textContent = `${displayMinutes}:${displaySeconds}`;
        }, 1000);
    }

    function calculateScore() {
        let score = 0;
        examData.questions.forEach(q => {
            const questionId = q._id;
            const selectedOption = document.querySelector(`input[name="q${questionId}"]:checked`);
            if (selectedOption && selectedOption.value === q.correct_answer) {
                score++;
            }
        });
        return score;
    }

    function switchTab(partToShow) {
        tabsContainer.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.part === partToShow);
        });
        questionArea.querySelectorAll('.part-content').forEach(pane => {
            pane.classList.toggle('active', pane.dataset.part === partToShow);
        });
        
        // Cuộn lên đầu phần nội dung
        questionArea.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function scrollToQuestion(questionId) {
        const questionElement = questionArea.querySelector(`.question-block[data-question-id="${questionId}"]`);
        if (questionElement) {
            questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            questionElement.style.backgroundColor = 'var(--primary-light)';
            setTimeout(() => {
                questionElement.style.backgroundColor = '';
            }, 1000);
        }
    }

    function handleAnswerSelection(questionId, selectedOption, optionsList) {
        const navItem = navContainer.querySelector(`.nav-item[data-question-id="${questionId}"]`);
        if (navItem) {
            navItem.classList.add('answered');
            answeredQuestions.add(questionId);
        }
        const questionDiv = questionArea.querySelector(`[data-question-id="${questionId}"]`);
        let clearBtn = questionDiv.querySelector('.clear-answer-btn');
        if (!clearBtn) {
            clearBtn = document.createElement('button');
            clearBtn.className = 'clear-answer-btn';
            clearBtn.textContent = 'Xóa đáp án';
            questionDiv.appendChild(clearBtn);
            clearBtn.addEventListener('click', function() {
                const radios = questionDiv.querySelectorAll(`input[name="q${questionId}"]`);
                radios.forEach(r => r.checked = false);
                navItem.classList.remove('answered');
                navItem.classList.remove('cleared'); // Xóa class cleared
                answeredQuestions.delete(questionId);
                clearBtn.remove(); // Xóa nút xóa đáp án
            });
        }
    }

    
    const parts = [...new Set(examData.questions.map(q => q.part))].sort();
    parts.forEach((part, index) => {
        tabsContainer.appendChild(createTab(part, index === 0));
    });

    renderQuestions(examData, questionArea, navContainer, switchTab, scrollToQuestion, (q) => {
        return createQuestionElement(q, handleAnswerSelection);
    });

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const part = tab.dataset.part;
            switchTab(part);
        });
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const questionId = item.dataset.questionId;
            const part = item.dataset.part;
            switchTab(part);
            setTimeout(() => scrollToQuestion(questionId), 50);
        });
    });

    document.getElementById('submit-btn').addEventListener('click', function() {
        submitModal.style.display = 'flex';
        scoreDisplay.style.display = 'none';
        confirmSubmit.style.display = 'inline-block';
        cancelSubmit.textContent = 'Hủy';
    });

    confirmSubmit.addEventListener('click', function() {
        clearInterval(timerInterval);
        const score = calculateScore();
        scoreDisplay.style.display = 'block';
        scoreDisplay.textContent = `Bài thi đã nộp! Điểm của bạn: ${score}/${examData.questions.length}`;
        confirmSubmit.style.display = 'none';
        cancelSubmit.textContent = 'Xem lịch sử';
    });

    cancelSubmit.addEventListener('click', function() {
        submitModal.style.display = 'none';
        scoreDisplay.style.display = 'none';
        if (cancelSubmit.textContent === 'Hủy') {
            if (!timerInterval) startTimer();
        }
    });

    startTimer();
});