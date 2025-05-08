document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => {
      if (!res.ok) throw new Error("Tài khoản không đúng");
      return res.json();
    })
    .then(user => {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      if (user.account_role === "Thủ thư") {
        navigateTo("home.html");
      } else if (user.account_role === "Độc giả") {
        navigateTo("public.html");
      } else {
        alert("Vai trò không hợp lệ");
      }
    })
    .catch(err => {
      console.error("Lỗi đăng nhập:", err);
      alert("Tên đăng nhập hoặc mật khẩu không đúng!");
      console.error(err);
    });
});
}});
document.addEventListener("DOMContentLoaded", function () {
  const usernameDisplay = document.getElementById("usernameDisplay");
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (loggedInUser && usernameDisplay) {
    usernameDisplay.textContent = loggedInUser.account_owner || "Không rõ tên";
  } else {
    usernameDisplay.textContent = "Khách";
  }
});

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
// Chuyển trang
function navigateTo(page) {
  window.location.href = page;
}
// Đăng xuất
function logout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  }
}

// ------------------- QUẢN LÝ TÀI KHOẢN ------------------- //
document.addEventListener("DOMContentLoaded", () => {
  renderAccountTable();
});

function renderAccountTable() {
  fetch("http://localhost:3000/api/accounts")
    .then(res => res.json())
    .then(accounts => {
      const table = document.getElementById("accountTable");
      if (!table) return;
      table.innerHTML = "";
      accounts.forEach((acc, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${acc.account_name}</td>
            <td>${acc.account_owner}</td>
            <td>${acc.account_dateadd ? acc.account_dateadd.slice(0, 10) : ""}</td>
            <td><button onclick="editAccount('${acc.account_name}')">Sửa</button></td>
            <td><button onclick="deleteAccount('${acc.account_name}')">Xoá</button></td>
          </tr>
        `;
        table.innerHTML += row;
      });
    })
    .catch(err => console.error("Lỗi khi tải danh sách tài khoản:", err));
}

function saveNewAccount() {
  const role = document.getElementById("newRole").value;
  const data = {
    account_name: document.getElementById("newUsername").value,
    account_owner: document.getElementById("newOwner").value,
    account_email: document.getElementById("newEmail").value,
    account_password: document.getElementById("newPassword").value,
    account_role: role,
  };

  // Nếu không phải thủ thư thì thêm reader_id
  if (role !== "thủ thư") {
    data.reader_id = document.getElementById("newReaderCode").value;
  }

  fetch("http://localhost:3000/api/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      renderAccountTable();
    })
    .catch(err => console.error("Lỗi thêm tài khoản:", err));

  navigateTo("account.html");
}

function editAccount(username) {
  fetch(`http://localhost:3000/api/accounts/${username}`)
    .then(res => res.json())
    .then(acc => {
      // Gán giá trị vào form sửa
      document.getElementById("infoUsername").value = acc.account_name;
      document.getElementById("infoPassword").value = acc.account_password;
      document.getElementById("infoOwner").value = acc.account_owner;
      document.getElementById("infoEmail").value = acc.account_email;
      document.getElementById("infoRole").value = acc.account_role;
      document.getElementById("infoReaderCode").value = acc.reader_id;
      sessionStorage.setItem("editingUsername", username);
      // Hiển thị đúng phần giao diện
      document.getElementById("accountListSection").classList.add("hidden");
      document.getElementById("addAccountSection").classList.add("hidden");
      document.getElementById("editAccountSection").classList.remove("hidden");

      // Xử lý ẩn/hiện mã độc giả theo vai trò
      handleInfoRoleChange();
    })
    .catch(err => console.error("Lỗi lấy thông tin tài khoản:", err));
}
function updateAccount() {
  const oldUsername = sessionStorage.getItem("editingUsername");
  const newUsername = document.getElementById("infoUsername").value;

  const data = {
    username: newUsername,
    owner: document.getElementById("infoOwner").value,
    email: document.getElementById("infoEmail").value,
    password: document.getElementById("infoPassword").value,
    role: document.getElementById("infoRole").value,
    readerCode: document.getElementById("infoReaderCode").value,
  };

  fetch(`http://localhost:3000/api/accounts/${oldUsername}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      renderAccountTable();
    })
    .catch(err => console.error("Lỗi cập nhật tài khoản:", err));
    navigateTo("account.html");
}


function deleteAccount(username) {
  if (!confirm("Bạn có chắc muốn xoá tài khoản này không?")) return;
  fetch(`http://localhost:3000/api/accounts/${username}`, { method: "DELETE" })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      renderAccountTable();
    })
    .catch(err => console.error("Lỗi xoá tài khoản:", err));
}
function handleNewRoleChange() {
  const role = document.getElementById("newRole").value;
  const readerCodeGroup = document.getElementById("readerCodeGroup");
  const newOwner = document.getElementById("newOwner");
  const newEmail = document.getElementById("newEmail");

  if (role === "Độc giả") {
    readerCodeGroup.style.display = "block";
    newOwner.readOnly = true;
    newEmail.readOnly = true;
    newOwner.value = "";
    newEmail.value = "";
  } else {
    readerCodeGroup.style.display = "none";
    newOwner.readOnly = false;
    newEmail.readOnly = false;
    document.getElementById("newReaderCode").value = "";
  }
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


function deleteAccountConfirmed() {
  const username = document.getElementById("infoUsername").value;

  if (!username) {
    alert("Không tìm thấy tên tài khoản để xoá.");
    return;
  }

  if (!confirm("Bạn có chắc muốn xoá tài khoản này không?")) return;

  fetch(`http://localhost:3000/api/accounts/${username}`, { method: "DELETE" })
    .then(res => {
      if (!res.ok) throw new Error("Không xoá được tài khoản");
      return res.text();
    })
    .then(msg => {
      alert(msg);
      // Chuyển về trang danh sách tài khoản sau khi xoá thành công
      window.location.href = "account.html";
    })
    .catch(err => {
      console.error("Lỗi xoá tài khoản:", err);
      alert("Xoá tài khoản không thành công.");
    });
}

// ------------------- QUẢN LÝ TÀI LIỆU ------------------- //
document.addEventListener("DOMContentLoaded", () => {
  renderDocumentTable();
});

//hiển thị danh sách tài liệu//

function renderDocumentTable() {
  fetch("http://localhost:3000/api/documents")
    .then(res => res.json())
    .then(documents => {
      const table = document.getElementById("documentTable");
      if (!table) return;
      table.innerHTML = "";
      documents.forEach((doc, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${doc.document_id}</td>
            <td>${doc.document_name}</td>
            <td>${doc.document_category}</td>
            <td>${doc.document_publish}</td>
            <td>${doc.document_quantity}</td>
            <td><button onclick="editDocument('${doc.document_id}')">Sửa</button></td>
            <td><button onclick="deleteDocument('${doc.document_id}')">Xoá</button></td>
          </tr>
        `;
        table.innerHTML += row;
      });
    })
    .catch(err => console.error("Lỗi khi tải danh sách tài liệu:", err));
}
//Lưu tài liệu//
function saveNewDocument() {
  const data = {
    document_id : document.getElementById("newDocumentCode").value.trim(),
    document_name : document.getElementById("newDocumentName").value.trim(),
    document_category : document.getElementById("newCategory").value.trim(),
    document_author : document.getElementById("newAuthor").value.trim(),
    document_publish : document.getElementById("newPublisher").value.trim(),
    document_date : document.getElementById("newYear").value,
    document_quantity : document.getElementById("newQuantity").value,
    document_value : document.getElementById("newPrice").value,
    document_describe : document.getElementById("newDescribe").value,
  };

  fetch("http://localhost:3000/api/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      renderDocumentTable();
    })
    .catch(err => console.error("Lỗi thêm tài liệu:", err));
    navigateTo("documents.html");
}
//chỉnh sửa tài liệu//
function editDocument(document_id) {
  fetch(`http://localhost:3000/api/documents/${document_id}`)
    .then(res => res.json())
    .then(doc => {
      // Gán giá trị vào form sửa
      document.getElementById("infoDocumentCode").value = doc.document_id;
      document.getElementById("infoDocumentName").value = doc.document_name;
      document.getElementById("infoCategory").value = doc.document_category;
      document.getElementById("infoAuthor").value = doc.document_author;
      document.getElementById("infoPublisher").value = doc.document_publish;
      document.getElementById("infoYear").value = doc.document_date ? doc.document_date.substring(0, 10) : "";
      document.getElementById("infoQuantity").value = doc.document_quantity;
      document.getElementById("infoPrice").value = doc.document_value;
      document.getElementById("infoDescribe").value = doc.document_describe;

      // Hiển thị đúng phần giao diện
      document.getElementById("documentListSection").classList.add("hidden");
      document.getElementById("addDocumentSection").classList.add("hidden");
      document.getElementById("editDocumentSection").classList.remove("hidden");

    })
    .catch(err => console.error("Lỗi lấy thông tin tài liệu:", err));
}
function updateDocument() {
  const document_id = document.getElementById("infoDocumentCode").value;
  const data = {
    document_id : document.getElementById("infoDocumentCode").value,
    document_name : document.getElementById("infoDocumentName").value.trim(),
    document_category : document.getElementById("infoCategory").value.trim(),
    document_author : document.getElementById("infoAuthor").value.trim(),
    document_publish : document.getElementById("infoPublisher").value.trim(),
    document_date : document.getElementById("infoYear").value,
    document_quantity : document.getElementById("infoQuantity").value,
    document_value : document.getElementById("infoPrice").value,
    document_describe : document.getElementById("infoDescribe").value,
  };

  fetch(`http://localhost:3000/api/documents/${document_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      renderDocumentTable();
    })
    .catch(err => console.error("Lỗi cập nhật tài liệu:", err));
    navigateTo("documents.html");
}

//Xóa tài liệu//
function deleteDocument(document_id) {
  if (!confirm("Bạn có chắc muốn xoá tài liệu này không?")) return;
  fetch(`http://localhost:3000/api/documents/${document_id}`, { method: "DELETE" })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      renderDocumentTable();
    })
    .catch(err => console.error("Lỗi xoá tài liệu:", err));
}
//Xác nhận xóa tài liệu//
function deleteDocumentConfirmed() {
  const document_id = document.getElementById("infoDocumentCode").value;

  if (!document_id) {
    alert("Không tìm thấy tài liệu để xoá.");
    return;
  }

  if (!confirm("Bạn có chắc muốn xoá tài liệu này không?")) return;

  fetch(`http://localhost:3000/api/accounts/${document_id}`, { method: "DELETE" })
    .then(res => {
      if (!res.ok) throw new Error("Không xoá được tài liệu");
      return res.text();
    })
    .then(msg => {
      alert(msg);
      // Chuyển về trang danh sách tài liệu sau khi xoá thành công
      navigateTo("documents.html");
    })
    .catch(err => {
      console.error("Lỗi xoá tài liệu:", err);
      alert("Xoá tài liệu không thành công.");
    });
}
// ------------------- QUẢN LÝ ĐỘC GIẢ ------------------- //
document.addEventListener("DOMContentLoaded", () => {
  renderReaderTable();
});
//hiển thị danh sách độc giả//
function renderReaderTable(readers = null) {
  const table = document.getElementById("readerTable");
  if (!table) return;

  // Nếu không có dữ liệu truyền vào, fetch toàn bộ
  if (!readers) {
    fetch("http://localhost:3000/api/readers")
      .then(res => res.json())
      .then(data => renderReaderTable(data));
    return;
  }

  table.innerHTML = "";
  readers.forEach((rea, index) => {
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${rea.reader_id}</td>
        <td>${rea.reader_name}</td>
        <td>${rea.reader_email}</td>
        <td>${rea.reader_dateadd ? rea.reader_dateadd.slice(0, 10) : ""}</td>
        <td><button onclick="editReader('${rea.reader_id}')">Sửa</button></td>
        <td><button onclick="deleteReader('${rea.reader_id}')">Xoá</button></td>
      </tr>
    `;
    table.innerHTML += row;
  });
}
//Lưu độc giả//
function saveNewReader() {
  const email = document.getElementById("newReaderEmail").value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    alert("Email không hợp lệ. Vui lòng nhập lại.");
    return;
  }
  const data = {
    reader_id : document.getElementById("newReaderCode").value.trim(),
    reader_name : document.getElementById("newReaderName").value.trim(),
    reader_gender : document.getElementById("newReaderGender").value.trim(),
    reader_birth : document.getElementById("newReaderBirth").value.trim(),
    reader_cccd : document.getElementById("newReaderIDCard").value.trim(),
    reader_phone : document.getElementById("newReaderPhone").value.trim(),
    reader_email : document.getElementById("newReaderEmail").value.trim(),
    reader_address : document.getElementById("newReaderAddress").value.trim(),
  };

  fetch("http://localhost:3000/api/readers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      renderReaderTable();
    })
    .catch(err => console.error("Lỗi thêm độc giả:", err));
    navigateTo("readers.html");
}
//chỉnh sửa độc giả//
function editReader(reader_id) {
  fetch(`http://localhost:3000/api/readers/${reader_id}`)
    .then(res => res.json())
    .then(rea => {
      // Gán giá trị vào form sửa
      document.getElementById("infoReaderCode").value = rea.reader_id;
      document.getElementById("infoReaderName").value = rea.reader_name;
      document.getElementById("infoReaderGender").value = rea.reader_gender;
      document.getElementById("infoReaderBirth").value = rea.reader_birth ? rea.reader_birth.substring(0, 10) : "";
      document.getElementById("infoReaderIDCard").value = rea.reader_cccd;
      document.getElementById("infoReaderPhone").value = rea.reader_phone;
      document.getElementById("infoReaderAddress").value = rea.reader_address;
      document.getElementById("infoReaderEmail").value = rea.reader_email;

      // Hiển thị đúng phần giao diện
      document.getElementById("readerListSection").classList.add("hidden");
      document.getElementById("addReaderSection").classList.add("hidden");
      document.getElementById("editReaderSection").classList.remove("hidden");

    })
    .catch(err => console.error("Lỗi lấy thông tin độc giả:", err));
}
function updateReader() {
  const reader_id = document.getElementById("infoReaderCode").value;
  const data = {
    reader_id : document.getElementById("infoReaderCode").value,
    reader_name : document.getElementById("infoReaderName").value.trim(),
    reader_gender : document.getElementById("infoReaderGender").value.trim(),
    reader_birth : document.getElementById("infoReaderBirth").value.trim(),
    reader_cccd : document.getElementById("infoReaderIDCard").value.trim(),
    reader_phone : document.getElementById("infoReaderPhone").value,
    reader_address : document.getElementById("infoReaderAddress").value,
    reader_email : document.getElementById("infoReaderEmail").value,
  };

  fetch(`http://localhost:3000/api/readers/${reader_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      renderReaderTable();
    })
    .catch(err => console.error("Lỗi cập nhật độc giả:", err));
    navigateTo("readers.html");
}
//Xóa độc giả//
function deleteReader(reader_id) {
  if (!confirm("Bạn có chắc muốn xoá độc giả này không?")) return;
  fetch(`http://localhost:3000/api/readers/${reader_id}`, { method: "DELETE" })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      renderReaderTable();
    })
    .catch(err => console.error("Lỗi xoá độc giả:", err));
}
//Xác nhận xóa độc giả//
function deleteReaderConfirmed() {
  const reader_id = document.getElementById("infoReaderCode").value;

  if (!reader_id) {
    alert("Không tìm thấy độc giả để xoá.");
    return;
  }

  if (!confirm("Bạn có chắc muốn xoá độc giả này không?")) return;

  fetch(`http://localhost:3000/api/readers/${reader_id}`, { method: "DELETE" })
    .then(res => {
      if (!res.ok) throw new Error("Không xoá được độc giả");
      return res.text();
    })
    .then(msg => {
      alert(msg);
      // Chuyển về trang danh sách độc giả sau khi xoá thành công
      navigateTo("readers.html");
    })
    .catch(err => {
      console.error("Lỗi xoá độc giả:", err);
      alert("Xoá độc giả không thành công.");
    });
}

// ------------------- QUẢN LÝ MƯỢN TRẢ SÁCH ------------------- //
document.addEventListener("DOMContentLoaded", () => {
  renderBorrowTable()
})
function renderBorrowTable() {
  fetch("http://localhost:3000/api/borrows")
    .then((res) => res.json())
    .then((loans) => {
      const table = document.getElementById("borrowTable")
      if (!table) return
      table.innerHTML = ""
      loans.forEach((loan) => {
        // Xác định tình trạng và lớp CSS tương ứng
        let statusClass = "status-borrowing"
        const status = loan.loan_status

        if (status === "Đã trả") {
          statusClass = "status-returned"
        } else if (status === "Quá hạn") {
          statusClass = "status-overdue"
        }

        const row = `
          <tr>
            <td>${loan.loan_id}</td>
            <td>${loan.reader_id}</td>
            <td>${loan.borrow_date ? loan.borrow_date.slice(0, 10) : ""}</td>
            <td>${loan.due_date ? loan.due_date.slice(0, 10) : ""}</td>
            <td>${loan.return_date ? loan.return_date.slice(0, 10) : ""}</td>
            <td class="${statusClass}">${status}</td>
            <td>
              <button class="btn-danger" onclick="deleteBorrow('${loan.loan_id}')">Xóa</button>
            </td>
            <td>
              <button class="btn-primary" onclick="showBorrowDetails('${loan.loan_id}')">Xem</button>
            </td>
          </tr>
        `
        table.innerHTML += row
      })
    })
    .catch((err) => {
      console.error("Lỗi khi tải danh sách phiếu mượn:", err)
      alert("Không thể tải danh sách phiếu mượn. Vui lòng thử lại sau.")
    })
}
let borrowItems = [] 
//Hiện form thêm phiếu mượn
function showBorrowForm() {
  // Reset form fields
  document.getElementById("borrowReaderCode").value = ""
  document.getElementById("borrowReaderName").value = ""
  document.getElementById("borrowDocumentCode").value = ""
  document.getElementById("borrowQuantity").value = ""
  document.getElementById("borrowDate").value = new Date().toISOString().split("T")[0]

  // Set default return date (14 days from now)
  const returnDate = new Date()
  returnDate.setDate(returnDate.getDate() + 14)
  document.getElementById("returnDate").value = returnDate.toISOString().split("T")[0]

  // Clear borrowed items list
  borrowItems = []
  document.getElementById("borrowItemList").innerHTML = ""
  document.getElementById("totalQuantity").textContent = "0"
  document.getElementById("totalDeposit").textContent = "0"

  // Show borrow form
  document.getElementById("borrowListSection").classList.add("hidden")
  document.getElementById("borrowFormSection").classList.remove("hidden")
}

//Tạo phiếu mượn
function addToBorrowList() {
  const reader_id = document.getElementById("borrowReaderCode").value.trim()
  const document_id = document.getElementById("borrowDocumentCode").value.trim()
  const borrow_quantity = Number.parseInt(document.getElementById("borrowQuantity").value)

  if (!reader_id || !document_id || isNaN(borrow_quantity) || borrow_quantity <= 0) {
    alert("Please fill in all fields with valid values!")
    return
  }

  // Verify reader exists
  fetch(`http://localhost:3000/api/readers/${reader_id}`)
    .then((res) => {
      if (!res.ok) throw new Error("Reader not found")
      return res.json()
    })
    .then((reader) => {
      // Reader exists, now check document
      return fetch(`http://localhost:3000/api/documents/${document_id}`)
    })
    .then((res) => {
      if (!res.ok) throw new Error("Document not found")
      return res.json()
    })
    .then((document) => {
      // Check if document has enough quantity
      if (document.document_quantity < borrow_quantity) {
        alert(`Only ${document.document_quantity} copies available for this document!`)
        return
      }

      // Calculate deposit (50% of document value)
      const deposit_money = document.document_value * borrow_quantity * 0.5

      // Add to borrowed items list
      borrowItems.push({
        document_id: document.document_id,
        name: document.document_name,
        borrow_quantity: borrow_quantity,
        deposit_money: deposit_money,
      })

      renderBorrowItems()
    })
    .catch((err) => {
      console.error("Error adding item to borrow list:", err)
      if (err.message === "Reader not found") {
        alert("Reader not found!")
      } else if (err.message === "Document not found") {
        alert("Document not found!")
      } else {
        alert("Failed to add item to borrow list. Please try again.")
      }
    })
}
function renderBorrowItems() {
  const borrowItemList = document.getElementById("borrowItemList")
  const totalQuantity = document.getElementById("totalQuantity")
  const totalDeposit = document.getElementById("totalDeposit")

  borrowItemList.innerHTML = ""
  let totalQty = 0
  let totalDep = 0

  borrowItems.forEach((item, index) => {
    totalQty += item.borrow_quantity
    totalDep += item.deposit_money

    const row = `
      <tr>
        <td>${item.document_id}</td>
        <td>${item.name}</td>
        <td>${item.borrow_quantity}</td>
        <td>${formatCurrency(item.deposit_money)}</td>
        <td><button class="btn-primary" onclick="editBorrowItem(${index})">Edit</button></td>
        <td><button class="btn-danger" onclick="removeBorrowItem(${index})">Delete</button></td>
      </tr>
    `
    borrowItemList.innerHTML += row
  })

  totalQuantity.textContent = totalQty
  totalDeposit.textContent = formatCurrency(totalDep)
}

function formatCurrency(value) {
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
}

function formatDate(date) {
  if (!date) {
    return ""; // Nếu date là null, undefined hoặc giá trị falsy, trả về chuỗi trống
  }

  const d = new Date(date);
  
  // Lấy năm, tháng và ngày
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0, nên cộng thêm 1
  const day = String(d.getDate()).padStart(2, '0'); // Đảm bảo ngày có 2 chữ số

  // Trả về chuỗi theo định dạng YYYY-MM-DD
  return `${year}-${month}-${day}`;
}
function removeBorrowItem(index) {
  borrowItems.splice(index, 1)
  renderBorrowItems()
}

function editBorrowItem(index) {
  const item = borrowItems[index]

  // Fill form with item data
  document.getElementById("borrowDocumentCode").value = item.documentCode
  document.getElementById("borrowQuantity").value = item.quantity

  // Remove item from list
  removeBorrowItem(index)
}

function saveBorrow() {
  const readerCode = document.getElementById("borrowReaderCode").value.trim()
  const borrowDate = document.getElementById("borrowDate").value
  const returnDate = document.getElementById("returnDate").value
  const notes = document.getElementById("borrowNote") ? document.getElementById("borrowNote").value : ""

  if (!readerCode || !borrowDate || !returnDate || borrowItems.length === 0) {
    alert("Please fill in all required fields and add at least one document!")
    return
  }

  const borrowData = {
    reader_id: readerCode,
    borrow_date: borrowDate,
    due_date: returnDate,
    notes: notes,
    items: borrowItems,
  }

  fetch("http://localhost:3000/api/borrows", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(borrowData),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to create borrow record")
      return res.text()
    })
    .then((msg) => {
      alert(msg || "Borrow record created successfully!")
      navigateTo("borrows.html")
    })
    .catch((err) => {
      console.error("Error creating borrow record:", err)
      alert("Failed to create borrow record. Please try again.")
    })
}
// Find the fetchReaderDetails function and replace it with this improved version
function fetchReaderDetails(codeId, nameId, emailId) {
  const readerCode = document.getElementById(codeId).value.trim()
  if (!readerCode) {
    // Clear fields if reader code is empty
    document.getElementById(nameId).value = ""
    if (emailId && document.getElementById(emailId)) {
      document.getElementById(emailId).value = ""
    }
    return
  }

  fetch(`http://localhost:3000/api/readers/${readerCode}`)
    .then((res) => {
      if (!res.ok) throw new Error("Reader not found")
      return res.json()
    })
    .then((reader) => {
      // Fill in the reader name automatically
      document.getElementById(nameId).value = reader.reader_name || ""
      // Fill in email if the email field exists and is requested
      if (emailId && document.getElementById(emailId)) {
        document.getElementById(emailId).value = reader.reader_email || ""
      }
    })
    .catch((err) => {
      document.getElementById(nameId).value = ""
      if (emailId && document.getElementById(emailId)) {
        document.getElementById(emailId).value = ""
      }
      if (err.message === "Reader not found") {
        alert("Reader ID not found in the system!")
      }
    })
}
function cancelBorrow() {
  borrowItems = []
  document.getElementById("borrowItemList").innerHTML = ""
  document.getElementById("borrowFormSection").classList.add("hidden")
  document.getElementById("borrowListSection").classList.remove("hidden")
}
function showBorrowDetails(loanId) {
  fetch(`http://localhost:3000/api/borrows/${loanId}`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load borrow details")
      return res.json()
    })
    .then((borrow) => {
      // Fill borrow details
      document.getElementById("returnBorrowId").value = borrow.loan_id
      document.getElementById("returnReaderCode").value = borrow.reader_id

      // Fetch reader name
      return fetch(`http://localhost:3000/api/readers/${borrow.reader_id}`)
        .then((res) => res.json())
        .then((reader) => {
          document.getElementById("returnReaderName").value = reader.reader_name || "Unknown"

          // Continue with borrow details
          document.getElementById("returnBorrowDate").value = borrow.borrow_date
            ? formatDate(borrow.borrow_date)
            : "";

          document.getElementById("returnDueDate").value = borrow.due_date
            ? formatDate(borrow.due_date)
            : "";

          document.getElementById("returnDate").value = (borrow.return_date !== null && borrow.return_date !== undefined)
            ? formatDate(borrow.return_date)
            : "";
          // Show/hide confirm return button based on status
          const confirmButton = document.querySelector(".btn-confirm-return")
          if (borrow.loan_status === "Đã trả") {
            confirmButton.style.display = "none"
          } else {
            confirmButton.style.display = "inline-block"
          }

          // Render borrowed items
          return fetch(`http://localhost:3000/api/borrows/${loanId}/items`)
        })
    })
    .then((res) => res.json())
    .then((items) => {
      const returnItemList = document.getElementById("returnItemList")
      returnItemList.innerHTML = ""

      items.forEach((item) => {
        const row = `
          <tr>
            <td>${item.document_id}</td>
            <td>${item.document_name}</td>
            <td>${item.borrow_quantity}</td>
            <td>${formatCurrency(item.deposit_money)}</td>
            <td><input type="number" value="${item.return_quantity ?? 0}" min="0" max="${item.borrow_quantity}" /></td>      
            <td><input type="text" placeholder="Book condition" value="${item.return_quality || ""}" /></td>
            <td><input type="number" value="${item.violation_money ?? 0}" min="0" /></td>
          </tr>
        `
        returnItemList.innerHTML += row
      })

      // Show return section
      document.getElementById("borrowListSection").classList.add("hidden")
      document.getElementById("returnBookSection").classList.remove("hidden")
    })
    .catch((err) => {
      console.error("Error loading borrow details:", err)
      alert("Failed to load borrow details. Please try again.")
    })
}
function cancelReturn() {
  document.getElementById("returnBookSection").classList.add("hidden")
  document.getElementById("borrowListSection").classList.remove("hidden")
}
function deleteBorrow(loan_id) {
  if (!confirm("Bạn có chắc chắn muốn xóa phiếu mượn này không?")) return

  fetch(`http://localhost:3000/api/borrows/${loan_id}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Không xóa được bản ghi mượn")
      return res.text()
    })
    .then((msg) => {
      alert(msg || "Xóa phiếu mượn thành công!")
      renderBorrowTable()
    })
    .catch((err) => {
      console.error("Lỗi xóa phiếu mượn:", err)
      alert("Không xóa được phiếu mượn. Vui lòng thử lại.")
    })
}
function confirmReturnSubmit() {
  const loan_id = document.getElementById("returnBorrowId").value

  const returnData = {
    loan_id: loan_id,
    return_date: new Date().toISOString().split("T")[0],
    items: [],
  }

  // Collect item data
  const rows = document.querySelectorAll("#returnItemList tr")
  rows.forEach((row) => {
    const document_id = row.querySelector("td:nth-child(1)").textContent
    const return_quantity = Number.parseInt(row.querySelector("td:nth-child(5) input").value)
    const return_quality = row.querySelector("td:nth-child(6) input").value
    const violation_money = Number.parseFloat(row.querySelector("td:nth-child(7) input").value)

    returnData.items.push({
      document_id: document_id,
      return_quantity: return_quantity,
      return_quality: return_quality,
      violation_money: violation_money,
    })
  })

  fetch(`http://localhost:3000/api/borrows/${loan_id}/return`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(returnData),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to process return")
      return res.text()
    })
    .then((msg) => {
      alert(msg || "Return processed successfully!")
      cancelReturn()
      renderBorrowTable()
    })
    .catch((err) => {
      console.error("Error processing return:", err)
      alert("Failed to process return. Please try again.")
    })
}
//-----------------BÁO CÁO THỐNG KÊ-----------------//
//Báo cáo độc giả
function showReaderReport() {
  document.getElementById("readerReportDashboard").classList.remove("hidden")

  fetch("http://localhost:3001/api/reports/readers")
    .then((res) => res.json())
    .then((data) => {
      // Cập nhật Scorecards
      document.getElementById("totalReadersCard").textContent = `Tổng số độc giả: ${data.totalReaders}`
      document.getElementById("newReadersCard").textContent = `Độc giả mới tháng này: ${data.newReaders}`

      // Tính tổng số lượt truy cập
      const totalAccesses = data.loginStats.reduce((sum, reader) => sum + reader.login_count, 0)
      document.getElementById("totalAccessesCard").textContent = `Tổng lượt truy cập: ${totalAccesses}`

      // Vẽ biểu đồ
      drawReadersOverTimeChart(data.readersMonthly)
      drawTopReadersChart(data.loginStats)
    })
    .catch((err) => {
      console.error("Lỗi khi tải báo cáo độc giả:", err)
      alert("Không thể tải báo cáo độc giả. Vui lòng thử lại sau.")
    })
}

function drawReadersOverTimeChart(monthlyData) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const counts = months.map((month) => {
    const monthData = monthlyData.find((data) => data.month === month)
    return monthData ? monthData.count : 0
  })

  const ctx = document.getElementById("readersOverTimeChart")
  if (!ctx) return

  new Chart(ctx, {
    type: "line",
    data: {
      labels: months.map((m) => `Tháng ${m}`),
      datasets: [
        {
          label: "Số độc giả đăng ký",
          data: counts,
          borderColor: "#007bff",
          fill: false,
        },
      ],
    },
  })
}

function drawTopReadersChart(loginStats) {
  const ctx = document.getElementById("topReadersChart")
  if (!ctx) return

  // Lấy top 10 độc giả có số lần đăng nhập nhiều nhất
  const topReaders = loginStats.sort((a, b) => b.login_count - a.login_count).slice(0, 10)

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: topReaders.map((reader) => reader.reader_name),
      datasets: [
        {
          label: "Số lượt truy cập",
          data: topReaders.map((reader) => reader.login_count),
          backgroundColor: "#ffc107",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Độc giả",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Số lượt truy cập",
          },
        },
      },
    },
  })
}

//---------------- PUBLIC ------------------- //
document.addEventListener("DOMContentLoaded", () => {
  loadBorrowHistory()
})
// Toggle dropdown menu
function toggleMenu() {
  const dropdown = document.querySelector(".dropdown")
  dropdown.classList.toggle("active")

  // Add event listener to close dropdown when clicking outside
  if (dropdown.classList.contains("active")) {
    document.addEventListener("click", closeDropdownOnClickOutside)
  } else {
    document.removeEventListener("click", closeDropdownOnClickOutside)
  }
}
function closeDropdownOnClickOutside(event) {
  const dropdown = document.querySelector(".dropdown")
  const userMenu = document.querySelector(".user-menu")
  const hamburgerMenu = document.querySelector(".hamburger-menu")

  if (!dropdown.contains(event.target) && !userMenu.contains(event.target) && !hamburgerMenu.contains(event.target)) {
    dropdown.classList.remove("active")
    document.removeEventListener("click", closeDropdownOnClickOutside)
  }
}

// Load borrow history
function loadBorrowHistory() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))

  // Kiểm tra xem có reader_id không
  if (!loggedInUser.reader_id) {
    document.getElementById("borrowHistoryTable").innerHTML =
      "<tr><td colspan='7'>Tài khoản của bạn không liên kết với độc giả nào. Vui lòng liên hệ thủ thư.</td></tr>"
    return
  }

  fetch(`http://localhost:3000/api/readers/${loggedInUser.reader_id}/loan`)
    .then((res) => {
      if (!res.ok) throw new Error("Không thể lấy dữ liệu phiếu mượn")
      return res.json()
    })
    .then((loans) => {
      const tableBody = document.getElementById("borrowHistoryTable")
      if (!tableBody) return

      tableBody.innerHTML = ""

      if (loans.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='7'>Không có phiếu mượn nào.</td></tr>"
        return
      }

      loans.forEach((loan) => {
        // Determine status and CSS class
        const status = loan.loan_status
        let statusClass = ""

        if (status === "Đã trả") {
          statusClass = "status-returned"
        } else if (status === "Quá hạn") {
          statusClass = "status-overdue"
        } else {
          statusClass = "status-borrowing"
        }

        const row = `
          <tr>
            <td>${loan.loan_id}</td>
            <td>${formatDate(loan.borrow_date)}</td>
            <td>${formatDate(loan.due_date)}</td>
            <td>${loan.return_date ? formatDate(loan.return_date) : ""}</td>
            <td>${formatCurrency(loan.total_deposit || 0)}</td>
            <td class="${statusClass}">${status}</td>
            <td>
              <button class="btn-primary" onclick="viewLoanDetails('${loan.loan_id}')">Xem</button>
            </td>
          </tr>
        `

        tableBody.innerHTML += row
      })
    })
    .catch((err) => {
      console.error("Lỗi khi tải lịch sử mượn trả:", err)
      const tableBody = document.getElementById("borrowHistoryTable")
      if (tableBody) {
        tableBody.innerHTML = "<tr><td colspan='7'>Không thể tải lịch sử mượn trả. Vui lòng thử lại sau.</td></tr>"
      }
    })
}

// View loan details
function viewLoanDetails(loanId) {
  fetch(`http://localhost:3000/api/borrows/${loanId}`)
    .then((res) => res.json())
    .then((loan) => {
      // Fill modal with loan details
      document.getElementById("modalLoanId").textContent = loan.loan_id
      document.getElementById("modalBorrowDate").textContent = formatDate(loan.borrow_date)
      document.getElementById("modalDueDate").textContent = formatDate(loan.due_date)
      

      // Determine status
      const status = loan.loan_status
      let statusClass = ""

      if (status === "Đã trả") {
        statusClass = "status-returned"
      } else if (status === "Quá hạn") {
        statusClass = "status-overdue"
      } else {
        statusClass = "status-borrowing"
      }

      document.getElementById("modalStatus").textContent = status
      document.getElementById("modalStatus").className = statusClass

      // Store loan ID for extend functionality
      const modal = document.getElementById("loanDetailsModal")
      modal.dataset.loanId = loanId

      // Show/hide extend button based on status
      const extendButton = document.getElementById("extendLoanBtn")
      if (status === "Đang mượn") {
        extendButton.style.display = "inline-block"
      } else {
        extendButton.style.display = "none"
      }

      // Get loan items
      return fetch(`http://localhost:3000/api/borrows/${loanId}/items`)
    })
    .then((res) => res.json())
    .then((items) => {
      const itemsContainer = document.getElementById("modalLoanItems")
      itemsContainer.innerHTML = ""

      let totalQuantityBorrow = 0
      let totalDeposit = 0
      let totalQuantityReturn = 0
      let totalViolation = 0

      items.forEach((item) => {
        totalQuantityBorrow += item.borrow_quantity
        totalDeposit += item.deposit_money
        totalQuantityReturn += item.return_quantity || 0
        totalViolation += item.violation_money || 0

        const row = `
          <tr>
            <td>${item.document_id}</td>
            <td>${item.document_name}</td>
            <td>${item.document_publish}</td>
            <td>${item.borrow_quantity}</td>
            <td>${formatCurrency(item.deposit_money)}</td>
            <td>${item.return_quantity ||""}</td>
            <td>${formatCurrency(item.violation_money || "")}</td>
            <td>${item.return_quality || ""}</td>
          </tr>
        `

        itemsContainer.innerHTML += row
      })

      // Update totals
      document.getElementById("modalTotalQuantityBorrow").textContent = totalQuantityBorrow
      document.getElementById("modalTotalDeposit").textContent = formatCurrency(totalDeposit)
      document.getElementById("modalTotalQuantityReturn").textContent = totalQuantityReturn
      document.getElementById("modalTotalViolation").textContent = formatCurrency(totalViolation)

      // Show modal
      document.getElementById("loanDetailsModal").style.display = "block"
    })
    .catch((err) => {
      console.error("Error loading loan details:", err)
      alert("Không thể tải thông tin phiếu mượn. Vui lòng thử lại sau.")
    })
}
// Close loan details modal
function closeModal() {
  document.getElementById("loanDetailsModal").style.display = "none"
}

// Extend loan
function extendLoan() {
  const modal = document.getElementById("loanDetailsModal")
  const loanId = modal.dataset.loanId

  if (confirm("Bạn có chắc chắn muốn gia hạn phiếu mượn này thêm 7 ngày?")) {
    fetch(`http://localhost:3000/api/borrows/${loanId}/extend`, {
      method: "POST",
    })
      .then(async (res) => {
        const message = await res.text()
        if (!res.ok) throw new Error(message || "Không thể gia hạn phiếu mượn.")
        alert(message || "Gia hạn phiếu mượn thành công!")
        closeModal()
        loadBorrowHistory()
      })
      .catch((err) => {
        console.error("Error extending loan:", err)
        alert(err.message || "Lỗi không xác định. Vui lòng thử lại sau.")
      })
  }
}
// Search documents
function searchDocuments() {
  const keyword = document.getElementById("searchInput").value.trim()
  const searchType = document.getElementById("searchType").value

  if (!keyword) {
    alert("Vui lòng nhập từ khóa tìm kiếm!")
    return
  }

  // Prepare search parameters
  const params = new URLSearchParams()
  params.append("keyword", keyword)
  params.append("type", searchType)

  fetch(`http://localhost:3000/api/documents/search?${params.toString()}`)
    .then((res) => {
      if (!res.ok) throw new Error("Không thể tìm kiếm tài liệu")
      return res.json()
    })
    .then((documents) => {
      const resultsContainer = document.getElementById("searchResults")
      const documentGrid = document.getElementById("documentGrid")

      if (!resultsContainer || !documentGrid) return

      if (documents.length === 0) {
        documentGrid.innerHTML = "<p>Không tìm thấy tài liệu phù hợp.</p>"
      } else {
        documentGrid.innerHTML = ""

        documents.forEach((doc) => {
          const item = document.createElement("div")
          item.className = "featured-item"
          item.setAttribute("data-id", doc.document_id)

          // Check if document is new (less than 30 days old)
          const isNew =
            doc.document_date && new Date(doc.document_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

          item.innerHTML = `
            <div class="featured-item-content">
              <img src="/placeholder.svg?height=250&width=150" alt="${doc.document_name}">
              ${isNew ? '<span class="featured-item-badge">Mới</span>' : ""}
              <div class="featured-item-info">
                <h3>${doc.document_name}</h3>
                <p>${doc.document_author || "Không có tác giả"}</p>
                <div class="featured-item-rating">
                  <span class="stars">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                  </span>
                  <span class="count">(${Math.floor(Math.random() * 100) + 50})</span>
                </div>
              </div>
            </div>
          `

          // Add click event to show document details
          item.addEventListener("click", () => {
            showDocumentDetails(doc)
          })

          documentGrid.appendChild(item)
        })
      }

      // Show results section
      resultsContainer.classList.remove("hidden")

      // Scroll to results
      resultsContainer.scrollIntoView({ behavior: "smooth" })
    })
    .catch((err) => {
      console.error("Lỗi khi tìm kiếm tài liệu:", err)
      alert("Không thể tìm kiếm tài liệu. Vui lòng thử lại sau.")
    })
}