document.addEventListener('DOMContentLoaded', function () {
    loadFolders();
})

// Tạo thư mục mới
document.getElementById('createFolderBtn').addEventListener('click', () => {
    const folderOrder = folderList.querySelectorAll('.folder-item').length + 1;
    const folderName = prompt('Tạo tên thư mục:');
    if (!folderName) return
    $.ajax({
        url: '/admin/insert_folder/',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            name: folderName,
            order: folderOrder
        }),
        success: function(data) {
            if (data.status === 'success') {
                console.log('Tạo thư mục thành công!');
                loadFolders();
            } else {
                console.log('Thất bại: ' + data.message);
            }
        },
        error: function() {
            alert('Lỗi kết nối server!');
        }
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
        const examOrder = folderItem.querySelectorAll('.table-row').length + 1;

        $.ajax({
            url: '/admin/insert_exam/',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                folder_id: folderId,
                exam_order: examOrder
            }),
            success: function(data) {
                if (data.status === 'success') {
                    examId = data._id;
                    window.location.href = `/admin/create_exam/?_id=${examId}`;
                } else {
                    console.log('Thất bại: ' + data.message);
                }
            },
            error: function() {
                alert('Lỗi kết nối server!');
                loadFolders();
            }
        });
        return;
    }

    // Xử lý sửa đề
    if (editExamBtn) {
        const row = editExamBtn.closest('tr');
        const examId = row.getAttribute('data-exam-id');
        window.location.href = `/admin/create_exam/?_id=${examId}`;
        return;
    }

    // Xử lý xóa đề
    if (deleteExamBtn) {
        if (confirm('Bạn có chắc chắn muốn xóa bài kiểm tra này không?')) {
            const row = deleteExamBtn.closest('tr');
            const _id = row.getAttribute('data-exam-id');

            $.ajax({
                url: '/admin/delete_exam/',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    _id: _id,
                }),
                success: function(data) {
                    if (data.status === 'success') {
                        console.log('Xóa thành công!');
                        const list = row.parentElement;
                        row.remove();
                        reorderBySTT(list);
                    } else {
                        console.log('Thất bại: ' + data.message);
                    }
                },
                error: function() {
                    alert('Lỗi kết nối server!');
                    loadFolders();
                }
            });
        }
        return;
    }

    // Sửa tên thư mục
    if (editFolderBtn) {
        const folder = editFolderBtn.closest('.folder-item');
        const _id = folder.getAttribute('data-folder-id');
        const nameSpan = folder.querySelector('span');
        const newName = prompt('Chỉnh sửa tên thư mục:', nameSpan.textContent);
        if (!newName || newName.trim() === '' || newName === nameSpan.textContent) return;
        $.ajax({
            url: '/admin/update_folder/',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                _id: _id,
                updates: {name: newName}
            }),
            success: function(data) {
                if (data.status === 'success') {
                    console.log('Cập nhật thành công!');
                    nameSpan.textContent = newName;
                } else {
                    console.log('Thất bại: ' + data.message);
                }
            },
            error: function() {
                alert('Lỗi kết nối server!');
                loadFolders()();
            }
        });
        return;
    }

    // Mở/đóng thư mục
    if (deleteFolderBtn) {
        if (confirm('Bạn có chắc chắn muốn xóa thư mục này không?')) {
            const folder = deleteFolderBtn.closest('.folder-item');
            const _id = folder.getAttribute('data-folder-id');


            $.ajax({
                url: '/admin/delete_folder/',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    _id: _id,
                }),
                success: function(data) {
                    if (data.status === 'success') {
                        console.log('Xóa thành công!');
                        folder.remove();
                    } else {
                        console.log('Thất bại: ' + data.message);
                    }
                },
                error: function() {
                    alert('Lỗi kết nối server!');
                    loadFolders()();
                }
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
        let updatedOrder = []; // Mảng chứa thông tin thứ tự mới của các thư mục
        folderItems.forEach((folderItem, index) => {
            const _id = folderItem.getAttribute('data-folder-id');
            const order = index + 1;  // Thứ tự mới của thư mục (tính từ 1)
            updatedOrder.push({ _id, updates: {order} });
        });

        $.ajax({
            url: '/admin/swap_folder/',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                updatedOrder: updatedOrder,
            }),
            success: function(data) {
                if (data.status === 'success') {
                    console.log('Cập nhật thành công!');
                } else {
                    console.log('Thất bại: ' + data.message);
                }
            },
            error: function() {
                alert('Lỗi kết nối server!');
                loadFolders()();
            }
        });
    }
});


function loadFolders() {
    $.ajax({
        url: '/admin/get_folders/',
        method: 'GET',
        success: function(response) {
            $('#folderList').empty();
            if (response.status === 'success') {
                // Lặp qua mỗi folder
                response.folders.forEach(folder => {
                    // Tạo phần tử HTML cho folder
                    let folderHtml = `
                        <div class="folder-item rounded-lg overflow-hidden border border-gray-200" data-folder-id="${folder._id}" draggable="false">
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
                            <div class="exam-list" id="${folder._id}">
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

                    // Lặp qua mỗi đề thi trong folder và thêm vào bảng
                    folder.exams.forEach((exam, index) => {
                        folderHtml += `
                            <tr class="table-row" data-exam-id="${exam._id}">
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

                    // Kết thúc bảng
                    folderHtml += `</tbody></table></div></div></div></div>`;

                    // Thêm folder vào DOM
                    $('#folderList').append(folderHtml);
                });

                // Khởi tạo lại Sortable sau khi DOM đã thay đổi
                document.querySelectorAll('tbody.sortable').forEach(tbody => {
                    new Sortable(tbody, {
                        animation: 150,
                        onEnd: (evt) => {
                            if (evt.oldIndex === evt.newIndex) {
                                return;
                            }
                
                            reorderBySTT(evt.target);
                            const examElements = Array.from(evt.target.querySelectorAll('tr'));
                            let updatedOrder = [];
                            examElements.forEach((exam, index) => {
                                const _id = exam.getAttribute('data-exam-id');
                                const order = index + 1;
                                updatedOrder.push({ _id, updates: {order} });
                            });
                            $.ajax({
                                url: '/admin/swap_exam/',
                                method: 'POST',
                                contentType: 'application/json',
                                data: JSON.stringify({
                                    updatedOrder: updatedOrder
                                }),
                                success: function(data) {
                                    if (data.status === 'success') {
                                        console.log('Cập nhật thành công!');
                                    } else {
                                        console.log('Thất bại: ' + data.message);
                                    }
                                },
                                error: function() {
                                    alert('Lỗi kết nối server!');
                                    loadFolders()();
                                }
                            });
                        }
                    });
                });
                
                const examLists = document.querySelectorAll('.exam-list');
                examLists.forEach(examList => {
                    examList.classList.add('hidden');
                });
            } else {
                alert('Không thể tải dữ liệu folders!');
            }
        },
        error: function() {
            $('#folderList').empty();
            alert('Lỗi kết nối với server!');
        }
    });
}

function reorderBySTT(tbody) {
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.forEach((row, index) => {
        const sttCell = row.querySelector('td:nth-child(1)');
        let sttSpan = sttCell.querySelector('.stt-badge');
        sttSpan.textContent = index + 1;
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
