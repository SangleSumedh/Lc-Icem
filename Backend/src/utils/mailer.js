import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

// Email configuration optimized for slow servers
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.COLLEGE_EMAIL,
    pass: process.env.COLLEGE_PASS,
  },
  // Connection pooling for better performance
  pool: true,
  maxConnections: 3, // Reduced for slow servers
  maxMessages: 50,
  // Remove timeouts for slow servers
  connectionTimeout: 0, // No timeout
  greetingTimeout: 0, // No timeout
  socketTimeout: 0, // No timeout
  // Retry logic
  retries: 2, // Reduced retries
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error);
  } else {
    console.log("✅ Email transporter is ready to send messages");
  }
});

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  attachments = [],
  cc = [],
  bcc = [],
  replyTo = process.env.COLLEGE_EMAIL,
}) => {
  try {
    // Validate required fields
    if (!to) {
      throw new Error("Recipient email address (to) is required");
    }

    if (!subject) {
      throw new Error("Email subject is required");
    }

    if (!text && !html) {
      throw new Error("Email content (text or html) is required");
    }

    // Validate email format for recipients
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const recipients = Array.isArray(to) ? to : [to];
    const invalidRecipients = recipients.filter(
      (email) => !validateEmail(email)
    );

    if (invalidRecipients.length > 0) {
      throw new Error(
        `Invalid email addresses: ${invalidRecipients.join(", ")}`
      );
    }

    const mailOptions = {
      from: `"LC-ICEM Portal" <${process.env.COLLEGE_EMAIL}>`,
      to: recipients.join(", "),
      subject: subject.trim(),
      text: text?.trim(),
      html: html?.trim(),
      attachments,
      cc: cc.length > 0 ? cc.join(", ") : undefined,
      bcc: bcc.length > 0 ? bcc.join(", ") : undefined,
      replyTo,
      // Add headers for better email deliverability
      headers: {
        "X-Priority": "3",
        "X-Mailer": "LC-ICEM Portal 1.0",
      },
    };

    console.log(`📧 Attempting to send email to: ${recipients.join(", ")}`);
    console.log(`📝 Subject: ${subject}`);

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully:", {
      messageId: info.messageId,
      to: recipients,
      subject,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (err) {
    console.error("❌ Error sending email:", {
      error: err.message,
      to,
      subject,
      timestamp: new Date().toISOString(),
    });

    // Enhanced error handling with specific error messages
    let userFriendlyError = "Failed to send email. Please try again later.";

    if (err.code === "EAUTH") {
      userFriendlyError =
        "Email authentication failed. Please check email credentials.";
    } else if (err.code === "ECONNECTION") {
      userFriendlyError =
        "Cannot connect to email server. Please check your internet connection.";
    } else if (err.message.includes("Invalid login")) {
      userFriendlyError = "Email login credentials are invalid.";
    } else if (err.message.includes("Recipient address")) {
      userFriendlyError = "Invalid recipient email address.";
    }

    throw new Error(userFriendlyError);
  }
};

// Utility function for sending bulk emails with minimal delay
export const sendBulkEmail = async (
  emailDataArray,
  delayBetweenEmails = 500 // Reduced delay for slow servers
) => {
  const results = {
    successful: [],
    failed: [],
    total: emailDataArray.length,
  };

  for (let i = 0; i < emailDataArray.length; i++) {
    const emailData = emailDataArray[i];

    try {
      const result = await sendEmail(emailData);
      results.successful.push({
        to: emailData.to,
        messageId: result.messageId,
      });
      console.log(`✅ Sent ${i + 1}/${emailDataArray.length} emails`);
    } catch (error) {
      results.failed.push({
        to: emailData.to,
        error: error.message,
      });
      console.error(
        `❌ Failed to send email ${i + 1}/${emailDataArray.length}:`,
        error.message
      );
    }

    // Minimal delay between emails for slow servers
    if (i < emailDataArray.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenEmails));
    }
  }

  return results;
};

// Utility function to check email service status
export const checkEmailServiceStatus = async () => {
  try {
    await transporter.verify();
    return {
      status: "healthy",
      message: "Email service is operational",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// Template for common email types
export const emailTemplates = {
  staffCredentials: (name, email, password) => ({
    subject: "Your Staff Account Credentials - LC-ICEM Portal",
    text: `Hi ${name}, Your staff account has been created. Email: ${email} | Password: ${password}`,
    html: `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Account Created - LC-ICEM Portal</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 0;">
        <tr>
            <td align="center">
                <!-- Header with Branding -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0; padding: 30px;">
                    <tr>
                        <td align="center">
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">LC-ICEM Portal</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Staff Account Activation</p>
                        </td>
                    </tr>
                </table>

                <!-- Main Content Card -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 0 0 12px 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px;">
                            <!-- Welcome Icon -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <div style="background: #10b981; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                                <path d="M9 12l2 2 4-4"/>
                                            </svg>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Title -->
                            <h2 style="color: #1f2937; text-align: center; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">
                                Staff Account Created Successfully
                            </h2>

                            <!-- Greeting -->
                            <p style="color: #6b7280; text-align: center; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Welcome to the <strong style="color: #374151;">LC-ICEM Portal</strong>, 
                                <strong style="color: #4f46e5;">${name}</strong>
                            </p>

                            <!-- Introduction -->
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                Your staff account has been successfully created. You now have access to the Leaving Certificate management system of Indira College of Engineering and Management.
                            </p>

                            <!-- Credentials Card -->
                            <div style="background: #f0f9ff; border: 1px solid #e0f2fe; border-radius: 8px; padding: 25px; margin: 25px 0;">
                                <h3 style="color: #0369a1; margin: 0 0 20px 0; font-size: 18px; text-align: center;">
                                    🔐 Your Login Credentials
                                </h3>
                                
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td width="30%" style="padding: 8px 0;">
                                            <strong style="color: #075985;">Email:</strong>
                                        </td>
                                        <td style="padding: 8px 0;">
                                            <code style="background: #ffffff; padding: 6px 12px; border-radius: 4px; color: #0c4a6e; font-weight: 600; border: 1px solid #bae6fd;">
                                                ${email}
                                            </code>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="30%" style="padding: 8px 0;">
                                            <strong style="color: #075985;">Password:</strong>
                                        </td>
                                        <td style="padding: 8px 0;">
                                            <code style="background: #ffffff; padding: 6px 12px; border-radius: 4px; color: #0c4a6e; font-weight: 600; border: 1px solid #bae6fd;">
                                                ${password}
                                            </code>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Security Notice -->
                            <div style="background: #fefce8; border: 1px solid #fef08a; padding: 16px; border-radius: 8px; margin: 25px 0;">
                                <p style="color: #854d0e; margin: 0; font-size: 14px; text-align: center;">
                                    <strong>🔒 Security Notice:</strong> For security reasons, please change your password immediately after first login.
                                </p>
                            </div>

                            <!-- Action Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="https://lc-icem-sumedh.vercel.app" 
                                           target="_blank"
                                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                                  color: white; 
                                                  text-decoration: none; 
                                                  padding: 16px 32px; 
                                                  border-radius: 8px; 
                                                  font-weight: 600; 
                                                  font-size: 16px;
                                                  display: inline-block;
                                                  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                                                  transition: all 0.3s ease;">
                                            🚀 Access LC-ICEM Portal
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Portal Features -->
                            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <h4 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; text-align: center;">
                                    📋 Portal Features Available:
                                </h4>
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td align="center" width="33%" style="padding: 10px;">
                                            <div style="color: #059669; font-size: 14px;">• Student Management</div>
                                        </td>
                                        <td align="center" width="33%" style="padding: 10px;">
                                            <div style="color: #059669; font-size: 14px;">• LC Generation</div>
                                        </td>
                                        <td align="center" width="33%" style="padding: 10px;">
                                            <div style="color: #059669; font-size: 14px;">• Document Tracking</div>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Support Information -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                                <tr>
                                    <td align="center">
                                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                                            Need assistance? Contact the admin team:
                                        </p>
                                        <p style="color: #374151; font-size: 14px; margin: 0; font-weight: 600;">
                                            📧 admin@indiraicem.ac.in | 📞 System Administrator
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                    <tr>
                        <td align="center">
                            <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                                This account provides access to the LC-ICEM Portal for official college use only.<br>
                                &copy; ${new Date().getFullYear()} Indira College of Engineering and Management. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,
  }),

  lcReady: (studentName, prn, lcUrl) => ({
    subject: "Your Leaving Certificate is Ready! - ICEM",
    text: `Dear ${studentName}, your LC is generated. Download it from: ${lcUrl}`,
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaving Certificate Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 0;">
        <tr>
            <td align="center">
                <!-- Header with College Branding -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0; padding: 30px;">
                    <tr>
                        <td align="center">
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Indira College of Engineering and Management</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Leaving Certificate Department</p>
                        </td>
                    </tr>
                </table>

                <!-- Main Content Card -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 0 0 12px 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px;">
                            <!-- Success Icon -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <div style="background: #10b981; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                                <path d="M20 6L9 17l-5-5"/>
                                            </svg>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Title -->
                            <h2 style="color: #1f2937; text-align: center; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">
                                Leaving Certificate Generated Successfully
                            </h2>

                            <!-- Student Greeting -->
                            <p style="color: #6b7280; text-align: center; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Dear <strong style="color: #374151;">${studentName}</strong>,
                            </p>

                            <!-- Main Message -->
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                We are pleased to inform you that your Leaving Certificate has been officially generated and is now ready for access. This document has been verified by the college administration. Please Download the LC within 7 days of generation else the LC will be deleted from cloud.
                                Visit Registrar office at ICEM to collect official document.
                            </p>

                            <!-- Important Information -->
                            <div style="background: #f0f9ff; border-left: 4px solid #0369a1; padding: 20px; margin: 25px 0; border-radius: 4px;">
                                <p style="color: #075985; margin: 0; font-size: 14px; font-weight: 600;">Important Information:</p>
                                <ul style="color: #075985; margin: 8px 0 0 0; padding-left: 20px; font-size: 14px;">
                                    <li>PRN: <strong>${prn}</strong></li>
                                    <li>Certificate generated on: <strong>${new Date().toLocaleDateString(
                                      "en-IN",
                                      {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )}</strong></li>
                                    <li>This is an electronically generated document</li>
                                </ul>
                            </div>

                            <!-- Action Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${lcUrl}" 
                                           target="_blank"
                                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                                  color: white; 
                                                  text-decoration: none; 
                                                  padding: 16px 32px; 
                                                  border-radius: 8px; 
                                                  font-weight: 600; 
                                                  font-size: 16px;
                                                  display: inline-block;
                                                  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                                                  transition: all 0.3s ease;">
                                            📄 Download Leaving Certificate
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Additional Instructions -->
                            <div style="background: #fefce8; border: 1px solid #fef08a; padding: 16px; border-radius: 8px; margin: 25px 0;">
                                <p style="color: #854d0e; margin: 0; font-size: 14px; text-align: center;">
                                    <strong>Note:</strong> The attached PDF contains your official Leaving Certificate. 
                                    Please keep this document safe for future reference.
                                </p>
                            </div>

                            <!-- Contact Information -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                                <tr>
                                    <td align="center">
                                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                                            For any queries, please contact:
                                        </p>
                                        <p style="color: #374151; font-size: 14px; margin: 0; font-weight: 600;">
                                            Registrar Office • Indira College of Engineering and Management<br>
                                            Email: registrar@indiraicem.ac.in • Phone: +91-20-12345678
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                    <tr>
                        <td align="center">
                            <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                                This is an auto-generated email. Please do not reply to this message.<br>
                                &copy; ${new Date().getFullYear()} Indira College of Engineering and Management. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,
  }),
};

export default {
  sendEmail,
  sendBulkEmail,
  checkEmailServiceStatus,
  emailTemplates,
};
