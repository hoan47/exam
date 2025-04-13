const Part7 = (function () {

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
            selector: '#part-7__passage-editor-1',
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
            lineheight_formats: "0.5 1 1.15 1.5 2 2.5 3",
            placeholder: 'Nhập nội dung đoạn văn...',
            setup: function (editor) {
                editor.on('input change NodeChange', function () {
                    debouncedHandlePassageChange(editor.id, editor.getContent());
                });
            }
        });
    }
    
    function addPassageQuestionPair() {
        const container = document.getElementById('part-7__passage-question-container');
        if (!container) return;
        const pairCount = container.querySelectorAll('.part-7__passage-question-pair').length + 1;
        const passageEditorId = `part-7__passage-editor-${pairCount}`;
        const questionEditorId = `part-7__question-editor-${pairCount}`;
        const newPair = document.createElement('div');
        newPair.className = 'part-7__passage-question-pair';
        newPair.dataset.pairId = pairCount;
        newPair.innerHTML = `
            <div class="part-7__passage-editor-box">
                <textarea id="${passageEditorId}" class="part-7__passage-editor" placeholder="Nhập nội dung đoạn văn..."></textarea>
            </div>
            <div class="part-7__question-editor-box">
                <textarea id="${questionEditorId}" class="part-7__question-editor" spellcheck="false" placeholder="Nhập nội dung các câu hỏi tại đây..."></textarea>
            </div>
            <button class="part-7__delete-pair" onclick="Part7.deletePassageQuestionPair(this)">Xóa</button>
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
            lineheight_formats: "0.5 1 1.15 1.5 2 2.5 3",
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
        const editorId = pair.querySelector('.part-7__passage-editor').id;
        tinymce.get(editorId)?.remove();
        pair.remove();
        updateDeleteButtons();
        sendEditorContent(getAllContent());
    }
    
    function updateDeleteButtons() {
        const pairs = document.querySelectorAll('#part-7 .part-7__passage-question-pair');
        const deleteButtons = document.querySelectorAll('#part-7 .part-7__delete-pair');
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
        const leftSection = document.getElementById('part-7__left-section');
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
            groupBox.className = 'part-7-passage-question-group';
    
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
        const pairs = document.querySelectorAll('.part-7__passage-question-pair');
        const contentList = [];
    
        pairs.forEach(pair => {
            const pairId = pair.dataset.pairId;
            const passageEditor = tinymce.get(`part-7__passage-editor-${pairId}`);
            const questionEditor = document.getElementById(`part-7__question-editor-${pairId}`);
    
            const passageContent = passageEditor ? passageEditor.getContent() : '';
            const questionContent = questionEditor ? questionEditor.value : '';
    
            contentList.push([passageContent, questionContent, pairId]);
        });
    
        return contentList;
    }
    
    function insertSampleContent() {
        const id_editor = getAllContent()[0][2]
        const passageEditor = tinymce.get(`part-7__passage-editor-${id_editor}`);
        const quetionsEditor = document.getElementById(`part-7__question-editor-${id_editor}`);
    
        if (!passageEditor || !quetionsEditor) return;
        passageEditor.setContent(`<p class="MsoNormal" style="text-align: justify; line-height: 150%; mso-layout-grid-align: none; text-autospace: none; margin: 3.0pt 28.35pt 6.0pt 0in;"><strong style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 150%; font-family: 'Times New Roman',serif;">Question 147-151 </span></strong><span style="font-size: 12.0pt; line-height: 150%; font-family: 'Times New Roman',serif;">refer to the following catalog page and order form.</span></p>
<div style="mso-element: para-border-div; border: solid windowtext 1.0pt; mso-border-alt: solid windowtext .5pt; padding: 1.0pt 4.0pt 1.0pt 4.0pt;">
<p class="MsoNormal" style="margin-bottom: 0in; text-align: center; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;" align="center"><strong style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Business Fashions</span></strong></p>
<p class="MsoNormal" style="margin-bottom: 6.0pt; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><strong style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Fall Catalog p. 35</span></strong></p>
<p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><strong style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Men's Dress Shirts.</span></strong><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;"> Solid color. Item #387</span></p>
<p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">These comfortable yet elegant shirts are made of 100% combed cotton.</span></p>
<p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Colors: white, cream, light blue, light green.</span></p>
<p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Sizes S M L XL. $55</span></p>
<p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><strong style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Men's Dress Shirts.</span></strong><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;"> Striped. Item #387A</span></p>
<p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Same as above, but with a thin stripe over a solid background color.</span></p>
<p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Colors: red on white, blue on white, green on cream, brown on cream.</span></p>
<p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Sizes S M L XL. $65</span></p>
<p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><strong style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Striped Ties.</span></strong><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;"> Item #765</span></p>
<p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">These stylish ties with a jaunty stripe are made of imported silk.</span></p>
<p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Colors: burgundy red/navy blue, moss green/navy blue, moss green/golden yellow, black/bright red. $30</span></p>
<p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><strong style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Cashmere Sweaters</span></strong><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">. Item #521</span></p>
<p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">You'll feel oh-so-comfortable in these sweaters made of 100% genuine cashmere with a chic V neck.</span></p>
<p class="MsoNormal" style="margin-bottom: 6.0pt; text-align: justify; border: none; mso-border-alt: solid windowtext .5pt; padding: 0in; mso-padding-alt: 1.0pt 4.0pt 1.0pt 4.0pt;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Colors: burgundy red, charcoal gray, midnight black. $150</span></p>
</div>
<p class="MsoNormal" style="text-align: justify; line-height: 150%; mso-layout-grid-align: none; text-autospace: none; margin: 3.0pt 28.35pt 6.0pt 0in;"><span style="font-size: 12.0pt; line-height: 150%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
<div align="center">
<table class="MsoNormalTable" style="border-collapse: collapse; border: none; height: 589.35px;" border="1" width="640" cellspacing="0" cellpadding="0">
<tbody>
<tr style="height: 33.95px;">
<td style="width: 140.6pt; border: solid windowtext 1.0pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="187">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><strong style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Description</span></strong></p>
</td>
<td style="width: 70.35pt; border: solid windowtext 1.0pt; border-left: none; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><strong style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Color</span></strong></p>
</td>
<td style="width: 64.9pt; border: solid windowtext 1.0pt; border-left: none; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="87">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><strong style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Size</span></strong></p>
</td>
<td style="width: 70.35pt; border: solid windowtext 1.0pt; border-left: none; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><strong style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Item No.</span></strong></p>
</td>
<td style="width: 70.35pt; border: solid windowtext 1.0pt; border-left: none; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><strong style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Quantity</span></strong></p>
</td>
<td style="width: 63.15pt; border: solid windowtext 1.0pt; border-left: none; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="84">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><strong style="mso-bidi-font-weight: normal;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Price</span></strong></p>
</td>
</tr>
<tr style="height: 33.95px;">
<td style="width: 140.6pt; border: solid windowtext 1.0pt; border-top: none; mso-border-top-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="187">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">men's dress shirt-striped</span></p>
</td>
<td style="width: 70.35pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">blue/white</span></p>
</td>
<td style="width: 64.9pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="87">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">L</span></p>
</td>
<td style="width: 70.35pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">387A</span></p>
</td>
<td style="width: 70.35pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">2</span></p>
</td>
<td style="width: 63.15pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="84">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">$1</span><span lang="VI" style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif; mso-ansi-language: VI;">1</span><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">0</span></p>
</td>
</tr>
<tr style="height: 33.95px;">
<td style="width: 140.6pt; border: solid windowtext 1.0pt; border-top: none; mso-border-top-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="187">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">silk tie</span></p>
</td>
<td style="width: 70.35pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">red/blue</span></p>
</td>
<td style="width: 64.9pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="87">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
<td style="width: 70.35pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">765</span></p>
</td>
<td style="width: 70.35pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">3</span></p>
</td>
<td style="width: 63.15pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="84">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">$90</span></p>
</td>
</tr>
<tr style="height: 33.95px;">
<td style="width: 140.6pt; border: solid windowtext 1.0pt; border-top: none; mso-border-top-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="187">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">cashmere sweater</span></p>
</td>
<td style="width: 70.35pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">black</span></p>
</td>
<td style="width: 64.9pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="87">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">L</span></p>
</td>
<td style="width: 70.35pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">521</span></p>
</td>
<td style="width: 70.35pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
<td style="width: 63.15pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="84">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">$150</span></p>
</td>
</tr>
<tr style="height: 33.55px;">
<td style="width: 140.6pt; border: none; border-left: solid windowtext 1.0pt; mso-border-left-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="187">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
<td style="width: 70.35pt; border: none; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
<td style="width: 64.9pt; border: none; padding: 0in 5.4pt 0in 5.4pt;" width="87">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
<td style="width: 70.35pt; border: none; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
<td style="width: 70.35pt; border: none; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">sub total</span></p>
</td>
<td style="width: 63.15pt; border: none; border-right: solid windowtext 1.0pt; mso-border-right-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="84">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">$350</span></p>
</td>
</tr>
<tr style="height: 33.15px;">
<td style="width: 140.6pt; border: none; border-left: solid windowtext 1.0pt; mso-border-left-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="187">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
<td style="width: 70.35pt; border: none; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
<td style="width: 64.9pt; border: none; padding: 0in 5.4pt 0in 5.4pt;" width="87">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
<td style="width: 70.35pt; border: none; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
<td style="width: 70.35pt; border: none; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">shipping</span></p>
</td>
<td style="width: 63.15pt; border: none; border-right: solid windowtext 1.0pt; mso-border-right-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="84">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
</tr>
<tr style="height: 33.55px;">
<td style="width: 140.6pt; border-top: none; border-left: solid windowtext 1.0pt; border-bottom: solid windowtext 1.0pt; border-right: none; mso-border-left-alt: solid windowtext .5pt; mso-border-bottom-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="187">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
<td style="width: 70.35pt; border: none; border-bottom: solid windowtext 1.0pt; mso-border-bottom-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
<td style="width: 64.9pt; border: none; border-bottom: solid windowtext 1.0pt; mso-border-bottom-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="87">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
<td style="width: 70.35pt; border: none; border-bottom: solid windowtext 1.0pt; mso-border-bottom-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
<td style="width: 70.35pt; border: none; border-bottom: solid windowtext 1.0pt; mso-border-bottom-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="94">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">total</span></p>
</td>
<td style="width: 63.15pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-bottom-alt: solid windowtext .5pt; mso-border-right-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" width="84">
<p class="MsoNormal" style="text-align: center; margin: 4.0pt 0in 4.0pt 0in;" align="center"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">&nbsp;</span></p>
</td>
</tr>
<tr style="height: 353.3px;">
<td style="width: 479.7pt; border: solid windowtext 1.0pt; border-top: none; mso-border-top-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0in 5.4pt 0in 5.4pt;" colspan="6" valign="top" width="640">
<p class="MsoNormal" style="text-align: justify;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Payment Method*: <span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp; </span><u>X </u><span style="mso-spacerun: yes;">&nbsp;</span>check ___ credit card</span></p>
<p class="MsoNormal" style="text-align: justify;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Credit card number: <span style="mso-tab-count: 1;">&nbsp;&nbsp; </span>__________________________________________________</span></p>
<p class="MsoNormal" style="text-align: justify;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Shipping Charges:<span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>for orders up to $200: $12.50 Please allow six weeksfor delivery.</span></p>
<p class="MsoNormal" style="text-align: justify;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;"><span style="mso-tab-count: 3;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>for orders up to $400: $20.00 *Cashandmoneyorders not accepted.</span></p>
<p class="MsoNormal" style="text-align: justify;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;"><span style="mso-tab-count: 3;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>for orders over $400: no charge</span></p>
<p class="MsoNormal" style="text-align: justify;"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Send Order to</span></p>
<p class="MsoNormal" style="text-align: justify;"><strong style="mso-bidi-font-weight: normal;"><em style="mso-bidi-font-style: normal;"><u><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Bill Simpson</span></u></em></strong></p>
<p class="MsoNormal" style="text-align: justify;"><strong style="mso-bidi-font-weight: normal;"><em style="mso-bidi-font-style: normal;"><u><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">P.O. Box 78</span></u></em></strong></p>
<p class="MsoNormal" style="text-align: justify;"><strong style="mso-bidi-font-weight: normal;"><em style="mso-bidi-font-style: normal;"><u><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif;">Ardmore, IL</span></u></em></strong></p>
</td>
</tr>
</tbody>
</table>
</div>`)
        quetionsEditor.value = `148. What mistake did Mr. Simpson make with his shirt order?
(A) He forgot to specify a size.
(B) He didn’t write the item number.
(C) He ordered a color that isn't available.
(D) He wrote the wrong price.
Lời giải:
Trong đơn hàng của ông Simpson, ông đã không chỉ định kích thước cho chiếc áo sơ mi "striped". Điều này là một lỗi khi đặt hàng.
Chọn: A
-------------------------------------------------------------------------------------------------------------------
149. How many ties did Mr. Simpson order?
(A) 1
(B) 2
(C) 3
(D) 4
Lời giải:
Ông Simpson đã đặt 3 chiếc Striped Ties (Item #765) với màu sắc red/blue.
Chọn: C
-------------------------------------------------------------------------------------------------------------------
150. How much should Mr. Simpson pay for shipping?
(A) $20
(B) $12.50
(C) $22.50
(D) $0
Lời giải:
Theo thông tin trong mẫu đơn, vì tổng giá trị đơn hàng của ông Simpson là $350, thuộc khoảng từ $200 đến $400, nên phí vận chuyển là $20.
Chọn: A
-------------------------------------------------------------------------------------------------------------------
151. How will Mr. Simpson pay for his order?
(A) Check
(B) Debit card
(C) Money order
(D) Cash
Lời giải:
Ông Simpson đã chọn thanh toán bằng check (séc) trong đơn hàng của mình.
Chọn: A
(B) Striped men’s dress shirts
(C) Striped sweaters
(D) Sweaters
Lời giải:
Solid color men’s dress shirts có 4 màu (white, cream, light blue, light green).
Striped men’s dress shirts có 4 màu (red on white, blue on white, green on cream, brown on cream).
Striped ties có 4 màu (burgundy red/navy blue, moss green/navy blue, moss green/golden yellow, black/bright red).
Sweaters có 3 màu (burgundy red, charcoal gray, midnight black).
Chọn: D
`;
        sendEditorContent(getAllContent());
    }
    
    // Hiển thị hướng dẫn
    function loadGuideContent() {
        const leftSection = document.getElementById('part-7__left-section');
        if (!leftSection) return;
        leftSection.innerHTML = `
            <div class="guide-container">
                <h2>📌 Hướng Dẫn Nhập Đề Thi</h2>
                <p>Nhập nội dung đoạn văn và câu hỏi vào khung bên phải</p>
                <p>Hệ thống sẽ tự động nhận diện câu hỏi và hiển thị ở đây.</p>
                <button onclick="Part7.insertSampleContent()">🔍 Xem ví dụ</button>
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
    Part7.initializeTinyMCE();
    Part7.updateDeleteButtons();
    Part7.loadGuideContent();
    const editor = document.getElementById('part-7__question-editor-1');
    if (editor) {
        editor.addEventListener('input', () => {
            Part7.handleQuestionChange(editor.id, editor.value);
            if (!editor.value.trim()) {
                editor.value = '';
            }
        });
    }
});