-- TẠO DATABASE LIBRARYMANAGEMENT
CREATE DATABASE LibraryManagement;
GO

USE LibraryManagement;
GO
-- TẠO BẢNG READER
CREATE TABLE Reader (
    reader_id VARCHAR(10) PRIMARY KEY,
    reader_name NVARCHAR(100) NOT NULL,
    reader_gender NVARCHAR(3) NOT NULL CHECK (reader_gender IN (N'Nam', N'Nữ')),
    reader_birth DATE NOT NULL,
    reader_cccd CHAR(12) NOT NULL UNIQUE,
    reader_phone CHAR(10) NOT NULL UNIQUE,
    reader_email VARCHAR(255) NOT NULL UNIQUE,
    reader_address NVARCHAR(200),
    reader_dateadd DATETIME
);
GO
-- TẠO BẢNG DOCUMENT
CREATE TABLE Document (
    document_id VARCHAR(10) PRIMARY KEY,
    document_name NVARCHAR(255) NOT NULL,
    document_publish NVARCHAR(255),
    document_category NVARCHAR(100),
    document_author NVARCHAR(255),
    document_quantity INT DEFAULT 0 CHECK (document_quantity >= 0),
    document_date DATE,
    document_value DECIMAL(10, 0),
    document_describe NVARCHAR(500)
);
GO
-- TẠO BẢNG ACCOUNT
CREATE TABLE Account (
    account_name VARCHAR(10) PRIMARY KEY,
    reader_id VARCHAR(10),
    account_owner NVARCHAR(100) NOT NULL,
    account_password VARCHAR(30) NOT NULL,
    account_email VARCHAR(100) NOT NULL UNIQUE,
    account_role NVARCHAR(10) NOT NULL CHECK (account_role IN (N'Thủ thư', N'Độc giả')),
    account_dateadd DATETIME,
    login_count INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_Account_Reader FOREIGN KEY (reader_id) 
        REFERENCES Reader(reader_id) 
        ON DELETE CASCADE
);
GO
-- TẠO BẢNG LOAN
CREATE TABLE Loan (
    loan_id VARCHAR(10) PRIMARY KEY,
    reader_id VARCHAR(10) NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    notes NVARCHAR(500),
    loan_status NVARCHAR(20) NOT NULL CHECK (loan_status IN (N'Đang mượn', N'Đã trả', N'Quá hạn')),
    is_extended BIT NOT NULL,
    CONSTRAINT FK_Loan_Reader FOREIGN KEY (reader_id) 
        REFERENCES Reader(reader_id) 
        ON DELETE CASCADE
);
GO
-- TẠO BẢNG LOAN_DETAIL
CREATE TABLE Loan_detail (
    loan_id VARCHAR(10) NOT NULL,
    document_id VARCHAR(10) NOT NULL,
    borrow_quantity INT DEFAULT 0,
    deposit_money DECIMAL(10,2),
    return_quantity INT DEFAULT 0,
    return_quality NVARCHAR(100),
    violation_money DECIMAL(10,2),
    PRIMARY KEY (loan_id, document_id),
    CONSTRAINT FK_Loan_deta_loan_619B8048 FOREIGN KEY (loan_id) 
        REFERENCES Loan(loan_id)
        ON DELETE CASCADE,
    CONSTRAINT FK_Loan_deta_document FOREIGN KEY (document_id) 
        REFERENCES Document(document_id)
        ON DELETE CASCADE
);
GO
-- TẠO STORED PROCEDUCE: câp nhật lại trạng thái phiếu mượn
CREATE PROCEDURE sp_UpdateLoanStatus
AS
BEGIN
    UPDATE Loan
    SET loan_status =
        CASE
            WHEN return_date IS NOT NULL THEN N'Đã trả'
            WHEN return_date IS NULL AND GETDATE() <= due_date THEN N'Đang mượn'
            WHEN return_date IS NULL AND GETDATE() > due_date THEN N'Quá hạn'
            ELSE N'Không xác định'
        END
END
-- TRIGGER: khi có phiếu mượn quá hạn thì cập nhật lại trạng thái phiếu mượn
CREATE TRIGGER trg_PreventDeleteReaderWithActiveLoans
ON Reader
INSTEAD OF DELETE
AS
BEGIN
    -- Kiểm tra độc giả bị xóa có phiếu mượn chưa trả hay không
    IF EXISTS (
        SELECT 1
        FROM Loan l
        JOIN deleted d ON l.reader_id = d.reader_id
        WHERE l.loan_status IN (N'Đang mượn', N'Quá hạn')
    )
    BEGIN
        RAISERROR(N'Không thể xóa độc giả vì đang có phiếu mượn chưa hoàn tất.', 16, 1)
        RETURN
    END

    -- Nếu không vi phạm, thực hiện xóa
    DELETE FROM Reader
    WHERE reader_id IN (SELECT reader_id FROM deleted)
END
-- TRIGGER: không cho phép xóa tài liệu khi có phiếu mượn
CREATE TRIGGER trg_PreventDeleteDocumentWithActiveLoans
ON Document
INSTEAD OF DELETE
AS
BEGIN
    -- Kiểm tra nếu tài liệu đang được mượn hoặc quá hạn
    IF EXISTS (
        SELECT 1
        FROM Loan_detail ld
        JOIN Loan l ON ld.loan_id = l.loan_id
        WHERE ld.document_id IN (SELECT document_id FROM deleted)
        AND (l.loan_status = 'Đang mượn' OR l.loan_status = 'Quá hạn')
    )
    BEGIN
        PRINT 'Không thể xóa tài liệu này vì nó đang được mượn hoặc quá hạn.'
    END
    ELSE
    BEGIN
        -- Nếu không có phiếu mượn, cho phép xóa tài liệu
        DELETE FROM Document WHERE document_id IN (SELECT document_id FROM deleted)
    END
END