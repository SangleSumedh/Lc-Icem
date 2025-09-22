// import prisma from "./src/prisma.js";
// import bcrypt from "bcrypt";

// const main = async () => {
//   try {
//     const username = "superadmin";
//     const email = "admin@example.com";
//     const password = "supersecret";

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const superAdmin = await prisma.superAdmin.create({
//       data: {
//         username,
//         email,
//         password: hashedPassword,
//       },
//     });

//     console.log("✅ SuperAdmin created:", superAdmin);
//   } catch (err) {
//     console.error("Error creating SuperAdmin:", err.message);
//   } finally {
//     await prisma.$disconnect();
//   }
// };

// main();
