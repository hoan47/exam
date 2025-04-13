const Part6 = (function () {

    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    const debouncedHandlePassageChange = debounce(handlePassageChange, 100);
    
    function initializeTinyMCE() {
        tinymce.init({
            selector: '#part-6__passage-editor-1',
            menubar: false,
            height: 600,
            toolbar: 'undo redo | fontfamily fontsizeinput lineheight removeformat | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | outdent indent | table',
            plugins: 'table fontfamily fontsize lineheight',
            content_style: `
                body {
                    font-family: Arial, sans-serif;
                    font-size: 15px;
                    color: rgb(0, 0, 0);
                    word-wrap: break-word;
                    overflow-x: hidden;
                    white-space: normal;
                    line-height: 1; /* Khoảng cách dòng mặc định */
                }
                img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                }
            `,
                // Cỡ chữ có sẵn
            fontsize_formats: "8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 24pt",
            
            // Danh sách font chữ
            font_family_formats: `
                Arial=Arial, sans-serif;
                Times New Roman=Times New Roman, serif;
                Courier New=Courier New, monospace;
                Verdana=Verdana, sans-serif;
                Georgia=Georgia, serif;
                Comic Sans MS=Comic Sans MS, cursive;
            `,

            // Khoảng cách dòng có sẵn
            lineheight_formats: "1 1.15 1.5 2 2.5 3",
            placeholder: 'Nhập nội dung đoạn văn...',
            setup: function (editor) {
                editor.on('input change NodeChange', function () {
                    debouncedHandlePassageChange(editor.id, editor.getContent());
                });
            }
        });
    }
    
    function addPassageQuestionPair() {
        const container = document.getElementById('part-6__passage-question-container');
        if (!container) return;
        const pairCount = container.querySelectorAll('.part-6__passage-question-pair').length + 1;
        const passageEditorId = `part-6__passage-editor-${pairCount}`;
        const questionEditorId = `part-6__question-editor-${pairCount}`;
        const newPair = document.createElement('div');
        newPair.className = 'part-6__passage-question-pair';
        newPair.dataset.pairId = pairCount;
        newPair.innerHTML = `
            <div class="part-6__passage-editor-box">
                <textarea id="${passageEditorId}" class="part-6__passage-editor" placeholder="Nhập nội dung đoạn văn..."></textarea>
            </div>
            <div class="part-6__question-editor-box">
                <textarea id="${questionEditorId}" class="part-6__question-editor" spellcheck="false" placeholder="Nhập nội dung các câu hỏi tại đây..."></textarea>
            </div>
            <button class="part-6__delete-pair" onclick="Part6.deletePassageQuestionPair(this)">Xóa</button>
        `;
        container.appendChild(newPair);
    
        tinymce.init({
            selector: `#${passageEditorId}`,
            menubar: false,
            height: 600,
            toolbar: 'undo redo | fontfamily fontsizeinput lineheight removeformat | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | outdent indent | table',
            plugins: 'table fontfamily fontsize lineheight',
            content_style: `
                body {
                    font-family: Arial, sans-serif;
                    font-size: 15px;
                    color: rgb(0, 0, 0);
                    word-wrap: break-word;
                    overflow-x: hidden;
                    white-space: normal;
                    line-height: 1; /* Khoảng cách dòng mặc định */
                }
                img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                }
            `,
                // Cỡ chữ có sẵn
            fontsize_formats: "8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 24pt",
            
            // Danh sách font chữ
            font_family_formats: `
                Arial=Arial, sans-serif;
                Times New Roman=Times New Roman, serif;
                Courier New=Courier New, monospace;
                Verdana=Verdana, sans-serif;
                Georgia=Georgia, serif;
                Comic Sans MS=Comic Sans MS, cursive;
            `,

            // Khoảng cách dòng có sẵn
            lineheight_formats: "1 1.15 1.5 2 2.5 3",
            placeholder: 'Nhập nội dung đoạn văn...',
            setup: function (editor) {
                editor.on('input change NodeChange', function () {
                    debouncedHandlePassageChange(editor.id, editor.getContent());
                });
            }
        });
    
        const questionEditor = document.getElementById(questionEditorId);
        if (questionEditor) {
            questionEditor.addEventListener('input', () => {
                handleQuestionChange(questionEditor.id, questionEditor.value);
                if (!questionEditor.value.trim()) {
                    questionEditor.value = '';
                }
            });
        }
    
        updateDeleteButtons();
    }
    
    function deletePassageQuestionPair(button) {
        const pair = button.parentElement;
        const editorId = pair.querySelector('.part-6__passage-editor').id;
        tinymce.get(editorId)?.remove();
        pair.remove();
        updateDeleteButtons();
        sendEditorContent(getAllContent());
    }
    
    function updateDeleteButtons() {
        const pairs = document.querySelectorAll('#part-6 .part-6__passage-question-pair');
        const deleteButtons = document.querySelectorAll('#part-6 .part-6__delete-pair');
        deleteButtons.forEach(button => {
            button.disabled = pairs.length <= 1;
        });
    }
    
    // Hàm xử lý khi nội dung passage thay đổi
    function handlePassageChange(editorId, content) {
        sendEditorContent(getAllContent());
    }
    
    // Hàm xử lý khi nội dung question thay đổi
    function handleQuestionChange(editorId, content) {
        sendEditorContent(getAllContent());
    }
    
    // Hàm render nội dung bên trái từ dữ liệu đầu vào
    function renderLeftSection(pairsData) {
        const leftSection = document.getElementById('part-6__left-section');
        if (!leftSection) return;
    
        leftSection.innerHTML = '';
    
        if (pairsData.length === 0) {
            loadGuideContent();
            return;
        }
        pairsData.forEach(pair => {
            const { passage, questions } = pair;
    
            // Tạo container nhóm
            const groupBox = document.createElement('div');
            groupBox.className = 'part-6-passage-question-group';
    
            // Render đoạn văn
            const passageBox = document.createElement('div');
            passageBox.className = 'passage-box';
            passageBox.innerHTML = `
                <div class="passage-text">${passage}</div>
            `;
            groupBox.appendChild(passageBox);
    
            // Render danh sách câu hỏi
            questions.forEach(q => {
                const questionBox = document.createElement('div');
                questionBox.className = 'question-box';
                questionBox.innerHTML = `
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
                groupBox.appendChild(questionBox);
            });
    
            leftSection.appendChild(groupBox);
        });
    }
    
    function sendEditorContent(allContent) {
        const requests = allContent.map(([passage, question]) => {
            if (!passage.trim() || !question.trim()) return Promise.resolve(null);  // Nếu không có passage hoặc question, trả về Promise resolve null
    
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: '/admin/get_editor/', // URL của API
                    type: 'GET', // Sử dụng GET request
                    data: { editor_content: question }, // Truyền dữ liệu qua query parameters
                    success: function(response) {
                        try {
                            const questions = JSON.parse(response.content);
                            // Trả về cả đoạn văn và câu hỏi nếu có dữ liệu hợp lệ
                            resolve(questions.length > 0 && passage ? { passage, questions } : null);
                        } catch (e) {
                            console.error('Error parsing JSON:', e);
                            resolve(null);  // Nếu có lỗi, resolve null
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Error:', error);
                        resolve(null);  // Nếu có lỗi, resolve null
                    }
                });
            });
        }).filter(request => request !== null); // Loại bỏ các phần tử null khỏi requests
    
        // Chờ tất cả các request hoàn tất trước khi render
        Promise.all(requests).then(results => {
            const contentList = results.filter(item => item !== null);
            renderLeftSection(contentList);
        });
    }
    
    // Hàm lấy tất cả nội dung dưới dạng tuple
    function getAllContent() {
        const pairs = document.querySelectorAll('.part-6__passage-question-pair');
        const contentList = [];
    
        pairs.forEach(pair => {
            const pairId = pair.dataset.pairId;
            const passageEditor = tinymce.get(`part-6__passage-editor-${pairId}`);
            const questionEditor = document.getElementById(`part-6__question-editor-${pairId}`);
    
            const passageContent = passageEditor ? passageEditor.getContent() : '';
            const questionContent = questionEditor ? questionEditor.value : '';
    
            contentList.push([passageContent, questionContent, pairId]);
        });
    
        return contentList;
    }
    
    function insertSampleContent() {
        const id_editor = getAllContent()[0][2]
        const passageEditor = tinymce.get(`part-6__passage-editor-${id_editor}`);
        const quetionsEditor = document.getElementById(`part-6__question-editor-${id_editor}`);
    
        if (!passageEditor || !quetionsEditor) return;
            passageEditor.setContent(`
                <div style="mso-element: para-border-div; border: solid windowtext 1.0pt; mso-border-alt: solid windowtext .5pt; padding: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="mso-element: para-border-div; border: solid windowtext 1.0pt; mso-border-alt: solid windowtext .5pt; padding: 1.0pt 4.0pt 1.0pt 4.0pt;"><p class="MsoNormal" style="margin-bottom: 0in; text-align: center; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" align="center" data-mce-style="margin-bottom: 0in; text-align: center; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><strong style="mso-bidi-font-weight: normal;" data-mce-style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Business Fashions</span></strong></p><p class="MsoNormal" style="margin-bottom: 6.0pt; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="margin-bottom: 6.0pt; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><strong style="mso-bidi-font-weight: normal;" data-mce-style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Fall Catalog p. 35</span></strong></p><p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><strong style="mso-bidi-font-weight: normal;" data-mce-style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Men's Dress Shirts.</span></strong><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;"> Solid color. Item #387</span></p><p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">These comfortable yet elegant shirts are made of 100% combed cotton.</span></p><p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Colors: white, cream, light blue, light green.</span></p><p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Sizes S M L XL. $55</span></p><p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><strong style="mso-bidi-font-weight: normal;" data-mce-style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Men's Dress Shirts.</span></strong><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;"> Striped. Item #387A</span></p><p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Same as above, but with a thin stripe over a solid background color.</span></p><p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Colors: red on white, blue on white, green on cream, brown on cream.</span></p><p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Sizes S M L XL. $65</span></p><p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><strong style="mso-bidi-font-weight: normal;" data-mce-style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Striped Ties.</span></strong><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;"> Item #765</span></p><p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">These stylish ties with a jaunty stripe are made of imported silk.</span></p><p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Colors: burgundy red/navy blue, moss green/navy blue, moss green/golden yellow, black/bright red. $30</span></p><p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><strong style="mso-bidi-font-weight: normal;" data-mce-style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Cashmere Sweaters</span></strong><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">. Item #521</span></p><p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">You'll feel oh-so-comfortable in these sweaters made of 100% genuine cashmere with a chic V neck.</span></p><p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" data-mce-style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;" data-mce-style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Colors: burgundy red, charcoal gray, midnight black. $150</span></p></div>
            `)
        quetionsEditor.value = `131. 
(A) seek        (B) to seek
(C) seeking     (D) are seeking
Lời giải:
Đáp án (A) "seek" là dạng động từ nguyên mẫu, không phù hợp.
Đáp án (B) "to seek" là dạng động từ nguyên mẫu có "to", cũng không phù hợp ở đây.
Đáp án (D) "are seeking" là dạng động từ ở thì hiện tại tiếp diễn, không phù hợp vì nó sẽ biến cả cụm từ thành một mệnh đề, trong khi chúng ta cần một bổ ngữ cho danh từ.
Đáp án (C) "seeking" là dạng V-ing (present participle) đóng vai trò là tính từ, phù hợp để bổ nghĩa cho danh từ "advertisement".
Chọn: C
-------------------------------------------------------------------------------------------------------------------
132. 
(A) extensive   (B) restricted
(C) generous    (D) limitless
Lời giải:
A. extensive (adj): nhiều, rộng rãi
B. restricted (adj): hạn chế
C. generous (adj): hào phóng
D. limitless (adj): vô hạn
Chọn: C
-------------------------------------------------------------------------------------------------------------------
133. 
(A) I would really appreciate the opportunity to work with you.
(B) I heard that DigitalIT is a great company.
(C) In fact, our designs are often copied by other companies.
(D) I have attached a number of our past designs to illustrate what we specialize in.
Lời giải:
A. Tôi thực sự đánh giá cao cơ hội được làm việc với bạn.
B. Tôi nghe nói Digital-IT là một công ty tuyệt vời.
C. Trên thực tế, thiết kế của chúng tôi thường bị các công ty khác sao chép.
D. Tôi đã đính kèm một số thiết kế trước đây của chúng tôi để minh họa rằng chúng tôi có chuyên môn về cái gì.
Chọn: D
-------------------------------------------------------------------------------------------------------------------
134. 
(A) at      (B) to
(C) with    (D) from
Lời giải:
Đáp án (B) "to" là đáp án chính xác. Cụm từ "look forward to your reply" có nghĩa là "mong đợi phản hồi của bạn".
Đáp án (A) "at", (C) "with", và (D) "from" không phù hợp với cụm động từ "look forward".
Chọn: B2. QIB will work…………to maintain sustainable growth and expansion plans.
(A) Persisted   (B) Persistent
(C) Persistently    (D) Persistence
Lời giải: "Persistently" (liên tục) là trạng từ phù hợp.
Chọn: C`;
        sendEditorContent(getAllContent());
    }
    
    // Hiển thị hướng dẫn
    function loadGuideContent() {
        const leftSection = document.getElementById('part-6__left-section');
        if (!leftSection) return;
        leftSection.innerHTML = `
            <div class="guide-container">
                <h2>📌 Hướng Dẫn Nhập Đề Thi</h2>
                <p>Nhập nội dung đoạn văn và câu hỏi vào khung bên phải</p>
                <p>Hệ thống sẽ tự động nhận diện câu hỏi và hiển thị ở đây.</p>
                <div class="note-container">
                    <strong>⚠️ Lưu ý quan trọng ⚠️</strong>
                    <ul>
                        Vui lòng nhập câu theo đúng định dạng như "131. " (số theo sau dấu chấm và khoảng trắng).<br>Nếu câu không có câu hỏi, hãy nhớ để lại một khoảng trắng sau dấu chấm để hệ thống nhận diện chính xác.
                    </ul>
                </div>
                <button onclick="Part6.insertSampleContent()">🔍 Xem ví dụ</button>
            </div>
        `;
    }
    
    return {
        getAllContent,
        sendEditorContent,
        renderLeftSection,
        handleQuestionChange,
        handlePassageChange,
        updateDeleteButtons,
        deletePassageQuestionPair,
        addPassageQuestionPair,
        initializeTinyMCE,
        debouncedHandlePassageChange,
        debounce,
        loadGuideContent,
        insertSampleContent
    };
    })();
    
    
document.addEventListener('DOMContentLoaded', () => {
    Part6.initializeTinyMCE();
    Part6.updateDeleteButtons();
    Part6.loadGuideContent();
    const editor = document.getElementById('part-6__question-editor-1');
    if (editor) {
        editor.addEventListener('input', () => {
            Part6.handleQuestionChange(editor.id, editor.value);
            if (!editor.value.trim()) {
                editor.value = '';
            }
        });
    }
});