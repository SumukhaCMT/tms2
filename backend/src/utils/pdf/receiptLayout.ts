import PDFDocument from "pdfkit"

export type Doc = PDFKit.PDFDocument

export const COLORS = {
  primary: "#111111",
  text: "#222222",
  muted: "#666666",
  border: "#D9D9D9",
  soft: "#F5F5F5",
  white: "#FFFFFF",
}

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 50
export const LEFT = MARGIN
export const RIGHT = PAGE_WIDTH - MARGIN
export const WIDTH = RIGHT - LEFT
const CONTENT_TOP = 64
const CONTENT_BOTTOM = PAGE_HEIGHT - 48
const SECTION_GAP = 16

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
  contact?: string[]
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
    doc.y = CONTENT_TOP
  }
}

function drawHeader(doc: Doc, options: ReceiptOptions) {
  const leftWidth = WIDTH * 0.64
  const rightWidth = WIDTH * 0.34
  const rightX = RIGHT - rightWidth

  doc.font("Helvetica-Bold").fontSize(20).fillColor(COLORS.primary)
    .text(options.organizationName, LEFT, 42, { width: leftWidth, height: 52, ellipsis: true, lineGap: 1 })
  doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.muted)
  doc.y += 4
  ;(options.contact ?? []).forEach((line) => {
    doc.text(line, LEFT, doc.y, { width: leftWidth, lineGap: 2 })
  })
  const leftBottom = doc.y

  doc.font("Helvetica-Bold").fontSize(15).fillColor(COLORS.primary)
    .text(options.title.toUpperCase(), rightX, 46, { width: rightWidth, align: "right", characterSpacing: 1, lineBreak: false })
  doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted)
  if (options.subtitle) doc.text(options.subtitle, rightX, 68, { width: rightWidth, align: "right", lineGap: 2 })
  const rightBottom = doc.y

  const dividerY = Math.max(leftBottom, rightBottom, 80) + 12
  doc.moveTo(LEFT, dividerY).lineTo(RIGHT, dividerY).lineWidth(1.2).strokeColor(COLORS.primary).stroke()
  doc.y = dividerY + 18
  drawMetaPanel(doc, options.meta)
}

function drawContinuationHeader(doc: Doc, options: ReceiptOptions) {
  const previousX = doc.x
  const previousY = doc.y
  doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.primary)
    .text(options.organizationName, LEFT, 28, { width: WIDTH * 0.58, lineBreak: false, ellipsis: true })
  doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.muted)
    .text(options.title.toUpperCase(), LEFT + WIDTH * 0.58, 29, { width: WIDTH * 0.42, align: "right", lineBreak: false, ellipsis: true, characterSpacing: 0.6 })
  doc.moveTo(LEFT, 46).lineTo(RIGHT, 46).lineWidth(0.8).strokeColor(COLORS.border).stroke()
  doc.x = previousX
  doc.y = previousY
}

function drawMetaPanel(doc: Doc, meta: MetaItem[]) {
  if (!meta.length) return
  const top = doc.y
  const cellWidth = WIDTH / meta.length
  const heights = meta.map((item) => {
    doc.font("Helvetica-Bold").fontSize(11)
    return doc.heightOfString(item.value, { width: cellWidth - 28, height: 44, ellipsis: true })
  })
  const height = Math.max(64, Math.min(88, Math.max(...heights) + 42))

  doc.roundedRect(LEFT, top, WIDTH, height, 6).fill(COLORS.soft)
  doc.roundedRect(LEFT, top, WIDTH, height, 6).lineWidth(0.8).strokeColor(COLORS.border).stroke()

  meta.forEach((item, index) => {
    const x = LEFT + cellWidth * index + 14
    if (index > 0) {
      doc.moveTo(LEFT + cellWidth * index, top + 14).lineTo(LEFT + cellWidth * index, top + height - 14)
        .lineWidth(0.8).strokeColor(COLORS.border).stroke()
    }
    doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted)
      .text(item.label.toUpperCase(), x, top + 15, { width: cellWidth - 28, characterSpacing: 0.6 })
    doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.primary)
      .text(item.value, x, top + 31, { width: cellWidth - 28, height: height - 38, ellipsis: true, lineGap: 1 })
  })

  doc.x = LEFT
  doc.y = top + height + 26
}

export function sectionTitle(doc: Doc, title: string) {
  ensureSpace(doc, 100)
  const y = doc.y
  doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.primary)
    .text(title.toUpperCase(), LEFT, y, { characterSpacing: 0.8, lineBreak: false })
  doc.moveTo(LEFT, y + 18).lineTo(RIGHT, y + 18).lineWidth(0.8).strokeColor(COLORS.border).stroke()
  doc.x = LEFT
  doc.y = y + 30
}

export function keyValueGrid(doc: Doc, pairs: MetaItem[], columns = 2) {
  const visible = pairs.filter((pair) => pair.value && pair.value.trim() && pair.value !== "-")
  if (!visible.length) return
  const cellWidth = WIDTH / columns

  for (let start = 0; start < visible.length; start += columns) {
    const row = visible.slice(start, start + columns)
    const heights = row.map((pair) => {
      doc.font("Helvetica").fontSize(11)
      return doc.heightOfString(pair.value, { width: cellWidth - 20 }) + 15
    })
    const rowHeight = Math.max(...heights) + 10
    ensureSpace(doc, rowHeight)
    const y = doc.y
    row.forEach((pair, index) => {
      const x = LEFT + cellWidth * index
      doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted)
        .text(pair.label.toUpperCase(), x, y, { width: cellWidth - 20, characterSpacing: 0.6 })
      doc.font("Helvetica").fontSize(11).fillColor(COLORS.text)
        .text(pair.value, x, y + 13, { width: cellWidth - 20 })
    })
    doc.x = LEFT
    doc.y = y + rowHeight
  }
  doc.y += SECTION_GAP
}

function scaleColumns(columns: TableColumn[]) {
  const total = columns.reduce((sum, column) => sum + column.width, 0)
  return columns.map((column) => ({ ...column, width: (column.width / total) * WIDTH }))
}

function drawTableHeader(doc: Doc, columns: TableColumn[]) {
  const y = doc.y
  doc.rect(LEFT, y, WIDTH, 28).fill(COLORS.soft)
  doc.moveTo(LEFT, y + 28).lineTo(RIGHT, y + 28).lineWidth(1).strokeColor(COLORS.primary).stroke()
  let x = LEFT
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(COLORS.muted)
  columns.forEach((column) => {
    doc.text(column.label.toUpperCase(), x + 8, y + 10, { width: column.width - 16, align: column.align ?? "left", characterSpacing: 0.4 })
    x += column.width
  })
  doc.y = y + 28
}

export function table(doc: Doc, rawColumns: TableColumn[], rows: string[][], minRowHeight = 0) {
  const columns = scaleColumns(rawColumns)
  ensureSpace(doc, 72)
  drawTableHeader(doc, columns)

  rows.forEach((row) => {
    doc.font("Helvetica").fontSize(10.5)
    const height = Math.max(minRowHeight, Math.max(...row.map((value, index) => doc.heightOfString(value || "-", { width: columns[index].width - 16 }))) + 18)
    if (doc.y + height > CONTENT_BOTTOM) {
      doc.addPage()
      doc.y = CONTENT_TOP
      drawTableHeader(doc, columns)
    }
    const y = doc.y
    let x = LEFT
    row.forEach((value, index) => {
      doc.font(index === 1 ? "Helvetica-Bold" : "Helvetica").fontSize(10.5).fillColor(index === 0 ? COLORS.muted : COLORS.text)
        .text(value || "-", x + 8, y + 9, { width: columns[index].width - 16, align: columns[index].align ?? "left" })
      x += columns[index].width
    })
    doc.moveTo(LEFT, y + height).lineTo(RIGHT, y + height).lineWidth(0.6).strokeColor(COLORS.border).stroke()
    doc.y = y + height
  })

  doc.x = LEFT
  doc.y += SECTION_GAP + 4
}

export function totalsBox(doc: Doc, rows: TotalRow[]) {
  const boxWidth = 260
  const x = RIGHT - boxWidth
  const height = rows.reduce((sum, row) => sum + (row.emphasis ? 34 : 26), 0)
  ensureSpace(doc, height + SECTION_GAP)
  const top = doc.y
  doc.roundedRect(x, top, boxWidth, height, 6).lineWidth(0.8).strokeColor(COLORS.border).stroke()
  rows.forEach((row, index) => {
    const y = doc.y
    const rowHeight = row.emphasis ? 34 : 26
    if (row.emphasis) {
      doc.save()
      doc.roundedRect(x, top, boxWidth, height, 6).clip()
      doc.rect(x, y, boxWidth, rowHeight).fill(COLORS.primary)
      doc.restore()
    } else if (index > 0) {
      doc.moveTo(x + 12, y).lineTo(RIGHT - 12, y).lineWidth(0.6).strokeColor(COLORS.border).stroke()
    }
    const textY = y + (row.emphasis ? 11 : 8)
    doc.font(row.emphasis ? "Helvetica-Bold" : "Helvetica").fontSize(row.emphasis ? 11.5 : 10)
      .fillColor(row.emphasis ? COLORS.white : COLORS.muted)
      .text(row.label, x + 14, textY, { width: boxWidth / 2 - 14, lineBreak: false })
    doc.font("Helvetica-Bold").fontSize(row.emphasis ? 12.5 : 10.5).fillColor(row.emphasis ? COLORS.white : COLORS.text)
      .text(row.value, x + boxWidth / 2, textY - (row.emphasis ? 0.5 : 0), { width: boxWidth / 2 - 14, align: "right", lineBreak: false })
    doc.y = y + rowHeight
  })
  doc.x = LEFT
  doc.y = top + height + SECTION_GAP
}

export function noteBand(doc: Doc, label: string, text: string) {
  if (!text) return
  doc.font("Helvetica-Oblique").fontSize(10.5)
  const height = doc.heightOfString(text, { width: WIDTH - 120 }) + 22
  ensureSpace(doc, height + SECTION_GAP)
  const y = doc.y
  doc.roundedRect(LEFT, y, WIDTH, height, 6).fill(COLORS.soft)
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(COLORS.muted)
    .text(label.toUpperCase(), LEFT + 14, y + 12, { width: 92, characterSpacing: 0.6 })
  doc.font("Helvetica-Oblique").fontSize(10.5).fillColor(COLORS.text)
    .text(text, LEFT + 108, y + 11, { width: WIDTH - 120 })
  doc.x = LEFT
  doc.y = y + height + SECTION_GAP + 4
}

export function paragraph(doc: Doc, text: string) {
  if (!text) return
  doc.font("Helvetica").fontSize(11).fillColor(COLORS.text)
  ensureSpace(doc, doc.heightOfString(text, { width: WIDTH, lineGap: 3 }) + SECTION_GAP)
  doc.text(text, LEFT, doc.y, { width: WIDTH, lineGap: 3 })
  doc.x = LEFT
  doc.y += SECTION_GAP + 4
}

export function signatures(doc: Doc, labels: { title: string; name?: string }[]) {
  ensureSpace(doc, 50)
  doc.y += 24
  const y = doc.y
  const slot = Math.min(WIDTH / labels.length, 200)
  const start = RIGHT - slot * labels.length
  labels.forEach((label, index) => {
    const x = start + slot * index + 16
    const width = slot - 16
    doc.moveTo(x, y).lineTo(x + width, y).lineWidth(0.8).strokeColor(COLORS.primary).stroke()
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(COLORS.primary).text(label.title.toUpperCase(), x, y + 8, { width, align: "center", characterSpacing: 0.6 })
    if (label.name) {
      doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.muted).text(label.name, x, y + 22, { width, align: "center" })
    }
  })
  doc.x = LEFT
  doc.y = y + (labels.some((label) => label.name) ? 38 : 26)
}

function drawFooters(doc: Doc) {
  const range = doc.bufferedPageRange()
  const generatedAt = formatDate(new Date(), true)
  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index)
    const bottomMargin = doc.page.margins.bottom
    doc.page.margins.bottom = 0
    const y = PAGE_HEIGHT - 42
    doc.moveTo(LEFT, y).lineTo(RIGHT, y).lineWidth(0.6).strokeColor(COLORS.border).stroke()
    doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted)
      .text(`Generated ${generatedAt}`, LEFT, y + 11, { width: WIDTH * 0.55, lineBreak: false })
      .text(`Page ${index - range.start + 1} of ${range.count}`, LEFT + WIDTH * 0.55, y + 11, {
        width: WIDTH * 0.45,
        align: "right",
        lineBreak: false,
      })
    doc.page.margins.bottom = bottomMargin
  }
}

export function renderReceipt(options: ReceiptOptions, draw: (doc: Doc) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margins: { top: MARGIN, bottom: 40, left: MARGIN, right: MARGIN }, bufferPages: true })
    const chunks: Buffer[] = []

    doc.on("data", (chunk) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)
    doc.on("pageAdded", () => drawContinuationHeader(doc, options))

    drawHeader(doc, options)
    draw(doc)
    drawFooters(doc)
    doc.end()
  })
}

export function closingNote(doc: Doc, text: string) {
  ensureSpace(doc, 34)
  doc.y += 14
  doc.font("Helvetica-Oblique").fontSize(9.5).fillColor(COLORS.muted).text(text, LEFT, doc.y, { width: WIDTH, align: "center", lineGap: 2 })
  doc.x = LEFT
  doc.y += 6
}
