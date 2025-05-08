const sql = require('mssql');

// Cấu hình kết nối SQL Server
const config = {
  user: 'ad', // Thay bằng tên đăng nhập SQL Server
  password: '123', // Thay bằng mật khẩu SQL Server
  server: 'DESKTOP-872IH4O', // Thay bằng tên máy chủ (VD: localhost hoặc IP)
  database: 'LibraryManagement', // Tên cơ sở dữ liệu
  options: {
    encrypt: false, // Đặt thành true nếu sử dụng kết nối SSL
    enableArithAbort: true,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Kết nối SQL Server thành công!');
    return pool;
  })
  .catch(err => {
    console.error('Kết nối SQL Server thất bại!', err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise,
};