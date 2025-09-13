import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import "dotenv/config";
import db from "./db";
import { PaymentTable, TaskTable, UserTable } from "./schemas";
const categoryId = "76836f5c-eaf9-4404-927b-c969ea538446";
const programmingTaskContents = [
  `
  <h2>Arduino Debugging</h2>
  <p>My Arduino project sometimes works but then produces strange beeping sounds. I can't figure out if it's a wiring or code issue.</p>
  <p>I need someone to review both the sketch and circuit to spot mistakes.</p>
  <p>Bonus if you can explain how to properly debounce button inputs.</p>
  `,
  `
  <h2>Express.js API Setup</h2>
  <p>I want to set up a REST API using Express.js and MongoDB. I already have Node.js installed but I'm lost after that.</p>
  <p>The API should support basic CRUD for a "tasks" resource.</p>
  <p>Please guide me through middleware setup and folder structure.</p>
  `,
  `
  <h2>React Hooks Review</h2>
  <p>I built a React project but I think I'm overusing <code>useEffect</code>.</p>
  <p>Could someone review my hooks implementation and show me best practices?</p>
  <p>I especially struggle with dependency arrays and cleanup functions.</p>
  `,
  `
  <h2>C++ Memory Leak Issues</h2>
  <p>I have a C++ program that crashes randomly. Running Valgrind shows memory leaks.</p>
  <p>I'm not confident about my use of pointers and dynamic allocation.</p>
  <p>Looking for help refactoring my code to use RAII properly.</p>
  `,
  `
  <h2>Next.js + Drizzle ORM</h2>
  <p>I'm trying to integrate Drizzle ORM migrations in a Next.js project with Postgres.</p>
  <p>The schema compiles fine, but migrations don't apply properly in production.</p>
  <p>Can someone help me set up a clean workflow for schema changes?</p>
  `,
  `
  <h2>Learn Go by Building</h2>
  <p>I want to learn the basics of Go. My plan is to build a small CLI that parses JSON.</p>
  <p>I'm comfortable with JavaScript but new to Go's type system.</p>
  <p>Looking for someone who can mentor me step-by-step.</p>
  `,
  `
  <h2>Async/Await in JS</h2>
  <p>I struggle to understand async/await, especially when mixing with promises.</p>
  <p>My functions often return "undefined" when I expect data.</p>
  <p>Can someone provide a few simple examples with API calls?</p>
  `,
  `
  <h2>Unit Testing with Jest</h2>
  <p>I wrote a Node.js app but it has zero test coverage.</p>
  <p>I'd like to start with unit tests for my utils functions.</p>
  <p>Need help structuring a test folder and writing my first Jest test.</p>
  `,
  `
  <h2>Flutter API Integration</h2>
  <p>My Flutter app fails when making requests to a backend because of CORS.</p>
  <p>I've tried using http but still get blocked.</p>
  <p>I need guidance on setting headers or using a proxy correctly.</p>
  `,
  `
  <h2>TypeScript Types for Schema</h2>
  <p>I designed a schema for a task management app, but my TypeScript types are messy.</p>
  <p>Unions and optionals confuse me, especially when extending interfaces.</p>
  <p>Looking for feedback and tips to clean up my types.</p>
  `,
];

async function main() {
  const hashedPassword = await bcrypt.hash("12345678", 10);
  const [user] = await db
    .insert(UserTable)
    .values({
      email: "testuser@example.com",
      name: "Test User",
      emailVerified: new Date(),
      password: hashedPassword,
    })
    .returning();

  if (!user) throw new Error("❌ Failed to create user");
  console.log(`✅ Created user ${user.email} (${user.id})`);

  const payments = await db
    .insert(PaymentTable)
    .values(
      Array.from({ length: 10 }).map(() => ({
        userId: user.id,
        amount: faker.number.int({ min: 10, max: 200 }),
        status: faker.helpers.arrayElement([
          "HOLD",
          "SUCCEEDED",
          "FAILED",
          "CANCELED",
          "REFUNDED",
        ]),
        purpose: "Task Payment",
        stripePaymentIntentId: faker.string.uuid(),
        stripeChargeId: faker.string.uuid(),
      }))
    )
    .returning();
  console.log(`✅ Created ${payments.length} payments`);

  const tasks = await db
    .insert(TaskTable)
    .values(
      payments.map((payment, idx) => ({
        title: faker.lorem.words({ min: 3, max: 8 }),
        description: faker.lorem.sentence(),
        content: programmingTaskContents[idx % programmingTaskContents.length],
        price: payment.amount,
        posterId: user.id,
        categoryId,
        paymentId: payment.id,
        deadline: "12h",
      }))
    )
    .returning();
  console.log(`✅ Created ${tasks.length} tasks`);

  console.log("✨ Database seeding completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
