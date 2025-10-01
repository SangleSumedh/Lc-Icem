import prisma from "./src/prisma.js";
import bcrypt from "bcrypt";

const main = async () => {
  try {
    // --- SuperAdmin creation ---
    const username = "sumedh";
    const email = "sumedh@example.com";
    const password = "supersecret";
    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await prisma.superAdmin.upsert({
      where: { email },
      update: {},
      create: { username, email, password: hashedPassword },
    });

    console.log("✅ SuperAdmin ready:", superAdmin);

    // --- Departments & HOD Staff creation ---
    const departments = [
      "Account",
      "Library",
      "Alumni Co-Coordinator",
      "Central Placement Dept",
      "Dept. Placement Coordinator",
      "Scholarship",
      "Exam Section",
      "Hostel/Mess",
      "Bus Transport",
      "Registrar",
    ];

    for (const deptName of departments) {
      // 1️⃣ Create department
      const department = await prisma.department.create({
        data: {
          deptName,
          branchId: null,
          college: "ALL",
        },
      });

      // 2️⃣ Create HOD staff
      const hodEmail = `${department.deptName
        .replace(/\s+/g, "")
        .toLowerCase()}@example.com`;
      const hodUsername = `${department.deptName
        .replace(/\s+/g, "")
        .toLowerCase()}_hod`;
      const hodPasswordHash = await bcrypt.hash("password123", 10);

      const hodStaff = await prisma.staff.create({
        data: {
          name: `Head ${department.deptName}`,
          email: hodEmail,
          passwordHash: hodPasswordHash,
          deptId: department.deptId,
        },
      });


      // 3️⃣ Update department with HOD reference
      await prisma.department.update({
        where: { deptId: department.deptId },
        data: { deptHeadId: hodStaff.staffId },
      });

      console.log(
        `✅ Department: ${department.deptName} | HOD: ${hodStaff.name}`
      );
    }

    console.log("🎉 Initial seeding complete!");
  } catch (err) {
    console.error("❌ Error seeding data:", err.message);
  } finally {
    await prisma.$disconnect();
  }
};

main();
