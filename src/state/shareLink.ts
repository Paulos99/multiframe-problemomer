/**
 * Deep-link: encode RoomAnswers into ?p= so messengers / paste open the same Result.
 */
import type { RoomAnswers, SessionState } from './types';
import { createInitialSession, withDerived } from './session';

const SHARE_PARAM = 'p';

function toBase64Url(raw: string): string {
  const b64 = btoa(raw);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(token: string): string {
  const b64 = token.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  return atob(b64 + pad);
}

function utf8ToBinary(s: string): string {
  return unescape(encodeURIComponent(s));
}

function binaryToUtf8(s: string): string {
  return decodeURIComponent(escape(s));
}

/** Compact JSON of the answer chain (room questionnaire). */
export function encodeRoomAnswers(room: RoomAnswers): string {
  const json = JSON.stringify(room);
  return toBase64Url(utf8ToBinary(json));
}

export function decodeRoomAnswers(token: string): RoomAnswers | null {
  try {
    const json = binaryToUtf8(fromBase64Url(token));
    const data = JSON.parse(json) as Partial<RoomAnswers>;
    if (!data || typeof data !== 'object') return null;
    if (typeof data.slabType !== 'string' || typeof data.roomWish !== 'string') return null;
    return data as RoomAnswers;
  } catch {
    return null;
  }
}

export function buildShareUrl(session: SessionState, origin = window.location.origin): string {
  const basePath = import.meta.env.BASE_URL || '/';
  const url = new URL(basePath, origin);
  url.searchParams.set(SHARE_PARAM, encodeRoomAnswers(session.answers.room));
  return url.toString();
}

/** Marketing line for messenger share sheet / clipboard blurb. */
export const SHARE_MARKETING_BLURB =
  'Ощутите эффект звукоизоляции. Пройдите бесплатный расчёт — шаги, музыка и эхо в вашей комнате:';

export function buildShareClipboardText(session: SessionState): string {
  return `${SHARE_MARKETING_BLURB}\n${buildShareUrl(session)}`;
}

export function readShareParamFromLocation(
  search = typeof window !== 'undefined' ? window.location.search : '',
): string | null {
  try {
    const params = new URLSearchParams(search);
    const p = params.get(SHARE_PARAM);
    return p && p.length > 8 ? p : null;
  } catch {
    return null;
  }
}

/** Hydrate a Result session from ?p= payload. */
export function sessionFromShareToken(token: string): SessionState | null {
  const room = decodeRoomAnswers(token);
  if (!room) return null;
  const base = createInitialSession();
  return withDerived({
    ...base,
    step: 'result',
    answers: {
      ...base.answers,
      room,
    },
  });
}

export function tryRestoreSharedSession(): SessionState | null {
  const token = readShareParamFromLocation();
  if (!token) return null;
  return sessionFromShareToken(token);
}
