// Hiển thị form Quên mật khẩu
function showForgotPassword() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("forgotForm").classList.remove("hidden");
}

// Quay lại form đăng nhập
function showLogin() {
  document.getElementById("forgotForm").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
}

// Xử lý đăng nhập
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;

      const storedAccounts = JSON.parse(localStorage.getItem("accountList") || "[]");
      const matched = storedAccounts.find(
        acc => acc.username === username && acc.password === password
      );

      if (matched) {
        // Tăng số lần đăng nhập
        matched.loginCount = (matched.loginCount || 0) + 1;

        // Lưu ngày đăng nhập
        const today = new Date();
        const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        matched.loginDates = matched.loginDates || [];
        matched.loginDates.push(formattedDate);

        // Lưu lại danh sách tài khoản vào localStorage
        localStorage.setItem("accountList", JSON.stringify(storedAccounts));

        // Lưu thông tin tài khoản vào localStorage
        localStorage.setItem("loggedInUser", JSON.stringify(matched));

        // Điều hướng dựa trên vai trò
        if (matched.role === "thuthu") {
          window.location.href = "home.html";
        } else if (matched.role === "docgia") {
          window.location.href = "public.html";
        } else {
          alert("Vai trò của tài khoản không hợp lệ!");
        }
      } else {
        alert("Tên đăng nhập hoặc mật khẩu không đúng!");
      }
    });
  }
});
//Lấy thông tin tài khoản//
document.addEventListener("DOMContentLoaded", function () {
  const usernameDisplay = document.getElementById("usernameDisplay");
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (loggedInUser && usernameDisplay) {
    usernameDisplay.textContent = loggedInUser.owner; // Hiển thị tên chủ tài khoản
  } else {
    usernameDisplay.textContent = "Khách"; // Hiển thị mặc định nếu không có thông tin
  }
});
//Xóa thông tin khi đăng xuất//
function logout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  }
}
// Chuyển trang
function navigateTo(page) {
  window.location.href = page;
}

// Đăng xuất
function logout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    window.location.href = "login.html";
  }
}

// ------------------- QUẢN LÝ TÀI KHOẢN ------------------- //
let accounts = [];
// Đồng bộ biến `accounts` với `localStorage` khi trang được tải
document.addEventListener("DOMContentLoaded", function () {
  const storedAccounts = JSON.parse(localStorage.getItem("accountList") || "[]");
  accounts = storedAccounts;
  renderTable();
});
function renderTable() {
  const tableBody = document.getElementById("accountTable");
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  tableBody.innerHTML = "";
  accounts
    .filter(acc =>
      acc.username.toLowerCase().includes(keyword) ||
      acc.owner.toLowerCase().includes(keyword)
    )
    .forEach((acc, index) => {
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${acc.username}</td>
          <td>${acc.owner}</td>
          <td>${acc.date}</td>
          <td><button class="btn-primary" onclick="editAccount(${index})">Chỉnh sửa</button></td>
          <td><button class="btn-danger" onclick="deleteAccount(${index})">Xoá</button></td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
}

function handleNewRoleChange() {
  const role = document.getElementById("newRole")?.value;
  const readerCodeGroup = document.getElementById("readerCodeGroup");
  const ownerInput = document.getElementById("newOwner");
  const emailInput = document.getElementById("newEmail");

  // Hiển thị hoặc ẩn ô "Mã độc giả" dựa trên vai trò
  if (readerCodeGroup) {
    readerCodeGroup.style.display = role === "docgia" ? "block" : "none";
  }

  // Bật hoặc tắt ô "Chủ tài khoản" dựa trên vai trò
  if (ownerInput) {
    if (role === "thuthu") {
      ownerInput.removeAttribute("readonly"); // Bật ô nhập
      ownerInput.value = ""; // Xóa giá trị cũ
    } else {
      ownerInput.setAttribute("readonly", true); // Tắt ô nhập
      ownerInput.value = ""; // Xóa giá trị cũ
    }
  }

  // Bật hoặc tắt ô "Email" dựa trên vai trò
  if (emailInput) {
    if (role === "thuthu") {
      emailInput.removeAttribute("readonly"); // Bật ô nhập
      emailInput.value = ""; // Xóa giá trị cũ
    } else {
      emailInput.setAttribute("readonly", true); // Tắt ô nhập
      emailInput.value = ""; // Xóa giá trị cũ
    }
  }
}

function saveNewAccount() {
  const username = document.getElementById("newUsername")?.value.trim();
  const owner = document.getElementById("newOwner")?.value.trim();
  const email = document.getElementById("newEmail")?.value.trim();
  const password = document.getElementById("newPassword")?.value;
  const confirmPassword = document.getElementById("confirmPassword")?.value;
  const role = document.getElementById("newRole")?.value;
  const readerCode = document.getElementById("newReaderCode").value.trim();

  if (!username || !owner || !email || !password || !confirmPassword) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Email không đúng định dạng!");
    return;
  }

  if (password !== confirmPassword) {
    alert("Mật khẩu và xác nhận mật khẩu không khớp!");
    return;
  }

  const newAccount = {
    username,
    owner,
    email,
    password,
    date: new Date().toLocaleDateString("vi-VN"),
    role,
    readerCode: role === "docgia" ? readerCode : ""
  };

  let stored = JSON.parse(localStorage.getItem("accountList") || "[]");
  stored.push(newAccount);
  localStorage.setItem("accountList", JSON.stringify(stored));

  alert("Tài khoản đã được lưu!");

  // Gọi lại renderTable để cập nhật danh sách
  accounts = stored; // Cập nhật biến `accounts` với danh sách mới
  renderTable();

  navigateTo("account.html");
}
//Hàm chỉnh sửa tài khoản//
function editAccount(index) {
  const acc = accounts[index];
  localStorage.setItem("selectedAccount", JSON.stringify(acc));

  // Hiển thị form chỉnh sửa
  document.getElementById("accountListSection").classList.add("hidden");
  document.getElementById("editAccountSection").classList.remove("hidden");

  // Điền thông tin tài khoản vào form
  document.getElementById("infoUsername").value = acc.username || ""; // Tên tài khoản
  document.getElementById("infoPassword").value = acc.password || ""; // Mật khẩu
  document.getElementById("infoOwner").value = acc.owner || ""; // Chủ tài khoản
  document.getElementById("infoEmail").value = acc.email || ""; // Email
  document.getElementById("infoRole").value = acc.role || ""; // Vai trò
  document.getElementById("infoReaderCode").value = acc.readerCode || ""; // Mã độc giả

  handleInfoRoleChange(); // Cập nhật hiển thị mã độc giả nếu cần
}

function deleteAccount(index) {
  if (confirm("Bạn có chắc muốn xoá tài khoản này?")) {
    accounts.splice(index, 1);
    localStorage.setItem("accountList", JSON.stringify(accounts));
    renderTable();
  }
}

function handleInfoRoleChange() {
  const role = document.getElementById("infoRole")?.value;
  const readerCodeGroup = document.getElementById("infoReaderCodeGroup");
  if (readerCodeGroup)
    readerCodeGroup.style.display = role === "docgia" ? "block" : "none";
}

function loadAccountInfo() {
  const acc = JSON.parse(localStorage.getItem("selectedAccount"));
  if (!acc) return;

  document.getElementById("infoUsername").value = acc.username;
  document.getElementById("infoPassword").value = acc.password || "";
  document.getElementById("infoOwner").value = acc.owner;
  document.getElementById("infoEmail").value = acc.email || "";
  document.getElementById("infoRole").value = acc.role;
  document.getElementById("infoReaderCode").value = acc.readerCode || "";

  handleInfoRoleChange();
}

function updateAccount() {
  const username = document.getElementById("infoUsername").value;
  const password = document.getElementById("infoPassword").value;
  const owner = document.getElementById("infoOwner").value;
  const email = document.getElementById("infoEmail").value;
  const role = document.getElementById("infoRole").value;
  const readerCode = document.getElementById("infoReaderCode").value;

  const list = JSON.parse(localStorage.getItem("accountList") || "[]");
  const index = list.findIndex(acc => acc.username === username);
  if (index !== -1) {
    list[index] = {
      ...list[index],
      password,
      owner,
      email,
      role,
      readerCode: role === "docgia" ? readerCode : ""
    };
    localStorage.setItem("accountList", JSON.stringify(list));
    alert("Cập nhật tài khoản thành công!");
    navigateTo("account.html");
  }
}

function deleteAccountConfirmed() {
  if (confirm("Bạn có chắc muốn xoá tài khoản này?")) {
    const username = document.getElementById("infoUsername").value;
    let list = JSON.parse(localStorage.getItem("accountList") || "[]");
    list = list.filter(acc => acc.username !== username);
    localStorage.setItem("accountList", JSON.stringify(list));
    alert("Đã xoá tài khoản.");
    navigateTo("account.html");
  }
}
// ------------------- QUẢN LÝ TÀI LIỆU ------------------- //
let documents = [];
// Đồng bộ biến `documents` với `localStorage` khi trang được tải
document.addEventListener("DOMContentLoaded", function () {
  const storedDocuments = JSON.parse(localStorage.getItem("documentsList") || "[]");
  documents = storedDocuments;
  renderDocumentTable();
});
function formatCurrency(value) {
  return value.toLocaleString("vi-VN"); // Định dạng theo chuẩn Việt Nam
}
//lưu tài liệu//
function saveNewDocument() {
  const documentCode = document.getElementById("newDocumentCode").value.trim();
  const name = document.getElementById("newDocumentName").value.trim();
  const category = document.getElementById("newCategory").value.trim();
  const author = document.getElementById("newAuthor").value.trim();
  const publisher = document.getElementById("newPublisher").value.trim();
  const year = document.getElementById("newYear").value;
  const quantity = document.getElementById("newQuantity").value;
  const price = document.getElementById("newPrice").value;

  if (!documentCode || !name || !category || !author || !publisher || !year || !quantity || !price) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const newDocument = {
    documentCode,
    name,
    category,
    author,
    publisher,
    year,
    quantity,
    price,
  };

  let documents = JSON.parse(localStorage.getItem("documentsList") || "[]");
  documents.push(newDocument);
  localStorage.setItem("documentsList", JSON.stringify(documents));

  alert("Tài liệu đã được lưu!");

  // Cập nhật biến `documents` và hiển thị lại danh sách
  documents = JSON.parse(localStorage.getItem("documentsList") || "[]");
  renderDocumentTable();
  navigateTo("documents.html");
}

//hiển thị danh sách tài liệu//
function renderDocumentTable() {
  const tableBody = document.getElementById("documentTable");
  const keyword = document.getElementById("searchInput")?.value.toLowerCase() || "";
  tableBody.innerHTML = "";

  documents
    .filter(doc => doc.name.toLowerCase().includes(keyword) || doc.documentCode.toLowerCase().includes(keyword))
    .forEach((doc, index) => {
      const row = `
        <tr>
          <td>${doc.documentCode}</td>
          <td>${doc.name}</td>
          <td>${doc.category}</td>
          <td>${doc.publisher}</td>
          <td>${doc.quantity}</td>
          <td><button class="btn-primary" onclick="editDocument(${index})">Chỉnh sửa</button></td>
          <td><button class="btn-danger" onclick="deleteDocument(${index})">Xoá</button></td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
}
//chỉnh sửa tài liệu//
function editDocument(index) {
  const documents = JSON.parse(localStorage.getItem("documentsList") || "[]");
  const doc = documents[index];
  localStorage.setItem("selectedDocument", JSON.stringify(doc));

  document.getElementById("documentListSection").classList.add("hidden");
  document.getElementById("editDocumentSection").classList.remove("hidden");

  document.getElementById("infoDocumentCode").value = doc.documentCode;
  document.getElementById("infoDocumentName").value = doc.name;
  document.getElementById("infoCategory").value = doc.category;
  document.getElementById("infoAuthor").value = doc.author;
  document.getElementById("infoPublisher").value = doc.publisher;
  document.getElementById("infoYear").value = doc.year;
  document.getElementById("infoQuantity").value = doc.quantity;
  document.getElementById("infoPrice").value = doc.price;
}
//Xóa tài liệu//
function deleteDocument(index) {
  if (confirm("Bạn có chắc muốn xoá tài liệu này?")) {
    let documents = JSON.parse(localStorage.getItem("documentsList") || "[]");
    documents.splice(index, 1);
    localStorage.setItem("documentsList", JSON.stringify(documents));
    renderDocumentTable();
  }
}
//Cập nhật tài liệu//
function updateDocument() {
  const documentCode = document.getElementById("infoDocumentCode").value;
  const name = document.getElementById("infoDocumentName").value.trim();
  const category = document.getElementById("infoCategory").value.trim();
  const author = document.getElementById("infoAuthor").value.trim();
  const publisher = document.getElementById("infoPublisher").value.trim();
  const year = document.getElementById("infoYear").value;
  const quantity = document.getElementById("infoQuantity").value;
  const price = document.getElementById("infoPrice").value;

  if (!name || !category || !author || !publisher || !year || !quantity || !price) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const documents = JSON.parse(localStorage.getItem("documentsList") || "[]");
  const index = documents.findIndex(doc => doc.documentCode === documentCode);

  if (index !== -1) {
    documents[index] = {
      ...documents[index],
      name,
      category,
      author,
      publisher,
      year,
      quantity,
      price,
    };

    localStorage.setItem("documentsList", JSON.stringify(documents));
    alert("Cập nhật tài liệu thành công!");
    navigateTo("documents.html");
  } else {
    alert("Không tìm thấy tài liệu để cập nhật!");
  }
}
//Xóa tài liệu//
function deleteDocumentConfirmed() {
  if (confirm("Bạn có chắc muốn xoá tài liệu này?")) {
    const documentCode = document.getElementById("infoDocumentCode").value;
    let documents = JSON.parse(localStorage.getItem("documentsList") || "[]");

    documents = documents.filter(doc => doc.documentCode !== documentCode);

    localStorage.setItem("documentsList", JSON.stringify(documents));
    alert("Đã xoá tài liệu.");
    navigateTo("documents.html");
  }
}
// ------------------- QUẢN LÝ ĐỘC GIẢ ------------------- //
let readers = [];
// Đồng bộ biến `readers` với `localStorage` khi trang được tải
document.addEventListener("DOMContentLoaded", function () {
  const storedDocuments = JSON.parse(localStorage.getItem("readersList") || "[]");
  readers = storedDocuments;
  renderReaderTable();
});
//Lưu độc giả//
function saveNewReader() {
  const readerCode = document.getElementById("newReaderCode").value.trim();
  const name = document.getElementById("newReaderName").value.trim();
  const email = document.getElementById("newReaderEmail").value.trim();
  const phone = document.getElementById("newReaderPhone").value.trim();
  const address = document.getElementById("newReaderAddress").value.trim();

  if (!readerCode || !name || !email || !phone || !address) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const newReader = {
    readerCode,
    name,
    email,
    phone,
    address,
    registrationDate: new Date().toLocaleDateString("vi-VN"),
  };

  let readers = JSON.parse(localStorage.getItem("readerList") || "[]");
  readers.push(newReader);
  localStorage.setItem("readerList", JSON.stringify(readers));

  alert("Độc giả đã được lưu!");
  navigateTo("readers.html");
}
//hiển thị danh sách độc giả//
function renderReaderTable() {
  const tableBody = document.getElementById("readerTable");
  const keyword = document.getElementById("searchInput")?.value.toLowerCase() || "";
  tableBody.innerHTML = "";

  const readers = JSON.parse(localStorage.getItem("readerList") || "[]");

  readers
    .filter(reader =>
      reader.name.toLowerCase().includes(keyword) || reader.readerCode.toLowerCase().includes(keyword)
    )
    .forEach((reader, index) => {
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${reader.readerCode}</td>
          <td>${reader.name}</td>
          <td>${reader.email}</td>
          <td>${reader.registrationDate}</td>
          <td><button class="btn-primary" onclick="editReader(${index})">Chỉnh sửa</button></td>
          <td><button class="btn-danger" onclick="deleteReader(${index})">Xoá</button></td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
}
//chỉnh sửa độc giả//
function editReader(index) {
  const readers = JSON.parse(localStorage.getItem("readerList") || "[]");
  const reader = readers[index];
  localStorage.setItem("selectedReader", JSON.stringify(reader));

  document.getElementById("readerListSection").classList.add("hidden");
  document.getElementById("editReaderSection").classList.remove("hidden");

  document.getElementById("infoReaderCode").value = reader.readerCode;
  document.getElementById("infoReaderName").value = reader.name;
  document.getElementById("infoReaderEmail").value = reader.email;
  document.getElementById("infoReaderPhone").value = reader.phone;
  document.getElementById("infoReaderAddress").value = reader.address;
}
//Xóa độc giả//
function deleteReader(index) {
  if (confirm("Bạn có chắc muốn xoá độc giả này?")) {
    let readers = JSON.parse(localStorage.getItem("readerList") || "[]");
    readers.splice(index, 1);
    localStorage.setItem("readerList", JSON.stringify(readers));
    renderReaderTable();
  }
}

function deleteReaderConfirmed() {
  if (confirm("Bạn có chắc muốn xoá độc giả này?")) {
    const readerCode = document.getElementById("infoReaderCode").value;
    let readers = JSON.parse(localStorage.getItem("readerList") || "[]");

    readers = readers.filter(reader => reader.readerCode !== readerCode);

    localStorage.setItem("readerList", JSON.stringify(readers));
    alert("Độc giả đã được xoá!");
    navigateTo("readers.html");
  }
}
//Cập nhật độc giả//
function updateReader() {
  const readerCode = document.getElementById("infoReaderCode").value;
  const name = document.getElementById("infoReaderName").value.trim();
  const email = document.getElementById("infoReaderEmail").value.trim();
  const phone = document.getElementById("infoReaderPhone").value.trim();
  const address = document.getElementById("infoReaderAddress").value.trim();

  if (!name || !email || !phone || !address) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const readers = JSON.parse(localStorage.getItem("readerList") || "[]");
  const index = readers.findIndex(reader => reader.readerCode === readerCode);

  if (index !== -1) {
    readers[index] = {
      ...readers[index],
      name,
      email,
      phone,
      address,
    };

    localStorage.setItem("readerList", JSON.stringify(readers));
    alert("Cập nhật thông tin độc giả thành công!");
    navigateTo("readers.html");
  } else {
    alert("Không tìm thấy độc giả để cập nhật!");
  }
}
// ------------------- QUẢN LÝ MƯỢN TRẢ SÁCH ------------------- //
let borrowRecords = [];
// Đồng bộ biến `borrowRecords` với `localStorage` khi trang được tải
document.addEventListener("DOMContentLoaded", function () {
  const storedRecords = JSON.parse(localStorage.getItem("borrowRecords") || "[]");
  borrowRecords = storedRecords;
  renderBorrowTable();
});
//Hiển thị danh sách phiếu mượn//
document.addEventListener("DOMContentLoaded", function () {
  renderBorrowTable();
});
function renderBorrowTable() {
  const borrowTableBody = document.getElementById("borrowTableBody");
  const borrowRecords = JSON.parse(localStorage.getItem("borrowList") || "[]");
  const today = new Date();

  borrowTableBody.innerHTML = ""; // Xóa nội dung cũ

  borrowRecords.forEach((record, index) => {
    // Xác định tình trạng
    let status = "Đang mượn";
    let statusClass = "status-borrowing";

    if (record.returnDatereal) {
      status = "Đã trả";
      statusClass = "status-returned";
    } else {
      const dueDate = new Date(record.returnDate);
      if (dueDate < today) {
        status = "Quá hạn";
        statusClass = "status-overdue";
      }
    }

    const showinfoBorrow = `<button class="btn-primary" onclick="showinfoBorrow(${index})">Xem</button>`;

    const row = `
      <tr>
        <td>${record.borrowId}</td>
        <td>${record.readerCode}</td>
        <td>${record.borrowDate}</td>
        <td>${record.returnDate}</td>
        <td>${record.returnDatereal || ""}</td>
        <td class="${statusClass}">${status}</td>
        <td>
          <button class="btn-secondary" onclick="editBorrow(${index})">Sửa</button>
        </td>
        <td>
          <button class="btn-danger" onclick="deleteBorrow(${index})">Xóa</button>
        </td>
        <td>
          ${showinfoBorrow}
        </td>
      </tr>
    `;
    borrowTableBody.innerHTML += row;
  });
}
//Xóa phiếu mượn//
function deleteBorrow(index) {
  if (confirm("Bạn có chắc chắn muốn xóa phiếu mượn này?")) {
    const borrowRecords = JSON.parse(localStorage.getItem("borrowList") || "[]");
    borrowRecords.splice(index, 1); // Xóa phiếu mượn tại vị trí `index`
    localStorage.setItem("borrowList", JSON.stringify(borrowRecords)); // Cập nhật `localStorage`
    renderBorrowTable(); // Hiển thị lại danh sách
    alert("Phiếu mượn đã được xóa!");
  }
}
//Hiển thị form mượn sách//
function showBorrowForm() {
  // Đặt lại các trường nhập liệu
  document.getElementById("borrowReaderCode").value = "";
  document.getElementById("borrowReaderName").value = "";
  document.getElementById("borrowDocumentCode").value = "";
  document.getElementById("borrowQuantity").value = "";
  document.getElementById("borrowDate").value = "";
  document.getElementById("returnDate").value = "";

  // Xóa danh sách tài liệu trong form
  const borrowItemList = document.getElementById("borrowItemList");
  borrowItemList.innerHTML = "";

  // Đặt lại tổng số lượng và tổng tiền cọc
  document.getElementById("totalQuantity").textContent = "0";
  document.getElementById("totalDeposit").textContent = "0";

  // Xóa danh sách tạm thời của các tài liệu mượn
  borrowItems = [];

  // Hiển thị form tạo phiếu mượn
  document.getElementById("borrowListSection").classList.add("hidden");
  document.getElementById("borrowFormSection").classList.remove("hidden");
}
//Thêm tài liệu vào form mượn sách//
let borrowItems = [];

function addToBorrowList() {
  const readerCode = document.getElementById("borrowReaderCode").value.trim();
  const documentCode = document.getElementById("borrowDocumentCode").value.trim();
  const quantity = parseInt(document.getElementById("borrowQuantity").value, 10);

  if (!readerCode || !documentCode || isNaN(quantity) || quantity <= 0) {
    alert("Vui lòng nhập đầy đủ thông tin hợp lệ!");
    return;
  }

  // Kiểm tra mã độc giả và tài liệu trong hệ thống
  const readers = JSON.parse(localStorage.getItem("readerList") || "[]");
  const documents = JSON.parse(localStorage.getItem("documentsList") || "[]");

  const reader = readers.find(r => r.readerCode === readerCode);
  const selectedDocument = documents.find(d => d.documentCode === documentCode);

  if (!reader) {
    alert("Mã độc giả không tồn tại!");
    return;
  }

  if (!selectedDocument) {
    alert("Mã tài liệu không tồn tại!");
    return;
  }

  // Tính tiền cọc (50% giá trị tài liệu)
  const deposit = (selectedDocument.price * quantity) * 0.5;

  // Thêm tài liệu vào danh sách mượn
  borrowItems.push({
    documentCode: selectedDocument.documentCode,
    name: selectedDocument.name,
    quantity,
    deposit,
  });

  renderBorrowItems();
}
//Lấy tên độc giả//
function fetchReaderDetails(readerCodeId, ownerId, emailId) {
  const readerCode = document.getElementById(readerCodeId).value.trim();
  const readers = JSON.parse(localStorage.getItem("readerList") || "[]");

  // Tìm độc giả theo mã độc giả
  const reader = readers.find(r => r.readerCode === readerCode);

  if (reader) {
    // Điền thông tin tên và email
    document.getElementById(ownerId).value = reader.name;
    document.getElementById(emailId).value = reader.email;
  } else {
    // Xóa thông tin nếu không tìm thấy
    document.getElementById(ownerId).value = "";
    document.getElementById(emailId).value = "";
  }
}
//Hiển thị danh sách tài liệu đã chọn để mượn//
function renderBorrowItems() {
  const borrowItemList = document.getElementById("borrowItemList");
  const totalQuantity = document.getElementById("totalQuantity");
  const totalDeposit = document.getElementById("totalDeposit");

  borrowItemList.innerHTML = "";
  let totalQty = 0;
  let totalDep = 0;

  borrowItems.forEach((item, index) => {
    totalQty += item.quantity;
    totalDep += item.deposit;

    const row = `
      <tr>
        <td>${item.documentCode}</td>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.deposit)}</td> <!-- Định dạng tiền cọc -->
        <td>
          <button class="btn-primary" onclick="editBorrowItem(${index})">Chỉnh sửa</button>
        </td>
        <td>
          <button class="btn-danger" onclick="removeBorrowItem(${index})">Xoá</button>
        </td>
      </tr>
    `;
    borrowItemList.innerHTML += row;
  });

  totalQuantity.textContent = totalQty;
  totalDeposit.textContent = formatCurrency(totalDep); // Hiển thị tổng tiền cọc
}
//Xóa tài liệu khỏi danh sách mượn//
function removeBorrowItem(index) {
  borrowItems.splice(index, 1);
  renderBorrowItems();
}
//Chỉnh sửa tài liệu trong danh sách mượn//
function editBorrowItem(index) {
  const item = borrowItems[index];

  // Điền thông tin tài liệu mượn vào form
  document.getElementById("borrowDocumentCode").value = item.documentCode;
  document.getElementById("borrowQuantity").value = item.quantity;

  // Xóa tài liệu khỏi danh sách tạm thời
  borrowItems.splice(index, 1);
  renderBorrowItems();
}
//Lưu thông tin mượn sách//
function saveBorrow() {
  const readerCode = document.getElementById("borrowReaderCode").value.trim();
  const readerName = document.getElementById("borrowReaderName").value.trim();
  const borrowDate = document.getElementById("borrowDate").value;
  const returnDate = document.getElementById("returnDate").value;

  if (!readerCode || !readerName || !borrowDate || !returnDate || borrowItems.length === 0) {
    alert("Vui lòng điền đầy đủ thông tin và thêm ít nhất một tài liệu!");
    return;
  }

  const borrows = JSON.parse(localStorage.getItem("borrowList") || "[]");

  // Tạo mã phiếu mượn (PM + số tăng dần)
  let borrowId;
  let idCounter = borrows.length + 1;
  do {
    borrowId = `PM${idCounter}`;
    idCounter++;
  } while (borrows.some(borrow => borrow.borrowId === borrowId));
  

  // Lưu phiếu mượn
  borrows.push({
    borrowId,
    readerCode,
    readerName,
    borrowDate,
    returnDate,
    items: borrowItems,
  });

  localStorage.setItem("borrowList", JSON.stringify(borrows));
  alert(`Phiếu mượn ${borrowId} đã được lưu!`);
  cancelBorrow();
  renderBorrowTable();
}
//Hủy mượn sách//
function cancelBorrow() {
  borrowItems = [];
  renderBorrowItems();
  document.getElementById("borrowFormSection").classList.add("hidden");
  document.getElementById("borrowListSection").classList.remove("hidden");
}
//Hiện giao diện trả sách khi nhấn nút//
function showinfoBorrow(index) {
  const borrowRecords = JSON.parse(localStorage.getItem("borrowList") || "[]");
  const record = borrowRecords[index];

  // Điền thông tin phiếu mượn vào form
  document.getElementById("returnBorrowId").value = record.borrowId;
  document.getElementById("returnReaderCode").value = record.readerCode;
  document.getElementById("returnReaderName").value = record.readerName || "Không xác định";
  document.getElementById("returnBorrowDate").value = record.borrowDate;
  document.getElementById("returnDueDate").value = record.returnDate;

  // Xác định trạng thái phiếu mượn
  let status = "Đang mượn";
  if (record.returnDatereal) {
    status = "Đã trả";
  } else {
    const dueDate = new Date(record.returnDate);
    const today = new Date();
    if (dueDate < today) {
      status = "Quá hạn";
    }
  }
  document.getElementById("returnStatus").value = status;

  // Hiển thị hoặc ẩn nút "Xác nhận trả" dựa trên trạng thái
  const confirmButton = document.querySelector(".btn-confirm-return");
  if (status === "Đang mượn" || status === "Quá hạn") {
    confirmButton.style.display = "inline-block"; // Hiển thị nút "Xác nhận trả"
  } else {
    confirmButton.style.display = "none"; // Ẩn nút "Xác nhận trả"
  }

  // Hiển thị danh sách tài liệu
  const returnItemList = document.getElementById("returnItemList");
  returnItemList.innerHTML = "";
  record.items.forEach((item, index) => {
    const row = `
      <tr>
        <td>${item.documentCode}</td>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.deposit)}</td>
        <td><input type="number" value="${item.quantity}" min="0" max="${item.quantity}" /></td>
        <td><input type="text" placeholder="Tình trạng sách" /></td>
        <td><input type="number" value="0" min="0" /></td>
      </tr>
    `;
    returnItemList.innerHTML += row;
  });

  // Hiển thị giao diện trả sách
  document.getElementById("borrowListSection").classList.add("hidden");
  document.getElementById("returnBookSection").classList.remove("hidden");
}
//Thoát xem thông tin phiếu//
function cancelReturn() {
  document.getElementById("returnBookSection").classList.add("hidden"); // Ẩn giao diện trả sách
  document.getElementById("borrowListSection").classList.remove("hidden"); // Hiển thị danh sách phiếu mượn
}
//Lưu thông tin trả sách//
function confirmReturnSubmit() {
  const borrowId = document.getElementById("returnBorrowId").value;
  const borrowRecords = JSON.parse(localStorage.getItem("borrowList") || "[]");
  const documents = JSON.parse(localStorage.getItem("documentsList") || "[]");

  // Tìm phiếu mượn theo mã
  const borrowIndex = borrowRecords.findIndex(record => record.borrowId === borrowId);
  if (borrowIndex === -1) {
    alert("Không tìm thấy phiếu mượn!");
    return;
  }

  const borrowRecord = borrowRecords[borrowIndex];

  // Cập nhật trạng thái phiếu mượn
  borrowRecord.returnDatereal = new Date().toISOString().split("T")[0]; // Ngày trả thực tế
  borrowRecord.status = "Đã trả";

  // Cập nhật số lượng tài liệu trong kho
  const returnItems = document.querySelectorAll("#returnItemList tr");
  returnItems.forEach((row, index) => {
    const documentCode = row.querySelector("td:nth-child(1)").textContent.trim();
    const returnQuantity = parseInt(row.querySelector("td:nth-child(5) input").value, 10);

    // Tìm tài liệu trong danh sách tài liệu
    const document = documents.find(doc => doc.documentCode === documentCode);
    if (document) {
      document.quantity += returnQuantity; // Cộng số lượng trả vào kho
    }
  });

  // Lưu lại dữ liệu vào localStorage
  localStorage.setItem("borrowList", JSON.stringify(borrowRecords));
  localStorage.setItem("documentsList", JSON.stringify(documents));

  alert("Phiếu mượn đã được cập nhật thành 'Đã trả' và số lượng tài liệu đã được cập nhật!");

  // Quay lại danh sách phiếu mượn
  cancelReturn();
  renderBorrowTable();
}
//-----------------BÁO CÁO THỐNG KÊ-----------------//
// Báo cáo độc giả
// Hiển thị báo cáo độc giả
function showReaderReport() {
  document.getElementById("readerReportDashboard").classList.remove("hidden");

  const readers = JSON.parse(localStorage.getItem("readerList") || "[]");
  const accounts = JSON.parse(localStorage.getItem("accountList") || "[]");

  // Lọc tài khoản có vai trò là "docgia"
  const readerAccounts = accounts.filter(acc => acc.role === "docgia");

  // Cập nhật Scorecards
  document.getElementById("totalReadersCard").textContent = `Tổng số độc giả: ${readers.length}`;
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const newReadersThisMonth = readers.filter(r => {
    const parts = r.registrationDate.split("/");
    return parseInt(parts[1]) === currentMonth && parseInt(parts[2]) === currentYear;
  }).length;
  document.getElementById("newReadersCard").textContent = `Độc giả mới tháng này: ${newReadersThisMonth}`;

  // Tính tổng số lượt truy cập của độc giả
  const totalAccesses = readerAccounts.reduce((sum, acc) => sum + (acc.loginCount || 0), 0);
  document.getElementById("totalAccessesCard").textContent = `Tổng lượt truy cập: ${totalAccesses}`;

  // Vẽ biểu đồ
  drawReadersOverTimeChart(readers);
  drawAccessesOverTimeChart(readerAccounts);
  drawTopReadersChart(readerAccounts);
}

function drawReadersOverTimeChart(readers) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const counts = months.map(month =>
    readers.filter(r => {
      const parts = r.registrationDate.split("/");
      return parseInt(parts[1]) === month;
    }).length
  );

  new Chart(document.getElementById("readersOverTimeChart"), {
    type: 'line',
    data: {
      labels: months.map(m => `Tháng ${m}`),
      datasets: [{
        label: 'Số độc giả đăng ký',
        data: counts,
        borderColor: '#007bff',
        fill: false,
      }]
    }
  });
}

function drawAccessesOverTimeChart(accounts) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const counts = months.map(month =>
    accounts.reduce((sum, acc) => {
      const loginDates = acc.loginDates || []; // Danh sách ngày đăng nhập
      return sum + loginDates.filter(date => {
        const parts = date.split("/");
        return parseInt(parts[1]) === month;
      }).length;
    }, 0)
  );

  new Chart(document.getElementById("accessesOverTimeChart"), {
    type: 'line',
    data: {
      labels: months.map(m => `Tháng ${m}`),
      datasets: [{
        label: 'Lượt truy cập',
        data: counts,
        borderColor: '#28a745',
        fill: false,
      }]
    }
  });
}

function drawTopReadersChart(accounts) {
  // Lọc tài khoản có vai trò là "docgia"
  const readerAccounts = accounts.filter(acc => acc.role === "docgia");

  // Tạo danh sách số lần đăng nhập của từng độc giả
  const readerLoginCounts = readerAccounts.map(acc => ({
    readerCode: acc.readerCode,
    name: acc.owner || "Không xác định",
    loginCount: acc.loginCount || 0
  }));

  // Sắp xếp danh sách theo số lần đăng nhập giảm dần và lấy top 10
  const topReaders = readerLoginCounts
    .sort((a, b) => b.loginCount - a.loginCount)
    .slice(0, 10);

  // Chuẩn bị dữ liệu cho biểu đồ
  const labels = topReaders.map(reader => reader.name); // Tên độc giả
  const data = topReaders.map(reader => reader.loginCount); // Số lần đăng nhập

  // Vẽ biểu đồ Bar Chart
  const ctx = document.getElementById("topReadersChart");
  if (ctx) {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Số lượt truy cập',
          data: data,
          backgroundColor: '#ffc107',
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Độc giả'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Số lượt truy cập'
            }
          }
        }
      }
    });
  } else {
    console.error("Không tìm thấy phần tử canvas với id 'topReadersChart'");
  }
}
// Báo cáo tài liệu

// Báo cáo mượn trả

//---------------- PUBLIC ------------------- //
function searchDocument() {
  const keyword = document.getElementById("searchInput").value.trim().toLowerCase();

  if (!keyword) {
    alert("Vui lòng nhập từ khóa tìm kiếm!");
    return;
  }

  const documents = JSON.parse(localStorage.getItem("documentsList") || "[]");
  const document = documents.find(doc => doc.name.toLowerCase().includes(keyword));

  if (!document) {
    alert("Không tìm thấy tài liệu phù hợp!");
    return;
  }

  // Hiển thị thông tin tài liệu
  document.getElementById("documentDetails").classList.remove("hidden");
  document.getElementById("documentDescription").classList.remove("hidden");

  document.getElementById("documentName").value = document.name;
  document.getElementById("documentPublisher").value = document.publisher;
  document.getElementById("documentYear").value = document.year;
  document.getElementById("documentCategory").value = document.category;
  document.getElementById("documentAuthor").value = document.author;
  document.getElementById("documentPrice").value = document.price;
  document.getElementById("documentDescriptionText").textContent = document.description || "Không có mô tả.";
}
function toggleMenu() {
  const dropdownContent = document.querySelector(".dropdown-content");
  if (dropdownContent.style.display === "block") {
    dropdownContent.style.display = "none";
  } else {
    dropdownContent.style.display = "block";
  }
}

function logout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    window.location.href = "login.html";
  }
}
document.addEventListener("DOMContentLoaded", function () {
  // Gọi API để lấy danh sách độc giả
  fetch('http://localhost:3000/api/readers')
    .then(response => response.json())
    .then(data => {
      console.log('Danh sách độc giả:', data);
      // Bạn có thể xử lý dữ liệu ở đây, ví dụ: hiển thị danh sách độc giả lên bảng
    })
    .catch(error => {
      console.error('Lỗi khi gọi API:', error);
    });
});