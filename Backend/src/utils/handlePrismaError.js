// utils/handlePrismaError.js

export const handlePrismaError = (err, context = {}) => {
  let userFriendlyMessage = "An unexpected error occurred.";
  let statusCode = 500;

  // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference
  switch (err.code) {
    // Unique constraint violations
    case "P2002":
      const uniqueField = err.meta?.target?.[0];
      const fieldNames = {
        email: "Email address",
        prn: "PRN",
        username: "Username",
        phoneNo: "Phone number",
        deptName: "Department name",
        ticketId: "Ticket ID",
        staffId: "Staff ID",
        approvalId: "Approval ID",
      };

      const fieldName = fieldNames[uniqueField] || "This information";
      userFriendlyMessage = `${fieldName} already exists. Please use a different value.`;
      statusCode = 409;
      break;

    // Foreign key constraint violations
    case "P2003":
      userFriendlyMessage =
        "Invalid reference. The related record does not exist.";
      statusCode = 400;
      break;

    // Record not found
    case "P2025":
      userFriendlyMessage = "Requested record not found.";
      statusCode = 404;
      break;

    // Null constraint violation
    case "P2011":
      userFriendlyMessage = "Required field cannot be empty.";
      statusCode = 400;
      break;

    // Missing required value
    case "P2012":
      userFriendlyMessage = "Missing required field in the input data.";
      statusCode = 400;
      break;

    // Missing required argument
    case "P2013":
      userFriendlyMessage = "Missing required argument in the query.";
      statusCode = 400;
      break;

    // Required relation violation
    case "P2014":
      userFriendlyMessage =
        "Cannot perform this operation due to existing relationships.";
      statusCode = 409;
      break;

    // Query interpretation error
    case "P2016":
      userFriendlyMessage =
        "Query interpretation error. Please check your parameters.";
      statusCode = 400;
      break;

    // Value too long for column
    case "P2000":
      userFriendlyMessage = "The value provided is too long for the field.";
      statusCode = 400;
      break;

    // Database query execution errors
    case "P2010":
      userFriendlyMessage = "Database query failed. Please contact support.";
      statusCode = 500;
      break;

    // Database connection errors
    case "P1001":
      userFriendlyMessage =
        "Database server is unavailable. Please try again later.";
      statusCode = 503;
      break;

    case "P1002":
      userFriendlyMessage = "Database connection timed out. Please try again.";
      statusCode = 408;
      break;

    case "P1008":
      userFriendlyMessage =
        "Database operation timed out. Please try again later.";
      statusCode = 408;
      break;

    case "P1017":
      userFriendlyMessage =
        "Database connection closed unexpectedly. Please retry.";
      statusCode = 503;
      break;

    case "P1011":
      userFriendlyMessage =
        "Error opening a TLS connection. Please contact support.";
      statusCode = 500;
      break;

    case "P1012":
      userFriendlyMessage =
        "Database schema validation error. Please contact support.";
      statusCode = 500;
      break;

    // Database initialization errors
    case "P1000":
      userFriendlyMessage =
        "Authentication failed for database. Please contact admin.";
      statusCode = 500;
      break;

    case "P1003":
      userFriendlyMessage = "Database does not exist. Please contact admin.";
      statusCode = 500;
      break;

    case "P1009":
      userFriendlyMessage = "Database already exists. Please contact admin.";
      statusCode = 500;
      break;

    case "P1010":
      userFriendlyMessage =
        "Database user was denied access. Please contact admin.";
      statusCode = 500;
      break;

    // Transaction errors
    case "P2028":
      userFriendlyMessage = "Transaction error occurred. Please try again.";
      statusCode = 500;
      break;

    case "P2034":
      userFriendlyMessage = "Transaction failed. Please try again.";
      statusCode = 500;
      break;

    // Raw query errors
    case "P2017":
      userFriendlyMessage = "Database records are not connected.";
      statusCode = 400;
      break;

    case "P2018":
      userFriendlyMessage = "Required connected records were not found.";
      statusCode = 404;
      break;

    case "P2019":
      userFriendlyMessage = "Input error. Please check your data.";
      statusCode = 400;
      break;

    case "P2020":
      userFriendlyMessage = "Value out of range for the field type.";
      statusCode = 400;
      break;

    case "P2021":
      userFriendlyMessage =
        "Database table does not exist. Please contact support.";
      statusCode = 500;
      break;

    case "P2022":
      userFriendlyMessage =
        "Database column does not exist. Please contact support.";
      statusCode = 500;
      break;

    // Migration errors
    case "P3000":
      userFriendlyMessage =
        "Database migration failed. Please contact support.";
      statusCode = 500;
      break;

    case "P3001":
      userFriendlyMessage =
        "Migration possible with destructive changes. Please contact admin.";
      statusCode = 500;
      break;

    case "P3002":
      userFriendlyMessage = "Migration rolled back. Please contact support.";
      statusCode = 500;
      break;

    case "P3003":
      userFriendlyMessage = "Database format changed. Please contact support.";
      statusCode = 500;
      break;

    case "P3004":
      userFriendlyMessage = "Migration system changed. Please contact support.";
      statusCode = 500;
      break;

    case "P3005":
      userFriendlyMessage =
        "Database schema is not empty. Please contact admin.";
      statusCode = 500;
      break;

    case "P3006":
      userFriendlyMessage =
        "Migration failed to apply. Please contact support.";
      statusCode = 500;
      break;

    case "P3007":
      userFriendlyMessage =
        "Preview feature not enabled. Please contact admin.";
      statusCode = 500;
      break;

    case "P3008":
      userFriendlyMessage =
        "Migration already applied. Please contact support.";
      statusCode = 500;
      break;

    case "P3009":
      userFriendlyMessage = "Failed migrations found. Please contact support.";
      statusCode = 500;
      break;

    case "P3010":
      userFriendlyMessage = "Migration name too long. Please contact support.";
      statusCode = 500;
      break;

    case "P3011":
      userFriendlyMessage =
        "Migration cannot be rolled back. Please contact support.";
      statusCode = 500;
      break;

    case "P3012":
      userFriendlyMessage =
        "Migration is not in a failed state. Please contact support.";
      statusCode = 500;
      break;

    case "P3013":
      userFriendlyMessage =
        "Datasource provider not supported. Please contact admin.";
      statusCode = 500;
      break;

    case "P3014":
      userFriendlyMessage =
        "Preview feature not available. Please contact admin.";
      statusCode = 500;
      break;

    case "P3015":
      userFriendlyMessage = "Missing valid migration. Please contact support.";
      statusCode = 500;
      break;

    case "P3016":
      userFriendlyMessage =
        "Fallback migration failed. Please contact support.";
      statusCode = 500;
      break;

    case "P3017":
      userFriendlyMessage =
        "Cannot connect to shadow database. Please contact admin.";
      statusCode = 500;
      break;

    case "P3018":
      userFriendlyMessage =
        "Migration failed to apply. Please contact support.";
      statusCode = 500;
      break;

    case "P3019":
      userFriendlyMessage =
        "Datasource provider mismatch. Please contact admin.";
      statusCode = 500;
      break;

    default:
      // Prisma validation and runtime errors
      if (err.name === "PrismaClientValidationError") {
        userFriendlyMessage =
          "Invalid data provided. Please verify your input.";
        statusCode = 400;
      } else if (err.name === "PrismaClientInitializationError") {
        userFriendlyMessage =
          "Database connection failed. Please contact system administrator.";
        statusCode = 500;
      } else if (err.name === "PrismaClientKnownRequestError") {
        userFriendlyMessage = "Database request error. Please try again.";
        statusCode = 400;
      } else if (err.name === "PrismaClientUnknownRequestError") {
        userFriendlyMessage = "Unknown database error. Please contact support.";
        statusCode = 500;
      } else if (err.name === "PrismaClientRustPanicError") {
        userFriendlyMessage =
          "Database engine error. Please contact support immediately.";
        statusCode = 500;
      } else if (err.name === "TypeError") {
        userFriendlyMessage =
          "Invalid data type encountered. Please check your input.";
        statusCode = 400;
      } else if (err.name === "SyntaxError") {
        userFriendlyMessage = "Malformed input or query syntax error.";
        statusCode = 400;
      } else if (err.name === "RangeError") {
        userFriendlyMessage = "Value out of acceptable range.";
        statusCode = 400;
      } else if (err.name === "ReferenceError") {
        userFriendlyMessage = "Reference error in the application.";
        statusCode = 500;
      } else if (err.name === "URIError") {
        userFriendlyMessage = "Invalid URI format.";
        statusCode = 400;
      }
      break;
  }

  // 🧾 Log detailed diagnostic info (for internal monitoring)
  console.error("📦 Prisma Error Details:", {
    code: err.code,
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    timestamp: new Date().toISOString(),
    ...context,
  });

  return { message: userFriendlyMessage, statusCode };
};
