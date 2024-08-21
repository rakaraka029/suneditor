import EditorInjector from '../../editorInjector';
import { domUtils, env } from '../../helper';
import { ApiManager } from '../../modules';

const { _d } = env;

const ExportPDF = function (editor, pluginOptions) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.exportPDF;
	this.icon = 'PDF';

	// plugin options
	this.apiUrl = pluginOptions.apiUrl;
	this.fileName = pluginOptions.fileName || 'suneditor-pdf';

	// option check
	if (!this.apiUrl) {
		console.warn('[SUNEDITOR.plugins.exportPDF.error] Requires exportPDF."apiUrl" options.');
	} else {
		this.apiManager = new ApiManager(this, {
			method: 'POST',
			url: this.apiUrl,
			headers: {
				'Content-Type': 'application/json'
			},
			responseType: 'blob'
		});
	}
};

ExportPDF.key = 'exportPDF';
ExportPDF.type = 'command';
ExportPDF.className = 'se-component-enabled';
ExportPDF.prototype = {
	/**
	 * @override core
	 * @param {Element} target Target command button
	 */
	async action() {
		this.editor.showLoading();
		let ww = null;

		try {
			const editableDiv = domUtils.createElement('div', { class: this.editor.frameContext.get('wysiwyg').className }, this.html.get());
			ww = domUtils.createElement('div', { style: `position: absolute; top: -10000px; left: -10000px; width: 21cm; columns: 21cm; height: auto;` }, editableDiv);

			if (this.apiUrl) {
				const innerPadding = this._w.getComputedStyle(this.editor.frameContext.get('wysiwyg')).padding;
				const inlineWW = domUtils.applyInlineStylesAll(editableDiv, true, this.options.get('allUsedStyles'));
				ww.innerHTML = `
				<style>
					@page {
						size: A4;
						margin: ${innerPadding};
					}
				</style>
				${inlineWW.outerHTML}`;
			}

			_d.body.appendChild(ww);

			// before event
			if ((await this.triggerEvent('onExportPDFBefore', { editableDiv })) === false) return;

			// at server
			await this._createByServer(ww);
			return;
		} catch (error) {
			console.error(`[SUNEDITOR.plugins.exportPDF.error] ${error.message}`);
		} finally {
			// domUtils.removeItem(ww);
			this.editor.hideLoading();
		}
	},

	async _createByServer(ww) {
		const data = {
			fileName: this.fileName,
			htmlContent: ww.innerHTML
		};

		const xhr = await this.apiManager.asyncCall({ data: JSON.stringify(data) });

		if (xhr.status !== 200) {
			const res = !xhr.responseText ? xhr : JSON.parse(xhr.responseText);
			throw Error(`[SUNEDITOR.plugins.exportPDF.error] ${res.errorMessage}`);
		}

		const blob = new Blob([xhr.response], { type: 'application/pdf' });
		const contentDisposition = xhr.getResponseHeader('Content-Disposition');
		const downloadUrl = URL.createObjectURL(blob);
		const filename = (contentDisposition.match(/filename="([^"]+)/) || [])[1] || this.fileName + '.pdf';
		const a = domUtils.createElement('A', { href: downloadUrl, download: filename, style: 'display: none;' }, null);

		try {
			_d.body.appendChild(a);
			a.click();
		} finally {
			setTimeout(() => {
				domUtils.removeItem(a);
				URL.revokeObjectURL(downloadUrl);
			}, 100);
		}
	},

	constructor: ExportPDF
};

export default ExportPDF;