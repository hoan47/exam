// scripts/practice.js
document.addEventListener('DOMContentLoaded', function() {
    const examData = parseExamData();
    if (!examData) return;

    const examTitleEl = document.getElementById('exam-title');
    const tabsContainer = document.getElementById('part-tabs');
    const questionArea = document.getElementById('question-area');
    const navContainer = document.getElementById('question-nav');
    const submitBtn = document.getElementById('submit-exam-btn');
    const overlay = document.getElementById('submission-overlay');

    let userAnswers = {};
    let isSubmitted = false;

    examTitleEl.textContent = examData.exam.title;

    function switchTab(partToShow) {
        if (isSubmitted) return;
        tabsContainer.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.part === partToShow);
        });
        questionArea.querySelectorAll('.part-content').forEach(pane => {
            pane.classList.toggle('active', pane.dataset.part === partToShow);
        });
    }

    function scrollToQuestion(questionId) {
        if (isSubmitted) return;
        const questionElement = questionArea.querySelector(`.question-block[data-question-id="${questionId}"]`);
        if (questionElement) {
            questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function updateNavItemStatus(questionId, status) {
        const navItem = navContainer.querySelector(`.nav-item[data-question-id="${questionId}"]`);
        if (navItem) {
            navItem.classList.remove('answered', 'correct', 'incorrect');
            if (status) {
                navItem.classList.add(status);
            }
        }
    }

    function displayStatsOnOptions(questionId) {
        const questionData = getQuestionById(questionId, examData);
        const optionsList = questionArea.querySelector(`#question-${questionId} .answer-options`);
        if (!questionData || !optionsList || !questionData.stats) return;
        const stats = questionData.stats;
        optionsList.querySelectorAll('li').forEach(li => {
            const option = li.dataset.option;
            const statValue = stats[option] !== undefined ? stats[option] : 0;
            const statSpan = li.querySelector('.option-stat-value') || document.createElement('span');
            statSpan.className = 'option-stat-value';
            statSpan.textContent = `${statValue}%`;
            if (!li.querySelector('.option-stat-value')) li.appendChild(statSpan);
        });
    }

    function handleAnswerSelection(questionId, selectedOption, optionsList) {
        if (isSubmitted || userAnswers[questionId]?.checked) return;
        if (!userAnswers[questionId] || !userAnswers[questionId].checked) {
            userAnswers[questionId] = { ...userAnswers[questionId], selected: selectedOption, checked: false, correct: null };
            optionsList.querySelectorAll('li').forEach(li => {
                li.classList.toggle('selected', li.dataset.option === selectedOption);
            });
            const checkBtn = questionArea.querySelector(`.check-answer-btn[data-question-id="${questionId}"]`);
            if (checkBtn) checkBtn.style.display = 'inline-block';
            updateNavItemStatus(questionId, 'answered');
            const explanationDiv = questionArea.querySelector(`#question-${questionId} .answer-explanation`);
            if (explanationDiv) explanationDiv.style.display = 'none';
        }
    }

    function handleCheckAnswer(questionId) {
        if (isSubmitted) return;
        const questionData = getQuestionById(questionId, examData);
        const userAnswer = userAnswers[questionId];
        if (!questionData || !userAnswer || userAnswer.checked) return;
        const selectedOption = userAnswer.selected;
        const isCorrect = selectedOption === questionData.correct_answer;
        userAnswer.checked = true;
        userAnswer.correct = isCorrect;
        const optionsList = questionArea.querySelector(`#question-${questionId} .answer-options`);
        optionsList.querySelectorAll('li').forEach(li => {
            li.classList.add('checked');
            const option = li.dataset.option;
            if (option === questionData.correct_answer) li.classList.add('correct');
            else if (option === selectedOption && !isCorrect) li.classList.add('incorrect');
            const radio = li.querySelector('input[type="radio"]');
            if (radio) radio.disabled = true;
        });
        updateNavItemStatus(questionId, isCorrect ? 'correct' : 'incorrect');
        const explanationDiv = questionArea.querySelector(`#question-${questionId} .answer-explanation`);
        if (explanationDiv) explanationDiv.style.display = 'block';
        displayStatsOnOptions(questionId);
        const checkBtn = questionArea.querySelector(`.check-answer-btn[data-question-id="${questionId}"]`);
        const unknownBtn = questionArea.querySelector(`.unknown-option[data-question-id="${questionId}"]`);
        if (checkBtn) checkBtn.disabled = true;
        if (unknownBtn) unknownBtn.disabled = true;
    }

    function handleUnknownAnswer(questionId) {
        if (isSubmitted) return;
        const questionData = getQuestionById(questionId, examData);
        if (!questionData || userAnswers[questionId]?.checked) return;
        userAnswers[questionId] = { selected: 'Unknown', checked: true, correct: false };
        updateNavItemStatus(questionId, 'incorrect');
        const optionsList = questionArea.querySelector(`#question-${questionId} .answer-options`);
        optionsList.querySelectorAll('li').forEach(li => {
            li.classList.add('checked');
            li.classList.remove('selected');
            const radio = li.querySelector('input[type="radio"]');
            if (radio) { radio.checked = false; radio.disabled = true; }
        });
        const explanationDiv = questionArea.querySelector(`#question-${questionId} .answer-explanation`);
        if (explanationDiv) explanationDiv.style.display = 'block';
        displayStatsOnOptions(questionId);
        const checkBtn = questionArea.querySelector(`.check-answer-btn[data-question-id="${questionId}"]`);
        const unknownBtn = questionArea.querySelector(`.unknown-option[data-question-id="${questionId}"]`);
        if (checkBtn) { checkBtn.style.display = 'none'; checkBtn.disabled = true; }
        if (unknownBtn) unknownBtn.disabled = true;
    }

    function handleSubmitExam() {
        if (isSubmitted) return;
        if (!confirm('Bạn có chắc chắn muốn nộp bài không? Bạn sẽ không thể thay đổi câu trả lời sau khi nộp.')) {
            return;
        }
        isSubmitted = true;
        let correctCount = 0;
        Object.values(userAnswers).forEach(answer => {
            if (answer.checked && answer.correct === true) {
                correctCount++;
            }
        });
        submitBtn.disabled = true;
        tabsContainer.querySelectorAll('.tab').forEach(tab => tab.disabled = true);
        navContainer.querySelectorAll('.nav-item').forEach(item => item.disabled = true);
        questionArea.querySelectorAll('input[type="radio"], .check-answer-btn, .unknown-option').forEach(el => {
            if (!el.disabled) el.disabled = true;
        });
        overlay.style.display = 'block';
        examData.questions.forEach(q => {
            if (!userAnswers[q._id] || !userAnswers[q._id].checked) {
                const optionsList = questionArea.querySelector(`#question-${q._id} .answer-options`);
                if (optionsList) {
                    optionsList.querySelectorAll('li').forEach(li => {
                        li.classList.add('checked');
                        const option = li.dataset.option;
                        if (option === q.correct_answer) li.classList.add('correct');
                        const radio = li.querySelector('input[type="radio"]');
                        if (radio) radio.disabled = true;
                    });
                    const explanationDiv = questionArea.querySelector(`#question-${q._id} .answer-explanation`);
                    if (explanationDiv) explanationDiv.style.display = 'block';
                    displayStatsOnOptions(q._id);
                    updateNavItemStatus(q._id, 'incorrect');
                    const checkBtn = questionArea.querySelector(`.check-answer-btn[data-question-id="${q._id}"]`);
                    const unknownBtn = questionArea.querySelector(`.unknown-option[data-question-id="${q._id}"]`);
                    if (checkBtn) checkBtn.disabled = true;
                    if (unknownBtn) unknownBtn.disabled = true;
                }
            }
        });
        questionArea.innerHTML = `
            <div class="exam-results">
                <h2>Kết quả</h2>
                <p>Bạn đã trả lời đúng <strong>${correctCount}</strong> / <strong>${examData.questions.length}</strong> câu.</p>
            </div>
        `;
        questionArea.scrollTop = 0;
    }

    const parts = [...new Set(examData.questions.map(q => q.part))].sort();
    parts.forEach((part, index) => {
        tabsContainer.appendChild(createTab(part, index === 0));
    });

    renderQuestions(examData, questionArea, navContainer, switchTab, scrollToQuestion, (q) => {
        const questionBlock = createQuestionElement(q, handleAnswerSelection, handleCheckAnswer, handleUnknownAnswer);
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'question-actions';
        const checkBtn = document.createElement('button');
        checkBtn.className = 'check-answer-btn';
        checkBtn.textContent = 'Kiểm tra';
        checkBtn.dataset.questionId = q._id;
        checkBtn.style.display = 'none';
        checkBtn.addEventListener('click', () => handleCheckAnswer(q._id));
        actionsDiv.appendChild(checkBtn);
        const unknownBtn = document.createElement('button');
        unknownBtn.className = 'unknown-option';
        unknownBtn.textContent = 'Không biết';
        unknownBtn.dataset.questionId = q._id;
        unknownBtn.addEventListener('click', () => handleUnknownAnswer(q._id));
        actionsDiv.appendChild(unknownBtn);
        questionBlock.appendChild(actionsDiv);
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'answer-explanation';
        explanationDiv.innerHTML = `<strong>Giải thích:</strong> ${q.explanation}`;
        explanationDiv.style.display = 'none';
        questionBlock.appendChild(explanationDiv);
        return questionBlock;
    });

    submitBtn.addEventListener('click', handleSubmitExam);
});