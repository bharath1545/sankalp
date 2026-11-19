// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const pdf = Buffer.from("%PDF-1.4 test").toString("base64");
let ipCounter = 0;

const goodBody = () => ({
  teamName: "Team Spark",
  college: "AJIET",
  leaderPhone: "9876543210",
  theme: "Some theme",
  members: [
    { name: "Asha Rao", usn: "4AJ22EC001", email: "asha@example.com" },
    { name: "", usn: "", email: "" },
    { name: "", usn: "", email: "" },
  ],
  website: "",
  attachment: { name: "idea.pdf", type: "application/pdf", content: pdf },
});

/** Each call gets its own IP unless one is given, so the rate limiter does not interfere. */
function req(
  body: unknown,
  opts: { ip?: string; raw?: string; headers?: Record<string, string> } = {},
) {
  return new Request("http://localhost/api/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": opts.ip ?? `10.0.0.${++ipCounter}`,
      ...opts.headers,
    },
    body: opts.raw ?? JSON.stringify(body),
  });
}

describe("POST /api/submit", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => "" });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("RESEND_FROM_EMAIL", "Sankalp <noreply@example.com>");
    vi.stubEnv("REGISTRATION_EMAIL", "inbox@example.com");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("sends the email through Resend and returns success", async () => {
    const res = await POST(req(goodBody()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    const sent = JSON.parse(init.body);
    expect(sent.from).toBe("Sankalp <noreply@example.com>");
    expect(sent.to).toEqual(["inbox@example.com"]);
    expect(sent.reply_to).toBe("asha@example.com");
    expect(sent.subject).toBe("SANKALP 2026 registration: Team Spark");
    expect(sent.text).toContain("Team name: Team Spark");
    expect(sent.attachments).toEqual([
      { filename: "idea.pdf", content_type: "application/pdf", content: pdf },
    ]);
  });

  it("answers a honeypot hit with success and sends nothing", async () => {
    const res = await POST(req({ ...goodBody(), website: "http://spam" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["invalid JSON", { raw: "{not json" }],
    ["a JSON array", { raw: "[]" }],
    ["JSON null", { raw: "null" }],
  ])("rejects %s with 400", async (_name, opts) => {
    const res = await POST(req(null, opts));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid registration data.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects invalid fields with 400 and the reason", async () => {
    const res = await POST(req({ ...goodBody(), leaderPhone: "123" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/valid leader phone/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an oversize file with 400", async () => {
    const big = Buffer.alloc(3 * 1024 * 1024 + 1, 1).toString("base64");
    const res = await POST(
      req({
        ...goodBody(),
        attachment: { name: "a.pdf", type: "application/pdf", content: big },
      }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/3 MB/);
  });

  it("rejects a declared body size over the limit with 413", async () => {
    const res = await POST(
      req(goodBody(), { headers: { "content-length": String(10 * 1024 * 1024) } }),
    );
    expect(res.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rate limits one IP after five requests", async () => {
    const ip = "203.0.113.9";
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++)
      statuses.push((await POST(req(goodBody(), { ip }))).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
    const limited = await POST(req(goodBody(), { ip }));
    expect(limited.headers.get("Retry-After")).toBe("600");
    // another IP is unaffected
    expect((await POST(req(goodBody(), { ip: "203.0.113.10" }))).status).toBe(200);
  });

  it("uses the first address in x-forwarded-for", async () => {
    const h = { "x-forwarded-for": "198.51.100.7, 10.1.1.1" };
    for (let i = 0; i < 5; i++) await POST(req(goodBody(), { headers: h }));
    const res = await POST(
      req(goodBody(), { headers: { "x-forwarded-for": "198.51.100.7, 10.9.9.9" } }),
    );
    expect(res.status).toBe(429);
  });

  it.each(["RESEND_API_KEY", "RESEND_FROM_EMAIL", "REGISTRATION_EMAIL"])(
    "returns 503 when %s is missing",
    async (name) => {
      vi.stubEnv(name, "");
      const res = await POST(req(goodBody()));
      expect(res.status).toBe(503);
      expect((await res.json()).error).toMatch(/not configured/);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("returns 502 when Resend rejects, without leaking the provider body", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => "secret detail",
    });
    const res = await POST(req(goodBody()));
    expect(res.status).toBe(502);
    expect(JSON.stringify(await res.json())).not.toContain("secret detail");
  });

  it("returns 502 when Resend cannot be reached", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    const res = await POST(req(goodBody()));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/Could not reach/);
  });
});
