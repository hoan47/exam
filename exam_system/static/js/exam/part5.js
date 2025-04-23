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
    const numPages = pdf.numPages;
    
    let fullText = '';  // <-- Khai báo fullText ở đây để cộng dồn nội dung từ tất cả các trang
    
    // Xử lý từng trang
    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Trích xuất thông tin về viewport để tính toán khoảng cách
        const viewport = page.getViewport({ scale: 1.0 });
        const pageWidth = viewport.width;
        
        // Sắp xếp các phần tử văn bản theo thứ tự đọc tự nhiên hơn
        // (từ trên xuống dưới, từ trái sang phải)
        const textItems = textContent.items.sort((a, b) => {
            const yDiff = b.transform[5] - a.transform[5];
            
            // Nếu cùng dòng (hoặc gần cùng dòng), thì so sánh tọa độ x (cột)
            if (Math.abs(yDiff) < 3) {
                return a.transform[4] - b.transform[4];
            }
            
            return yDiff;
        });
        
        let pageText = '';
        let lastY = null;
        let lastX = 0;
        let isNewParagraph = false;
        
        // Xử lý từng phần tử văn bản trên trang
        textItems.forEach(item => {
            const currentY = item.transform[5];
            const currentX = item.transform[4];
            const fontSize = Math.sqrt(item.transform[0] * item.transform[0] + item.transform[1] * item.transform[1]);
            
            // Xử lý xuống dòng và phân đoạn
            if (lastY !== null) {
                if (Math.abs(lastY - currentY) > fontSize * 1.5) {
                    if (Math.abs(lastY - currentY) > fontSize * 2.5 || currentX < pageWidth * 0.1) {
                        pageText += '\n\n';
                        isNewParagraph = true;
                    } else {
                        pageText += '\n';
                        isNewParagraph = false;
                    }
                } else if (currentX > lastX + fontSize * 1.5 && !isNewParagraph) {
                    const spaceCount = Math.min(Math.floor((currentX - lastX) / (fontSize * 0.6)), 10);
                    pageText += ' '.repeat(spaceCount);
                }
            }
            
            pageText += item.str;
            
            lastY = currentY;
            lastX = currentX + (item.width || 0);
        });
        
        // Xử lý các dấu ngắt dòng liên tiếp và chuẩn hóa văn bản
        pageText = pageText.replace(/\n{3,}/g, '\n\n')
                        .replace(/\s+\n/g, '\n')
                        .replace(/\n\s+/g, '\n')
                        .trim();
        
        fullText += `--- Trang ${i} ---\n\n${pageText}\n\n`;
    }
    
    return fullText;  // Trả về fullText sau khi xử lý xong tất cả các trang
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
                fileInput.value = ''; // Reset input để đọc lại cùng file
                sendEditorContent(editor.value);
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