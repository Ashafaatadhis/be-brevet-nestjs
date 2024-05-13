import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  //   await prisma.user.create({
  //     data: {
  //       email: 'admin@example.com',
  //       fullname: 'admin',
  //       password: await hash('admin@123', 10),
  //       username: 'admin',
  //       role: 'ADMIN',
  //     },
  //   });
  await prisma.user.create({
    data: {
      email: 'superadmin@example.com',
      fullname: 'superadmin',
      password: await hash('superadmin@123', 10),
      username: 'superadmin',
      role: 'SUPERADMIN',
    },
  });
  await prisma.user.create({
    data: {
      email: 'teacher@example.com',
      fullname: 'teacher',
      password: await hash('teacher@123', 10),
      username: 'teacher',
      role: 'TEACHER',
    },
  });
  await prisma.user.create({
    data: {
      email: 'student1@example.com',
      fullname: 'student1',
      password: await hash('student1@123', 10),
      username: 'student1',
      role: 'STUDENT',
    },
  });

  // for (let i = 1; i <= 30; i++) {
  //   await prisma.user.create({
  //     data: {
  //       email: `student${i}@gmail.com`,
  //       fullname: `student${i}`,
  //       password: (await hashPassword(`student${i}@123`)) as string,
  //       username: `student${i}`,
  //       role: "STUDENT",
  //     },
  //   });
  // }
  // await prisma.user.create({
  //   data: {
  //     email: "teacher@gmail.com",
  //     fullname: "teacher",
  //     password: (await hashPassword("teacher@123")) as string,
  //     username: "teacher",
  //     role: "TEACHER",
  //   },
  // });
  // await prisma.user.create({
  //   data: {
  //     email: "student@gmail.com",
  //     fullname: "student",
  //     password: (await hashPassword("student@123")) as string,
  //     username: "student",
  //     role: "STUDENT",
  //   },
  // });
  // await prisma.user.create({
  //   data: {
  //     email: "admin@gmail.com",
  //     fullname: "admin",
  //     password: (await hashPassword("admin@123")) as string,
  //     username: "admin",
  //     role: "ADMIN",
  //   },
  // });
  // await prisma.user.create({
  //   data: {
  //     email: "superadmin@gmail.com",
  //     fullname: "superadmin",
  //     password: (await hashPassword("superadmin@123")) as string,
  //     username: "superadmin",
  //     role: "SUPERADMIN",
  //   },
  // });
  // const allUsers = await prisma.user.findMany();
  // console.dir(allUsers);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
