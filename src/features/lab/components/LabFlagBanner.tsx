import { Alert } from "@/components/feedback/Alert";
import { ClaimFlagForm } from "@/features/lab/components/ClaimFlagForm";

const COPY = {
  api: {
    title: "Great work, you've achieved IDOR",
    definition:
      "IDOR (Insecure Direct Object Reference) means the app trusts an ID from the request, such as the account ID in the URL, and returns that record without checking that you own it. You changed the ID and read another customer's account.",
    evidence:
      "The lab note in the activity below contains a unique canary. It proves the data was exposed to you.",
  },
  xss: {
    title: "Great work, you've achieved XSS",
    definition:
      "XSS (Cross-site scripting) means the app places user input into a page as HTML or script, so the browser runs code the user wrote. Your display name was rendered as HTML and its script ran in your browser.",
    evidence: "Your display name is shown unescaped in the header on every page.",
  },
  race: {
    title: "Great work, you've achieved a race condition",
    definition:
      "A race condition happens when concurrent requests check a shared value and then act on that stale check. The transfer checked your balance, waited, and debited without checking again, so parallel transfers overdrew the account.",
    evidence: "Your account balance went below zero, which proves the overdraw.",
  },
  crypto: {
    title: "Great work, you've broken the encryption",
    definition:
      "Encryption only protects data when the key stays secret. Here the key and IV were left in the page source, so anyone could decrypt the stored passwords.",
    evidence: "You decrypted a stored password and it matched the record.",
  },
  file: {
    title: "Great work, you've achieved a file upload injection",
    definition:
      "A file upload injection happens when the app trusts the file name and declared type, and skips checking the contents. The browser then decides what the stored bytes are, so a file named like an image can run script.",
    evidence: "Your file ran a script in your browser, and the script called the server as your signed-in session.",
  },
  "access-control": {
    title: "Great work, you've achieved broken access control",
    definition:
      "Access control decides who may call an endpoint. This endpoint was an admin tool, but it only checked that you were signed in, so any student could read the victim accounts.",
    evidence: "The victim activity you received contains a unique canary. It proves the data was exposed to you.",
  },
} as const;

export function LabFlagBanner({
  challengeId,
  flag,
}: {
  challengeId: keyof typeof COPY;
  flag: string;
}) {
  const copy = COPY[challengeId];
  return (
    <Alert tone="success" title={copy.title} className="mb-6">
      <p>{copy.definition}</p>
      <p className="mt-2">
        {copy.evidence} Your flag is <code className="font-mono">{flag}</code>.
      </p>
      <ClaimFlagForm challengeId={challengeId} />
    </Alert>
  );
}
