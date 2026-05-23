export function isAiosInternalTester(userId: string, email: string | null) {
  const accessList = (process.env.AINCARN_AIOS_TEST_USERS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

  return accessList.includes(userId.toLowerCase()) || Boolean(email && accessList.includes(email.toLowerCase()))
}
