import { describe, expect, it } from "vitest";
import {
  cleanText,
  formatEmail,
  validateSubmission,
  type CleanSubmission,
} from "./submission";

const pdf = Buffer.from("%PDF-1.4 test").toString("base64");

function body(over: Record<string, unknown> = {}) {
  return {
    teamName: "Team Spark",
    college: "AJIET",
    leaderPhone: "+91 98765 43210",
    theme: "Some theme",
    members: [
      { name: "Asha Rao", usn: "4AJ22EC001", email: "asha@example.com" },
      { name: "", usn: "", email: "" },
      { name: "", usn: "", email: "" },
    ],
    website: "",
    attachment: { name: "idea.pdf", type: "application/pdf", content: pdf },
    ...over,
  };
}

const err = (b: Record<string, unknown>) =>
  "error" in validateSubmission(b)
    ? (validateSubmission(b) as { error: string }).error
    : null;

describe("cleanText", () => {
  it("strips control characters, trims and caps length", () => {
    expect(cleanText("  a\u0000b\nc  ", 10)).toBe("a b c");
    expect(cleanText("abcdef", 3)).toBe("abc");
  });
  it("returns empty for non-strings", () => {
    expect(cleanText(42, 5)).toBe("");
    expect(cleanText(undefined, 5)).toBe("");
  });
});

describe("validateSubmission", () => {
  it("accepts a valid team and normalises the phone", () => {
    const r = validateSubmission(body());
    expect("submission" in r).toBe(true);
    if ("submission" in r) {
      expect(r.submission.leaderPhone).toBe("9876543210");
      expect(r.submission.members).toHaveLength(1);
      expect(r.submission.attachment).toEqual({
        filename: "idea.pdf",
        content_type: "application/pdf",
        content: pdf,
      });
    }
  });

  it("returns spam when the honeypot is filled", () => {
    expect(validateSubmission(body({ website: "http://spam" }))).toEqual({ spam: true });
  });

  it.each([
    ["teamName", ""],
    ["college", ""],
    ["theme", ""],
    ["leaderPhone", "12345"],
  ])("rejects bad %s", (k, v) => {
    expect(err(body({ [k]: v }))).toMatch(/team name, college/);
  });

  it("rejects members that are not three entries", () => {
    expect(err(body({ members: [] }))).toBe("Invalid team member details.");
    expect(err(body({ members: "x" }))).toBe("Invalid team member details.");
  });

  it("requires the team leader (member 1)", () => {
    const b = body({
      members: [
        { name: "", usn: "", email: "" },
        { name: "B", usn: "4AJ22EC002", email: "b@example.com" },
        { name: "", usn: "", email: "" },
      ],
    });
    expect(err(b)).toBe("Add the team leader details.");
  });

  it("rejects a half-filled member", () => {
    const b = body({
      members: [
        { name: "Asha", usn: "4AJ22EC001", email: "asha@example.com" },
        { name: "B", usn: "", email: "" },
        null,
      ],
    });
    expect(err(b)).toMatch(/valid name, USN, and email/);
  });

  it("rejects duplicate USN or email ignoring case", () => {
    const dupUsn = body({
      members: [
        { name: "A", usn: "4AJ22EC001", email: "a@example.com" },
        { name: "B", usn: "4aj22ec001", email: "b@example.com" },
        { name: "", usn: "", email: "" },
      ],
    });
    expect(err(dupUsn)).toMatch(/unique/);
    const dupEmail = body({
      members: [
        { name: "A", usn: "4AJ22EC001", email: "a@example.com" },
        { name: "B", usn: "4AJ22EC002", email: "A@EXAMPLE.com" },
        { name: "", usn: "", email: "" },
      ],
    });
    expect(err(dupEmail)).toMatch(/unique/);
  });

  describe("attachment", () => {
    it("is required", () => {
      expect(err(body({ attachment: undefined }))).toBe("Attach your one-page abstract.");
    });
    it.each(["a.txt", "a.exe", "noextension", "a.pdf.exe"])("rejects %s", (name) => {
      expect(
        err(body({ attachment: { name, type: "application/pdf", content: pdf } })),
      ).toMatch(/PDF, DOC, or DOCX/);
    });
    it("rejects a mismatched content type", () => {
      expect(
        err(body({ attachment: { name: "a.pdf", type: "text/html", content: pdf } })),
      ).toMatch(/PDF, DOC, or DOCX/);
    });
    it("accepts octet-stream for any allowed extension", () => {
      expect(
        err(
          body({
            attachment: {
              name: "a.docx",
              type: "application/octet-stream",
              content: pdf,
            },
          }),
        ),
      ).toBeNull();
    });
    it("replaces path separators in the filename", () => {
      const r = validateSubmission(
        body({
          attachment: { name: "../x/a.pdf", type: "application/pdf", content: pdf },
        }),
      );
      expect("submission" in r && r.submission.attachment.filename).toBe(".._x_a.pdf");
    });
    it("rejects content that is not base64", () => {
      expect(
        err(
          body({
            attachment: {
              name: "a.pdf",
              type: "application/pdf",
              content: "not base64!",
            },
          }),
        ),
      ).toMatch(/could not be read/);
    });
    it("rejects an empty file", () => {
      expect(
        err(
          body({ attachment: { name: "a.pdf", type: "application/pdf", content: "" } }),
        ),
      ).toMatch(/no larger than 3 MB/);
    });
    it("allows exactly 3 MB and rejects one byte more", () => {
      const limit = 3 * 1024 * 1024;
      const mk = (n: number) => Buffer.alloc(n, 1).toString("base64");
      expect(
        err(
          body({
            attachment: { name: "a.pdf", type: "application/pdf", content: mk(limit) },
          }),
        ),
      ).toBeNull();
      expect(
        err(
          body({
            attachment: {
              name: "a.pdf",
              type: "application/pdf",
              content: mk(limit + 1),
            },
          }),
        ),
      ).toMatch(/no larger than 3 MB/);
    });
  });
});

describe("formatEmail", () => {
  it("lists team details and each member", () => {
    const s: CleanSubmission = {
      teamName: "Team Spark",
      college: "AJIET",
      leaderPhone: "9876543210",
      theme: "T",
      members: [
        { name: "A", usn: "4AJ22EC001", email: "a@example.com" },
        { name: "B", usn: "4AJ22EC002", email: "b@example.com" },
      ],
      attachment: { filename: "a.pdf", content_type: "application/pdf", content: "" },
    };
    const text = formatEmail(s);
    expect(text).toContain("Team name: Team Spark");
    expect(text).toContain("Team size: 2");
    expect(text).toContain("Member 2\nName: B\nUSN: 4AJ22EC002\nEmail: b@example.com");
  });
});
