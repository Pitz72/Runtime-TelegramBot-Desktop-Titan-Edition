import { Telegram } from 'telegraf';
import { classifyTelegramError, normalizeChannelId, postingRight } from './rules';
import type { BotCheckResult } from '../../shared/types';

export type { BotCheckResult };

/**
 * «Prova il bot»: tre domande a Telegram, nessun messaggio pubblicato.
 *
 * 1. il token è valido? (`getMe`)
 * 2. il canale esiste e il bot lo vede? (`getChat`)
 * 3. il bot può pubblicarci? (`getChatMember` sul bot stesso)
 *
 * Prima questi errori si scoprivano solo avviando il motore, leggendo il diario. Niente
 * messaggio di prova di proposito: certe chat non gradiscono nemmeno quello di avvio.
 */

/** Ogni domanda ha un tetto: senza rete, telegraf può restare in attesa a lungo. */
const CALL_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(Object.assign(new Error('timed out'), { code: 'ETIMEDOUT' })), CALL_TIMEOUT_MS);
        promise.then(
            value => { clearTimeout(timer); resolve(value); },
            error => { clearTimeout(timer); reject(error); },
        );
    });
}

const isNetwork = (e: unknown) => classifyTelegramError(e).kind === 'transient' && !(e as any)?.response;

export async function checkBot(token: string, channelId: string): Promise<BotCheckResult> {
    const secret = token.trim();
    // Un errore di rete può riportare l'indirizzo chiamato, token compreso: non deve
    // arrivare all'interfaccia (né a chi fa uno screenshot del risultato).
    const describe = (e: unknown) => classifyTelegramError(e).description.split(secret).join('<token>');
    const api = new Telegram(secret);
    const result: BotCheckResult = {
        token: { status: 'ok' },
        chat: { status: 'skipped' },
        rights: { status: 'skipped' },
    };

    let botUserId: number;
    try {
        const me = await withTimeout(api.getMe());
        botUserId = me.id;
        result.token = { status: 'ok', username: me.username };
    } catch (e) {
        result.token = { status: isNetwork(e) ? 'network' : 'invalid', error: describe(e) };
        return result;
    }

    const chatId = normalizeChannelId(channelId);
    let chatType: string;
    try {
        const chat: any = await withTimeout(api.getChat(chatId));
        chatType = chat.type;
        result.chat = { status: 'ok', type: chat.type, title: chat.title ?? chat.username ?? chat.first_name };
    } catch (e) {
        const status = (e as any)?.response?.error_code;
        result.chat = {
            // 403: la chat c'è ma il bot non può vederla (canale privato in cui non è entrato, o espulso)
            status: isNetwork(e) ? 'network' : status === 403 ? 'noAccess' : 'notFound',
            error: describe(e),
        };
        return result;
    }

    try {
        const member: any = await withTimeout(api.getChatMember(chatId, botUserId));
        result.rights = { status: postingRight(chatType, member) };
    } catch (e) {
        result.rights = { status: isNetwork(e) ? 'network' : 'unknown', error: describe(e) };
    }
    return result;
}
