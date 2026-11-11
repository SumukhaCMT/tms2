import fs from 'fs';
import path from 'path';
import mjml2html from 'mjml';
import { sendMail } from './mail';

interface NoticeMail {
    to: string;
    name: string;
    subject: string;
    message: string;
    button?: { label: string; link: string; note?: string };
    details?: [string, string][];
}

const escapeHtml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const sendNoticeMail = ({ to, name, subject, message, button, details = [] }: NoticeMail) => {
    const template = button ? 'notice-action.mjml' : 'notice.mjml';
    const values: Record<string, string> = {
        title: escapeHtml(subject),
        name: escapeHtml(name),
        message: escapeHtml(message).replace(/\n/g, '<br />'),
        buttonLabel: escapeHtml(button?.label ?? ''),
        buttonLink: button?.link ?? '',
        note: escapeHtml(button?.note ?? ''),
        details: details.length
            ? `<mj-table font-size="14px" line-height="22px" color="#262626" padding-bottom="40px" table-layout="fixed" css-class="detail-table">${details
                  .map(([label, value], index) => {
                      const first = index === 0;
                      const last = index === details.length - 1;
                      const labelRadius = `${first ? '10px' : '0'} 0 0 ${last ? '10px' : '0'}`;
                      const valueRadius = `0 ${first ? '10px' : '0'} ${last ? '10px' : '0'} 0`;
                      const labelClass = `detail-label${first ? ' detail-first' : ''}`;
                      const valueClass = `detail-value${last ? ' detail-last' : ''}`;
                      return `<tr><td class="${labelClass}" style="padding:12px 16px;background:${index % 2 ? '#333333' : '#262626'};color:#ffffff;font-weight:600;width:35%;vertical-align:top;border-radius:${labelRadius}">${escapeHtml(label)}</td><td class="${valueClass}" style="padding:12px 16px;background:${index % 2 ? '#f4f4f4' : '#ffffff'};color:#262626;vertical-align:top;word-break:break-word;border-radius:${valueRadius}">${escapeHtml(value).replace(/\n/g, '<br />')}</td></tr>`;
                  })
                  .join('')}</mj-table>`
            : ''
    };
    const content = fs
        .readFileSync(path.join(__dirname, '../templates', template), 'utf8')
        .replace(/{{(\w+)}}/g, (_match, key: string) => values[key] ?? '');
    const text = [`Hi ${name},`, message, details.map(([label, value]) => `${label}: ${value}`).join('\n'), button ? `${button.label}: ${button.link}` : ''].filter(Boolean).join('\n\n');

    mjml2html(content)
        .then(({ html }) => sendMail({ to, subject, html, text }))
        .catch((err) => console.error(`Failed to send "${subject}" email:`, err));
};
