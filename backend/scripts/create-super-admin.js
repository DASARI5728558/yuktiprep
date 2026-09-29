import readline from "readline";
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

const parseCliArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
    } else if (arg === "--email" || arg === "-e") {
      parsed.email = args[++i];
    } else if (arg === "--password" || arg === "-p") {
      parsed.password = args[++i];
    } else if (arg === "--name" || arg === "-n") {
      parsed.name = args[++i];
    }
  }

  return parsed;
};

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const main = async () => {
  console.log("==========================================");
  console.log(" Create or Update SUPER_ADMIN User");
  console.log("==========================================\n");

  const cliArgs = parseCliArgs();
  if (cliArgs.help) {
    console.log("Usage: node scripts/create-super-admin.js [options]\n");
    console.log("Options:");
    console.log("  -e, --email <email>        Super admin email address");
    console.log("  -p, --password <password>  Super admin password (min 6 characters)");
    console.log("  -n, --name <name>          Super admin display name (default: Super Admin)");
    console.log("  -h, --help                 Show help message\n");
    console.log("Examples:");
    console.log("  node scripts/create-super-admin.js");
    console.log("  node scripts/create-super-admin.js --email admin@yuktiprep.com --password SecretPassword123 --name \"Head Admin\"\n");
    process.exit(0);
  }

  let email = cliArgs.email;
  let password = cliArgs.password;
  let name = cliArgs.name;

  if (!email) {
    email = await askQuestion("Enter super admin email: ");
  }

  if (!email || !validateEmail(email)) {
    console.error("❌ Error: A valid email address is required.");
    process.exit(1);
  }

  if (!password) {
    password = await askQuestion("Enter super admin password: ");
  }

  if (!password || password.length < 6) {
    console.error("❌ Error: Password must be at least 6 characters long.");
    process.exit(1);
  }

  if (!name) {
    name = (await askQuestion("Enter admin display name (default: Super Admin): ")) || "Super Admin";
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingAdmin) {
      console.log(`\n⚠️  Admin user with email "${normalizedEmail}" already exists.`);
      const answer = await askQuestion("Do you want to update password and grant SUPER_ADMIN role? (y/N): ");

      if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
        console.log("Operation cancelled.");
        process.exit(0);
      }

      const updated = await prisma.adminUser.update({
        where: { id: existingAdmin.id },
        data: {
          name: name || existingAdmin.name,
          passwordHash,
          role: "SUPER_ADMIN",
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          updatedAt: true,
        },
      });

      console.log("\n✅ SUPER_ADMIN successfully updated!");
      console.table(updated);
    } else {
      const created = await prisma.adminUser.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role: "SUPER_ADMIN",
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      console.log("\n✅ SUPER_ADMIN successfully created!");
      console.table(created);
    }
  } catch (err) {
    console.error("\n❌ Failed to create/update super admin:", err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();
