// scripts/practice.js
document.addEventListener('DOMContentLoaded', function () {
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
        const userStats = stats.user;  // Thống kê người dùng
        const allStats = stats.all;    // Thống kê cộng đồng

        optionsList.querySelectorAll('li').forEach(li => {
            const option = li.dataset.option;
            // Lấy tỷ lệ phân bổ cho người dùng và cộng đồng
            const userStatValue = userStats.distribution[option] !== undefined ? userStats.distribution[option] : 0;
            const allStatValue = allStats.distribution[option] !== undefined ? allStats.distribution[option] : 0;

            const statSpan = li.querySelector('.option-stat-value') || document.createElement('span');
            statSpan.className = 'option-stat-value';
            statSpan.innerHTML = `
                <div style="font-weight: 400; color:#4361ee; font-size: 0.6rem; line-height: 1.5;">
                    Bạn: ${userStatValue}%
                </div>
                <div style="font-weight: 400; color:#2d3748; font-size: 0.6rem; line-height: 1.5;">
                    Cộng đồng: ${allStatValue}%
                </div>
            `;
            if (!li.querySelector('.option-stat-value')) li.appendChild(statSpan);
        });
    }

    function handleAnswerSelection(questionId, selectedOption, optionsList, is_update = true) { //Lưu đáp án
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

    function handleCheckAnswer(questionId, is_update = true) {
        if (isSubmitted) return;
        const questionData = getQuestionById(questionId, examData);
        const userAnswer = userAnswers[questionId];
        if (!questionData || !userAnswer || userAnswer.checked) return;
        const selectedOption = userAnswer.selected;
        if (is_update){ 
            updateSelectedOption(questionId, selectedOption, true);
            updateStats(questionData, selectedOption);
            updateStatsDisplay(questionData);
        }
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

    function handleUnknownAnswer(questionId, is_update = true) {
        if (isSubmitted) return;
        if (is_update) updateSelectedOption(questionId, "X");
        const questionData = getQuestionById(questionId, examData);
        if (!questionData || userAnswers[questionId]?.checked) return;
        userAnswers[questionId] = { selected: 'Unknown', checked: true, correct: false };
        updateNavItemStatus(questionId, 'incorrect');
        const optionsList = questionArea.querySelector(`#question-${questionId} .answer-options`);
        if (optionsList) {
            optionsList.querySelectorAll('li').forEach(li => {
                li.classList.add('checked');
                li.classList.remove('selected');
                const option = li.dataset.option;
                if (option === questionData.correct_answer) {
                    li.classList.add('correct');
                }
                const radio = li.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = false;
                    radio.disabled = true;
                }
            });
        }

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
        // explanationDiv.innerHTML = `<strong>Giải thích:</strong> ${q.explanation}`; //Chỗ này sửa
        explanationDiv.innerHTML = `
            <div class="explanation-content" style="
                color: #4a4a4a;
                line-height: 1.6;
                margin-bottom: 16px;
                white-space: pre-line;
            ">
                <strong>Giải thích:</strong> ${q.explanation}
            </div>
            
            <div class="stats-container" style="
                display: flex;
                gap: 16px;
                flex-wrap: wrap;
            ">
                <!-- Thống kê cá nhân -->
                <div class="user-stats" style="
                    flex: 1;
                    min-width: 200px;
                    max-width: 600px;
                    border-radius: 8px;
                    padding: 6px;
                    border: 1px solid #b3e5fc;
                ">
                    <h5 style="
                        color: #4e73df;
                        margin-top: 0;
                        margin-bottom: 12px;
                        font-size: 15px;
                        display: flex;
                        align-items: center;
                    ">
                        <i class="fas fa-user" style="margin-right: 8px;"></i>
                        Cá nhân
                    </h5>
                    
                    <div class="progress-container" style="margin-bottom: 12px;">
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 4px;
                        ">
                            <span id="user-correct-${q.id}" style="font-weight: 400;">Đúng: ${q.stats.user.correct} (${q.stats.user.correct_percent}%)</span>
                            <span id="user-wrong-${q.id}" style="font-weight: 400;">Sai: ${q.stats.user.wrong} (${q.stats.user.wrong_percent}%)</span>
                        </div>
                        <div class="progress" style="
                            height: 10px;
                            border-radius: 5px;
                            background: #f56565;
                            overflow: hidden;
                        ">
                            <div id="user-correct-bar-${q.id}" class="progress-bar bg-success" style="
                                width: ${q.stats.user.correct_percent}%;
                                height: 100%;
                                background-color: #1cc88a;
                            "></div>
                            <div id="user-wrong-bar-${q.id}" class="progress-bar bg-danger" style="
                                width: ${q.stats.user.wrong_percent}%;
                                height: 100%;
                                background-color: #e74a3b;
                            "></div>
                        </div>
                    </div>
                    
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        color: #6c757d;
                        font-size: 13px;
                    ">
                        <span id="user-total-${q.id}" style="font-weight: 600;">Tổng: ${q.stats.user.total}</span>
                    </div>
                </div>
                
                <!-- Thống kê cộng đồng -->
                <div class="community-stats" style="
                    flex: 1;
                    min-width: 200px;
                    max-width: 600px;
                    border-radius: 8px;
                    padding: 6px;
                    border: 1px solid #b3e5fc;
                ">
                    <h5 style="
                        color: #4e73df;
                        margin-top: 0;
                        margin-bottom: 12px;
                        font-size: 15px;
                        display: flex;
                        align-items: center;
                    ">
                        <i class="fas fa-users" style="margin-right: 8px;"></i>
                        Cộng đồng
                    </h5>
                    
                    <div class="progress-container" style="margin-bottom: 12px;">
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 4px;
                        ">
                            <span id="all-correct-${q.id}" style="font-weight: 400;">Đúng: ${q.stats.all.correct} (${q.stats.all.correct_percent}%)</span>
                            <span id="all-wrong-${q.id}" style="font-weight: 400;">Sai: ${q.stats.all.wrong} (${q.stats.all.wrong_percent}%)</span>
                        </div>
                        <div class="progress" style="
                            height: 10px;
                            border-radius: 5px;
                            background: #f56565;
                            overflow: hidden;
                        ">
                            <div id="all-correct-bar-${q.id}" class="progress-bar bg-success" style="
                                width: ${q.stats.all.correct_percent}%;
                                height: 100%;
                                background-color: #1cc88a;
                            "></div>
                            <div id="all-wrong-bar-${q.id}" class="progress-bar bg-danger" style="
                                width: ${q.stats.all.wrong_percent}%;
                                height: 100%;
                                background-color: #e74a3b;
                            "></div>
                        </div>
                    </div>
                    
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        color: #6c757d;
                        font-size: 13px;
                    ">
                        <span id="all-total-${q.id}" style="font-weight: 600;">Tổng: ${q.stats.all.total}</span>
                    </div>
                </div>
            </div>
            <div style="
                margin-top: 12px;
                font-size: 13px;
                color: #858796;
                text-align: right;
            ">
            </div>
        `;
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
                if (answer.checked === true) {
                    handleCheckAnswer(question.id, false)
                }
            }
        }
    }
});

function updateStats(question, userAnswer) {
    const correctAnswer = question.correct_answer;

    // Hàm phụ cập nhật cho 1 object stats (user hoặc all)
    function updateSingleStats(stats) {
        // Kiểm tra sự tồn tại của stats.distribution trước khi khởi tạo _distributionCount
        if (!stats.distribution) {
            console.error('Distribution is undefined or invalid', stats);
            return; // Không tiếp tục nếu distribution không hợp lệ
        }

        // Tính lại _distributionCount (dựa trên dữ liệu phân phối ban đầu) chỉ khi lần đầu tiên
        if (!stats._distributionCount) {
            stats._distributionCount = {
                A: Math.round(stats.distribution.A * stats.total / 100), 
                B: Math.round(stats.distribution.B * stats.total / 100), 
                C: Math.round(stats.distribution.C * stats.total / 100), 
                D: Math.round(stats.distribution.D * stats.total / 100), 
            };
        }

        // Cộng thêm 1 lượt chọn cho đáp án người dùng vừa chọn
        stats._distributionCount[userAnswer] += 1;

        // Tăng tổng số lần làm bài sau khi người dùng chọn đáp án
        stats.total += 1;

        // Cập nhật số câu đúng/sai
        if (userAnswer === correctAnswer) {
            stats.correct += 1;
        } else {
            stats.wrong += 1;
        }

        // Tính lại phần trăm đúng/sai
        stats.correct_percent = +(stats.correct / stats.total * 100).toFixed(2);
        stats.wrong_percent = +(stats.wrong / stats.total * 100).toFixed(2);

        // Tính lại tổng và phân phối phần trăm
        const totalChoices = stats._distributionCount.A + stats._distributionCount.B +
            stats._distributionCount.C + stats._distributionCount.D;

        stats.distribution = {
            A: +(stats._distributionCount.A / totalChoices * 100).toFixed(1),
            B: +(stats._distributionCount.B / totalChoices * 100).toFixed(1),
            C: +(stats._distributionCount.C / totalChoices * 100).toFixed(1),
            D: +(stats._distributionCount.D / totalChoices * 100).toFixed(1),
        };
    }

    // Cập nhật cho cả user và all
    updateSingleStats(question.stats.user);
    updateSingleStats(question.stats.all);
}



function updateStatsDisplay(q) {
    const uc = q.stats.user.correct, uw = q.stats.user.wrong, ut = q.stats.user.total;
    const ucp = q.stats.user.correct_percent, uwp = q.stats.user.wrong_percent;

    const ac = q.stats.all.correct, aw = q.stats.all.wrong, at = q.stats.all.total;
    const acp = q.stats.all.correct_percent, awp = q.stats.all.wrong_percent;

    document.getElementById(`user-correct-${q.id}`).textContent = `Đúng: ${uc} (${ucp}%)`;
    document.getElementById(`user-wrong-${q.id}`).textContent = `Sai: ${uw} (${uwp}%)`;
    document.getElementById(`user-total-${q.id}`).textContent = `Tổng: ${ut}`;
    document.getElementById(`user-correct-bar-${q.id}`).style.width = `${ucp}%`;
    document.getElementById(`user-wrong-bar-${q.id}`).style.width = `${uwp}%`;

    document.getElementById(`all-correct-${q.id}`).textContent = `Đúng: ${ac} (${acp}%)`;
    document.getElementById(`all-wrong-${q.id}`).textContent = `Sai: ${aw} (${awp}%)`;
    document.getElementById(`all-total-${q.id}`).textContent = `Tổng: ${at}`;
    document.getElementById(`all-correct-bar-${q.id}`).style.width = `${acp}%`;
    document.getElementById(`all-wrong-bar-${q.id}`).style.width = `${awp}%`;
}
