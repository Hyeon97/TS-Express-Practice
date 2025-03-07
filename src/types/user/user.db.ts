//  user_info table 데이터 구조 정의
export interface Userinfo {
  idx: number
  GroupID: number
  email: string
  password: string
  confirm_date: Date
  create_date: Date
  last_login_date: Date
  popup_block_duedate: Date
  migration_count: number
  login_count: number
  username: string
  email_notice: string
  log_period: number
  data_period: number
  company: string
  company_addr: string
  company_size: string
  organization: string
  phone: string
  position: string
  country: string
  timezone: string
  language: string
  login_failed_cnt: number
  login_lock: number
  guide_val: number
  pw_data: string
}

//  user_token table 데이터 구조 정의
export interface UserToken {
  nID: number
  sToken: string
  sMaile: string
  sIssue_Date: string
  sLast_Use_Date: string
}
