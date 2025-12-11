// import { faker } from "@faker-js/faker";
// import bcrypt from "bcryptjs";
// import "dotenv/config";
// import db from "./db";
// import { PaymentTable, TaskTable } from "./schemas";
// const categoryId = "ebb10f9a-8e66-45da-acd6-80c61ff56b08";
// const userId = "49ccef0d-2bf0-4d08-a4ff-34e5dd966a68"
// const programmingTaskContents = [
//   {
//     title: "Arduino Debugging and Circuit Review",
//     description:
//       "Help diagnose random beeping sounds in an Arduino project, reviewing both sketch code and wiring setup.",
//     content: `
//       <h2>Arduino Debugging</h2>
//       <p>My Arduino project sometimes works but then produces strange beeping sounds. I can't figure out if it's a wiring or code issue.</p>
//       <h3>Steps I Already Tried</h3>
//       <ul>
//         <li>Swapped out multiple jumper wires.</li>
//         <li>Replaced the piezo buzzer.</li>
//         <li>Tested with another Arduino Uno board.</li>
//       </ul>
//       <p>I need someone to review both the sketch and circuit to spot mistakes. I’ve already tried swapping out components but the issue persists.</p>
//       <h3>Code Sample</h3>
//       <pre><code>
// const int buzzer = 9;
// void setup() {
//   pinMode(buzzer, OUTPUT);
// }
// void loop() {
//   digitalWrite(buzzer, HIGH);
//   delay(1000);
//   digitalWrite(buzzer, LOW);
//   delay(1000);
// }
//       </code></pre>
//       <p>Bonus if you can explain how to properly debounce button inputs, as my current implementation causes ghost presses.</p>
//       <blockquote>
//         "Good circuits are 90% design and 10% debugging."
//       </blockquote>
//       <h3>Comparison Table</h3>
//       <table border="1" cellpadding="6">
//         <thead>
//           <tr><th>Connection</th><th>Temporary</th><th>Permanent</th></tr>
//         </thead>
//         <tbody>
//           <tr><td>Breadboard</td><td>✔️</td><td>❌</td></tr>
//           <tr><td>Soldered PCB</td><td>❌</td><td>✔️</td></tr>
//         </tbody>
//       </table>
//     `,
//   },
//   {
//     title: "Express.js API Setup with MongoDB",
//     description:
//       "Guide needed for setting up a REST API with Express.js and MongoDB, covering CRUD, middleware, and structure.",
//     content: `
//       <h2>Express.js API Setup</h2>
//       <p>I want to set up a REST API using Express.js and MongoDB. I already have Node.js installed but I'm lost after that.</p>
//       <h3>Requirements</h3>
//       <ol>
//         <li>CRUD for tasks (Create, Read, Update, Delete)</li>
//         <li>Middleware for logging and error handling</li>
//         <li>Environment-based configuration</li>
//       </ol>
//       <h3>Sample Route</h3>
//       <pre><code>
// app.get("/tasks", async (req, res) => {
//   const tasks = await Task.find();
//   res.json(tasks);
// });
//       </code></pre>
//       <p>Extra: tips on using environment variables and connecting to MongoDB Atlas would be appreciated.</p>
//       <h3>Best Practices</h3>
//       <ul>
//         <li>Separate routes and controllers</li>
//         <li>Use async/await consistently</li>
//         <li>Centralize error handling</li>
//       </ul>
//     `,
//   },
//   {
//     title: "React Hooks Code Review",
//     description:
//       "Review React project hooks usage with focus on useEffect, dependency arrays, and cleanup functions.",
//     content: `
//       <h2>React Hooks Review</h2>
//       <p>I built a React project but I think I'm overusing <code>useEffect</code>.</p>
//       <h3>Issues</h3>
//       <ul>
//         <li>Infinite re-renders</li>
//         <li>Memory leaks from event listeners</li>
//         <li>Unnecessary re-computations</li>
//       </ul>
//       <h3>Code Example</h3>
//       <pre><code>
// useEffect(() => {
//   window.addEventListener("resize", handleResize);
//   return () => window.removeEventListener("resize", handleResize);
// }, []);
//       </code></pre>
//       <p>Looking for code examples and patterns to make my hooks more efficient and maintainable.</p>
//       <blockquote>
//         "Rules of Hooks: only call them at the top level, never inside loops or conditions."
//       </blockquote>
//     `,
//   },
//   {
//     title: "C++ Memory Leak Troubleshooting",
//     description:
//       "Fix memory leaks in a C++ program, using Valgrind results and improving RAII usage.",
//     content: `
//       <h2>C++ Memory Leak Issues</h2>
//       <p>I have a C++ program that crashes randomly. Running Valgrind shows memory leaks.</p>
//       <h3>Symptoms</h3>
//       <ul>
//         <li>Random crashes after 10–15 minutes.</li>
//         <li>Memory not freed properly when closing program.</li>
//       </ul>
//       <h3>Example Output</h3>
//       <pre><code>
// ==12345== 200 bytes in 5 blocks are definitely lost in loss record 1 of 2
// ==12345==    at 0x4C2FB55: malloc (vg_replace_malloc.c:299)
// ==12345==    by 0x4006ED: main (leak.cpp:10)
//       </code></pre>
//       <h3>Topics to Cover</h3>
//       <ul>
//         <li>RAII principles</li>
//         <li>Using <code>unique_ptr</code> vs <code>shared_ptr</code></li>
//         <li>Proper destructor design</li>
//       </ul>
//     `,
//   },
//   {
//     title: "Next.js with Drizzle ORM Integration",
//     description:
//       "Help needed to integrate Drizzle ORM migrations into a Next.js + Postgres project.",
//     content: `
//       <h2>Next.js + Drizzle ORM</h2>
//       <p>I'm trying to integrate Drizzle ORM migrations in a Next.js project with Postgres.</p>
//       <h3>Problem</h3>
//       <p>The schema compiles fine, but migrations don't apply properly in production. Locally they work but not on my deployment pipeline.</p>
//       <h3>What I Need</h3>
//       <ul>
//         <li>Clean workflow for schema changes</li>
//         <li>Rollback and versioning strategy</li>
//         <li>Seeding strategies for initial data</li>
//       </ul>
//       <pre><code>
// drizzle-kit generate:pg --out migrations
//       </code></pre>
//     `,
//   },
//   {
//     title: "Learning Go by Building a CLI",
//     description:
//       "Step-by-step mentorship to build a Go CLI tool for JSON parsing, aimed at beginners from JavaScript background.",
//     content: `
//       <h2>Learn Go by Building</h2>
//       <p>I want to learn the basics of Go. My plan is to build a small CLI that parses JSON.</p>
//       <h3>Concepts to Learn</h3>
//       <ul>
//         <li>Structs and Interfaces</li>
//         <li>Error handling with <code>error</code></li>
//         <li>Goroutines and channels</li>
//       </ul>
//       <h3>Sample Code</h3>
//       <pre><code>
// package main
// import (
//   "encoding/json"
//   "fmt"
//   "os"
// )
// func main() {
//   data := \`{"name":"Abdullahi"}\`
//   var obj map[string]string
//   json.Unmarshal([]byte(data), &obj)
//   fmt.Println(obj["name"])
// }
//       </code></pre>
//     `,
//   },
//   {
//     title: "Understanding Async/Await in JavaScript",
//     description:
//       "Clarify async/await with examples of API calls and common pitfalls with promises.",
//     content: `
//       <h2>Async/Await in JS</h2>
//       <p>I struggle to understand async/await, especially when mixing with promises.</p>
//       <h3>Common Mistakes</h3>
//       <ul>
//         <li>Forgetting to <code>await</code> inside loops</li>
//         <li>Not handling rejections</li>
//       </ul>
//       <h3>Code Example</h3>
//       <pre><code>
// async function getData() {
//   try {
//     const res = await fetch("/api/data");
//     return await res.json();
//   } catch (err) {
//     console.error(err);
//   }
// }
//       </code></pre>
//     `,
//   },
//   {
//     title: "Unit Testing with Jest",
//     description:
//       "Start unit testing a Node.js app with Jest, focusing on utils and test structure.",
//     content: `
//       <h2>Unit Testing with Jest</h2>
//       <p>I wrote a Node.js app but it has zero test coverage. I’d like to start with unit tests for my utils functions.</p>
//       <h3>Example Test</h3>
//       <pre><code>
// describe("sum", () => {
//   it("adds two numbers", () => {
//     expect(sum(1, 2)).toBe(3);
//   });
// });
//       </code></pre>
//       <h3>Topics</h3>
//       <ul>
//         <li>Folder structure</li>
//         <li>describe vs test</li>
//         <li>Mocking APIs</li>
//         <li>CI/CD integration</li>
//       </ul>
//     `,
//   },
//   {
//     title: "Flutter API Integration Fix",
//     description:
//       "Solve Flutter API integration issues with CORS and proper request handling.",
//     content: `
//       <h2>Flutter API Integration</h2>
//       <p>My Flutter app fails when making requests to a backend because of CORS.</p>
//       <h3>Attempts</h3>
//       <ul>
//         <li>Tried <code>http</code> package</li>
//         <li>Added headers manually</li>
//         <li>Backend still blocks requests</li>
//       </ul>
//       <h3>Code Sample</h3>
//       <pre><code>
// final response = await http.get(
//   Uri.parse("https://api.example.com/data"),
//   headers: {"Authorization": "Bearer token"}
// );
//       </code></pre>
//       <p>If you can, please show me how to use Dio or Chopper for API handling in Flutter.</p>
//     `,
//   },
//   {
//     title: "TypeScript Schema Types Cleanup",
//     description:
//       "Refactor and simplify messy TypeScript schema types with unions and optionals.",
//     content: `
//       <h2>TypeScript Types for Schema</h2>
//       <p>I designed a schema for a task management app, but my TypeScript types are messy.</p>
//       <h3>Problems</h3>
//       <ul>
//         <li>Too many nested unions</li>
//         <li>Overuse of optionals</li>
//         <li>Broken autocomplete</li>
//       </ul>
//       <h3>Example</h3>
//       <pre><code>
// type Task = {
//   id: string;
//   title: string;
//   status: "open" | "in_progress" | "done";
//   assignee?: string;
// }
//       </code></pre>
//       <p>Looking for feedback and tips to clean up my types. Should I use type aliases or interfaces for flexibility?</p>
//     `,
//   },
// ];

// async function main() {
//   const hashedPassword = await bcrypt.hash("12345678", 10);
//   // const [user] = await db
//   //   .insert(UserTable)
//   //   .values({
//   //     email: "testuser@example.com",
//   //     name: "Test User",
//   //     emailVerified: new Date(),
//   //     password: hashedPassword,
//   //   })
//   //   .returning();
//   // await db
//   //   .insert(UserDetails)
//   //   .values({ userId: user.id, onboardingCompleted: true });
//   // if (!user) throw new Error("❌ Failed to create user");
//   // console.log(`✅ Created user ${user.email} (${user.id})`);

//   const payments = await db
//     .insert(PaymentTable)
//     .values(
//       Array.from({ length: 10 }).map(() => ({
//         userId,
//         amount: faker.number.int({ min: 10, max: 200 }),
//         status: faker.helpers.arrayElement([
//           "HOLD",
//           "SUCCEEDED",
//           "FAILED",
//           "CANCELED",
//           "REFUNDED",
//         ]),
//         purpose: "Task Payment",
//         stripePaymentIntentId: faker.string.uuid(),
//         stripeChargeId: faker.string.uuid(),
//       }))
//     )
//     .returning();
//   console.log(`✅ Created ${payments.length} payments`);

//   const tasks = await Promise.all(
//     payments.map(async (payment, idx) => {
//       return await db
//         .insert(TaskTable)
//         .values({
//           visibility: "public",
//           title: programmingTaskContents[idx].title,
//           description: programmingTaskContents[idx].description,
//           content: programmingTaskContents[idx].content,
//           price: payment.amount,
//           posterId: userId,
//           categoryId,
//           paymentId: payment.id,
//           deadline: "12h",
//         })
//         .returning();
//     })
//   );

//   console.log(`✅ Created ${tasks.length} tasks`);

//   console.log("✨ Database seeding completed successfully!");
//   process.exit(0);
// }

// main().catch((err) => {
//   console.error("❌ Seed failed:", err);
//   process.exit(1);
// });
