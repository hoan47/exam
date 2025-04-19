let current_exam;

loadSection('/warehouse/', 'navExams');
document.getElementById("activateBtn").addEventListener("click", apply_code);
document.getElementById('openPremiumModal')?.addEventListener('click', openPremiumModal);
document.getElementById('closePremiumModal').addEventListener('click', closePremiumModal);



// Xử lý modal premium
const premiumModal = document.getElementById('premiumModal');
const modalContent = document.getElementById('modalContent');
function openPremiumModal(){
    document.getElementById("activeInfo").classList.add("hidden");
    document.getElementById("errorInfo").classList.add("hidden");
    document.getElementById("activationCode").value = "";
    premiumModal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}
function closePremiumModal(){
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        premiumModal.classList.add('hidden');
    }, 300);
}

// Xử lý dropdown user menu
document.querySelectorAll('.dropdown').forEach(dropdown => {
    const button = dropdown.querySelector('button');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    button.addEventListener('click', () => {
        menu.classList.toggle('opacity-0');
        menu.classList.toggle('invisible');
        menu.classList.toggle('translate-y-2');
    });
    
    // Đóng menu khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            menu.classList.add('opacity-0', 'invisible', 'translate-y-2');
        }
    });
});

function loadSection(url, activeBtnId) {
    const navButtons = ['navExams', 'navPractice'];

    // Tô sáng nút đang active
    navButtons.forEach(id => {
        document.getElementById(id).classList.remove('bg-white', 'text-blue-600', 'shadow', 'font-semibold');
    });
    document.getElementById(activeBtnId).classList.add('bg-white', 'text-blue-600', 'shadow', 'font-semibold');

    fetch(url, {
        method: 'POST',
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById("contentContainer").innerHTML = data;
        if (activeBtnId === 'navExams') {
            Warehouse.render();
        }
    })
    .catch(error => {
        alert('Lỗi kết nối server!');
    });
}

function apply_code() {
    const code = document.getElementById("activationCode").value.trim();

    fetch("/apply_code/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            code: code,
            user_id: user.id
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            document.getElementById("activeInfo").classList.remove("hidden");
            document.getElementById("errorInfo").classList.add("hidden");
            document.getElementById("successMessage").innerText = data.message || " Bạn có thể thi tất cả đề thi Premium ngay bây giờ";
        } else {
            document.getElementById("activeInfo").classList.add("hidden");
            document.getElementById("errorInfo").classList.remove("hidden");
            document.getElementById("errorMessage").innerText = data.message || "Mã không hợp lệ";
        }
    })
    .catch(err => {
        document.getElementById("activeInfo").classList.add("hidden");
        document.getElementById("errorInfo").classList.remove("hidden");
        document.getElementById("errorMessage").innerText = "Có lỗi xảy ra khi gửi yêu cầu.";
        console.error("Lỗi khi gọi API:", err);
    });
}