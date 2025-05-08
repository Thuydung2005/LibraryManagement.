const express = require('express');
const { poolPromise, sql } = require('./dbConfig');

const app = express();
app.use(express.json());
const path = require('path');
// Cấu hình để phục vụ file tĩnh từ thư mục assets
app.use('/assets', express.static(path.join(__dirname, '../assets')));
// Cấu hình để phục vụ file tĩnh từ thư mục views
app.use('/', express.static(path.join(__dirname, '../views')));
// Route mặc định trả về giao diện chính
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});
//--------------------- QUẢN LÝ ĐĂNG NHẬP -------------------- //
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("username", sql.VarChar(50), username)
      .input("password", sql.VarChar(30), password)
      .query(`
        SELECT account_name, account_owner, account_role, reader_id
        FROM Account
        WHERE account_name = @username AND account_password = @password
      `);

    if (result.recordset.length === 0) {
      return res.status(401).send("Sai tên đăng nhập hoặc mật khẩu");
    }

    const user = result.recordset[0];
    await pool
      .request()
      .input("username", sql.VarChar(50), username)
      .query(`
        UPDATE Account 
        SET login_count = login_count + 1 
        WHERE account_name = @username
      `)

    // Gợi ý nâng cao: có thể thêm ghi nhật ký hoặc đếm số lần đăng nhập tại đây
    await pool.request().execute("sp_UpdateLoanStatus");

    res.json(user);
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    res.status(500).send("Lỗi hệ thống");
  }
});
// -------------------- QUẢN LÝ TÀI KHOẢN -------------------- //

// API: Lấy danh sách tài khoản
app.get('/api/accounts', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Account');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send('Lỗi khi lấy danh sách tài khoản: ' + err.message);
  }
});

// API: Lấy thông tin chi tiết tài khoản
app.get('/api/accounts/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.VarChar(50), username)
      .query('SELECT * FROM Account WHERE account_name = @username');
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).send('Lỗi khi lấy thông tin tài khoản: ' + err.message);
  }
});

// API: Thêm tài khoản mới
app.post('/api/accounts', async (req, res) => {
  const { account_name, reader_id, account_owner, account_password, account_email, account_role } = req.body;

  try {
    const pool = await poolPromise;

    // Nếu là thủ thư hoặc reader_id trống/null → cho vào NULL
    const readerIdValue = (!reader_id || account_role === 'Thủ thư') ? null : reader_id;

    await pool.request()
      .input('account_name', sql.VarChar(50), account_name)
      .input('reader_id', sql.VarChar(5), readerIdValue)
      .input('account_owner', sql.NVarChar(100), account_owner)
      .input('account_password', sql.VarChar(30), account_password)
      .input('account_email', sql.VarChar(100), account_email)
      .input('account_role', sql.NVarChar(10), account_role)
      .query(`
        INSERT INTO Account (account_name, reader_id, account_owner, account_password, account_email, account_role)
        VALUES (@account_name, @reader_id, @account_owner, @account_password, @account_email, @account_role)
      `);

    res.send('Thêm tài khoản thành công!');
  } catch (err) {
    console.error("Lỗi thêm tài khoản:", err);
    res.status(500).send('Lỗi khi thêm tài khoản: ' + err.message);
  }
});

// API: Cập nhật tài khoản
app.put('/api/accounts/:username', async (req, res) => {
  const { username: newUsername,owner, email, password, role, readerCode } = req.body;
  const { username: oldUsername } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
  .input('newUsername', sql.VarChar(50), newUsername)
  .input('owner', sql.NVarChar(100), owner)
  .input('email', sql.VarChar(100), email)
  .input('password', sql.VarChar(30), password)
  .input('role', sql.NVarChar(10), role)
  .input('readerCode', sql.VarChar(5), readerCode)
  .input('oldUsername', sql.VarChar(50), oldUsername)
  .query(`
    UPDATE Account
    SET account_name = @newUsername,
        account_owner = @owner,
        account_email = @email,
        account_password = @password,
        account_role = @role,
        reader_id = @readerCode
    WHERE account_name = @oldUsername
  `);
    res.send('Cập nhật tài khoản thành công!');
  } catch (err) {
    res.status(500).send('Lỗi khi cập nhật tài khoản: ' + err.message);
  }
});

// API: Xóa tài khoản
app.delete('/api/accounts/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('account_name', sql.VarChar(50), username)
      .query('DELETE FROM Account WHERE account_name = @account_name');
    res.send('Xóa tài khoản thành công!');
  } catch (err) {
    res.status(500).send('Lỗi khi xóa tài khoản: ' + err.message);
  }
});
//--------------------- QUẢN LÝ SÁCH -------------------- //

// API: Lấy danh sách tài liệu
app.get('/api/documents', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Document');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send('Lỗi khi lấy danh sách tài liệu: ' + err.message);
  }
});

// API: Lấy thông tin chi tiết tài liệu
app.get('/api/documents/:document_id', async (req, res) => {
  const { document_id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('document_id', sql.VarChar(50), document_id)
      .query('SELECT * FROM Document WHERE document_id = @document_id');
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).send('Lỗi khi lấy thông tin tài liệu: ' + err.message);
  }
});

// API: Thêm tài liệu mới
app.post('/api/documents', async (req, res) => {
  const { document_id,document_name, document_publish,document_category,document_author,document_quantity,document_date,document_value,document_describe } = req.body;
  try {
    const pool = await poolPromise;

    await pool.request()
      .input('document_id', sql.VarChar(10), document_id)
      .input('document_name', sql.NVarChar(255), document_name)
      .input('document_publish', sql.NVarChar(255), document_publish)
      .input('document_category', sql.NVarChar(100), document_category)
      .input('document_author', sql.NVarChar(255), document_author)
      .input('document_quantity', sql.Int, document_quantity)
      .input('document_date', sql.Date, document_date)
      .input('document_value', sql.Decimal(10,0), document_value)
      .input('document_describe', sql.Text, document_describe)
      .query(`
        INSERT INTO Document (document_id,document_name,document_publish,document_category,document_author,document_quantity,document_date,document_value,document_describe)
        VALUES (@document_id,@document_name,@document_publish,@document_category,@document_author,@document_quantity,@document_date,@document_value,@document_describe)
      `);
    res.send('Thêm tài liệu thành công!');
  } catch (err) {
    res.status(500).send('Lỗi khi thêm tài liệu: ' + err.message);
  }
});

// API: Cập nhật tài liệu
app.put('/api/documents/:document_id', async (req, res) => {
  const { document_id } = req.params;
  const { document_name, document_publish,document_category,document_author,document_quantity,document_date,document_value,document_describe } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
    .input('document_id', sql.VarChar(10), document_id)
    .input('document_name', sql.NVarChar(255), document_name)
    .input('document_publish', sql.NVarChar(255), document_publish)
    .input('document_category', sql.NVarChar(100), document_category)
    .input('document_author', sql.NVarChar(255), document_author)
    .input('document_quantity', sql.Int, document_quantity)
    .input('document_date', sql.Date, document_date)
    .input('document_value', sql.Decimal(10,0), document_value)
    .input('document_describe', sql.Text, document_describe)
      .query(`
        UPDATE Document
        SET document_name = @document_name,
            document_publish = @document_publish,
            document_category = @document_category,
            document_author = @document_author,
            document_quantity = @document_quantity,
            document_date = @document_date,
            document_value = @document_value,
            document_describe = @document_describe
        WHERE document_id = @document_id
      `);
    res.send('Cập nhật tài khoản thành công!');
  } catch (err) {
    res.status(500).send('Lỗi khi cập nhật tài khoản: ' + err.message);
  }
});

// API: Xóa tài liệu
app.delete('/api/documents/:document_id', async (req, res) => {
  const { document_id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('document_id', sql.VarChar(10), document_id)
      .query('DELETE FROM Document WHERE document_id = @document_id');
    res.send('Xóa tài liệu thành công!');
  } catch (err) {
    res.status(500).send('Lỗi khi xóa tài liệu: ' + err.message);
  }
});

// -------------------- QUẢN LÝ ĐỘC GIẢ -------------------- //

// API: Lấy danh sách độc giả
app.get('/api/readers', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Reader');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send('Lỗi khi lấy danh sách độc giả: ' + err.message);
  }
});
// API: Lấy thông tin chi tiết tài khoản
app.get('/api/readers/:reader_id', async (req, res) => {
  const { reader_id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('reader_id', sql.VarChar(5), reader_id)
      .query('SELECT * FROM Reader WHERE reader_id = @reader_id');
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).send('Lỗi khi lấy thông tin độc giả: ' + err.message);
  }
});
// API: Thêm độc giả mới
app.post('/api/readers', async (req, res) => {
  const { reader_id, reader_name, reader_gender, reader_birth, reader_cccd, reader_phone, reader_email, reader_address } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('reader_id', sql.VarChar(10), reader_id)
      .input('reader_name', sql.NVarChar(100), reader_name)
      .input('reader_gender', sql.NVarChar(3), reader_gender)
      .input('reader_birth', sql.Date, reader_birth)
      .input('reader_cccd', sql.Char(12), reader_cccd)
      .input('reader_phone', sql.Char(10), reader_phone)
      .input('reader_email', sql.VarChar(255), reader_email)
      .input('reader_address', sql.NVarChar(200), reader_address)
      .query(`
        INSERT INTO Reader (reader_id, reader_name, reader_gender, reader_birth, reader_cccd, reader_phone, reader_email, reader_address)
        VALUES (@reader_id, @reader_name, @reader_gender, @reader_birth, @reader_cccd, @reader_phone, @reader_email, @reader_address)
      `);
    res.send('Thêm độc giả thành công!');
  } catch (err) {
    console.error("Lỗi thêm độc giả:", err)
    res.status(500).send('Lỗi khi thêm độc giả: ' + err.message);
  }
});
// API: Cập nhật độc giả
app.put('/api/readers/:reader_id', async (req, res) => {
  const { reader_id } = req.params;
  const { reader_name, reader_gender,reader_birth,reader_cccd,reader_phone,reader_address,reader_email } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
    .input('reader_id', sql.VarChar(10), reader_id)
    .input('reader_name', sql.NVarChar(100), reader_name)
    .input('reader_gender', sql.NVarChar(3), reader_gender)
    .input('reader_birth', sql.Date, reader_birth)
    .input('reader_cccd', sql.Char(12), reader_cccd)
    .input('reader_phone', sql.Char(10), reader_phone)
    .input('reader_address', sql.NVarChar(200), reader_address)
    .input('reader_email', sql.VarChar(255), reader_email)
      .query(`
        UPDATE Reader
        SET reader_name = @reader_name,
            reader_gender = @reader_gender,
            reader_birth = @reader_birth,
            reader_cccd = @reader_cccd,
            reader_phone = @reader_phone,
            reader_address = @reader_address,
            reader_email = @reader_email
        WHERE reader_id = @reader_id
      `);
    res.send('Cập nhật độc giả thành công!');
  } catch (err) {
    res.status(500).send('Lỗi khi cập nhật độc giả: ' + err.message);
  }
});

// API: Xóa độc giả
app.delete('/api/readers/:reader_id', async (req, res) => {
  const { reader_id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('reader_id', sql.VarChar(10), reader_id)
      .query('DELETE FROM Reader WHERE reader_id = @reader_id');
    res.send('Xóa độc giả thành công!');
  } catch (err) {
    res.status(500).send('Lỗi khi xóa độc giả: ' + err.message);
  }
});
// API: Tìm kiếm độc giả
app.get("/api/readers/search", async (req, res) => {
  const keyword = `%${req.query.q || ""}%`;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("keyword", sql.NVarChar(255), keyword)
      .query(`
        SELECT * FROM Reader
        WHERE reader_id LIKE @keyword OR reader_name LIKE @keyword
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi tìm kiếm độc giả:", err);  // In lỗi chi tiết ra console
    res.status(500).json({ error: 'Lỗi máy chủ', message: err.message });  // Trả về chi tiết lỗi dưới dạng JSON
  }
});
// --------------------- QUẢN LÝ MƯỢN TRẢ SÁCH -------------------- //
// API: Lấy danh sách phiếu mượn
app.get("/api/borrows", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query(`
      SELECT * FROM Loan 
    `)
    res.json(result.recordset)
  } catch (err) {
    res.status(500).send("Lỗi khi lấy danh sách phiếu mượn: " + err.message)
  }
})
// API: Lấy chi tiết phiếu mượn
app.get("/api/borrows/:loanId", async (req, res) => {
  const { loanId } = req.params
  try {
    const pool = await poolPromise
    const result = await pool
      .request()
      .input("loanId", sql.VarChar(10), loanId)
      .query(`
        SELECT * FROM Loan
        WHERE loan_id = @loanId
      `)

    if (result.recordset.length === 0) {
      return res.status(404).send("Borrow record not found")
    }

    res.json(result.recordset[0])
  } catch (err) {
    console.error("Error getting borrow details:", err)
    res.status(500).send("Error getting borrow details: " + err.message)
  }
})
// API: Lấy chi tiết phiếu mượn (bao gồm tài liệu)
app.get("/api/borrows/:loanId/items", async (req, res) => {
  const { loanId } = req.params
  try {
    const pool = await poolPromise
    const result = await pool
      .request()
      .input("loanId", sql.VarChar(10), loanId)
      .query(`
        SELECT  l.document_id, 
                d.document_name,
                d.document_publish, 
                l.borrow_quantity, 
                l.deposit_money,
                l.return_quantity,
                l.return_quality,
                l.violation_money
        FROM Loan_detail l
        JOIN Document d ON l.document_id = d.document_id
        WHERE l.loan_id = @loanId
      `)

    res.json(result.recordset)
  } catch (err) {
    console.error("Error getting borrow items:", err)
    res.status(500).send("Error getting borrow items: " + err.message)
  }
})

// API: Tạo phiếu mượn mới
app.post("/api/borrows", async (req, res) => {
  const { reader_id, borrow_date, due_date, items,notes } = req.body

  if (!reader_id || !borrow_date || !due_date || !items || items.length === 0) {
    return res.status(400).send("Thiếu thông tin cần thiết")
  }

  const pool = await poolPromise
  const transaction = new sql.Transaction(pool)

  try {
    await transaction.begin()

    const { v4: uuidv4 } = require('uuid')
const loan_id = `PM${uuidv4().slice(0, 3).toUpperCase()}`
const today = new Date();
let loan_status;

if (today >new Date(due_date)) {
  loan_status = 'Quá hạn';
} else {
  loan_status = 'Đang mượn';
}

    // Thêm phiếu mượn
    await transaction
        .request()
        .input("loan_id", sql.VarChar(10), loan_id)
        .input("reader_id", sql.VarChar(10), reader_id)
        .input("borrow_date", sql.Date, borrow_date)
        .input("due_date", sql.Date, due_date)
        .input("notes", sql.NVarChar(500), notes)
        .input("loan_status", sql.NVarChar(20), loan_status)
        .query(`
          INSERT INTO Loan (loan_id, reader_id, borrow_date, due_date, notes, loan_status)
          VALUES (@loan_id, @reader_id, @borrow_date, @due_date, @notes,@loan_status)
        `)

    for (const item of items) {

      await transaction
          .request()
          .input("loan_id", sql.VarChar(10), loan_id)
          .input("document_id", sql.VarChar(10), item.document_id)
          .input("borrow_quantity", sql.Int, item.borrow_quantity)
          .input("deposit_money", sql.Decimal(10, 2), item.deposit_money)
          .query(`
            INSERT INTO Loan_detail (loan_id, document_id,borrow_quantity, deposit_money)
            VALUES (@loan_id, @document_id, @borrow_quantity, @deposit_money)
          `)

      // Cập nhật số lượng tài liệu
      await new sql.Request(transaction)
        .input("document_id", sql.VarChar(10), item.document_id)
        .input("borrow_quantity", sql.Int, item.borrow_quantity)
        .query(`
          UPDATE Document
          SET document_quantity = document_quantity - @borrow_quantity
          WHERE document_id = @document_id
        `)
    }

    await transaction.commit()
    res.status(201).json({ loan_id, message: "Tạo phiếu mượn thành công" })
  } catch (err) {
    console.error("Error creating borrow record:", err)
    await transaction.rollback()
    res.status(500).send("Lỗi khi tạo phiếu mượn: " + err.message)
  }
})
//Xóa phiếu mượn
app.delete("/api/borrows/:loan_id", async (req, res) => {
  const { loan_id } = req.params

  try {
    const pool = await poolPromise

    // Begin transaction
    const transaction = new sql.Transaction(pool)
    await transaction.begin()

    try {
      // Get loan details to restore document quantities
      const detailsResult = await transaction
        .request()
        .input("loan_id", sql.VarChar(10), loan_id)
        .query(`
          SELECT document_id, borrow_quantity FROM Loan_detail
          WHERE loan_id = @loan_id
        `)

      // Restore document quantities if the loan is active
      const loanResult = await transaction
        .request()
        .input("loan_id", sql.VarChar(10), loan_id)
        .query(`
          SELECT return_date FROM Loan
          WHERE loan_id = @loan_id
        `)

      if (loanResult.recordset.length > 0 && !loanResult.recordset[0].return_date) {
        for (const detail of detailsResult.recordset) {
          await transaction
            .request()
            .input("document_id", sql.VarChar(10), detail.document_id)
            .input("borrow_quantity", sql.Int, detail.borrow_quantity)
            .query(`
              UPDATE Document
              SET document_quantity = document_quantity + @borrow_quantity
              WHERE document_id = @document_id
            `)
        }
      }

      // Delete loan details
      await transaction
        .request()
        .input("loan_id", sql.VarChar(10), loan_id)
        .query(`
          DELETE FROM Loan_detail
          WHERE loan_id = @loan_id
        `)


      // Delete loan record
      await transaction
        .request()
        .input("loan_id", sql.VarChar(10), loan_id)
        .query(`
          DELETE FROM Loan
          WHERE loan_id = @loan_id
        `)

      // Commit transaction
      await transaction.commit()

      res.send("Xóa phiếu mượn thành công!")
    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback()
      throw err
    }
  } catch (err) {
    console.error("Lỗi xóa phiếu mượn:", err)
    res.status(500).send("Lỗi xóa phiếu mượn: " + err.message)
  }
})
// API: Trả sách
app.post("/api/borrows/:loan_id/return", async (req, res) => {
  const { loan_id } = req.params
  const { return_date, items } = req.body

  try {
    const pool = await poolPromise

    // Begin transaction
    const transaction = new sql.Transaction(pool)
    await transaction.begin()

    try {
      // Update loan record
      await transaction
        .request()
        .input("loan_id", sql.VarChar(10), loan_id)
        .input("return_date", sql.Date, return_date)
        .query(`
          UPDATE Loan
          SET return_date = @return_date, loan_status = N'Đã trả'
          WHERE loan_id = @loan_id
        `)

      // Update document quantities
      for (const item of items) {
        await transaction
          .request()
          .input("document_id", sql.VarChar(10), item.document_id)
          .input("return_quantity", sql.Int, item.return_quantity)
          .query(`
            UPDATE Document
            SET document_quantity = document_quantity + @return_quantity
            WHERE document_id = @document_id
          `)

        // Insert return details (if needed)
        if ((item.return_quality !== null && item.return_quality >= 0) || item.violation_money >= 0 || item.return_quantity >= 0) {      
          await transaction
            .request()
            .input("loan_id", sql.VarChar(10), loan_id)
            .input("document_id", sql.VarChar(10), item.document_id)
            .input("return_quantity", sql.Int, item.return_quantity)
            .input("return_quality", sql.NVarChar(100), item.return_quality)
            .input("violation_money", sql.Decimal(10, 2), item.violation_money)
            .query(`
              UPDATE Loan_detail
              SET return_quantity = @return_quantity,
                  return_quality = @return_quality,
                  violation_money = @violation_money
              WHERE loan_id = @loan_id AND document_id = @document_id
            `)
        }
      }

      // Commit transaction
      await transaction.commit()

      res.send("Return processed successfully!")
    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback()
      throw err
    }
  } catch (err) {
    console.error("Error processing return:", err)
    res.status(500).send("Error processing return: " + err.message)
  }
})
// API: Lấy lịch sử mượn trả của độc giả
app.get("/api/readers/:reader_id/loan", async (req, res) => {
  const { reader_id } = req.params
  try {
    const pool = await poolPromise
    const result = await pool
      .request()
      .input("reader_id", sql.VarChar(10), reader_id)
      .query(`
        SELECT 
          l.loan_id, 
          l.borrow_date, 
          l.due_date, 
          l.return_date, 
          l.loan_status,
          (SELECT SUM(deposit_money) FROM Loan_detail WHERE loan_id = l.loan_id) as total_deposit
        FROM Loan l
        WHERE l.reader_id = @reader_id
        ORDER BY l.borrow_date DESC
      `)

    res.json(result.recordset)
  } catch (err) {
    console.error("Lỗi lấy lịch sử mượn trả:", err)
    res.status(500).send("Lỗi khi lấy lịch sử mượn trả: " + err.message)
  }
})
// -------------------- BÁO CÁO THỐNG KÊ -------------------- //
// API: Báo cáo thống kê về độc giả
app.get("/api/reports/readers", async (req, res) => {
  try {
    const pool = await poolPromise

    // Tổng số độc giả
    const totalReadersResult = await pool.request().query("SELECT COUNT(*) as count FROM Reader")

    // Số độc giả mới trong tháng hiện tại
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

    const newReadersResult = await pool
      .request()
      .input("firstDay", sql.Date, firstDayOfMonth)
      .query(`
        SELECT COUNT(*) as count 
        FROM Reader 
        WHERE reader_dateadd >= @firstDay
      `)

    // Thống kê số độc giả theo tháng trong năm hiện tại
    const readersMonthlyResult = await pool
      .request()
      .input("year", sql.Int, currentDate.getFullYear())
      .query(`
        SELECT MONTH(reader_dateadd) as month, COUNT(*) as count
        FROM Reader
        WHERE YEAR(reader_dateadd) = @year
        GROUP BY MONTH(reader_dateadd)
        ORDER BY month
      `)

    // Thống kê số lần đăng nhập
    const loginCountResult = await pool.request().query(`
        SELECT 
          r.reader_id,
          r.reader_name,
          COUNT(l.login_id) as login_count
        FROM 
          Reader r
        LEFT JOIN 
          Account a ON r.reader_id = a.reader_id
        LEFT JOIN 
          LoginHistory l ON a.account_name = l.account_name
        GROUP BY 
          r.reader_id, r.reader_name
        ORDER BY 
          login_count DESC
      `)

    // Kết quả trả về
    const result = {
      totalReaders: totalReadersResult.recordset[0].count,
      newReaders: newReadersResult.recordset[0].count,
      readersMonthly: readersMonthlyResult.recordset,
      loginStats: loginCountResult.recordset,
    }

    res.json(result)
  } catch (err) {
    res.status(500).send("Lỗi khi lấy báo cáo độc giả: " + err.message)
  }
})
// API: Gia hạn phiếu mượn
app.post("/api/borrows/:loan_id/extend", async (req, res) => {
  const { loan_id } = req.params

  try {
    const pool = await poolPromise

    // Kiểm tra phiếu mượn có tồn tại không
    const checkResult = await pool
      .request()
      .input("loan_id", sql.VarChar(10), loan_id)
      .query(`
        SELECT due_date, loan_status, is_extended FROM Loan
        WHERE loan_id = @loan_id
      `)

    if (checkResult.recordset.length === 0) {
      return res.status(404).send("Không tìm thấy phiếu mượn")
    }

    const loan = checkResult.recordset[0]

    // Kiểm tra trạng thái phiếu mượn
    if (loan.loan_status !== "Đang mượn") {
      return res.status(400).send("Chỉ có thể gia hạn phiếu mượn đang trong trạng thái mượn")
    }

    if (loan.is_extended) {
      return res.status(400).send("Phiếu mượn này đã được gia hạn 1 lần rồi")
    }

    // Tính ngày trả mới (thêm 7 ngày)
    const currentDueDate = new Date(loan.due_date)
    const newDueDate = new Date(currentDueDate)
    newDueDate.setDate(newDueDate.getDate() + 7)

    // Cập nhật ngày trả mới
    await pool
      .request()
      .input("loan_id", sql.VarChar(10), loan_id)
      .input("new_due_date", sql.Date, newDueDate)
      .input("is_extended", sql.Bit, 1)
      .query(`
        UPDATE Loan
        SET due_date = @new_due_date,
        is_extended = @is_extended
        WHERE loan_id = @loan_id
      `)

    res.send("Gia hạn phiếu mượn thành công!")
  } catch (err) {
    console.error("Lỗi gia hạn phiếu mượn:", err)
    res.status(500).send("Lỗi gia hạn phiếu mượn: " + err.message)
  }
})
// API: Tìm kiếm phiếu mượn - ĐẶT TRƯỚC các route cụ thể
app.get("/api/borrows/search", async (req, res) => {
  const { keyword, reader_id } = req.query
  try {
    const pool = await poolPromise
    const result = await pool
      .request()
      .input("keyword", sql.VarChar(50), `%${keyword}%`)
      .input("reader_id", sql.VarChar(10), reader_id)
      .query(`
        SELECT 
          l.loan_id, 
          l.borrow_date, 
          l.due_date, 
          l.return_date, 
          l.loan_status,
          (SELECT SUM(deposit_money) FROM Loan_detail WHERE loan_id = l.loan_id) as total_deposit
        FROM Loan l
        WHERE l.reader_id = @reader_id AND (l.loan_id LIKE @keyword)
        ORDER BY l.borrow_date DESC
      `)

    res.json(result.recordset)
  } catch (err) {
    console.error("Lỗi tìm kiếm phiếu mượn:", err)
    res.status(500).send("Lỗi khi tìm kiếm phiếu mượn: " + err.message)
  }
})
// API: Tìm kiếm tài liệu - ĐẶT TRƯỚC các route cụ thể
app.get("/api/documents/search", async (req, res) => {
  const { keyword, type } = req.query
  if (!keyword) {
    return res.status(400).send("Từ khóa tìm kiếm không được để trống")
  }

  try {
    const pool = await poolPromise
    let query = "SELECT * FROM Document WHERE "

    switch (type) {
      case "author":
        query += "document_author LIKE @keyword"
        break
      case "category":
        query += "document_category LIKE @keyword"
        break
      case "publisher":
        query += "document_publish LIKE @keyword"
        break
      default:
        query += "document_name LIKE @keyword"
    }

    const result = await pool.request().input("keyword", sql.NVarChar(255), `%${keyword}%`).query(query)

    res.json(result.recordset)
  } catch (err) {
    console.error("Lỗi tìm kiếm tài liệu:", err)
    res.status(500).send("Lỗi khi tìm kiếm tài liệu: " + err.message)
  }
})
// -------------------- KHỞI ĐỘNG SERVER -------------------- //
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});