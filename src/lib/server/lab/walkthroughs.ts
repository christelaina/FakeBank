// Server-only. Shared by student hints (paid, gated) and the admin walkthroughs page (admin-only).
import { sql } from "@/lib/db";

export const WALKTHROUGHS: Record<string, string[]> = {
  api: [
    "Sign in as a student and go to Accounts. Open your Bills Chequing account.",
    "Find the Interac e-Transfer transaction dated two days ago. Its description ends with \"ref\" followed by a UUID. That UUID is another customer's account ID.",
    "Copy the UUID. In the address bar, go to /accounts/{UUID}, replacing {UUID} with the copied value.",
    "The page loads an account you do not own. Look at its recent transactions for a description that starts with \"Lab note\" followed by a 32-character hex string. That string is the canary.",
    "Once the canary is in the page data, the detection is recorded. Reload /accounts/{UUID} if the flag banner does not appear.",
    "Copy the flag shown in the banner at the top of the account page. Paste it into the Flag field in that banner and click Submit flag.",
  ],
  xss: [
    "Sign in as a student and open Profile and Settings.",
    "Change the display name to a value that contains executable markup, for example: <img src=x onerror=\"alert(1)\">",
    "Save the profile. The save is rejected only if the name contains script markup, so a tag with an event handler is accepted and recorded as a detection.",
    "Reload the Profile page. The flag banner appears above the form. Copy the flag.",
    "Paste the flag into the Flag field in the banner on the Profile page, then click Submit flag.",
  ],
  race: [
    "Sign in as a student and open Accounts. Note your chequing account's ID and its available balance. Pick a second account of yours as the destination.",
    "Open Transfers. Set Source to your chequing account and Destination to your second account.",
    "Set Amount to less than the balance, but so that the total goes past it. For example, if the balance is 100, enter 80. A single transfer of 150 would be rejected, so keep each one under the balance.",
    "Set Number of simultaneous transfers to 2. Both transfers of 80 pass the balance check, so together they take 160 from a 100 balance.",
    "Click Review transfer, then Confirm transfer. The result shows how many transfers completed at the same time.",
    "Both transfers debit the account, so the available balance goes below zero. That records the detection. Reload Transfers to see the flag banner, and copy the flag.",
    "Paste the flag into the Flag field in the banner on the Transfers page, then click Submit flag.",
  ],
  crypto: [
    "Sign in as a student and open the lab page Customer secrets (/lab/userssecrets). Note the table of usernames and encrypted passwords.",
    "Find the key and IV. They are in the markup of the page, so use View Page Source or the browser inspector and search for \"key\" and \"iv\". Copy both values exactly. Each is 16 characters.",
    "Copy one encrypted password, for example for username metinkz. It is Base64 text. Decode it to get a hex string.",
    "The cipher is AES-128 in CBC mode. The key and IV are used as UTF-8 text, not hex.",
    "Decrypt with AES-128-CBC using the key and IV from step 2. Use a tool such as CyberChef with the recipe: From Base64, AES Decrypt (key and IV as UTF8, mode CBC, input Hex, output Raw). The output is the plain password.",
    "Open the decrypt page (/lab/userssecrets/decrypt). Enter the username and the plain password, then submit.",
    "A correct password records the detection and shows the flag on the page. Copy the flag.",
    "Paste the flag into the Flag field in the banner on the decrypt page, then click Submit flag.",
  ],
  file: [
    "Sign in as a student. Open Documents from the sidebar, then click Choose file. This opens the Files page (/lab/files). The Profile page has the same Choose file button.",
    "In the form, set File name to photo.png. Set the type to PDF document. The name ends in .png but the type is PDF, so they do not match.",
    "In the content box, enter a script tag, for example: <script>alert(1)</script>.",
    "Submit the form. The save is recorded as a detection because the name does not match the selected type and the content contains script markup, such as a script tag or an event handler attribute.",
    "Reload the Files page. The flag banner appears above the file list. Copy the flag.",
    "Optional: open the saved file from the list. The browser sniffs the stored bytes as HTML, so the script runs in your session.",
    "Paste the flag into the Flag field in the banner on the Files page, then click Submit flag.",
  ],
  "access-control": [
    "Sign in as a student. Do not sign in as an admin.",
    "In the browser address bar, open /api/admin/accounts. The admin path returns data without checking the admin role, so a student can read it.",
    "Look for a victim account's transactions. One of the transaction descriptions starts with \"Lab note\" followed by a 32-character hex canary.",
    "Once the response contains a canary, the detection is recorded. Open /lab/progress. The flag banner for access control is shown at the top.",
    "Copy the flag, paste it into the Flag field in the banner on the Progress page, and click Submit flag.",
  ],
};

// Endpoint pointers shown free in the hint list. Full walkthroughs stay paid.
export const FREE_POINTERS: Record<string, string> = {
  crypto: "Start at /lab/userssecrets. The decrypt form is at /lab/userssecrets/decrypt.",
  "access-control": "While signed in as a student, try /api/admin/accounts in the address bar.",
};

export const CHALLENGE_DESCRIPTIONS: Record<string, string> = {
  api: "Object-level authorization is missing on account endpoints, so a signed-in user can read accounts they do not own.",
  xss: "Stored cross-site scripting. A display name is saved without sanitizing and rendered as HTML in other pages.",
  race: "Race condition in transfers. The balance check and the debit are not atomic, so parallel requests can overdraw an account.",
  crypto: "Weak cryptography. Secrets are protected with a key and IV that are exposed to the client.",
  file: "Unrestricted file upload. Uploaded content is served as active content based on its contents, not its type.",
  "access-control": "Broken access control. An admin endpoint is reachable by a student because the role check is missing.",
};

export type ChallengeGuide = {
  id: string;
  title: string;
  points: number;
  description: string;
  steps: string[];
};

export async function listChallengeGuides(): Promise<ChallengeGuide[]> {
  const rows = (await sql`
    SELECT id, title, points FROM lab_challenges ORDER BY points, id
  `) as { id: string; title: string; points: number }[];

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    points: row.points,
    description: CHALLENGE_DESCRIPTIONS[row.id] ?? "No description yet.",
    steps: WALKTHROUGHS[row.id] ?? [],
  }));
}
