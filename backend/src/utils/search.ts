const IST = "'+00:00', '+05:30'"

export const searchTerm = (value: unknown) => (typeof value === "string" ? value.trim().slice(0, 100) : "")

export const searchCondition = (term: string, columns: string[]) => {
  const pattern = `%${term.replace(/[\\%_]/g, "\\$&")}%`
  return {
    sql: `(${columns.map((column) => `${column} LIKE ? COLLATE utf8mb4_unicode_ci`).join(" OR ")})`,
    params: columns.map(() => pattern),
  }
}

const sept = (sql: string) => `REPLACE(${sql}, ' Sep ', ' Sept ')`

export const sqlDate = (column: string) => sept(`DATE_FORMAT(CONVERT_TZ(${column}, ${IST}), '%d %b %Y')`)

export const sqlDateTime = (column: string) => sept(`DATE_FORMAT(CONVERT_TZ(${column}, ${IST}), '%d %b %Y, %h:%i %p')`)

export const sqlPlainDate = (column: string) => sept(`DATE_FORMAT(${column}, '%d %b %Y')`)

export const sqlMoney = (column: string) => `CONCAT('₹', CAST(${column} AS DECIMAL(18,2)))`

export const sqlPercent = (column: string) => `CONCAT(CAST(${column} AS DECIMAL(5,2)), ' %')`

export const sqlMonths = (column: string) => `CONCAT(${column}, ' Months')`

export const sqlLabel = (column: string) => `REPLACE(${column}, '_', ' ')`

export const sqlYesNo = (column: string) => `IF(${column}, 'Yes', 'No')`
