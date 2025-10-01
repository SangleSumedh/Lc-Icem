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
      // 1️⃣ Create the department
      const department = await prisma.department.create({
        data: {
          deptName: `HOD - ${dept}`,
          branchId,
          college: "ICEM",
        },
      });

      // 2️⃣ Create the HOD staff
      const safeName = dept
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
      const email = `${safeName}@example.com`;
      const passwordHash = await bcrypt.hash("password123", 10);

      const hodStaff = await prisma.staff.create({
        data: {
          name: `HOD ${dept}`,
          email,
          passwordHash,
          deptId: department.deptId,
        },
      });

      // 3️⃣ Link department head
      await prisma.department.update({
        where: { deptId: department.deptId },
        data: { deptHeadId: hodStaff.staffId },
      });

      console.log(
        `✅ HOD Department: ${department.deptName} | Head: ${hodStaff.name}`
      );
      branchId++;
    }

    // --- Add HOD - MBA for IGSB ---
    const igsbDeptName = "HOD - MBA";
    const igsbDepartment = await prisma.department.create({
      data: {
        deptName: igsbDeptName,
        branchId: branchId, // incremented branchId
        college: "IGSB",
      },
    });

    const igsbSafeName = "mba_igsb";
    const igsbEmail = `${igsbSafeName}@example.com`;
    const igsbPasswordHash = await bcrypt.hash("password123", 10);

    const igsbHodStaff = await prisma.staff.create({
      data: {
        name: igsbDeptName,
        email: igsbEmail,
        passwordHash: igsbPasswordHash,
        deptId: igsbDepartment.deptId,
      },
    });

    await prisma.department.update({
      where: { deptId: igsbDepartment.deptId },
      data: { deptHeadId: igsbHodStaff.staffId },
    });

    console.log(
      `✅ HOD Department: ${igsbDepartment.deptName} | Head: ${igsbHodStaff.name}`
    );

    console.log("🎉 All HOD Departments seeding complete!");
  } catch (err) {
    console.error("❌ Error seeding HOD departments:", err);
  } finally {
    await prisma.$disconnect();
  }
};

main();
