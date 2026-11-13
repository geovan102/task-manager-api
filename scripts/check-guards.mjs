// Sends requests WITHOUT a token and checks that every protected endpoint
// answers 401 and every public endpoint answers 200.
// Uses only fake ids (999999) and fake data. Needs the server to be running.
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

// [method, path, body or null, expected status]
const checks = [
  ['GET', '/', null, 200],
  ['GET', '/health', null, 200],
  ['GET', '/auth/me', null, 401],
  ['POST', '/projects', { name: 'x' }, 401],
  ['GET', '/projects', null, 401],
  ['GET', '/projects/999999', null, 401],
  ['PATCH', '/projects/999999', { name: 'x' }, 401],
  ['DELETE', '/projects/999999', null, 401],
  ['POST', '/projects/999999/members', { email: 'a@example.com' }, 401],
  ['GET', '/projects/999999/members', null, 401],
  ['DELETE', '/projects/999999/members/999999', null, 401],
  ['POST', '/tasks', { title: 'x', projectId: 999999 }, 401],
  ['GET', '/tasks?projectId=999999', null, 401],
  ['GET', '/tasks/999999', null, 401],
  ['PATCH', '/tasks/999999', { title: 'x' }, 401],
  ['DELETE', '/tasks/999999', null, 401],
];

let failures = 0;

for (const [method, path, body, expected] of checks) {
  let status;
  try {
    const response = await fetch(BASE + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    status = response.status;
  } catch {
    console.log(`ERROR  cannot reach ${BASE}. Is the server running?`);
    process.exit(1);
  }

  const ok = status === expected;
  if (!ok) failures++;
  console.log(
    `${ok ? 'OK  ' : 'FAIL'}  got ${status}, expected ${expected}  ${method} ${path}`,
  );
}

console.log(
  failures === 0
    ? `\nAll ${checks.length} checks passed.`
    : `\n${failures} of ${checks.length} checks FAILED.`,
);
process.exit(failures === 0 ? 0 : 1);
