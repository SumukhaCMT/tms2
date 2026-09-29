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
}

const escapeHtml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const sendNoticeMail = ({ to, name, subject, message, button }: NoticeMail) => {
    const template = button ? 'notice-action.mjml' : 'notice.mjml';
    const values: Record<string, string> = {
        title: escapeHtml(subject),
        name: escapeHtml(name),
        message: escapeHtml(message).replace(/\n/g, '<br />'),
        buttonLabel: escapeHtml(button?.label ?? ''),
        buttonLink: button?.link ?? '',
        note: escapeHtml(button?.note ?? '')
    };
    const content = fs
        .readFileSync(path.join(__dirname, '../templates', template), 'utf8')
        .replace(/{{(\w+)}}/g, (_match, key: string) => values[key] ?? '');
    const text = [`Hi ${name},`, message, button ? `${button.label}: ${button.link}` : ''].filter(Boolean).join('\n\n');

    mjml2html(content)
        .then(({ html }) => sendMail({ to, subject, html, text }))
        .catch((err) => console.error(`Failed to send "${subject}" email:`, err));
};
