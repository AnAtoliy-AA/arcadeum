// Strip CR/LF so user input never breaks out of an email header value
// (defense in depth — nodemailer's structured API already escapes, but we
// belt-and-suspender for replyTo/subject building.)
export function stripNewlines(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

// Escape Discord markdown so user input can't render as bold, links, etc.
// Wrapping in a fenced code block also disables markdown, but escaping
// keeps embed fields readable when shown inline.
export function escapeDiscordMarkdown(value: string): string {
  return value.replace(/([\\`*_~|>[\]()])/g, '\\$1');
}

// Count http/https URLs in a string. Used to cap link-spam in contact
// messages — real users rarely paste 3+ links, bots paste many.
export function countUrls(value: string): number {
  const matches = value.match(/\bhttps?:\/\/\S+/gi);
  return matches ? matches.length : 0;
}
