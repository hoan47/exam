document.addEventListener('DOMContentLoaded', () => {
    showPart(5);
    loadExam();
});

$('#examSettingsModal').modal('hide');
// Lưu cài đặt đề thi
$('#saveExamSettings').click(function() {
    const title = document.getElementById('examTitle').value.trim();
    const status = document.getElementById('examStatus').value;
    const access = document.getElementById('examAccess').value;
    const duration = parseInt(document.getElementById('examDuration').value);
    const part5 = parsePart5Questions();
    const part6 = parsePart67Questions("6");
    const part7 = parsePart67Questions("7");
    fetch('/update_exam/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: exam.id,
            title: title,
            status: status,
            access: access,
            duration: duration,
            part5: part5,
            part6: part6,
            part7: part7,
        })
    })
        .then(response => response.json())  // Chuyển đổi phản hồi thành JSON
        .then(data => {
            if (data.status === 'success') {
                $('#examSettingsModal').modal('hide');
                alert('Cập nhật đề thi thành công!');
            } else {
                alert('Có lỗi sảy ra!');
            }
        })
        .catch(error => {
            alert('Lỗi kết nối server!');
        });
});


function parsePart5Questions() {
    const questionBoxes = document.querySelectorAll('#part-5__left-section .question-box');
    const questions = [];

    questionBoxes.forEach(box => {
        const questionText = box.querySelector('.question-text')?.textContent;
        const options = box.querySelectorAll('.option');
        const correctAnswerRaw = box.querySelector('.correct-answer')?.innerText.trim();
        // Xử lý explanation để giữ \n
        const explanation = getExplanationWithNewlines(box.querySelector('.explanation'));
        const correctAnswerMatch = correctAnswerRaw.match(/Đáp án đúng:\s*([A-D])/i);
        const correctAnswer = correctAnswerMatch ? correctAnswerMatch[1].toUpperCase() : null;

        const question = {
            exam_id: exam.id,
            part: "5",
            text: questionText,
            option_A: options[0]?.innerText.replace(/^\(A\)\s*/, ''),
            option_B: options[1]?.innerText.replace(/^\(B\)\s*/, ''),
            option_C: options[2]?.innerText.replace(/^\(C\)\s*/, ''),
            option_D: options[3]?.innerText.replace(/^\(D\)\s*/, ''),
            correct_answer: correctAnswer,
            explanation: explanation
        };
        questions.push(question);
    });

    return questions;
}

function parsePart67Questions(part){
    const passageGroups = document.querySelectorAll(`.part-${part}-passage-question-group`);
    const passages = [];

    passageGroups.forEach((group) => {
        const passageBox = group.querySelector(".passage-box .passage-text");
        const passageText = passageBox?.innerHTML.trim();
        const questions = [];
        const questionBoxes = group.querySelectorAll(".question-box");

        questionBoxes.forEach((box) => {
            const questionText = box.querySelector(".question-text")?.textContent;

            const options = box.querySelectorAll(".option");
            const option_A = options[0]?.innerText.replace(/^\(A\)\s*/, "");
            const option_B = options[1]?.innerText.replace(/^\(B\)\s*/, "");
            const option_C = options[2]?.innerText.replace(/^\(C\)\s*/, "");
            const option_D = options[3]?.innerText.replace(/^\(D\)\s*/, "");

            const correctRaw = box.querySelector(".correct-answer")?.innerText;
            const correctAnswer = correctRaw.match(/Đáp án đúng:\s*([ABCD])/i)?.[1];
            // Xử lý explanation để giữ \n

            const explanation = getExplanationWithNewlines(box.querySelector('.explanation'));

            questions.push({
                exam_id: exam.id,
                part: part,
                text: questionText,
                option_A,
                option_B,
                option_C,
                option_D,
                correct_answer: correctAnswer,
                explanation: explanation
            });
        });
        passages.push({passageText, questions})
    });
    return passages;
}

function loadExam() {
    document.getElementById("examTitle").value = exam.title;
    document.getElementById("examStatus").value = exam.status;
    document.getElementById("examAccess").value = exam.access;
    document.getElementById("examDuration").value = exam.max_duration;
    questions(exam.questions);
}

function questions(questions){
    contextPart5 = ""
    contextPart6 = {}
    contextPart7 = {}

    questions.forEach((q) => {
        const questionNumber  = q.text.match(/\d+/);

        if (q.part === "5"){
            contextPart5 += `${q.text}\n(A) ${q.option_A}\n(B) ${q.option_B}\n(C) ${q.option_C}\n(D) ${q.option_D}\nLời giải: ${q.explanation}\nChọn: ${q.correct_answer}\n-------------------------------------------------------------------------------------------------------------------\n`
        }
        else if (q.part === "6"){
            const passageId = q.passage.id;
            if (!contextPart6[passageId]) {
                contextPart6[passageId] = {
                passage_text: q.passage.text,
                questions: `${q.text}\n(A) ${q.option_A}\n(B) ${q.option_B}\n(C) ${q.option_C}\n(D) ${q.option_D}\nLời giải: ${q.explanation}\nChọn: ${q.correct_answer}\n-------------------------------------------------------------------------------------------------------------------\n`
                };
            }
            else {
                contextPart6[passageId].questions += `${q.text}\n(A) ${q.option_A}\n(B) ${q.option_B}\n(C) ${q.option_C}\n(D) ${q.option_D}\nLời giải: ${q.explanation}\nChọn: ${q.correct_answer}\n-------------------------------------------------------------------------------------------------------------------\n`;
            }
        }
        else {
            const passageId = q.passage.id;
            if (!contextPart7[passageId]) {
                contextPart7[passageId] = {
                passage_text: q.passage.text,
                questions: `${q.text}\n(A) ${q.option_A}\n(B) ${q.option_B}\n(C) ${q.option_C}\n(D) ${q.option_D}\nLời giải: ${q.explanation}\nChọn: ${q.correct_answer}\n-------------------------------------------------------------------------------------------------------------------\n`
                };
            }
            else {
                contextPart7[passageId].questions += `${q.text}\n(A) ${q.option_A}\n(B) ${q.option_B}\n(C) ${q.option_C}\n(D) ${q.option_D}\nLời giải: ${q.explanation}\nChọn: ${q.correct_answer}\n-------------------------------------------------------------------------------------------------------------------\n`;
            }
        }
    })
    //Part 5
    Part5.sendEditorContent(contextPart5)
    document.getElementById('part-5__editor-1').value = contextPart5;

    //Part 6
    id_editor_part_6 = 1
    Object.keys(contextPart6).forEach((passageId) => {
        Part6.addPassageQuestionPair();
        setTimeout(() => {
            tinymce.get(`part-6__passage-editor-${id_editor_part_6}`).setContent(contextPart6[passageId].passage_text);
            document.getElementById(`part-6__question-editor-${id_editor_part_6}`).value = contextPart6[passageId].questions;
            id_editor_part_6 +=1;
            Part6.sendEditorContent(Part6.getAllContent());
        }, 1000); // delay s, cho chắc chắn editor đã init
    })

    //Part 7
    let id_editor_part_7 = 1
    Object.keys(contextPart7).forEach((passageId) => {
        Part7.addPassageQuestionPair();
        setTimeout(() => {
            tinymce.get(`part-7__passage-editor-${id_editor_part_7}`).setContent(contextPart7[passageId].passage_text);
            document.getElementById(`part-7__question-editor-${id_editor_part_7}`).value = contextPart7[passageId].questions;
            id_editor_part_7 +=1;
            Part7.sendEditorContent(Part7.getAllContent());
        }, 1000); // delay s, cho chắc chắn editor đã init
    })
}

// exam.js

function showPart(partNumber) {
    // Ẩn tất cả nội dung và CSS/JS không cần thiết
    document.querySelectorAll('.content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.header button').forEach(button => button.classList.remove('active'));
    document.querySelectorAll('link[id$="-css"]').forEach(link => link.disabled = true);
    document.querySelectorAll('script[id$="-js"]').forEach(script => script.disabled = true);

    // Hiển thị Part được chọn
    const part = document.getElementById(`part-${partNumber}`);
    if (part) part.classList.add('active');
    const button = document.querySelector(`.header button[onclick="showPart(${partNumber})"]`);
    if (button) button.classList.add('active');

    // Kích hoạt CSS và JS tương ứng
    const cssLink = document.getElementById(`part${partNumber}-css`);
    const jsScript = document.getElementById(`part${partNumber}-js`);
    if (cssLink) cssLink.disabled = false;
    if (jsScript) jsScript.disabled = false;
}

function showExitWarning() {
    // Hiển thị modal nhắc nhở người dùng
    $('#exitWarningModal').modal('show');
}

function getExplanationWithNewlines(element) {
    if (!element) return '';

    function normalizeText(text) {
        return text
            .replace(/\s*\n\s*/g, '\n')  // Chuẩn hóa khoảng trắng quanh \n
            .replace(/\n+/g, '\n')       // Loại bỏ nhiều \n liên tiếp
            .trim();
    }

    // Hàm decode HTML entities (&gt; => >, &lt; => <)
    function decodeHTMLEntities(str) {
        const txt = document.createElement('textarea');
        txt.innerHTML = str;
        return txt.value;
    }

    let result = '';
    const htmlContent = element.innerHTML;

    if (htmlContent.includes('<br') || htmlContent.includes('<p') || htmlContent.includes('<div')) {
        result = htmlContent
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>\s*<p>/gi, '\n')
            .replace(/<\/div>\s*<div>/gi, '\n')
            .replace(/<[^>]+>/g, '') // Xóa hết thẻ HTML
            .replace(/\s*\n\s*/g, '\n');

        // 🔥 Quan trọng: decode ký tự HTML đã bị escape
        result = decodeHTMLEntities(result);
    } else {
        result = element.textContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .join('\n');
    }

    return normalizeText(result.replace(/^Lời giải:\s*/, ''));
}

function decodeHTMLEntities(str) {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
}
