import prisma from "./src/prisma.js";
import bcrypt from "bcrypt";

const main = async () => {
  try {
    const hodDepartments = [
      "Civil Engineering",
      "Computer Engineering",
      "Mechanical Engineering",
      "Artificial Intelligence and Data Science",
      "Electronics and Telecommunication Engineering",
      "First Year Engineering",
      "Information Technology",
      "Integrated MBA (BBA+MBA)",
      "Integrated MCA (BCA+MCA)",
      "MBA",
      "MCA",
      "M.Tech in Mechanical Engineering",
      "M.Tech in Computer Engineering",
    ];

    let branchId = 1;

    for (const dept of hodDepartments) {
      const deptName = `HOD - ${dept}`;
      const safeName = dept
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
      const username = `hod_${safeName}`;
      const email = `${safeName}@example.com`;
      const passwordHash = await bcrypt.hash("password123", 10);

      // Dept head string (e.g. "HeadCivil", "HeadMBA")
      const headBase = dept.split(" ")[0].replace(/[^a-zA-Z]/g, "");
      const deptHead = `Head${headBase}`;

      const department = await prisma.department.upsert({
        where: { email },
        update: {},
        create: {
          deptName,
          deptHead,
          branchId,
          username,
          email,
          passwordHash,
        },
      });

      console.log(
        `✅ HOD Department: ${department.deptName} | Branch ID: ${branchId} | Head: ${deptHead}`
      );

      branchId++;
    }

    console.log("🎉 HOD Departments seeding complete!");
  } catch (err) {
    console.error("❌ Error seeding HOD departments:", err.message);
  } finally {
    await prisma.$disconnect();
  }
};

main();
