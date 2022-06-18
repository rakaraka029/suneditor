const userAgent = navigator.userAgent.toLowerCase();

/**
 * @description Checks if User Agent is IE
 * @returns {boolean} Whether User Agent is IE or not.
 */
export function isIE() {
	return userAgent.indexOf('trident') > -1;
}

/**
 * @description Checks if User Agent is Edge
 * @returns {boolean} Whether User Agent is Edge or not.
 */
export function isEdge() {
	return navigator.appVersion.indexOf('Edge') > -1;
}

/**
 * @description Checks if platform is OSX or IOS
 * @returns {boolean} Whether platform is (OSX || IOS) or not.
 */
export function isOSX_IOS() {
	return /(Mac|iPhone|iPod|iPad)/.test(navigator.platform);
}

/**
 * @description Checks if User Agent Blink engine.
 * @returns {boolean} Whether User Agent is Blink engine or not.
 */
export function isBlink() {
	return userAgent.indexOf('chrome/') > -1 && userAgent.indexOf('edge/') < 0;
}

/**
 * @description Checks if User Agent is Firefox (Gecko).
 * @returns {boolean} Whether User Agent is Firefox or not.
 */
export function isGecko() {
	return !!userAgent.match(/gecko\/\d+/);
}

/**
 * @description Checks if User Agent is Chromium browser.
 * @returns {boolean} Whether User Agent is Chromium browser.
 */
export function isChromium() {
	return !!window.chrome;
}

/**
 * @description Checks if User Agent is Safari.
 * @returns {boolean} Whether User Agent is Safari or not.
 */
export function isSafari() {
	return userAgent.indexOf('applewebkit/') > -1 && userAgent.indexOf('chrome') === -1;
}

/**
 * @description Checks if User Agent is Android mobile device.
 * @returns {boolean} Whether User Agent is Android or not.
 */
export function isAndroid() {
	return userAgent.indexOf('android') > -1;
}

/**
 * @description Command(Mac) or CTRL(Window) icon.
 */
export const cmdIcon = isOSX_IOS ? '⌘' : 'CTRL';

/**
 * @description SHIFT(Mac, Window) icon.
 */
export const shiftIcon = isOSX_IOS ? '⇧' : '+SHIFT';

export const _allowedEmptyNodeList = '.se-component, pre, blockquote, hr, li, table, img, iframe, video, audio, canvas, details';

const env = {
	isIE: isIE(),
	isEdge: isEdge(),
	isBlink: isBlink(),
	isGecko: isGecko(),
	isChromium: isChromium(),
	isSafari: isSafari(),
	isOSX_IOS: isOSX_IOS(),
	isAndroid: isAndroid(),
	cmdIcon: cmdIcon,
	shiftIcon: shiftIcon,
	_allowedEmptyNodeList: _allowedEmptyNodeList
};

export default env;