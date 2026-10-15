import net from 'node:net';

/**
 * Minimal plaintext SMTP sink for automated tests. It never relays mail.
 * `failAuth` and `failRecipient(address)` simulate provider failures;
 * `delayMs` slows acceptance and `onMessage` observes each accepted message.
 */
export function startMockSmtp() {
  const state = {
    messages: [],
    failAuth: false,
    failRecipient: () => false,
    delayMs: 0,
    onMessage: null,
  };

  const server = net.createServer((socket) => {
    let buffer = '';
    let inData = false;
    let authStep = null;
    let envelope = { from: '', to: [] };
    const reply = (line) => socket.write(`${line}\r\n`);

    reply('220 mock-smtp ESMTP');

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');

      while (true) {
        if (inData) {
          const end = buffer.indexOf('\r\n.\r\n');
          if (end < 0) return;
          const raw = buffer.slice(0, end).replace(/\r\n\.\./g, '\r\n.');
          buffer = buffer.slice(end + 5);
          inData = false;
          const message = { ...envelope, raw };
          envelope = { from: '', to: [] };
          setTimeout(() => {
            state.messages.push(message);
            state.onMessage?.(message);
            reply('250 2.0.0 queued');
          }, state.delayMs);
          continue;
        }

        const lineEnd = buffer.indexOf('\r\n');
        if (lineEnd < 0) return;
        const line = buffer.slice(0, lineEnd);
        buffer = buffer.slice(lineEnd + 2);
        const upper = line.toUpperCase();

        if (authStep === 'user') {
          authStep = 'pass';
          reply('334 UGFzc3dvcmQ6');
        } else if (authStep === 'pass') {
          authStep = null;
          reply(state.failAuth ? '535 5.7.8 authentication failed' : '235 2.7.0 accepted');
        } else if (upper.startsWith('EHLO') || upper.startsWith('HELO')) {
          socket.write('250-mock-smtp\r\n250-AUTH PLAIN LOGIN\r\n250 8BITMIME\r\n');
        } else if (upper.startsWith('AUTH PLAIN')) {
          reply(state.failAuth ? '535 5.7.8 authentication failed' : '235 2.7.0 accepted');
        } else if (upper.startsWith('AUTH LOGIN')) {
          authStep = 'user';
          reply('334 VXNlcm5hbWU6');
        } else if (upper.startsWith('MAIL FROM')) {
          envelope.from = line.slice(10).trim();
          reply('250 2.1.0 ok');
        } else if (upper.startsWith('RCPT TO')) {
          const address = line.slice(8).trim().replace(/[<>]/g, '');
          if (state.failRecipient(address)) {
            reply('550 5.1.1 mailbox unavailable');
          } else {
            envelope.to.push(address);
            reply('250 2.1.5 ok');
          }
        } else if (upper === 'DATA') {
          inData = true;
          reply('354 end with <CRLF>.<CRLF>');
        } else if (upper === 'RSET') {
          envelope = { from: '', to: [] };
          reply('250 2.0.0 ok');
        } else if (upper === 'NOOP') {
          reply('250 2.0.0 ok');
        } else if (upper === 'QUIT') {
          reply('221 2.0.0 bye');
          socket.end();
        } else {
          reply('502 5.5.2 not implemented');
        }
      }
    });
    socket.on('error', () => {});
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({
        port: server.address().port,
        state,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

/** Decodes quoted-printable soft breaks and escapes so URLs can be extracted. */
export function decodeQuotedPrintable(raw) {
  return raw
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}
