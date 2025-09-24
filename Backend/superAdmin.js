import prisma from "./src/prisma.js";
import bcrypt from "bcrypt";
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
      create: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log("✅ SuperAdmin ready:", superAdmin);

    // --- Departments creation ---
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
    ];

    for (const deptName of departments) {
      // Make safe identifiers
      const safeName = deptName
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
      const username = `${safeName}_dept`;
      const email = `${safeName}@example.com`;
      const passwordHash = await bcrypt.hash("password123", 10);

      // Dept head string (e.g., "HeadAccount", "HeadLibrary")
      const headBase = deptName.split(" ")[0].replace(/[^a-zA-Z]/g, ""); // take first word only
      const deptHead = `Head${headBase}`;

      const department = await prisma.department.upsert({
        where: { email },
        update: {},
        create: {
          deptName,
          deptHead,
          branchId: null,
          username,
          email,
          passwordHash,
        },
      });

      console.log(
        `✅ Department ensured: ${department.deptName} | Head: ${deptHead}`
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

