// header.js
document.addEventListener('DOMContentLoaded', function () {
    // Giả sử trạng thái đăng nhập người dùng và thông tin người dùng
    const isLoggedIn = true; // Bạn có thể thay thế giá trị này từ API hoặc session
    const user = {
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        picture: 'https://via.placeholder.com/150',
        created_at: '2023-01-01',
        expiry_at: '2025-12-31'
    };

    // Hiển thị thông tin người dùng nếu đăng nhập
    if (isLoggedIn) {
        document.getElementById('userAvatar').src = user.picture;
        document.getElementById('userName').textContent = `Chào ${user.name}`;
        document.getElementById('userGreeting').textContent = `Xin chào, ${user.name}!`;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userJoinDate').textContent = `Thành viên từ: ${user.created_at}`;
        document.getElementById('userExpiryDate').textContent = `Thời điểm hết hạn gói: ${user.expiry_at}`;
    } else {
        document.getElementById('userGreeting').textContent = 'Chưa đăng nhập';
        document.getElementById('userEmail').textContent = '';
        document.getElementById('userJoinDate').textContent = '';
        document.getElementById('userExpiryDate').textContent = '';
    }

    // Nếu người dùng chưa Premium, có thể hiển thị quảng cáo hoặc các phần khác.
    if (!isLoggedIn) {
        // Mã để hiển thị quảng cáo, chẳng hạn
        console.log("Hiển thị quảng cáo Premium");
    }
});
