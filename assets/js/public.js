document.addEventListener("DOMContentLoaded", () => {
  // Display username
  const usernameDisplay = document.getElementById("usernameDisplay")
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))

  if (loggedInUser && usernameDisplay) {
    usernameDisplay.textContent = loggedInUser.account_owner || "Độc giả"
  }

  // Load featured documents
  loadFeaturedDocuments()

  // Load borrow history if on that page
  if (document.getElementById("borrowHistoryTable")) {
    loadBorrowHistory()
  }

  // Load account info if on that page
  if (document.getElementById("readerId")) {
    loadAccountInfo()
  }
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

// Logout function
function logout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    localStorage.removeItem("loggedInUser")
    window.location.href = "login.html"
  }
}

// Navigation
function navigateTo(page) {
  window.location.href = page
}

// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
}

// Format date
function formatDate(dateString) {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("vi-VN")
}

// Load featured documents
function loadFeaturedDocuments() {
  const slider = document.getElementById("featuredSlider")
  if (!slider) return

  fetch("http://localhost:3000/api/documents")
    .then((res) => res.json())
    .then((documents) => {
      // Sort by date (newest first)
      documents.sort((a, b) => new Date(b.document_date) - new Date(a.document_date))

      // Take first 10 documents
      const featuredDocs = documents.slice(0, 10)

      slider.innerHTML = "" // Clear existing content

      featuredDocs.forEach((doc) => {
        const item = document.createElement("div")
        item.className = "featured-item"
        item.setAttribute("data-id", doc.document_id)
        item.setAttribute("data-category", doc.document_category)

        // Check if document is new (less than 30 days old)
        const isNew = new Date(doc.document_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

        item.innerHTML = `
          <div class="featured-item-content">
            <img src="/placeholder.svg?height=250&width=150" alt="${doc.document_name}">
            ${isNew ? '<span class="featured-item-badge">Mới</span>' : ""}
            <div class="featured-item-info">
              <h3>${doc.document_name}</h3>
              <p>${doc.document_author}</p>
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

        slider.appendChild(item)
      })

      // Update pagination
      updatePagination()
    })
    .catch((err) => {
      console.error("Error loading featured documents:", err)
      slider.innerHTML = "<p>Không thể tải tài liệu. Vui lòng thử lại sau.</p>"
    })
}

// Update pagination
function updatePagination() {
  const currentPageElement = document.querySelector(".current-page")
  const totalPagesElement = document.querySelector(".total-pages")

  if (!currentPageElement || !totalPagesElement) return

  // Get all visible items
  const slider = document.getElementById("featuredSlider")
  const items = Array.from(slider.querySelectorAll(".featured-item"))
  const visibleItems = items.filter((item) => {
    const category = document.querySelector(".category-btn.active").dataset.category
    return category === "all" || item.dataset.category === category
  })

  const itemsPerPage = 5
  const totalPages = Math.ceil(visibleItems.length / itemsPerPage)

  currentPageElement.textContent = "1"
  totalPagesElement.textContent = totalPages.toString()
}

// Navigate featured documents
function navigateFeatured(direction) {
  const currentPageElement = document.querySelector(".current-page")
  const totalPagesElement = document.querySelector(".total-pages")

  if (!currentPageElement || !totalPagesElement) return

  let currentPage = Number.parseInt(currentPageElement.textContent)
  const totalPages = Number.parseInt(totalPagesElement.textContent)

  currentPage += direction

  if (currentPage < 1) currentPage = 1
  if (currentPage > totalPages) currentPage = totalPages

  currentPageElement.textContent = currentPage.toString()

  // Update visible items
  const slider = document.getElementById("featuredSlider")
  const items = Array.from(slider.querySelectorAll(".featured-item"))
  const category = document.querySelector(".category-btn.active").dataset.category

  const visibleItems = items.filter((item) => {
    return category === "all" || item.dataset.category === category
  })

  const itemsPerPage = 5
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  visibleItems.forEach((item, index) => {
    if (index >= startIndex && index < endIndex) {
      item.style.display = ""
    } else {
      item.style.display = "none"
    }
  })
}

// Change view (grid/list)
function changeView(viewType) {
  const slider = document.getElementById("featuredSlider")
  if (!slider) return

  // Update active button
  const viewButtons = document.querySelectorAll(".view-option")
  viewButtons.forEach((btn) => {
    btn.classList.remove("active")
    if (btn.dataset.view === viewType) {
      btn.classList.add("active")
    }
  })

  // Update slider class
  slider.className = `featured-slider ${viewType}-view`
}

// Filter by category
function filterCategory(category) {
  const categoryButtons = document.querySelectorAll(".category-btn")
  categoryButtons.forEach((btn) => {
    btn.classList.remove("active")
    if (btn.dataset.category === category) {
      btn.classList.add("active")
    }
  })

  const slider = document.getElementById("featuredSlider")
  const items = slider.querySelectorAll(".featured-item")

  items.forEach((item) => {
    if (category === "all" || item.dataset.category === category) {
      item.style.display = ""
    } else {
      item.style.display = "none"
    }
  })

  // Reset pagination
  document.querySelector(".current-page").textContent = "1"
  updatePagination()
}

// Show document details
function showDocumentDetails(document) {
    const modal = document.getElementById("documentModal")
    if (!modal) return
  
    // Fill modal with document details
    document.getElementById("modalDocumentTitle").textContent = document.document_name
    document.getElementById("modalDocumentAuthor").textContent = document.document_author || "Không có thông tin"
    document.getElementById("modalDocumentPublisher").textContent = document.document_publish || "Không có thông tin"
    document.getElementById("modalDocumentYear").textContent = formatDate(document.document_date) || "Không có thông tin"
    document.getElementById("modalDocumentCategory").textContent = document.document_category || "Không có thông tin"
    document.getElementById("modalDocumentQuantity").textContent = document.document_quantity || "0"
    document.getElementById("modalDocumentPrice").textContent = formatCurrency(document.document_value) || "0"
    document.getElementById("modalDocumentDescription").textContent =
      document.document_describe || "Không có mô tả chi tiết."
  
    // Hiển thị modal
    modal.style.display = "block"
  }
  // Close document modal
  function closeDocumentModal() {
    document.getElementById("documentModal").style.display = "none"
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


  // Load borrow history
  function loadBorrowHistory() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
    if (!loggedInUser) {
      alert("Vui lòng đăng nhập để xem lịch sử mượn trả!")
      window.location.href = "login.html"
      return
    }
  
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
  
        let totalQuantity = 0
        let totalDeposit = 0
  
        items.forEach((item) => {
          totalQuantity += item.borrow_quantity
          totalDeposit += item.deposit_money
  
          const row = `
            <tr>
              <td>${item.document_id}</td>
              <td>${item.document_name}</td>
              <td>${item.publisher || "N/A"}</td>
              <td>${item.borrow_quantity}</td>
              <td>${formatCurrency(item.deposit_money)}</td>
            </tr>
          `
  
          itemsContainer.innerHTML += row
        })
  
        // Update totals
        document.getElementById("modalTotalQuantity").textContent = totalQuantity
        document.getElementById("modalTotalDeposit").textContent = formatCurrency(totalDeposit)
  
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
        .then((res) => {
          if (!res.ok) throw new Error("Failed to extend loan")
          return res.text()
        })
        .then((msg) => {
          alert(msg || "Gia hạn phiếu mượn thành công!")
          closeModal()
          loadBorrowHistory() // Reload borrow history
        })
        .catch((err) => {
          console.error("Error extending loan:", err)
          alert("Không thể gia hạn phiếu mượn. Vui lòng thử lại sau.")
        })
    }
  }
  
  // Search loans
  function searchLoans() {
    const keyword = document.getElementById("searchLoanInput").value.trim()
  
    if (!keyword) {
      loadBorrowHistory() // If empty, load all loans
      return
    }
  
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
    if (!loggedInUser) {
      alert("Vui lòng đăng nhập để tìm kiếm phiếu mượn!")
      window.location.href = "login.html"
      return
    }
  
    // Prepare search parameters
    const params = new URLSearchParams()
    params.append("keyword", keyword)
    params.append("reader_id", loggedInUser.reader_id)
  
    fetch(`http://localhost:3000/api/borrows/search?${params.toString()}`)
      .then((res) => res.json())
      .then((loans) => {
        const tableBody = document.getElementById("borrowHistoryTable")
        tableBody.innerHTML = ""
  
        if (loans.length === 0) {
          tableBody.innerHTML = "<tr><td colspan='7'>Không tìm thấy phiếu mượn phù hợp.</td></tr>"
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
        console.error("Error searching loans:", err)
        alert("Không thể tìm kiếm phiếu mượn. Vui lòng thử lại sau.")
      })
  }
  
  // Load account info
  function loadAccountInfo() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
    if (!loggedInUser) {
      alert("Vui lòng đăng nhập để xem thông tin tài khoản!")
      window.location.href = "login.html"
      return
    }
  
    const readerIdElement = document.getElementById("readerId")
    const accountOwnerElement = document.getElementById("accountOwner")
    const readerNameElement = document.getElementById("readerName")
    const readerDobElement = document.getElementById("readerDob")
    const readerGenderElement = document.getElementById("readerGender")
    const readerAddressElement = document.getElementById("readerAddress")
    const readerPhoneElement = document.getElementById("readerPhone")
    const readerEmailElement = document.getElementById("readerEmail")
  
    if (
      !readerIdElement ||
      !accountOwnerElement ||
      !readerNameElement ||
      !readerDobElement ||
      !readerGenderElement ||
      !readerAddressElement ||
      !readerPhoneElement ||
      !readerEmailElement
    ) {
      console.error("Một hoặc nhiều phần tử thông tin tài khoản không tồn tại.")
      return
    }
  
    fetch(`http://localhost:3000/api/readers/${loggedInUser.reader_id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Không thể tải thông tin tài khoản")
        }
        return res.json()
      })
      .then((reader) => {
        readerIdElement.textContent = reader.reader_id || "Không có"
        accountOwnerElement.textContent = reader.account_owner || "Không có"
        readerNameElement.textContent = reader.reader_name || "Không có"
        readerDobElement.textContent = formatDate(reader.reader_dob) || "Không có"
        readerGenderElement.textContent = reader.reader_gender || "Không có"
        readerAddressElement.textContent = reader.reader_address || "Không có"
        readerPhoneElement.textContent = reader.reader_phone || "Không có"
        readerEmailElement.textContent = reader.reader_email || "Không có"
      })
      .catch((err) => {
        console.error("Lỗi khi tải thông tin tài khoản:", err)
        alert("Không thể tải thông tin tài khoản. Vui lòng thử lại sau.")
      })
  }
  