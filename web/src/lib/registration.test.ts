import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildPayload,
  emptyValues,
  fileToBase64,
  firstInvalid,
  memberKey,
  submitRegistration,
  validateRegistration,
  type AbstractFormValues,
} from "./registration";

const goodFile = { name: "idea.pdf", size: 1024 };

function valid(): AbstractFormValues {
  const v = emptyValues();
  v.teamName = "Team Spark";
  v.college = "AJIET";
  v.leaderPhone = "9876543210";
  v.theme = "Supply Chain Intelligence & Coastal Chain Intelligence";
  v.members[0] = { name: "Asha Rao", usn: "4AJ22EC001", email: "asha@example.com" };
  return v;
}

describe("validateRegistration", () => {
  it("accepts a team with only member 1", () => {
    expect(validateRegistration(valid(), goodFile)).toEqual({});
  });

  it("accepts three complete members", () => {
    const v = valid();
    v.members[1] = { name: "B", usn: "4AJ22EC002", email: "b@example.com" };
    v.members[2] = { name: "C", usn: "4AJ22EC003", email: "c@example.com" };
    expect(validateRegistration(v, goodFile)).toEqual({});
  });

  it("requires team name, college, phone and theme", () => {
    const e = validateRegistration(emptyValues(), goodFile);
    expect(e.teamName).toBeTruthy();
    expect(e.college).toBeTruthy();
    expect(e.leaderPhone).toBeTruthy();
    expect(e.theme).toBeTruthy();
  });

  it("requires every field of member 1", () => {
    const v = valid();
    v.members[0] = { name: "", usn: "", email: "" };
    const e = validateRegistration(v, goodFile);
    expect(e.member0Name && e.member0Usn && e.member0Email).toBeTruthy();
  });

  describe("phone", () => {
    it.each(["9876543210", "+91 98765 43210", "098765-43210", "6000000000"])(
      "accepts %s",
      (p) => {
        const v = valid();
        v.leaderPhone = p;
        expect(validateRegistration(v, goodFile).leaderPhone).toBeUndefined();
      },
    );
    it.each(["5876543210", "98765", "abcdefghij", "98765432"])("rejects %s", (p) => {
      const v = valid();
      v.leaderPhone = p;
      expect(validateRegistration(v, goodFile).leaderPhone).toBeTruthy();
    });
  });

  it("lets members 2 and 3 stay empty", () => {
    const e = validateRegistration(valid(), goodFile);
    expect(e.member1Name).toBeUndefined();
    expect(e.member2Email).toBeUndefined();
  });

  it("requires all three fields once an optional member is started", () => {
    const v = valid();
    v.members[1].name = "Only a name";
    const e = validateRegistration(v, goodFile);
    expect(e.member1Usn).toBeTruthy();
    expect(e.member1Email).toBeTruthy();
    expect(e.member1Name).toBeUndefined();
  });

  describe("USN", () => {
    it.each(["short", "4AJ22EC001XYZ", "4AJ-22EC001"])("rejects %s", (usn) => {
      const v = valid();
      v.members[0].usn = usn;
      expect(validateRegistration(v, goodFile).member0Usn).toBeTruthy();
    });
    it("flags a duplicate ignoring case", () => {
      const v = valid();
      v.members[1] = { name: "B", usn: "4aj22ec001", email: "b@example.com" };
      const e = validateRegistration(v, goodFile);
      expect(e.member1Usn).toMatch(/already used/);
      expect(e.member0Usn).toBeUndefined();
    });
  });

  describe("email", () => {
    it.each(["nope", "a@b", "a b@c.com", "a@b.c"])("rejects %s", (email) => {
      const v = valid();
      v.members[0].email = email;
      expect(validateRegistration(v, goodFile).member0Email).toBeTruthy();
    });
    it("flags a duplicate ignoring case", () => {
      const v = valid();
      v.members[2] = { name: "C", usn: "4AJ22EC003", email: "ASHA@example.com" };
      expect(validateRegistration(v, goodFile).member2Email).toMatch(/already used/);
    });
  });

  describe("abstract file", () => {
    it("is required", () => {
      expect(validateRegistration(valid(), null).file).toBeTruthy();
    });
    it.each(["a.pdf", "a.doc", "a.docx", "A.PDF", "report.final.DOCX"])(
      "accepts %s",
      (name) => {
        expect(validateRegistration(valid(), { name, size: 10 }).file).toBeUndefined();
      },
    );
    it.each(["a.txt", "a.pdf.exe", "a.docm", "pdf"])("rejects %s", (name) => {
      expect(validateRegistration(valid(), { name, size: 10 }).file).toBeTruthy();
    });
    it("allows exactly 3 MB and rejects one byte more", () => {
      const limit = 3 * 1048576;
      expect(
        validateRegistration(valid(), { name: "a.pdf", size: limit }).file,
      ).toBeUndefined();
      expect(
        validateRegistration(valid(), { name: "a.pdf", size: limit + 1 }).file,
      ).toBeTruthy();
    });
  });
});

describe("firstInvalid", () => {
  it("returns the first field in form order", () => {
    const e = validateRegistration(emptyValues(), null);
    expect(firstInvalid(e)).toBe("teamName");
  });
  it("returns null when valid", () => {
    expect(firstInvalid({})).toBeNull();
  });
  it("builds member keys", () => {
    expect(memberKey(1, "usn")).toBe("member1Usn");
  });
});

describe("fileToBase64 and buildPayload", () => {
  it("encodes file contents without the data: prefix", async () => {
    const file = new File(["hello"], "a.pdf", { type: "application/pdf" });
    expect(await fileToBase64(file)).toBe("aGVsbG8=");
  });

  it("builds the same payload shape as the live site", async () => {
    const v = valid();
    v.teamName = "  Team Spark ";
    const file = new File(["hello"], "idea.pdf", { type: "application/pdf" });
    const p = await buildPayload(v, file);
    expect(p.teamName).toBe("Team Spark");
    expect(p.members).toHaveLength(3);
    expect(p.members[0]).toEqual({
      name: "Asha Rao",
      usn: "4AJ22EC001",
      email: "asha@example.com",
    });
    expect(p.website).toBe("");
    expect(p.attachment).toEqual({
      name: "idea.pdf",
      type: "application/pdf",
      content: "aGVsbG8=",
    });
  });
});

describe("submitRegistration", () => {
  afterEach(() => vi.unstubAllGlobals());
  const payload = {} as Parameters<typeof submitRegistration>[0];

  it("posts JSON to /api/submit", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);
    await submitRegistration(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/submit",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("throws the server's error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "File too large." }),
      }),
    );
    await expect(submitRegistration(payload)).rejects.toThrow("File too large.");
  });

  it("throws a default message when the response is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error("not json");
        },
      }),
    );
    await expect(submitRegistration(payload)).rejects.toThrow(/could not accept/i);
  });

  it("throws when success is not true even with 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    );
    await expect(submitRegistration(payload)).rejects.toThrow();
  });

  it("passes network errors through", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(submitRegistration(payload)).rejects.toThrow("offline");
  });
});

describe("validateTeamDetails", () => {
  it("passes valid team details without a file", async () => {
    const { validateTeamDetails, emptyTeam } = await import("./registration");
    const t = emptyTeam();
    t.teamName = "Alpha";
    t.college = "AJIET";
    t.leaderPhone = "9876543210";
    t.theme = "x";
    t.members[0] = { name: "Asha", usn: "4AL22CS001", email: "a@b.co" };
    expect(validateTeamDetails(t)).toEqual({});
  });

  it("never reports a file error", async () => {
    const { validateTeamDetails, emptyTeam } = await import("./registration");
    expect(validateTeamDetails(emptyTeam()).file).toBeUndefined();
  });
});

describe("validateFinalRegistration", () => {
  it("requires a well-formed Team ID", async () => {
    const { validateFinalRegistration, emptyFinal } = await import("./registration");
    const v = emptyFinal();
    expect(validateFinalRegistration(v).teamId).toMatch(/Round 1 email/);
    v.teamId = "a b!";
    expect(validateFinalRegistration(v).teamId).toMatch(/4 to 24/);
    v.teamId = "SNK26-0001";
    expect(validateFinalRegistration(v).teamId).toBeUndefined();
  });
});
