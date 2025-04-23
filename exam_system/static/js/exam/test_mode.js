// scripts/test.js
document.addEventListener('DOMContentLoaded', function() {
    const examData = parseExamData();
    if (!examData) return;

    const examTitleEl = document.getElementById('exam-title');
    const tabsContainer = document.getElementById('part-tabs');
    const questionArea = document.getElementById('question-area');
    const navContainer = document.getElementById('question-nav');
    const timerDisplay = document.getElementById('timerDisplay');

    let answeredQuestions = new Set();
    let timerInterval = null;

    examTitleEl.textContent = examData.exam.title;
    startTimer();

    function startTimer() {
        const completedAt = new Date(history_exam.completed_at);
        const now = new Date();
        let remainingMs = completedAt - now;
    
        let minutes = Math.floor(remainingMs / 60000);
        let seconds = Math.floor((remainingMs % 60000) / 1000);
        timerInterval = setInterval(function () {
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(timerInterval);
                    submitExam();
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
        }
    }

    function handleAnswerSelection(questionId, selectedOption, optionsList, is_update=true) { //Lưu đáp án
        const navItem = navContainer.querySelector(`.nav-item[data-question-id="${questionId}"]`);
        if (navItem) {
            navItem.classList.add('answered');
            answeredQuestions.add(questionId);
        }
        if (is_update) updateSelectedOption(questionId, selectedOption);
        const questionDiv = questionArea.querySelector(`[data-question-id="${questionId}"]`);
        let clearBtn = questionDiv.querySelector('.clear-answer-btn');
        if (!clearBtn) {
            clearBtn = document.createElement('button');
            clearBtn.className = 'clear-answer-btn';
            clearBtn.textContent = 'Xóa đáp án';
            questionDiv.appendChild(clearBtn);
            clearBtn.addEventListener('click', function() { // Xóa đáp án
                updateSelectedOption(questionId, null);
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
        if (!confirm('Bạn có chắc chắn muốn nộp bài?')) {
            return;
        }
        submitExam();
    });

    for (let i = 0; i < history_exam.history_answers.length; i++) {
        const answer = history_exam.history_answers[i];
        const question = answer.question;
        console.log("Question ID:", question.id);
        console.log("Selected Option:", answer.selected_option);

        if (answer.selected_option !== null) {
            if (answer.selected_option != 'X') {
                handleAnswerSelection(question.id, answer.selected_option,
                    document.querySelector(`.question-block[data-question-id="${question.id}"]`).querySelector('.answer-options'), false);
                setAnswer(question.id, answer.selected_option);
            }
        }
    }
});
