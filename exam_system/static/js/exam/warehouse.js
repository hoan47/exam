const Warehouse = (function () {
    function render() {
        fetch(`/get_warehouse/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(response => {
            try {
                if (response.status != 'success') {
                    alert('Không thể tải dữ liệu!');
                    return;
                }
                const container = document.getElementById("folders");
                container.innerHTML = '';
    
                response.warehouse.forEach((folder) => {
                    const folderId = `folder_id-${folder.id}`;
                    const folderDiv = document.createElement("div");
                    folderDiv.className = "bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border border-gray-200";
    
                    folderDiv.innerHTML = `
                        <div onclick="Warehouse.toggleFolder('${folderId}')"
                            class="flex justify-between items-center px-6 py-5 cursor-pointer folder-header bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-all">
                            <div class="flex items-center">
                                <div class="mr-4 w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                                    <i class="fas fa-folder-open text-xl"></i>
                                </div>
                                <div>
                                    <h2 class="font-bold text-xl text-gray-800">${folder.name}</h2>
                                    <div class="flex items-center gap-3 mt-2">
                                        <span class="text-sm bg-indigo-100/80 text-indigo-700 px-3 py-1 rounded-full flex items-center gap-1">
                                            <i class="fas fa-file-alt"></i> ${folder.exams.length} đề thi
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="text-indigo-500">
                                <svg id="icon-${folderId}" class="w-6 h-6 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </div>
    
                        <div id="${folderId}" class="hidden px-6 py-4 bg-gradient-to-b from-gray-50 to-white">
                            <div class="grid grid-cols-1 gap-4">
                                ${folder.exams.map((exam, idx) => `
                                    <div class="exam-item bg-white rounded-xl p-5 cursor-pointer shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-indigo-300 group"
                                        data-exam='${JSON.stringify(exam)}' onclick="Warehouse.openExam(this)">
                                        <div class="flex items-start gap-4">
                                            <div class="flex-shrink-0 mt-1 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
                                                ${idx + 1}
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <h3 class="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors mb-1">${exam.title}</h3>
                                                <div class="flex flex-wrap items-center gap-2 mt-3">
                                                    <span class="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1">
                                                        <i class="fas fa-question-circle text-blue-500"></i> ${exam.total_attemped} lượt
                                                    </span>
                                                    <span class="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1">
                                                        <i class="fas fa-users text-purple-500"></i> ${exam.total_users_attempted} người
                                                    </span>
                                                    <span class="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full flex items-center gap-1">
                                                        <i class="fas fa-clock text-amber-500"></i> ${exam.max_duration} phút
                                                    </span>
                                                    ${exam.access === "free" ? `
                                                        <span class="text-xs bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 border border-green-200">
                                                            <i class="fas fa-unlock-alt text-green-500"></i> Miễn phí
                                                        </span>
                                                    ` : `
                                                        <span class="text-xs bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center gap-1 border border-amber-200 shadow-sm">
                                                            <i class="fas fa-crown text-amber-500"></i> Premium
                                                        </span>
                                                    `}
                                                    <span class="text-sm bg-white text-gray-600 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                                        <i class="fas fa-calendar-alt"></i> ${new Date(exam.updated_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div class="flex-shrink-0 text-gray-400 group-hover:text-indigo-500 transition-colors self-center">
                                                <i class="fas fa-chevron-right"></i>
                                            </div>
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                    `;
    
                    container.appendChild(folderDiv);
                });
            } catch (e) {
                console.error('Error:', e);
                alert('Lỗi xử lý dữ liệu!');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Lỗi kết nối server!');
        });
    }

    // Hàm toggle folder
    function toggleFolder(id) {
        const el = document.getElementById(id);
        const icon = document.getElementById(`icon-${id}`);
        el.classList.toggle("hidden");
        icon.classList.toggle("rotate-180");
    }

    // Hàm mở exam
    function openExam(element) {
        const exam = JSON.parse(element.getAttribute('data-exam'));
        current_exam = exam;
        if (!user){
            window.location = '/login' //Nhảy ra login khi chưa đăng nhập.
            return;
        }
        if (exam.access == "free"){
            openExamFetch();
            return;
        }
        // Kiểm tra nếu expiry_at là null
        if (user.expiry_at === null) {
            openPremiumModal();
            return;
        }
        openExamFetch();
    }

    function openExamFetch(){
        fetch("/exam_detail/", {
            method: 'POST',
        })
        .then(response => response.text())
        .then(data => {
            document.getElementById("contentContainer").innerHTML = data;
            ExamDetail.render();
        })
        .catch(error => {
            console.log(error);
            alert('Lỗi kết nối server!');
        });
    }

    // Return các hàm cần thiết
    return {
        render,
        toggleFolder,
        openExam
    };
})();