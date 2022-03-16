/**
 * Xpra Typescript Client
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

export class XpraError extends Error {}
export class XpraCapabilityError extends XpraError {}
export class XpraInvalidEncoderError extends XpraError {}
export class XpraInvalidHeaderError extends XpraError {}
export class XpraPacketError extends XpraError {}
export class XpraConnectionError extends XpraError {}
export class XpraInvalidAudioCodecError extends XpraError {}
export class XpraAudioError extends XpraError {}
export class XpraChallengeError extends XpraError {}
export class XpraDisconnectionError extends XpraError {}
export class XpraWorkerError extends XpraError {}
export class XpraCryptoError extends XpraError {}
