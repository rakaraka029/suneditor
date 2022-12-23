/**
 * @fileoverview Component class
 * @author Yi JiHong.
 */

import CoreDependency from '../../dependency/_core';
import { domUtils, env, converter } from '../../helper';

const Viewer = function (editor) {
	CoreDependency.call(this, editor);
};

Viewer.prototype = {
	/**
	 * @description Changes to code view or wysiwyg view
	 * @param {boolean|undefined} value true/false, If undefined toggle the codeView mode.
	 */
	codeView: function (value) {
		if (value === undefined) value = !this.status.isCodeView;
		const tc = this.targetContext;
		this.status.isCodeView = value;
		this.editor._offCurrentController();
		this.editor._offCurrentModal();

		domUtils.setDisabled(this.editor._codeViewDisabledButtons, value);
		const _var = this.editor._transformStatus;
		const code = tc.get('code');
		const wysiwygFrame = tc.get('wysiwygFrame');

		if (value) {
			this._setEditorDataToCodeView();
			domUtils.removeClass(code, 'se-display-none');
			_var.wysiwygOriginCssText = _var.wysiwygOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: none');

			if (this.status.isFullScreen) {
				code.style.height = '100%';
			} else if (this.options.height === 'auto' && !this.options.hasCodeMirror) {
				code.style.height = code.scrollHeight > 0 ? code.scrollHeight + 'px' : 'auto';
			}

			if (this.options.hasCodeMirror) {
				this._codeMirrorEditor('refresh', null);
			}

			if (!this.status.isFullScreen) {
				this.editor._notHideToolbar = true;
				if (/balloon/i.test(this.options.mode)) {
					this.context.toolbar._arrow.style.display = 'none';
					this.context.toolbar.main.style.left = '';
					this.editor.isInline = true;
					this.editor.isBalloon = false;
					this.editor.toolbar._showInline();
				}
			}

			this.status._range = null;
			code.focus();
			domUtils.addClass(this.editor._styleCommandMap.codeView, 'active');
		} else {
			if (!domUtils.isNonEditable(wysiwygFrame)) this._setCodeDataToEditor();
			wysiwygFrame.scrollTop = 0;
			domUtils.addClass(code, 'se-display-none');
			wysiwygFrame.style.display = 'block';
			_var.wysiwygOriginCssText = _var.wysiwygOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: block');

			if (this.options.height === 'auto' && !this.options.hasCodeMirror) tc.code.style.height = '0px';

			if (!this.status.isFullScreen) {
				this.editor._notHideToolbar = false;
				if (/balloon/i.test(this.options.mode)) {
					this.context.toolbar._arrow.style.display = '';
					this.editor.isInline = false;
					this.editor.isBalloon = true;
					this.eventManager._hideToolbar();
				}
			}

			this.editor._nativeFocus();
			domUtils.removeClass(this.editor._styleCommandMap.codeView, 'active');

			if (!domUtils.isNonEditable(wysiwygFrame)) {
				this.history.push(false);
				this.history._resetCachingButton();
			}
		}

		this.editor._checkPlaceholder();
		if (this.status.isReadOnly) domUtils.setDisabled(this.editor._codeViewDisabledButtons, true);

		// user event
		if (typeof this.events.onToggleCodeView === 'function') this.events.onToggleCodeView(this.status.isCodeView);
	},

	/**
	 * @description Changes to full screen or default screen
	 * @param {boolean|undefined} value true/false, If undefined toggle the codeView mode.
	 */
	fullScreen: function (value) {
		if (value === undefined) value = !this.status.isFullScreen;
		const tc = this.targetContext;
		this.status.isFullScreen = value;

		const topArea = tc.get('topArea');
		const toolbar = this.context.toolbar.main;
		const editorArea = tc.get('editorArea');
		const wysiwygFrame = tc.get('wysiwygFrame');
		const code = tc.get('code');
		const _var = this.editor._transformStatus;

		this.editor._offCurrentController();
		const wasToolbarHidden = toolbar.style.display === 'none' || (this.editor.isInline && !this.editor.toolbar._inlineToolbarAttr.isShow);

		if (value) {
			if (/balloon|inline/i.test(this.options.mode)) {
				this.context.toolbar._arrow.style.display = 'none';
				_var.fullScreenInline = this.editor.isInline;
				_var.fullScreenBalloon = this.editor.isBalloon;
				this.editor.isInline = false;
				this.editor.isBalloon = false;
			}

			if (this.options.toolbar_container) {
				_var.toolbarParent = toolbar.parentElement;
				tc.get('container').insertBefore(toolbar, editorArea);
			}

			topArea.style.position = 'fixed';
			topArea.style.top = '0';
			topArea.style.left = '0';
			topArea.style.width = '100%';
			topArea.style.maxWidth = '100%';
			topArea.style.height = '100%';
			topArea.style.zIndex = '2147483647';

			if (tc.get('_stickyDummy').style.display !== ('none' && '')) {
				_var.fullScreenSticky = true;
				tc.get('_stickyDummy').style.display = 'none';
				domUtils.removeClass(toolbar, 'se-toolbar-sticky');
			}

			_var.bodyOverflow = this._d.body.style.overflow;
			this._d.body.style.overflow = 'hidden';

			_var.editorAreaOriginCssText = editorArea.style.cssText;
			_var.wysiwygOriginCssText = wysiwygFrame.style.cssText;
			_var.codeOriginCssText = code.style.cssText;

			editorArea.style.cssText = toolbar.style.cssText = '';
			wysiwygFrame.style.cssText = (wysiwygFrame.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0] + this.options.defaultStyle;
			code.style.cssText = (code.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0];
			toolbar.style.width = wysiwygFrame.style.height = code.style.height = '100%';
			toolbar.style.position = 'relative';
			toolbar.style.display = 'block';

			_var.fullScreenInnerHeight = this._w.innerHeight - toolbar.offsetHeight;
			editorArea.style.height = _var.fullScreenInnerHeight - this.options.fullScreenOffset + 'px';

			if (this.options.iframe && this.options.height === 'auto') {
				editorArea.style.overflow = 'auto';
				this.editor._iframeAutoHeight();
			}

			tc.get('topArea').style.marginTop = this.options.fullScreenOffset + 'px';

			if (this.editor._styleCommandMap.fullScreen) {
				domUtils.changeElement(this.editor._styleCommandMap.fullScreen.firstElementChild, this.icons.reduction);
				domUtils.addClass(this.editor._styleCommandMap.fullScreen, 'active');
			}
		} else {
			wysiwygFrame.style.cssText = _var.wysiwygOriginCssText;
			code.style.cssText = _var.codeOriginCssText;
			toolbar.style.cssText = '';
			editorArea.style.cssText = _var.editorAreaOriginCssText;
			topArea.style.cssText = tc.get('topArea').style.cssText;
			this._d.body.style.overflow = _var.bodyOverflow;

			if (this.options.height === 'auto' && !this.options.hasCodeMirror) this._codeViewAutoHeight();

			if (_var.toolbarParent) {
				_var.toolbarParent.appendChild(toolbar);
				_var.toolbarParent = null;
			}

			if (this.options.toolbar_sticky > -1) {
				domUtils.removeClass(toolbar, 'se-toolbar-sticky');
			}

			if (_var.fullScreenSticky && !this.options.toolbar_container) {
				_var.fullScreenSticky = false;
				tc.get('_stickyDummy').style.display = 'block';
				domUtils.addClass(toolbar, 'se-toolbar-sticky');
			}

			if (/balloon|inline/i.test(this.options.mode)) {
				this.context.toolbar._arrow.style.display = '';
				this.editor.isInline = _var.fullScreenInline;
				this.editor.isBalloon = _var.fullScreenBalloon;
				this.editor.toolbar._showInline();
			}

			this.editor.toolbar._resetSticky();
			tc.get('topArea').style.marginTop = '';

			if (this.editor._styleCommandMap.fullScreen) {
				domUtils.changeElement(this.editor._styleCommandMap.fullScreen.firstElementChild, this.icons.expansion);
				domUtils.removeClass(this.editor._styleCommandMap.fullScreen, 'active');
			}
		}

		if (wasToolbarHidden) this.editor.toolbar.hide();

		// user event
		if (typeof this.events.onToggleFullScreen === 'function') this.events.onToggleFullScreen(this.status.isFullScreen);
	},

	/**
	 * @description Add or remove the class name of "body" so that the code block is visible
	 * @param {boolean|undefined} value true/false, If undefined toggle the codeView mode.
	 */
	showBlocks: function (value) {
		if (value === undefined) value = !this.status.isShowBlocks;
		this.status.isShowBlocks = value;

		if (value) {
			domUtils.addClass(this.targetContext.get('wysiwyg'), 'se-show-block');
			domUtils.addClass(this.editor._styleCommandMap.showBlocks, 'active');
		} else {
			domUtils.removeClass(this.targetContext.get('wysiwyg'), 'se-show-block');
			domUtils.removeClass(this.editor._styleCommandMap.showBlocks, 'active');
		}

		this.editor._resourcesStateChange();
	},

	/**
	 * @description Prints the current content of the editor.
	 */
	print: function () {
		const iframe = domUtils.createElement('IFRAME', {
			style: 'display: none;'
		});
		this._d.body.appendChild(iframe);

		const contentHTML = this.options.printTemplate ? this.options.printTemplate.replace(/\{\{\s*content\s*\}\}/i, this.editor.getContent(true)) : this.editor.getContent(true);
		const printDocument = domUtils.getIframeDocument(iframe);
		const wDoc = this.targetContext.get('_wd');

		if (this.options.iframe) {
			const arrts = this.options._printClass !== null ? 'class="' + this.options._printClass + '"' : this.options.iframe_fullPage ? domUtils.getAttributesToString(wDoc.body, ['contenteditable']) : 'class="' + this.options._editableClass + '"';

			printDocument.write('' + '<!DOCTYPE html><html>' + '<head>' + wDoc.head.innerHTML + '</head>' + '<body ' + arrts + '>' + contentHTML + '</body>' + '</html>');
		} else {
			const links = this._d.head.getElementsByTagName('link');
			const styles = this._d.head.getElementsByTagName('style');
			let linkHTML = '';
			for (let i = 0, len = links.length; i < len; i++) {
				linkHTML += links[i].outerHTML;
			}
			for (let i = 0, len = styles.length; i < len; i++) {
				linkHTML += styles[i].outerHTML;
			}

			printDocument.write('<!DOCTYPE html><html><head>' + linkHTML + '</head><body class="' + (this.options._printClass !== null ? this.options._printClass : this.options._editableClass) + '">' + contentHTML + '</body></html>');
		}

		this.editor._openLoading();
		this._w.setTimeout(
			function () {
				try {
					iframe.focus();
					// IE or Edge, Chromium
					if (env.isIE || env.isEdge || env.isChromium || !!this._d.documentMode || !!this._w.StyleMedia) {
						try {
							iframe.contentWindow.document.execCommand('print', false, null);
						} catch (e) {
							console.warn('[SUNEDITOR.print.warn] ' + e);
							iframe.contentWindow.print();
						}
					} else {
						// Other browsers
						iframe.contentWindow.print();
					}
				} catch (error) {
					throw Error('[SUNEDITOR.print.fail] error: ' + error.message);
				} finally {
					this.editor._closeLoading();
					domUtils.removeItem(iframe);
				}
			}.bind(this),
			1000
		);
	},

	/**
	 * @description Open the preview window.
	 */
	preview: function () {
		this.menu.dropdownOff();
		this.menu.containerOff();
		this.editor._offCurrentController();
		this.editor._offCurrentModal();

		const contentHTML = this.options.previewTemplate ? this.options.previewTemplate.replace(/\{\{\s*content\s*\}\}/i, this.editor.getContent(true)) : this.editor.getContent(true);
		const windowObject = this._w.open('', '_blank');
		windowObject.mimeType = 'text/html';
		const wDoc = this.targetContext.get('_wd');

		if (this.options.iframe) {
			const arrts = this.options._printClass !== null ? 'class="' + this.options._printClass + '"' : this.options.iframe_fullPage ? domUtils.getAttributesToString(wDoc.body, ['contenteditable']) : 'class="' + this.options._editableClass + '"';

			windowObject.document.write('<!DOCTYPE html><html><head>' + wDoc.head.innerHTML + '<style>body {overflow:auto !important; margin: 10px auto !important; height:auto !important; outline:1px dashed #ccc;}</style></head><body ' + arrts + '>' + contentHTML + '</body></html>');
		} else {
			const links = this._d.head.getElementsByTagName('link');
			const styles = this._d.head.getElementsByTagName('style');
			let linkHTML = '';
			for (let i = 0, len = links.length; i < len; i++) {
				linkHTML += links[i].outerHTML;
			}
			for (let i = 0, len = styles.length; i < len; i++) {
				linkHTML += styles[i].outerHTML;
			}

			windowObject.document.write(
				'<!DOCTYPE html><html>' +
					'<head>' +
					'<meta charset="utf-8" />' +
					'<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">' +
					'<title>' +
					this.lang.toolbar.preview +
					'</title>' +
					linkHTML +
					'</head>' +
					'<body class="' +
					(this.options._printClass !== null ? this.options._printClass : this.options._editableClass) +
					'" style="margin:10px auto !important; height:auto !important; outline:1px dashed #ccc;">' +
					contentHTML +
					'</body>' +
					'</html>'
			);
		}
	},

	/**
	 * @description Run CodeMirror Editor
	 * @param {"set"|"get"|"readonly"|"refresh"} key method key
	 * @param {any} value params
	 * @returns
	 * @private
	 */
	_codeMirrorEditor: function (key, value) {
		switch (key) {
			case 'set':
				if (this.options.codeMirror5Editor) {
					this.options.codeMirror5Editor.getDoc().setValue(value);
				} else if (this.options.codeMirror6Editor) {
					this.options.codeMirror6Editor.dispatch({
						changes: { from: 0, to: this.options.codeMirror6Editor.state.doc.length, insert: value }
					});
				}
				break;
			case 'get':
				if (this.options.codeMirror5Editor) {
					return this.options.codeMirror5Editor.getDoc().getValue();
				} else if (this.options.codeMirror6Editor) {
					return this.options.codeMirror6Editor.state.doc.toString();
				}
				break;
			case 'readonly':
				if (this.options.codeMirror5Editor) {
					this.options.codeMirror5Editor.setOption('readOnly', value);
				} else if (this.options.codeMirror6Editor) {
					if (!value) this.options.codeMirror6Editor.contentDOM.setAttribute('contenteditable', true);
					else this.options.codeMirror6Editor.contentDOM.removeAttribute('contenteditable');
				}
				break;
			case 'refresh':
				if (this.options.codeMirror5Editor) {
					this.options.codeMirror5Editor.refresh();
				}
				break;
		}
	},

	/**
	 * @description Set method in the code view area
	 * @param {string} value HTML string
	 * @private
	 */
	_setCodeView: function (value) {
		if (this.options.hasCodeMirror) {
			this._codeMirrorEditor('set', value);
		} else {
			this.targetContext.get('code').value = value;
		}
	},

	/**
	 * @description Get method in the code view area
	 * @private
	 */
	_getCodeView: function () {
		if (this.options.hasCodeMirror) {
			return this._codeMirrorEditor('get', null);
		} else {
			return this.targetContext.get('code').value;
		}
	},

	/**
	 * @description Convert the data of the code view and put it in the WYSIWYG area.
	 * @private
	 */
	_setCodeDataToEditor: function () {
		const code_html = this._getCodeView();

		if (this.options.iframe_fullPage) {
			const wDoc = this.targetContext.get('_wd');
			const parseDocument = this.editor._parser.parseFromString(code_html, 'text/html');
			const headChildren = parseDocument.head.children;

			for (let i = 0, len = headChildren.length; i < len; i++) {
				if (/^script$/i.test(headChildren[i].tagName)) {
					parseDocument.head.removeChild(headChildren[i]);
					i--, len--;
				}
			}

			let headers = parseDocument.head.innerHTML;
			if (!parseDocument.head.querySelector('link[rel="stylesheet"]') || (this.options.height === 'auto' && !parseDocument.head.querySelector('style'))) {
				headers += converter._setIframeCssTags(this.options);
			}

			wDoc.head.innerHTML = headers;
			wDoc.body.innerHTML = this.html.clean(parseDocument.body.innerHTML, true, null, null);

			const attrs = parseDocument.body.attributes;
			for (let i = 0, len = attrs.length; i < len; i++) {
				if (attrs[i].name === 'contenteditable') continue;
				wDoc.body.setAttribute(attrs[i].name, attrs[i].value);
			}
			if (!domUtils.hasClass(wDoc.body, 'sun-editor-editable')) {
				const editableClasses = this.options._editableClass.split(' ');
				for (let i = 0; i < editableClasses.length; i++) {
					domUtils.addClass(wDoc.body, this.options._editableClass[i]);
				}
			}
		} else {
			this.targetContext.get('wysiwyg').innerHTML = code_html.length > 0 ? this.html.clean(code_html, true, null, null) : '<' + this.options.defaultLineTag + '><br></' + this.options.defaultLineTag + '>';
		}
	},

	/**
	 * @description Convert the data of the WYSIWYG area and put it in the code view area.
	 * @private
	 */
	_setEditorDataToCodeView: function () {
		const codeContent = this.editor._convertHTMLToCode(this.targetContext.get('wysiwyg'), false);
		let codeValue = '';

		if (this.options.iframe_fullPage) {
			const attrs = domUtils.getAttributesToString(this.targetContext.get('_wd').body, null);
			codeValue = '<!DOCTYPE html>\n<html>\n' + this.targetContext.get('_wd').head.outerHTML.replace(/>(?!\n)/g, '>\n') + '<body ' + attrs + '>\n' + codeContent + '</body>\n</html>';
		} else {
			codeValue = codeContent;
		}

		this.targetContext.get('code').style.display = 'block';
		this.targetContext.get('wysiwygFrame').style.display = 'none';

		this._setCodeView(codeValue);
	},

	constructor: Viewer
};

export default Viewer;