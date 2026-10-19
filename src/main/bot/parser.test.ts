import { describe, expect, it } from 'vitest';
import { validateFeedUrl } from './parser';

describe('validateFeedUrl — difesa anti-SSRF', () => {
    it('accetta i feed pubblici', () => {
        for (const url of [
            'https://www.spreaker.com/show/7218870/episodes/feed',
            'http://feeds.example.org/rss.xml',
            'https://8.8.8.8/feed',
            'https://[2001:4860:4860::8888]/feed',
            'https://[::ffff:8.8.8.8]/feed',
        ]) {
            expect(() => validateFeedUrl(url)).not.toThrow();
        }
    });

    it('rifiuta schemi diversi da http/https', () => {
        for (const url of ['file:///C:/Windows/win.ini', 'ftp://example.org/feed', 'javascript:alert(1)']) {
            expect(() => validateFeedUrl(url)).toThrow();
        }
    });

    it('rifiuta loopback, reti private e metadata cloud', () => {
        for (const url of [
            'http://localhost/feed',
            'http://127.0.0.1/feed',
            'http://10.0.0.5/feed',
            'http://172.16.3.4/feed',
            'http://192.168.1.10/feed',
            'http://169.254.169.254/latest/meta-data',
            'http://100.64.0.1/feed',
            'http://[::1]/feed',
            'http://[fd00::1]/feed',
            'http://[fe80::1]/feed',
            'http://[::ffff:127.0.0.1]/feed',
            'http://[::ffff:7f00:1]/feed',
            'http://[::ffff:192.168.0.1]/feed',
            'http://[64:ff9b::a00:1]/feed',
            'http://[::127.0.0.1]/feed',
            'http://[ff02::1]/feed',
            'http://nas.local/feed',
            'http://metadata.google.internal/feed',
        ]) {
            expect(() => validateFeedUrl(url), url).toThrow();
        }
    });

    it('rifiuta l\'IPv4 scritto in forma numerica', () => {
        expect(() => validateFeedUrl('http://2130706433/feed')).toThrow();
        expect(() => validateFeedUrl('http://0x7f000001/feed')).toThrow();
    });

    it('rifiuta ciò che non è un URL', () => {
        expect(() => validateFeedUrl('non un url')).toThrow();
        expect(() => validateFeedUrl('')).toThrow();
    });
});
