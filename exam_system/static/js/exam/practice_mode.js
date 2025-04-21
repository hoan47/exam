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

    function handleAnswerSelection(questionId, selectedOption, optionsList, is_update=true) { //Lưu đáp án
        if (isSubmitted || userAnswers[questionId]?.checked) return;
        if (!userAnswers[questionId] || !userAnswers[questionId].checked) {
            if (is_update) updateSelectedOption(questionId, selectedOption);
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

    function handleCheckAnswer(questionId, is_update=true) {
        if (isSubmitted) return;
        
        const questionData = getQuestionById(questionId, examData);
        const userAnswer = userAnswers[questionId];
        if (!questionData || !userAnswer || userAnswer.checked) return;
        const selectedOption = userAnswer.selected;
        if (is_update) updateSelectedOption(questionId, selectedOption, true);
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

    function handleUnknownAnswer(questionId, is_update=true) {
        if (isSubmitted) return;
        if (is_update) updateSelectedOption(questionId, "X");
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
        if (!confirm('Bạn có chắc chắn muốn nộp bài?')) {
            return;
        }
        submitExam();
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
        checkBtn.dataset.questionId = q.id;
        checkBtn.style.display = 'none';
        checkBtn.addEventListener('click', () => handleCheckAnswer(q.id));
        actionsDiv.appendChild(checkBtn);
        const unknownBtn = document.createElement('button');
        unknownBtn.className = 'unknown-option';
        unknownBtn.textContent = 'Không biết';
        unknownBtn.dataset.questionId = q.id;
        unknownBtn.addEventListener('click', () => handleUnknownAnswer(q.id));
        actionsDiv.appendChild(unknownBtn);
        questionBlock.appendChild(actionsDiv);
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'answer-explanation';
        explanationDiv.innerHTML = `<strong>Giải thích:</strong> ${q.explanation}`;
        explanationDiv.style.display = 'none';
        questionBlock.appendChild(explanationDiv);
        return questionBlock;
    });

    // Thêm sự kiện click cho các tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.part);
        });
    });

    submitBtn.addEventListener('click', handleSubmitExam);

    for (let i = 0; i < history_exam.history_answers.length; i++) {
        const answer = history_exam.history_answers[i];
        const question = answer.question;
        console.log("Question ID:", question.id);
        console.log("Selected Option:", answer.selected_option);
        console.log("Checked:", answer.checked);
        if (answer.selected_option !== null) {
            if (answer.selected_option === 'X') {
                handleUnknownAnswer(question.id, answer.selected_option,
                    document.querySelector(`.question-block[data-question-id="${question.id}"]`).querySelector('.answer-options'), false);
            }
            else {
                handleAnswerSelection(question.id, answer.selected_option,
                    document.querySelector(`.question-block[data-question-id="${question.id}"]`).querySelector('.answer-options'), false);
                setAnswer(question.id, answer.selected_option);
                if (answer.checked === true){
                    handleCheckAnswer(question.id, false)
                }
            }
        }
    }
});

