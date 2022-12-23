/**
 * @fileoverview history stack closure
 * @author Yi JiHong.
 */

import { _w } from '../../helper/env';
import { getNodeFromPath, getNodePath } from '../../helper/domUtils';

export default function (editor, change) {
	const ctx = editor.context;
	const rootTargets = editor.rootTargets;
	const delayTime = editor.options.historyStackDelayTime;
	let undo = editor.context.buttons.undo;
	let redo = editor.context.buttons.redo;
	let pushDelay = null;
	let stackIndex, stack, rootStack, rootInitContents;

	function setContentFromStack(increase) {
		const prevKey = stack[stackIndex];
		const prevRoot = rootStack[prevKey];

		stackIndex += increase;
		const rootKey = increase < 0 && prevKey !== stack[stackIndex] && prevRoot.index > 0 ? prevKey : stack[stackIndex];
		const root = rootStack[rootKey];
		root.index += increase;

		const item = root.value[root.index];
		this.rootTargets.get(rootKey).get('wysiwyg').innerHTML = item.content;

		if (prevKey !== rootKey && increase < 0 && stackIndex === 1) {
			stackIndex = 0;
		} else if (prevKey !== rootKey && increase > 0 && root.index === 1) {
			stackIndex++;
		} else if ((increase < 0 && root.index < 1) || (increase > 0 && root.index > root.value.length)) {
			stackIndex += increase;
		}

		let focusKey = rootKey;
		let focusItem = item;
		if (increase < 0 && stackIndex > 0 && root.index === 0) {
			const nextKey = stack[stackIndex + increase];
			if (nextKey !== rootKey) {
				const nextRoot = rootStack[nextKey];
				focusKey = nextKey;
				focusItem = nextRoot.value[nextRoot.index];
			}
		}

		editor.changeContextElement(focusKey);
		editor.selection.setRange(getNodeFromPath(focusItem.s.path, ctx.element.wysiwyg), focusItem.s.offset, getNodeFromPath(focusItem.e.path, ctx.element.wysiwyg), focusItem.e.offset);
		editor.focus();

		if (stackIndex < 0) stackIndex = 0;
		else if (stackIndex >= stack.length) stackIndex = stack.length - 1;

		if (stack.length <= 1) {
			if (undo) undo.setAttribute('disabled', true);
			if (redo) redo.setAttribute('disabled', true);
		} else {
			if (stackIndex === 0) {
				if (undo) undo.setAttribute('disabled', true);
				if (redo) redo.removeAttribute('disabled');
			} else if (stackIndex === stack.length - 1) {
				if (undo) undo.removeAttribute('disabled');
				if (redo) redo.setAttribute('disabled', true);
			} else {
				if (undo) undo.removeAttribute('disabled');
				if (redo) redo.removeAttribute('disabled');
			}
		}

		editor._offCurrentController();
		editor._checkComponents();
		editor.char.display();
		editor._resourcesStateChange();

		// onChange
		change();
	}

	function setStack(content, range, rootKey, increase) {
		let s, e;
		if (!range) {
			s = { path: [0, 0], offset: [0, 0] };
			e = { path: 0, offset: 0 };
		} else {
			s = {
				path: getNodePath(range.startContainer, null, null),
				offset: range.startOffset
			};
			e = {
				path: getNodePath(range.endContainer, null, null),
				offset: range.endOffset
			};
		}

		// set root stack
		stackIndex += increase;
		stack[stackIndex] = rootKey;
		const root = rootStack[rootKey];
		root.index += increase;
		root.value[root.index] = {
			content: content,
			s: s,
			e: e
		};
	}

	function resetRoot(rootKey) {
		stackIndex++;
		stack[stackIndex] = rootKey;
		const root = rootStack[rootKey];
		root.index = 0;
		root.value[0] = {
			content: rootInitContents[rootKey],
			s: { path: [0, 0], offset: [0, 0] },
			e: { path: 0, offset: 0 }
		};
	}

	function initRoot(rootKey) {
		rootStack[rootKey] = { value: [], index: -1 };
		rootInitContents[rootKey] = rootTargets.get(rootKey).get('wysiwyg').innerHTML;
	}

	function refreshRoots(root) {
		const deleteRoot = [];
		for (let i = stackIndex + 1, len = stack.length; i < len; i++) {
			if (deleteRoot.indexOf(stack[i]) > -1) continue;
			deleteRoot.push(stack[i]);
		}

		stack = stack.slice(0, stackIndex + 1);
		root.value.splice(stackIndex + 1);
		if (redo) redo.setAttribute('disabled', true);

		for (let i = 0, len = deleteRoot.length; i < len; i++) {
			if (stack.indexOf(deleteRoot[i]) === -1) initRoot(deleteRoot[i]);
		}
	}

	function pushStack(rootKey, range) {
		editor._checkComponents();

		const current = rootTargets.get(rootKey).get('wysiwyg').innerHTML;
		const root = rootStack[rootKey];
		if (!current || (root.value[root.index] && current === root.value[root.index].content)) return;
		if (stack.length > stackIndex + 1) refreshRoots(root);
		if (root.value.length === 0) resetRoot(rootKey);

		setStack(current, range, rootKey, 1);

		if (stackIndex === 1 && undo) undo.removeAttribute('disabled');

		editor.char.display();
		change();
	}

	return {
		/**
		 * @description Saving the current status to the history object stack
		 * If "delay" is true, it will be saved after (options.historyStackDelayTime || 400) miliseconds
		 * If the function is called again with the "delay" argument true before it is saved, the delay time is renewal
		 * You can specify the delay time by sending a number.
		 * @param {Boolean|Number} delay If true, Add stack without delay time.
		 */
		push: function (delay, rootKey) {
			rootKey = rootKey || editor.status.rootKey;
			const range = editor.status._range;

			_w.setTimeout(editor._resourcesStateChange.bind(editor));
			const time = typeof delay === 'number' ? (delay > 0 ? delay : 0) : !delay ? 0 : delayTime;

			if (!time || pushDelay) {
				_w.clearTimeout(pushDelay);
				if (!time) {
					pushStack(rootKey, range);
					return;
				}
			}

			pushDelay = _w.setTimeout(function () {
				_w.clearTimeout(pushDelay);
				pushDelay = null;
				pushStack(rootKey, range);
			}, time);
		},

		check: function (rootKey, range) {
			if (pushDelay) {
				_w.clearTimeout(pushDelay);
				pushDelay = null;
				pushStack(rootKey, range);
			}
		},

		/**
		 * @description Undo function
		 */
		undo: function () {
			if (stackIndex > 0) {
				setContentFromStack(-1);
			}
		},

		/**
		 * @description Redo function
		 */
		redo: function () {
			if (stack.length - 1 > stackIndex) {
				setContentFromStack(1);
			}
		},

		overwrite: function (rootKey) {
			setStack(rootTargets.get(rootKey || editor.status.rootKey).get('wysiwyg').innerHTML, editor.status.rootKey, 0);
		},

		/**
		 * @description Reset the history object
		 */
		reset: function () {
			if (undo) undo.setAttribute('disabled', true);
			if (redo) redo.setAttribute('disabled', true);
			editor.status.isChanged = false;
			if (editor.context.buttons.save) editor.context.buttons.save.setAttribute('disabled', true);

			stackIndex = -1;
			stack = [];
			rootStack = {};
			rootInitContents = {};

			const rootKeys = editor.rootKeys;
			for (let i = 0, len = rootKeys.length, k; i < len; i++) {
				initRoot(rootKeys[i]);
			}
		},

		/**
		 * @description Reset the disabled state of the buttons to fit the current stack.
		 * @private
		 */
		_resetCachingButton: function () {
			undo = editor.context.buttons.undo;
			redo = editor.context.buttons.redo;

			if (stackIndex === 0) {
				if (undo) undo.setAttribute('disabled', true);
				if (redo && stackIndex === stack.length - 1) redo.setAttribute('disabled', true);
				editor.status.isChanged = false;
				if (editor.context.buttons.save) editor.context.buttons.save.setAttribute('disabled', true);
			} else if (stackIndex === stack.length - 1) {
				if (redo) redo.setAttribute('disabled', true);
			}
		},

		/**
		 * @description Remove all stacks and remove the timeout function.
		 * @private
		 */
		_destroy: function () {
			if (pushDelay) _w.clearTimeout(pushDelay);
			stackIndex = stack = rootStack = rootInitContents = null;
		}
	};
}