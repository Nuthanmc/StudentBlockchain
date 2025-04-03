const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StudentResultSystem", function () {
    let studentResultSystem, owner, teacher;

    beforeEach(async function () {
        const StudentResultSystem = await ethers.getContractFactory("StudentResultSystem");
        studentResultSystem = await StudentResultSystem.deploy();
        await studentResultSystem.waitForDeployment(); // Ensure deployment is completed
        [owner, teacher] = await ethers.getSigners();

        // Grant TEACHER_ROLE to teacher
        await studentResultSystem.addTeacher(teacher.address);
    });

    it("Should allow adding a result", async function () {
        await studentResultSystem.connect(teacher).uploadResult("123", "Math", "Qm123hash");

        const studentResultIds = await studentResultSystem.getStudentResultIds("123");
        expect(studentResultIds.length).to.be.greaterThan(0);
    });

    it("Should return an empty array for a student without a result", async function () {
        const studentResultIds = await studentResultSystem.getStudentResultIds("456");
        expect(studentResultIds).to.deep.equal([]);
    });
});
