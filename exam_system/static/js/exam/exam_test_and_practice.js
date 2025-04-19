// scripts/common.js
function parseExamData() {
    const rawData = document.getElementById('exam-data').textContent;
    try {
        return JSON.parse(rawData);
    } catch (e) {
        console.error('Error parsing JSON:', e);
        const errorContainer = document.getElementById('loading-error');
        errorContainer.style.display = 'block';
        document.getElementById('error-message').textContent = `Lỗi khi đọc dữ liệu bài thi: ${e.message}`;
        document.querySelector('.main-content').style.display = 'none';
        document.getElementById('part-tabs').style.display = 'none';
        document.querySelector('.exam-header').style.display = 'none';
        return null;
    }
}

function extractQuestionDisplayId(text) {
    const match = text.match(/^(\d+)/);
    return match ? match[1] : text.split('.')[0].trim();
}

function getPassageById(id, examData) {
    return examData.passages.find(p => p._id === id);
}

function getQuestionById(id, examData) {
    return examData.questions.find(q => q._id === id);
}

function createTab(part, isActive) {
    const tab = document.createElement('button');
    tab.className = `tab ${isActive ? 'active' : ''}`;
    tab.dataset.part = part;
    tab.textContent = `Part ${part}`;
    return tab;
}

function createNavItem(q, switchTab, scrollToQuestion) {
    const questionId = q._id;
    const displayId = extractQuestionDisplayId(q.text);
    const item = document.createElement('button');
    item.className = 'nav-item';
    item.dataset.questionId = questionId;
    item.dataset.part = q.part;
    item.textContent = displayId;
    item.addEventListener('click', () => {
        switchTab(q.part);
        setTimeout(() => scrollToQuestion(questionId), 50);
    });
    return item;
}

function createQuestionElement(q, handleAnswerSelection, handleCheckAnswer, handleUnknownAnswer) {
    const questionId = q._id;
    const displayId = extractQuestionDisplayId(q.text);

    const questionBlock = document.createElement('div');
    questionBlock.className = 'question-block';
    questionBlock.dataset.questionId = questionId;
    questionBlock.id = `question-${questionId}`;

    const questionHeader = document.createElement('div');
    const questionNumberSpan = document.createElement('span');
    questionNumberSpan.className = 'question-number';
    questionNumberSpan.textContent = displayId;
    questionHeader.appendChild(questionNumberSpan);
    const questionTextSpan = document.createElement('span');
    questionTextSpan.className = 'question-text';
    questionTextSpan.textContent = q.text.replace(/^\d+\.\s*/, '');
    questionHeader.appendChild(questionTextSpan);
    questionBlock.appendChild(questionHeader);

    const optionsList = document.createElement('ul');
    optionsList.className = 'answer-options';
    questionBlock.appendChild(optionsList);

    ['A', 'B', 'C', 'D'].forEach((opt) => {
        const li = document.createElement('li');
        li.dataset.option = opt;
        li.dataset.questionId = questionId;
        const input = document.createElement('input');
        input.type = 'radio';
        input.id = `q${questionId}_${opt}`;
        input.name = `q${questionId}`;
        input.value = opt;
        const label = document.createElement('label');
        label.htmlFor = `q${questionId}_${opt}`;
        label.textContent = ` ${q[`option_${opt}`]}`;
        li.appendChild(input);
        li.appendChild(label);
        optionsList.appendChild(li);

        li.addEventListener('click', (e) => {
            if (!input.checked && handleAnswerSelection) {
                input.checked = true;
                handleAnswerSelection(questionId, opt, optionsList);
            }
        });

        input.addEventListener('change', (e) => {
            if (input.checked && handleAnswerSelection) {
                handleAnswerSelection(questionId, opt, optionsList);
            }
        });
    });

    return questionBlock;
}

function renderQuestions(examData, questionArea, navContainer, switchTab, scrollToQuestion, createQuestionElement) {
    const questionsByPart = examData.questions.reduce((acc, q) => {
        if (!acc[q.part]) acc[q.part] = [];
        acc[q.part].push(q);
        return acc;
    }, {});
    const parts = Object.keys(questionsByPart).sort();

    parts.forEach((part, index) => {
        const partContent = document.createElement('div');
        partContent.className = `part-content ${index === 0 ? 'active' : ''}`;
        partContent.dataset.part = part;
        questionArea.appendChild(partContent);

        const navPartTitle = document.createElement('h3');
        navPartTitle.textContent = `Part ${part}`;
        navContainer.appendChild(navPartTitle);
        const navGrid = document.createElement('div');
        navGrid.className = 'nav-grid';
        navGrid.dataset.part = part;
        navContainer.appendChild(navGrid);

        const partQuestions = questionsByPart[part];
        if (part === '5') {
            const part5Container = document.createElement('div');
            part5Container.className = 'part-5-container';
            partContent.appendChild(part5Container);
            partQuestions.forEach(q => {
                part5Container.appendChild(createQuestionElement(q));
                navGrid.appendChild(createNavItem(q, switchTab, scrollToQuestion));
            });
        } else {
            const questionsByPassage = partQuestions.reduce((acc, q) => {
                const pId = q.passage_id;
                if (!acc[pId]) acc[pId] = { passage: getPassageById(pId, examData), questions: [] };
                acc[pId].questions.push(q);
                return acc;
            }, {});
            Object.values(questionsByPassage).forEach(group => {
                if (!group.passage) {
                    console.error(`Passage not found for questions starting with ID: ${group.questions[0]?._id}`);
                    return;
                }
                const passageGroup = document.createElement('div');
                passageGroup.className = 'passage-group';
                partContent.appendChild(passageGroup);
                const passageContainer = document.createElement('div');
                passageContainer.className = 'passage-container';
                const passageDiv = document.createElement('div');
                passageDiv.className = 'passage';
                const passageType = group.passage.text.includes('<table') ? 'table.' : group.passage.text.includes('<img') ? 'image.' : 'text.';
                const firstQNum = extractQuestionDisplayId(group.questions[0].text);
                const lastQNum = extractQuestionDisplayId(group.questions[group.questions.length - 1].text);
                passageDiv.innerHTML = `<div class="passage-instructions">Questions ${firstQNum} - ${lastQNum} refer to the following ${passageType}</div><div class="passage-content">${group.passage.text}</div>`;
                passageContainer.appendChild(passageDiv);
                passageGroup.appendChild(passageContainer);
                const questionsContainer = document.createElement('div');
                questionsContainer.className = 'questions-container';
                group.questions.forEach(q => {
                    questionsContainer.appendChild(createQuestionElement(q));
                    navGrid.appendChild(createNavItem(q, switchTab, scrollToQuestion));
                });
                passageGroup.appendChild(questionsContainer);
            });
        }
    });
}