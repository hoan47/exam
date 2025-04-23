document.addEventListener('DOMContentLoaded', function () {
    loadFolders();
})

// Tạo thư mục mới
document.getElementById('createFolderBtn').addEventListener('click', () => {
    const folderOrder = folderList.querySelectorAll('.folder-item').length;
    const folderName = prompt('Tạo tên thư mục:');
    if (!folderName) return
    fetch('/insert_folder/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: folderName,
            order: folderOrder
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            console.log('Tạo thư mục thành công!');
            loadFolders();
        } else {
            console.log('Thất bại: ' + data.message);
        }
    })
    .catch(() => {
        alert('Lỗi kết nối server!');
    });
});

document.getElementById('folderList').addEventListener('click', function (e) {
    const folderHeader = e.target.closest('.folder-header');
    const createExamBtn = e.target.closest('.create-exam-btn');
    const editExamBtn = e.target.closest('.edit-exam-btn');
    const deleteExamBtn = e.target.closest('.delete-exam-btn');
    const editFolderBtn = e.target.closest('.edit-folder-btn');
    const deleteFolderBtn = e.target.closest('.delete-folder-btn');

    // Ưu tiên xử lý nút tạo đề
    if (createExamBtn) {
        const folderItem = createExamBtn.closest('.folder-item');
        if (!folderItem) return;
        const folderId = folderItem.getAttribute('data-folder-id');
        const examOrder = folderItem.querySelectorAll('.table-row').length;

        fetch('/insert_exam/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                folder_id: folderId,
                exam_order: examOrder
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                const id = data.exam_id;
                window.location.href = `/create_exam/?id=${id}`;
            } else {
                console.log('Thất bại: ' + data.message);
            }
        })
        .catch(() => {
            alert('Lỗi kết nối server!');
            loadFolders();
        });
        return;
    }

    // Xử lý sửa đề
    if (editExamBtn) {
        const row = editExamBtn.closest('tr');
        const examId = row.getAttribute('data-exam-id');
        window.location.href = `/create_exam/?id=${examId}`;
        return;
    }

    // Xử lý xóa đề
    if (deleteExamBtn) {
        if (confirm('Bạn có chắc chắn muốn xóa bài kiểm tra này không?')) {
            const row = deleteExamBtn.closest('tr');
            const id = row.getAttribute('data-exam-id');

            fetch('/delete_exam/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log('Xóa thành công!');
                    const list = row.parentElement;
                    row.remove();
                    reorderBySTT(list);
                } else {
                    console.log('Thất bại: ' + data.message);
                }
            })
            .catch(() => {
                alert('Lỗi kết nối server!');
                loadFolders();
            });
        }
        return;
    }

    // Sửa tên thư mục
    if (editFolderBtn) {
        const folder = editFolderBtn.closest('.folder-item');
        const id = folder.getAttribute('data-folder-id');
        const nameSpan = folder.querySelector('span');
        const newName = prompt('Chỉnh sửa tên thư mục:', nameSpan.textContent);
        if (!newName || newName.trim() === '' || newName === nameSpan.textContent) return;
        fetch('/update_folder/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                name: newName
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('Cập nhật thành công!');
                nameSpan.textContent = newName;
            } else {
                console.log('Thất bại: ' + data.message);
            }
        })
        .catch(() => {
            alert('Lỗi kết nối server!');
            loadFolders();
        });
        return;
    }

    // Mở/đóng thư mục
    if (deleteFolderBtn) {
        if (confirm('Bạn có chắc chắn muốn xóa thư mục này không?')) {
            const folder = deleteFolderBtn.closest('.folder-item');
            const id = folder.getAttribute('data-folder-id');


            fetch('/delete_folder/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log('Xóa thành công!');
                    folder.remove();
                } else {
                    console.log('Thất bại: ' + data.message);
                }
            })
            .catch(() => {
                alert('Lỗi kết nối server!');
                loadFolders();
            });
        }
        return;

    }

    // Mở/đóng thư mục
    if (folderHeader) {
        const folderItem = folderHeader.closest('.folder-item');
        const examList = folderItem.querySelector('.exam-list');
        examList.classList.toggle('hidden');
        return;
    }
});

// Khởi tạo Sortable cho danh sách thư mục
const folderList = document.getElementById('folderList');
new Sortable(folderList, {
    group: 'folder',
    animation: 150,
    handle: '.folder-header',
    onEnd: (evt) => {
        if (evt.newIndex === evt.oldIndex){
            return;
        }
        const folderItems = document.querySelectorAll('.folder-item'); // Lấy tất cả thư mục
        let updates = []; // Mảng chứa thông tin thứ tự mới của các thư mục
        folderItems.forEach((folderItem, index) => {
            const id = folderItem.getAttribute('data-folder-id');
            const order = index;  // Thứ tự mới của thư mục (tính từ 0)
            updates.push({ id, order});
        });

        fetch('/swap_folder/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                updates: updates
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('Cập nhật thành công!');
            } else {
                console.log('Thất bại: ' + data.message);
            }
        })
        .catch(() => {
            alert('Lỗi kết nối server!');
            loadFolders();
        });
    }
});


function loadFolders() {
const folderList = document.getElementById('folderList');
folderList.innerHTML = '';

folders.forEach(folder => {
    let folderHtml = `
        <div class="folder-item rounded-lg overflow-hidden border border-gray-200" data-folder-id="${folder.id}" draggable="false">
            <div class="folder-header px-4 py-3 flex justify-between items-center">
                <div class="flex items-center">
                    <i class="fas fa-folder text-indigo-500 mr-3 text-lg"></i>
                    <span class="font-medium text-gray-800">${folder.name}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="folder-footer px-4 py-2 text-sm text-gray-500">
                        <span>Thời gian tạo: ${formatDate(folder.created_at)}</span>
                    </div>
                    <button class="edit-folder-btn text-gray-500 hover:text-indigo-600 transition-colors">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-folder-btn text-gray-500 hover:text-red-600 transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="toggle-folder-btn text-gray-500 hover:text-gray-700 transition-colors">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>
            <div class="exam-list" id="${folder.id}">
                <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <h4 class="text-sm font-medium text-gray-700">Danh sách đề thi</h4>
                    <button class="create-exam-btn bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center transition-colors">
                        <i class="fas fa-plus mr-2"></i>
                        Tạo đề thi mới
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề thi</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truy cập</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập nhật</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200 sortable">`;

    folder.exams.forEach((exam) => {
        folderHtml += `
            <tr class="table-row" data-exam-id="${exam.id}">
                <td class="px-4 py-3 whitespace-nowrap"><span class="stt-badge">${exam.order}</span></td>
                <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-900">${exam.title}</td>
                <td class="px-4 py-3 whitespace-nowrap"><span class="badge badge-hard">${exam.status}</span></td>
                <td class="px-4 py-3 whitespace-nowrap text-gray-500">${exam.max_duration} phút</td>
                <td class="px-4 py-3 whitespace-nowrap"><span class="badge badge-free">${exam.access}</span></td>
                <td class="px-4 py-3 whitespace-nowrap text-gray-500">${formatDate(exam.created_at)}</td>
                <td class="px-4 py-3 whitespace-nowrap text-gray-500">${formatDate(exam.updated_at)}</td>
                <td class="px-4 py-3 whitespace-nowrap text-right">
                    <div class="flex justify-end space-x-1">
                        <button class="edit-exam-btn action-btn bg-blue-100 text-blue-600 hover:bg-blue-200">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-exam-btn action-btn bg-red-100 text-red-600 hover:bg-red-200">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    });

    folderHtml += `</tbody></table></div></div></div></div>`;
    folderList.insertAdjacentHTML('beforeend', folderHtml);
});

document.querySelectorAll('tbody.sortable').forEach(tbody => {
    new Sortable(tbody, {
        animation: 150,
        onEnd: (evt) => {
            if (evt.oldIndex === evt.newIndex) return;

            reorderBySTT(evt.target);
            const updates = Array.from(evt.target.querySelectorAll('tr')).map((tr, index) => ({
                id: tr.dataset.examId,
                order: index
            }));

            fetch('/swap_exam/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log('Cập nhật thành công!');
                } else {
                    console.log('Thất bại: ' + data.message);
                }
            })
            .catch(() => {
                alert('Lỗi kết nối server!');
                loadFolders();
            });
        }
    });
});

document.querySelectorAll('.exam-list').forEach(el => el.classList.add('hidden'));
}

function reorderBySTT(tbody) {
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.forEach((row, index) => {
        const sttCell = row.querySelector('td:nth-child(1)');
        let sttSpan = sttCell.querySelector('.stt-badge');
        sttSpan.textContent = index;
    });
}

// Định dạng ngày tháng
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}
// Định dạng ngày tháng
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}
