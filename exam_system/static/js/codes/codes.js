let currentPage = 1;

// Định dạng tiền tệ
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Định dạng ngày tháng
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}

// Tải danh sách mã gói
function loadCodes(page = 1) {
    currentPage = page;
    $.ajax({
        url: '/admin/codes/get_codes/',
        method: 'GET',
        data: { page: page },
        success: function(response) {
            if (response.status === 'success') {
                const tableBody = $('#codesTable tbody');
                tableBody.empty();

                response.codes.forEach(code => {
                    const row = `
                        <tr id="${code._id}">
                            <td><span class="package-code">${code.code}</span></td>
                            <td>${formatPrice(code.price)}</td>
                            <td>${code.duration} tháng</td>
                            <td>${code.user_id || 'Chưa có'}</td>
                            <td>${code.applied_at ? formatDate(code.applied_at) : 'Chưa có'}</td>
                            <td>${formatDate(code.created_at)}</td>
                            <td>${formatDate(code.updated_at)}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary action-btn" data-code='${JSON.stringify(code)}' onclick="editCode(this)">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger action-btn" data-code='${JSON.stringify(code)}' onclick="deleteCode(this)">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    tableBody.append(row);
                });

                // Hiển thị phân trang
                renderPagination(response.total_pages);
            } else {
                alert('Không thể tải dữ liệu mã gói!');
            }
        },
        error: function() {
            alert('Lỗi kết nối với server!');
        }
    });
}

// Hiển thị phân trang
function renderPagination(totalPages) {
    const paginationContainer = $('#paginationContainer');
    paginationContainer.empty();

    if (totalPages <= 1) return;

    let paginationHtml = '';

    // Nút "Trang trước"
    if (currentPage > 1) {
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="loadCodes(${currentPage - 1}); return false;">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;
    } else {
        paginationHtml += `
            <li class="page-item disabled">
                <span class="page-link">
                    <i class="fas fa-chevron-left"></i>
                </span>
            </li>
        `;
    }

    // Hiển thị các số trang
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    startPage = Math.max(1, endPage - maxVisiblePages + 1);

    // Hiển thị nút trang đầu nếu cần
    if (startPage > 1) {
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="loadCodes(1); return false;">1</a>
            </li>
            ${startPage > 2 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
        `;
    }

    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHtml += `
                <li class="page-item active">
                    <span class="page-link">${i}</span>
                </li>
            `;
        } else {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="loadCodes(${i}); return false;">${i}</a>
                </li>
            `;
        }
    }

    // Hiển thị nút trang cuối nếu cần
    if (endPage < totalPages) {
        paginationHtml += `
            ${endPage < totalPages - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            <li class="page-item">
                <a class="page-link" href="#" onclick="loadCodes(${totalPages}); return false;">${totalPages}</a>
            </li>
        `;
    }

    // Nút "Trang sau"
    if (currentPage < totalPages) {
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="loadCodes(${currentPage + 1}); return false;">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;
    } else {
        paginationHtml += `
            <li class="page-item disabled">
                <span class="page-link">
                    <i class="fas fa-chevron-right"></i>
                </span>
            </li>
        `;
    }

    paginationContainer.html(paginationHtml);
}

// Chỉnh sửa mã gói
function editCode(buttonElement) {
    const code = JSON.parse(buttonElement.getAttribute('data-code'));
    
    // Điền thông tin vào modal
    $('#viewPackageCode').val(code.code);
    $('#editPackageAmount').val(code.price);
    
    // Tạo options cho select
    const selectElement = document.getElementById('editPackageDuration');
    selectElement.innerHTML = '';
    for (let i = 1; i <= 36; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} tháng`;
        if (i === code.duration) option.selected = true;
        selectElement.appendChild(option);
    }
    
    // Mở modal
    const modal = new bootstrap.Modal(document.getElementById('editPackageModal'));
    modal.show();
    
    // Xử lý khi click nút Lưu
    $('#saveEditPackageBtn').off('click').on('click', function() {
        const updatedDuration = $('#editPackageDuration').val();
        const updatedPrice = $('#editPackageAmount').val();
        
        if (!updatedDuration || !updatedPrice || !Number.isInteger(Number(updatedPrice)) ||  updatedPrice < 0) {
            alert('Vui lòng nhập thông tin hợp lệ!');
            return;
        }
        
        $.ajax({
            url: '/admin/codes/update_code/',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                _id: code._id,
                updates:{
                    duration: parseInt(updatedDuration),
                    price: parseFloat(updatedPrice)
                }
            }),
            success: function(data) {
                if (data.status === 'success') {
                    loadCodes(currentPage);
                    modal.hide();
                    alert('Cập nhật thành công!');
                } else {
                    alert('Thất bại: ' + data.message);
                }
            },
            error: function() {
                alert('Lỗi kết nối server!');
            }
        });
    });
}

// Xóa mã gói
function deleteCode(buttonElement) {
    const code = JSON.parse(buttonElement.getAttribute('data-code'));
    
    if (confirm(`Bạn có chắc chắn muốn xóa mã gói ${code.code}?`)) {
        $.ajax({
            url: '/admin/codes/delete_code/',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ _id: code._id }),
            success: function(data) {
                if (data.status === 'success') {
                    loadCodes(currentPage);
                    alert('Xóa thành công!');
                } else {
                    alert('Thất bại: ' + data.message);
                }
            },
            error: function() {
                alert('Lỗi kết nối server!');
            }
        });
    }
}

// Khởi tạo trang
$(document).ready(function() {
    // Tải danh sách mã gói
    loadCodes();
    
    // Mở modal tạo mã mới
    $('#createPackageBtn').click(function() {
        const modal = new bootstrap.Modal(document.getElementById('createPackageModal'));
        modal.show();
    });
    
    // Tạo options cho thời hạn
    const selectElements = ['packageDuration'];
    selectElements.forEach(id => {
        const select = document.getElementById(id);
        for (let i = 1; i <= 36; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} tháng`;
            select.appendChild(option);
        }
    });
    
    // Xử lý tạo mã mới
    $('#savePackageBtn').click(function() {
        const duration = $('#packageDuration').val();
        const price = $('#packageAmount').val();
        
        if (!duration || !price || !Number.isInteger(Number(price)) || price < 0) {
            alert('Vui lòng nhập thông tin hợp lệ!');
            return;
        }
        
        $.ajax({
            url: '/admin/codes/insert_code/',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                duration: parseInt(duration),
                price: parseFloat(price)
            }),
            success: function(data) {
                if (data.status === 'success') {
                    location.reload();
                    $('#createPackageModal').modal('hide');
                    $('#createPackageForm')[0].reset();
                    alert('Tạo mã thành công!');
                } else {
                    alert('Thất bại: ' + data.message);
                }
            },
            error: function() {
                alert('Lỗi kết nối server!');
            }
        });
    });
});

const inputs = document.querySelectorAll('#packageAmount, #editPackageAmount');
inputs.forEach(input => {
    input.addEventListener('input', function(event) {
        let value = event.target.value;

        // Kiểm tra nếu giá trị không phải là số nguyên
        if (!Number.isInteger(Number(value))) {
            // Chuyển giá trị về dạng số nguyên nếu có phần thập phân
            event.target.value = Math.floor(value);
        }
    });
});