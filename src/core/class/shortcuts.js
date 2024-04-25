/**
 * @fileoverview Shortcuts class
 */

const Shortcuts = function (editor) {
	this.editor = editor;
	this.isDisabled = false;
};

Shortcuts.prototype = {
	/**
	 * @description If there is a shortcut function, run it.
	 * @param {number} keyCode event.keyCode
	 * @param {boolean} shift Whether to press shift key
	 * @returns {boolean} Whether to execute shortcuts
	 */
	command(keyCode, shift) {
		if (this.isDisabled) return false;

		const info = this.editor.shortcutsKeyMap.get(keyCode + (shift ? 1000 : 0));
		if (!info || (!shift && info.s)) return false;

		this.editor.run(info.c, info.t, info.e);
		return true;
	},

	disable() {
		this.isDisabled = true;
	},

	enable() {
		this.isDisabled = false;
	},

	constructor: Shortcuts
};

export default Shortcuts;