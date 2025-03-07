//  user_info table 데이터 구조 정의
export interface Userinfo {
  idx: number
  GroupID: number
  email: string
  password: string
  confirm_date: Date
  create_date: Date
  last_login_date: Date
}

//  user_token table 데이터 구조 정의
export interface UserToken {
  nID: number
  sToken: string
  sMaile: string
  sIssue_Date: string
  sLast_Use_Date: string
}
