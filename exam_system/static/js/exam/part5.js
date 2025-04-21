const Part5 = (function () {

// Chèn nội dung mẫu
function insertSampleContent() {
    const editor = document.getElementById('part-5__editor-1');
    if (!editor) return;
    editor.value = `101. Its_______into Brazil has given Darrow Textiles Ltd an advantage over much of its competition.
(A) expansion   (B) process
(C) creation    (D) action
Lời giải: "Expansion" (sự mở rộng) là từ phù hợp nhất trong ngữ cảnh này.
Chọn: A
-------------------------------------------------------------------------------------------------------------------
102. QIB will work_______to maintain sustainable growth and expansion plans.
(A) Persisted   (B) Persistent
(C) Persistently    (D) Persistence
Lời giải: "Persistently" (liên tục) là trạng từ phù hợp.
Chọn: C`;
    sendEditorContent(editor.value);
}

function sendEditorContent(content) {
    fetch(`/get_editor/?editor_content=${encodeURIComponent(content)}`, {
        method: 'GET', // Sử dụng GET request
        headers: {
            'Content-Type': 'application/json' // Đảm bảo header là 'application/json'
        }
    })
    .then(response => response.json())  // Chuyển đổi phản hồi thành JSON
    .then(data => {
        try {
            const questions = JSON.parse(data.content); // Giả sử dữ liệu trả về có trường 'content'
            renderQuestions(questions);
        } catch (e) {
            console.error('Error parsing JSON:', e);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Hiển thị câu hỏi
function renderQuestions(questions) {
    const leftSection = document.getElementById('part-5__left-section');
    if (!leftSection) return;
    leftSection.innerHTML = '';
    if (!questions || questions.length === 0) {
        loadGuideContent();
        return;
    }
    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-box';
        questionDiv.innerHTML = `
            <div class="question-text">${q.text}</div>
            <div class="options">
                <div class="option">(A) ${q.option_A}</div>
                <div class="option">(B) ${q.option_B}</div>
                <div class="option">(C) ${q.option_C}</div>
                <div class="option">(D) ${q.option_D}</div>
            </div>
            <div class="correct-answer">Đáp án đúng: ${q.correct_answer || 'Chưa có'}</div>
            <div class="explanation">Lời giải: ${q.explanation.replace(/\n/g, '<br>')}</div>
        `;
        leftSection.appendChild(questionDiv);
    });
}

// Hàm đọc file PDF
async function readPDFFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        let pageText = '';
        let lastY = null;
        textContent.items.forEach(item => {
            if (lastY !== null && Math.abs(lastY - item.transform[5]) > 5) {
                pageText += '\n';
            }
            pageText += item.str + ' ';
            lastY = item.transform[5];
        });
        text += pageText.trim() + '\n\n';
    }

    return text;
}

// Hàm xử lý khi chọn file
async function readFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const editor = document.getElementById('part-5__editor-1');
    const fileType = file.name.split('.').pop().toLowerCase();
    const fileInput = document.getElementById('part-5__file-input');
    
    if (fileType === 'pdf') {
        readPDFFile(file)
            .then(text => {
                editor.value = text;
                sendEditorContent(editor.innerText);
                fileInput.value = ''; // Reset input để đọc lại cùng file
            })
            .catch(error => console.error('Error reading PDF:', error));
    } else {
        alert('Vui lòng chọn file PDF');
    }
}
// Hiển thị hướng dẫn
function loadGuideContent() {
    const leftSection = document.getElementById('part-5__left-section');
    if (!leftSection) return;
    leftSection.innerHTML = `
        <div class="guide-container">
            <h2>📌 Hướng Dẫn Nhập Đề Thi</h2>
            <p>Nhập nội dung câu hỏi vào khung bên phải hoặc <span class="highlight">tải lên file PDF</span>.</p>
            <p>Hệ thống sẽ tự động nhận diện câu hỏi và hiển thị ở đây.</p>
            <div class="example-box">
                101. Đây là câu hỏi mẫu?<br>
                (A) Đáp án A<br>
                (B) Đáp án B<br>
                (C) Đáp án C<br>
                (D) Đáp án D<br>
                Lời giải: Giải thích tại sao chọn A.<br>Chọn: A
            </div>
            <button onclick="Part5.insertSampleContent()">🔍 Xem ví dụ</button>
        </div>`;
}

return {
    insertSampleContent,
    sendEditorContent,
    renderQuestions,
    loadGuideContent,
    readFile
};
})();

// exam_create_part5.js
document.addEventListener('DOMContentLoaded', () => {
    Part5.loadGuideContent();

    const editor = document.getElementById('part-5__editor-1');
    if (editor) {
        editor.addEventListener('input', () => {
            // Gửi nội dung lên server
            Part5.sendEditorContent(editor.value);
            // Xóa sạch nếu rỗng
            if (!editor.value.trim()) {
                editor.value = ''; // Đặt lại thành rỗng
            }
        });
    }
});