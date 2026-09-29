import PDFDocument from "pdfkit"

export type Doc = PDFKit.PDFDocument

export const COLORS = {
  primary: "#7B1113",
  primarySoft: "#FBF1F1",
  text: "#1F2937",
  muted: "#6B7280",
  border: "#E5E7EB",
  headerFill: "#F3F4F6",
  zebra: "#FAFAFA",
  panel: "#F9FAFB",
}

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
export const LEFT = 40
export const RIGHT = PAGE_WIDTH - 40
export const WIDTH = RIGHT - LEFT
const CONTENT_BOTTOM = PAGE_HEIGHT - 58

export interface MetaItem {
  label: string
  value: string
}

export interface TableColumn {
  label: string
  width: number
  align?: "left" | "right" | "center"
}

export interface TotalRow {
  label: string
  value: string
  emphasis?: boolean
}

export interface ReceiptOptions {
  organizationName: string
  subtitle?: string
  title: string
  meta: MetaItem[]
  footerNote: string
}

export function formatCurrency(value: number): string {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatNumber(value: number): string {
  return Number(Number(value || 0).toFixed(3)).toLocaleString("en-IN")
}

export function formatDate(value: string | Date | null | undefined, withTime = false): string {
  if (!value) return "-"
  const date = value instanceof Date ? value : new Date(/^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? `${value}T00:00:00` : value)
  if (Number.isNaN(date.getTime())) return String(value)
  const datePart = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  return withTime ? `${datePart}, ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : datePart
}

export function ensureSpace(doc: Doc, height: number) {
  if (doc.y + height > CONTENT_BOTTOM) {
    doc.addPage()
    doc.y = 50
  }
}

function drawHeader(doc: Doc, options: ReceiptOptions) {
  doc.rect(0, 0, PAGE_WIDTH, 8).fill(COLORS.primary)

  const top = 34
  doc.font("Helvetica-Bold").fontSize(18).fillColor(COLORS.primary)
    .text(options.organizationName, LEFT, top, { width: WIDTH * 0.6 })
  const leftBottom = doc.y
  doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted)
    .text(options.subtitle ?? "Temple Management System", LEFT, leftBottom + 2, { width: WIDTH * 0.6 })
  const nameBottom = doc.y

  doc.font("Helvetica-Bold").fontSize(15).fillColor(COLORS.text)
    .text(options.title.toUpperCase(), LEFT + WIDTH * 0.5, top + 2, { width: WIDTH * 0.5, align: "right", characterSpacing: 0.5 })
  const titleBottom = doc.y

  const dividerY = Math.max(nameBottom, titleBottom) + 12
  doc.moveTo(LEFT, dividerY).lineTo(RIGHT, dividerY).lineWidth(1).strokeColor(COLORS.border).stroke()
  doc.y = dividerY + 14
  drawMetaPanel(doc, options.meta)
}

function drawMetaPanel(doc: Doc, meta: MetaItem[]) {
  if (!meta.length) return
  const top = doc.y
  const cellWidth = WIDTH / meta.length
  const heights = meta.map((item) => {
    doc.font("Helvetica-Bold").fontSize(10)
    return doc.heightOfString(item.value, { width: cellWidth - 24 })
  })
  const height = Math.max(...heights) + 34

  doc.roundedRect(LEFT, top, WIDTH, height, 6).fill(COLORS.panel)
  doc.roundedRect(LEFT, top, WIDTH, height, 6).lineWidth(0.8).strokeColor(COLORS.border).stroke()

  meta.forEach((item, index) => {
    const x = LEFT + cellWidth * index + 12
    if (index > 0) {
      doc.moveTo(LEFT + cellWidth * index, top + 10).lineTo(LEFT + cellWidth * index, top + height - 10)
        .lineWidth(0.8).strokeColor(COLORS.border).stroke()
    }
    doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.muted)
      .text(item.label.toUpperCase(), x, top + 10, { width: cellWidth - 24, characterSpacing: 0.4 })
    doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.text)
      .text(item.value, x, top + 22, { width: cellWidth - 24 })
  })

  doc.x = LEFT
  doc.y = top + height + 18
}

export function sectionTitle(doc: Doc, title: string) {
  ensureSpace(doc, 50)
  const y = doc.y
  doc.rect(LEFT, y, 3, 12).fill(COLORS.primary)
  doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.primary)
    .text(title.toUpperCase(), LEFT + 10, y + 1, { width: WIDTH - 10, characterSpacing: 0.6 })
  doc.x = LEFT
  doc.y = y + 20
}

export function keyValueGrid(doc: Doc, pairs: MetaItem[], columns = 2) {
  const visible = pairs.filter((pair) => pair.value && pair.value.trim() && pair.value !== "-")
  if (!visible.length) return
  const cellWidth = WIDTH / columns

  for (let start = 0; start < visible.length; start += columns) {
    const row = visible.slice(start, start + columns)
    const heights = row.map((pair) => {
      doc.font("Helvetica").fontSize(10)
      return doc.heightOfString(pair.value, { width: cellWidth - 16 }) + 14
    })
    const rowHeight = Math.max(...heights) + 5
    ensureSpace(doc, rowHeight)
    const y = doc.y
    row.forEach((pair, index) => {
      const x = LEFT + cellWidth * index
      doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.muted)
        .text(pair.label.toUpperCase(), x, y, { width: cellWidth - 16, characterSpacing: 0.4 })
      doc.font("Helvetica").fontSize(10).fillColor(COLORS.text)
        .text(pair.value, x, y + 11, { width: cellWidth - 16 })
    })
    doc.x = LEFT
    doc.y = y + rowHeight
  }
  doc.y += 6
}

function drawTableHeader(doc: Doc, columns: TableColumn[]) {
  const y = doc.y
  doc.rect(LEFT, y, WIDTH, 22).fill(COLORS.headerFill)
  let x = LEFT
  doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.muted)
  columns.forEach((column) => {
    doc.text(column.label.toUpperCase(), x + 6, y + 7, { width: column.width - 12, align: column.align ?? "left", characterSpacing: 0.3 })
    x += column.width
  })
  doc.y = y + 22
}

export function table(doc: Doc, columns: TableColumn[], rows: string[][], minRowHeight = 0) {
  ensureSpace(doc, 60)
  drawTableHeader(doc, columns)

  rows.forEach((row, rowIndex) => {
    doc.font("Helvetica").fontSize(9.5)
    const height = Math.max(minRowHeight, Math.max(...row.map((value, index) => doc.heightOfString(value || "-", { width: columns[index].width - 12 }))) + 12)
    if (doc.y + height > CONTENT_BOTTOM) {
      doc.addPage()
      doc.y = 50
      drawTableHeader(doc, columns)
    }
    const y = doc.y
    if (rowIndex % 2 === 1) doc.rect(LEFT, y, WIDTH, height).fill(COLORS.zebra)
    let x = LEFT
    doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.text)
    row.forEach((value, index) => {
      doc.text(value || "-", x + 6, y + 6, { width: columns[index].width - 12, align: columns[index].align ?? "left" })
      x += columns[index].width
    })
    doc.moveTo(LEFT, y + height).lineTo(RIGHT, y + height).lineWidth(0.6).strokeColor(COLORS.border).stroke()
    doc.y = y + height
  })

  doc.x = LEFT
  doc.y += 10
}

export function totalsBox(doc: Doc, rows: TotalRow[]) {
  const boxWidth = 240
  const x = RIGHT - boxWidth
  ensureSpace(doc, rows.length * 24 + 10)
  rows.forEach((row) => {
    const y = doc.y
    const height = row.emphasis ? 28 : 22
    if (row.emphasis) doc.rect(x, y, boxWidth, height).fill(COLORS.primary)
    doc.font(row.emphasis ? "Helvetica-Bold" : "Helvetica").fontSize(row.emphasis ? 11 : 9.5)
      .fillColor(row.emphasis ? "#FFFFFF" : COLORS.muted)
      .text(row.label, x + 10, y + (row.emphasis ? 9 : 6), { width: boxWidth / 2 - 10 })
    doc.fillColor(row.emphasis ? "#FFFFFF" : COLORS.text).font("Helvetica-Bold")
      .text(row.value, x + boxWidth / 2, y + (row.emphasis ? 9 : 6), { width: boxWidth / 2 - 10, align: "right" })
    if (!row.emphasis) doc.moveTo(x, y + height).lineTo(RIGHT, y + height).lineWidth(0.6).strokeColor(COLORS.border).stroke()
    doc.y = y + height
  })
  doc.x = LEFT
  doc.y += 12
}

export function noteBand(doc: Doc, label: string, text: string) {
  if (!text) return
  doc.font("Helvetica-Oblique").fontSize(9.5)
  const height = doc.heightOfString(text, { width: WIDTH - 110 }) + 16
  ensureSpace(doc, height + 10)
  const y = doc.y
  doc.rect(LEFT, y, WIDTH, height).fill(COLORS.primarySoft)
  doc.rect(LEFT, y, 3, height).fill(COLORS.primary)
  doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.primary)
    .text(label.toUpperCase(), LEFT + 12, y + 9, { width: 90, characterSpacing: 0.4 })
  doc.font("Helvetica-Oblique").fontSize(9.5).fillColor(COLORS.text)
    .text(text, LEFT + 100, y + 8, { width: WIDTH - 110 })
  doc.x = LEFT
  doc.y = y + height + 14
}

export function paragraph(doc: Doc, text: string) {
  if (!text) return
  doc.font("Helvetica").fontSize(10).fillColor(COLORS.text)
  ensureSpace(doc, doc.heightOfString(text, { width: WIDTH }) + 10)
  doc.text(text, LEFT, doc.y, { width: WIDTH, lineGap: 2 })
  doc.x = LEFT
  doc.y += 12
}

export function signatures(doc: Doc, labels: { title: string; name?: string }[]) {
  ensureSpace(doc, 64)
  doc.y += 30
  const y = doc.y
  const slot = Math.min(WIDTH / labels.length, 200)
  const start = RIGHT - slot * labels.length
  labels.forEach((label, index) => {
    const x = start + slot * index + 20
    const width = slot - 20
    doc.moveTo(x, y).lineTo(x + width, y).lineWidth(0.8).strokeColor(COLORS.text).stroke()
    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.text).text(label.title, x, y + 6, { width, align: "center" })
    if (label.name) {
      doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.muted).text(label.name, x, y + 19, { width, align: "center" })
    }
  })
  doc.x = LEFT
  doc.y = y + 32
}

function drawFooters(doc: Doc, note: string) {
  const range = doc.bufferedPageRange()
  const generatedAt = formatDate(new Date(), true)
  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index)
    const bottomMargin = doc.page.margins.bottom
    doc.page.margins.bottom = 0
    const y = PAGE_HEIGHT - 48
    doc.moveTo(LEFT, y).lineTo(RIGHT, y).lineWidth(0.6).strokeColor(COLORS.border).stroke()
    doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.muted)
      .text(note, LEFT, y + 8, { width: WIDTH * 0.58, lineBreak: false })
      .text(`Generated ${generatedAt}  |  Page ${index - range.start + 1} of ${range.count}`, LEFT + WIDTH * 0.6, y + 8, {
        width: WIDTH * 0.4,
        align: "right",
        lineBreak: false,
      })
    doc.page.margins.bottom = bottomMargin
  }
}

export function renderReceipt(options: ReceiptOptions, draw: (doc: Doc) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margins: { top: 40, bottom: 60, left: LEFT, right: 40 }, bufferPages: true })
    const chunks: Buffer[] = []

    doc.on("data", (chunk) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    drawHeader(doc, options)
    draw(doc)
    drawFooters(doc, options.footerNote)
    doc.end()
  })
}

export function closingNote(doc: Doc, text: string) {
  ensureSpace(doc, 34)
  doc.y += 10
  doc.font("Helvetica-Oblique").fontSize(9).fillColor(COLORS.muted).text(text, LEFT, doc.y, { width: WIDTH, align: "center" })
  doc.x = LEFT
  doc.y += 6
}
