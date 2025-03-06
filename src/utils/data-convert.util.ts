/**
 * 문자열 불리언 값을 실제 boolean 타입으로 변환
 */
export const convertToBoolean = (value: any): boolean => {
  if (value === undefined || value === null) return false
  // 이미 불리언 타입인 경우
  if (typeof value === "boolean") return value

  // 문자열인 경우 'true'만 true로 변환, 나머지는 모두 false
  if (typeof value === "string") {
    return value.toLowerCase() === "true"
  }

  // 기타 값은 모두 false로 처리
  return false
}

/**
 * 바이트 단위의 크기를 읽기 쉬운 형식으로 변환
 */
export const formatDiskSize = (sizeInBytes: string): string => {
  try {
    const bytes = parseInt(sizeInBytes, 10)
    if (isNaN(bytes) || bytes === 0) return sizeInBytes

    const units = ["B", "KB", "MB", "GB", "TB", "PB"]
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  } catch (error) {
    return "Unknown"
  }
}
/**
 * 문자열을 숫자로 변환
 *
 * @param value 변환할 문자열
 * @param defaultValue 변환 실패 시 기본값
 * @returns 변환된 숫자 또는 기본값
 *
 * @example
 * convertToNumber('123') // 123
 * convertToNumber('abc', 0) // 0
 */
export const convertToNumber = (value: string | undefined, defaultValue: number = 0): number => {
  if (value === undefined) return defaultValue

  const parsed = Number(value)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * 문자열 배열을 변환
 *
 * @param value 콤마로 구분된 문자열 또는 이미 배열인 값
 * @returns 문자열 배열
 *
 * @example
 * convertToStringArray('a,b,c') // ['a', 'b', 'c']
 * convertToStringArray(['a', 'b']) // ['a', 'b']
 */
export const convertToStringArray = (value: string | string[] | undefined): string[] => {
  if (value === undefined) return []

  if (Array.isArray(value)) {
    return value
  }

  return value.split(",").map((item) => item.trim())
}
