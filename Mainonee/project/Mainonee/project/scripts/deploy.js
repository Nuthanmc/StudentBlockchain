import { ethers } from "hardhat";

async function main() {
  console.log("Deploying StudentResultSystem contract...");

  const StudentResultSystem = await ethers.getContractFactory("StudentResultSystem");
  const studentResultSystem = await StudentResultSystem.deploy();

  await studentResultSystem.waitForDeployment();

  const address = await studentResultSystem.getAddress();
  console.log(`StudentResultSystem deployed to: ${address}`);
  
  console.log("Setting up initial roles...");
  // Additional setup can be done here if needed
  
  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });