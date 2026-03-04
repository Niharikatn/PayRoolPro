const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not your login password)
  },
});

exports.sendPayslipEmail = async ({ toEmail, employeeName, month, year, totalDays, presentDays, halfDays, absentDays, salaryPerDay, totalSalary }) => {
  const mailOptions = {
    from: `"PayrollPro" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `Your Salary Slip for ${month} ${year} — PayrollPro`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Salary Slip</title>
      </head>
      <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:560px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <div style="background:#080c14;padding:32px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <div style="width:40px;height:40px;background:linear-gradient(135deg,#eab308,#f59e0b);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#080c14;">₹</div>
              <span style="font-size:22px;font-weight:800;color:white;">Payroll<span style="color:#eab308;">Pro</span></span>
            </div>
            <div style="margin-top:16px;font-size:13px;color:#475569;text-transform:uppercase;letter-spacing:1px;">Salary Slip</div>
          </div>

          <!-- Employee Info -->
          <div style="padding:28px 32px 0;">
            <h2 style="margin:0 0 4px;font-size:20px;color:#0f172a;">Hi ${employeeName} 👋</h2>
            <p style="margin:0;font-size:14px;color:#64748b;">Here is your salary slip for <strong>${month} ${year}</strong>.</p>
          </div>

          <!-- Salary Card -->
          <div style="margin:24px 32px;background:linear-gradient(135deg,#1e3a5f,#2563eb);border-radius:14px;padding:24px;color:white;text-align:center;">
            <div style="font-size:13px;opacity:0.7;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Total Salary</div>
            <div style="font-size:42px;font-weight:800;">₹${Number(totalSalary).toLocaleString("en-IN")}</div>
            <div style="font-size:13px;opacity:0.7;margin-top:4px;">${month} ${year}</div>
          </div>

          <!-- Breakdown -->
          <div style="padding:0 32px 28px;">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f8fafc;">
                  <th style="padding:12px 16px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;border-bottom:2px solid #e2e8f0;">Detail</th>
                  <th style="padding:12px 16px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;border-bottom:2px solid #e2e8f0;">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style="padding:12px 16px;font-size:14px;color:#374151;border-bottom:1px solid #f1f5f9;">Working Days</td><td style="padding:12px 16px;font-size:14px;color:#374151;text-align:right;border-bottom:1px solid #f1f5f9;font-weight:600;">${totalDays}</td></tr>
                <tr style="background:#f8fafc;"><td style="padding:12px 16px;font-size:14px;color:#374151;border-bottom:1px solid #f1f5f9;">Days Present</td><td style="padding:12px 16px;font-size:14px;text-align:right;border-bottom:1px solid #f1f5f9;font-weight:600;color:#16a34a;">${presentDays}</td></tr>
                <tr><td style="padding:12px 16px;font-size:14px;color:#374151;border-bottom:1px solid #f1f5f9;">Half Days</td><td style="padding:12px 16px;font-size:14px;text-align:right;border-bottom:1px solid #f1f5f9;font-weight:600;color:#d97706;">${halfDays || 0}</td></tr>
                <tr style="background:#f8fafc;"><td style="padding:12px 16px;font-size:14px;color:#374151;border-bottom:1px solid #f1f5f9;">Days Absent</td><td style="padding:12px 16px;font-size:14px;text-align:right;border-bottom:1px solid #f1f5f9;font-weight:600;color:#dc2626;">${absentDays || 0}</td></tr>
                <tr><td style="padding:12px 16px;font-size:14px;color:#374151;">Salary Per Day</td><td style="padding:12px 16px;font-size:14px;text-align:right;font-weight:600;color:#374151;">₹${salaryPerDay}</td></tr>
              </tbody>
            </table>

            <!-- Total row -->
            <div style="margin-top:16px;background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:15px;font-weight:600;color:#0f172a;">Net Salary</span>
              <span style="font-size:22px;font-weight:800;color:#16a34a;">₹${Number(totalSalary).toLocaleString("en-IN")}</span>
            </div>
          </div>

          <!-- Footer -->
          <div style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">This is an auto-generated payslip from PayrollPro. Please do not reply to this email.</p>
          </div>

        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};