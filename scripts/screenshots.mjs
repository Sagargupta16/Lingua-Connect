// Capture the README screenshots from a running demo.
//
//   npm run demo                      (API on :5000 with seed data, client on :3000)
//   npm run screenshots               (writes docs/screenshots/*.png)
//
// BASE_URL and API_URL override the defaults. The script logs in through the
// API, stores the JWT the same way the app does, and shoots each page at a
// desktop and a phone viewport.
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const API_URL = process.env.API_URL ?? "http://localhost:5000";
const OUT = new URL("../docs/screenshots/", import.meta.url);
const PASSWORD = "Demo1234";

const login = async (email) => {
   const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: PASSWORD }),
   });
   if (!res.ok) throw new Error(`login ${email} failed: ${res.status}`);
   return (await res.json()).data.token;
};

const viewports = {
   desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
   phone: { ...devices["iPhone 13"] },
};

const shots = [
   { name: "home", path: "/" },
   { name: "tutors", path: "/tutor", user: "student", wait: ".tutor-card" },
   {
      name: "booking",
      path: "/tutor",
      user: "student",
      wait: ".tutor-card",
      act: async (page) => {
         await page.locator(".tutor-card .btn").first().click();
         await page.waitForSelector(".slot__card");
         // Bring the bookable slots into view inside the modal.
         await page.locator(".available-slots").scrollIntoViewIfNeeded();
      },
   },
   {
      name: "profile",
      path: "/profile",
      user: "student",
      wait: ".upcoming-class",
   },
   {
      name: "flashcards",
      path: "/flashcards",
      user: "student",
      wait: "h3",
      act: async (page) => {
         await page.getByRole("heading", { name: "Spanish" }).click();
         const cards = page.locator("ul li, ul > div");
         await cards.first().waitFor();
         await cards.nth(1).click();
         await page.waitForTimeout(700);
      },
   },
   {
      name: "tutor-dashboard",
      path: "/profile",
      user: "tutor",
      wait: ".upcoming-class",
   },
];

const main = async () => {
   await mkdir(OUT, { recursive: true });
   const tokens = {
      student: await login("student@demo.lingua.dev"),
      tutor: await login("tutor@demo.lingua.dev"),
   };
   const browser = await chromium.launch();
   try {
      for (const [device, options] of Object.entries(viewports)) {
         for (const shot of shots) {
            const context = await browser.newContext(options);
            if (shot.user)
               await context.addInitScript((token) => {
                  localStorage.setItem("token", token);
               }, tokens[shot.user]);
            const page = await context.newPage();
            await page.goto(`${BASE_URL}${shot.path}`, {
               waitUntil: "networkidle",
            });
            if (shot.wait) await page.waitForSelector(shot.wait);
            if (shot.act) await shot.act(page);
            await page.waitForTimeout(400);
            const file = fileURLToPath(
               new URL(`${device}-${shot.name}.png`, OUT),
            );
            await page.screenshot({ path: file });
            console.log("wrote", file);
            await context.close();
         }
      }
   } finally {
      await browser.close();
   }
};

main().catch((error) => {
   console.error(error);
   process.exit(1);
});
