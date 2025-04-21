// Khởi tạo trang
document.addEventListener('DOMContentLoaded', function () {
    // Tải danh sách mã gói
    loadCodes();
    // Lấy các phần tử
    const applyFilterBtn = document.querySelector('#applyFilterBtn');
    const resetFilterBtn = document.querySelector('#resetFilterBtn');
    const filterEmailInput = document.querySelector('#filterEmail');

    // Đăng ký sự kiện cho nút "Áp dụng"
    applyFilterBtn.addEventListener('click', function() {
        const email = filterEmailInput.value.trim(); // Lấy giá trị email
        loadCodes(1, email); // Tải lại danh sách mã gói với email đã nhập
    });

    // Đăng ký sự kiện cho nút "Đặt lại"
    resetFilterBtn.addEventListener('click', function() {
        filterEmailInput.value = ''; // Làm trống ô nhập liệu email
        loadCodes(1); // Tải lại danh sách mã gói mà không có bộ lọc
    });
});

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
    const email = document.querySelector('#filterEmail').value.trim();  // Lấy giá trị email từ ô nhập liệu bộ lọc
    currentPage = page;

    // Thêm email vào URL nếu có giá trị
    let url = '/get_codes/?page=' + page;
    if (email) {
        url += `&email=${encodeURIComponent(email)}`;
    }
    fetch(url, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tableBody = document.querySelector('#codesTable tbody');
                tableBody.innerHTML = '';
    
                data.codes.forEach(code => {
                    const row = `
                        <tr id="${code.id}">
                            <td><span class="package-code">${code.code}</span></td>
                            <td>${formatPrice(code.price)}</td>
                            <td>${code.duration} tháng</td>
                            <td>${code.user?.email || 'Chưa có'}</td>
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
                    tableBody.innerHTML += row;
                });
    
                renderPagination(data.total_pages);
            } else {
                alert('Không thể tải dữ liệu mã gói!');
            }
        })
        .catch(error => {
            console.error('Lỗi kết nối:', error);
            alert('Lỗi kết nối với server!');
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
    // Gán option tương ứng là selected
    const selectElement = document.getElementById('editPackageDuration');
    selectElement.value = code.duration;
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
        
        fetch('/update_code/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: code.id,
                duration: parseInt(updatedDuration),
                price: parseFloat(updatedPrice),
            }),
        })
            .then(response => response.json())  // Giải mã dữ liệu trả về từ server
            .then(data => {
                if (data.status === 'success') {
                    loadCodes(currentPage);  // Load lại dữ liệu
                    modal.hide();  // Đóng modal
                    alert('Cập nhật thành công!');
                } else {
                    alert('Thất bại: ' + data.message);  // Hiển thị thông báo lỗi
                }
            })
            .catch(error => {
                console.error('Lỗi kết nối:', error);  // Xử lý lỗi kết nối
                alert('Lỗi kết nối server!');
            });
    });
}

// Xóa mã gói
function deleteCode(buttonElement) {
    const code = JSON.parse(buttonElement.getAttribute('data-code'));
    
    if (confirm(`Bạn có chắc chắn muốn xóa mã gói ${code.code}?`)) {
        fetch('/delete_code/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: code.id }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    loadCodes(currentPage);
                    alert('Xóa thành công!');
                } else {
                    alert('Thất bại: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Lỗi kết nối:', error);
                alert('Lỗi kết nối server!');
            });
    }
}

// Mở modal tạo mã mới
$('#createPackageBtn').click(function() {
    const modal = new bootstrap.Modal(document.getElementById('createPackageModal'));
    modal.show();
});

// Xử lý tạo mã mới
$('#savePackageBtn').click(function() {
    const duration = $('#packageDuration').val();
    const price = $('#packageAmount').val();
    
    if (!duration || !price || !Number.isInteger(Number(price)) || price < 0) {
        alert('Vui lòng nhập thông tin hợp lệ!');
        return;
    }
    
    fetch('/insert_code/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            duration: parseInt(duration),
            price: parseFloat(price),
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                location.reload();
                $('#createPackageModal').modal('hide');
                $('#createPackageForm')[0].reset();
                alert('Tạo mã thành công!');
            } else {
                alert('Thất bại: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Lỗi kết nối:', error);
            alert('Lỗi kết nối server!');
        });
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

const selectElement = document.getElementById('editPackageDuration');
selectElement.innerHTML = '';
for (let i = 1; i <= 36; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${i} tháng`;
    selectElement.appendChild(option);
}