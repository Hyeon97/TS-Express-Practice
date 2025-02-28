import crypto from "crypto"

/**
 * 암호화 유틸리티
 */
export class CryptoUtils {
  // 솔트 생성을 위한 길이
  private static readonly SALT_LENGTH = 16

  // 해시 알고리즘
  private static readonly HASH_ALGORITHM = "sha256"

  /**
   * 비밀번호 해시 생성
   * @param password 해시할 비밀번호
   * @returns 솔트와 해시를 포함한 문자열 (format: salt:hash)
   */
  static hashPassword({ password }: { password: string }): string {
    // 랜덤 솔트 생성
    const salt = crypto.randomBytes(this.SALT_LENGTH).toString("hex")

    // 비밀번호와 솔트를 결합하여 해시 생성
    const hash = crypto
      .createHash(this.HASH_ALGORITHM)
      .update(password + salt)
      .digest("hex")

    // 솔트와 해시를 결합하여 반환 (솔트:해시 형식)
    return `${salt}:${hash}`
  }

  /**
   * 비밀번호 검증
   * @param password 검증할 원본 비밀번호
   * @param storedHash 저장된 해시 (format: salt:hash)
   * @returns 비밀번호 일치 여부
   */
  static verifyPassword({ password, storedHash }: { password: string; storedHash: string }): boolean {
    // 저장된 해시에서 솔트와 해시 추출
    const [salt, hash] = storedHash.split(":")

    if (!salt || !hash) {
      return false
    }

    // 제공된 비밀번호와 저장된 솔트를 결합하여 해시 생성
    const computedHash = crypto
      .createHash(this.HASH_ALGORITHM)
      .update(password + salt)
      .digest("hex")

    // 생성된 해시와 저장된 해시 비교
    return computedHash === hash
  }
}
