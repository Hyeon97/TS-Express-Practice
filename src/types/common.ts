export type LogFormat = "dev" | "combined" | "common" | "short" | "tiny"
export type LogLevel = "error" | "warn" | "info" | "http" | "debug" | "silly"

export const VALID_OS_VALUES = ["win", "lin"] as const
export const VALID_BOOLEAN_VALUES = ["true", "false"] as const
export const VALID_STATE_VALUES = ["connect", "disconnect"] as const
export const VALID_LICENSE_VALUES = ["assign", "unassign"] as const
