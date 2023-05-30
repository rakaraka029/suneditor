(function (global, factory) {
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = global.document
			? factory(global, true)
			: function (w) {
				if (!w.document) {
					throw new Error('SUNEDITOR_LANG a window with a document');
				}
				return factory(w);
			};
	} else {
		factory(global);
	}
})(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
	const lang = {
		code: 'en',
		align: 'Align',
		alignCenter: 'Align center',
		alignJustify: 'Align justify',
		alignLeft: 'Align left',
		alignRight: 'Align right',
		audio: 'Audio',
		audio_modal_file: 'Select from files',
		audio_modal_title: 'Insert Audio',
		audio_modal_url: 'Audio URL',
		autoSize: 'Auto size',
		backgroundColor: 'Highlight Color',
		basic: 'Basic',
		bold: 'Bold',
		caption: 'Insert description',
		center: 'Center',
		close: 'Close',
		codeView: 'Code view',
		default: 'Default',
		deleteColumn: 'Delete column',
		deleteRow: 'Delete row',
		dir_ltr: 'Left to right',
		dir_rtl: 'Right to left',
		edit: 'Edit',
		fixedColumnWidth: 'Fixed column width',
		font: 'Font',
		fontColor: 'Font Color',
		fontSize: 'Size',
		formats: 'Formats',
		fullScreen: 'Full screen',
		height: 'Height',
		horizontalLine: 'Horizontal line',
		horizontalSplit: 'Horizontal split',
		hr_dashed: 'Dashed',
		hr_dotted: 'Dotted',
		hr_solid: 'Solid',
		image: 'Image',
		imageGallery: 'Image gallery',
		image_modal_altText: 'Alternative text',
		image_modal_file: 'Select from files',
		image_modal_title: 'Insert image',
		image_modal_url: 'Image URL',
		indent: 'Indent',
		insertColumnAfter: 'Insert column after',
		insertColumnBefore: 'Insert column before',
		insertRowAbove: 'Insert row above',
		insertRowBelow: 'Insert row below',
		italic: 'Italic',
		layout: 'Layout',
		left: 'Left',
		lineHeight: 'Line height',
		link: 'Link',
		link_modal_bookmark: 'Bookmark',
		link_modal_downloadLinkCheck: 'Download link',
		link_modal_newWindowCheck: 'Open in new window',
		link_modal_text: 'Text to display',
		link_modal_title: 'Insert Link',
		link_modal_url: 'URL to link',
		list: 'List',
		math: 'Math',
		math_modal_fontSizeLabel: 'Font Size',
		math_modal_inputLabel: 'Mathematical Notation',
		math_modal_previewLabel: 'Preview',
		math_modal_title: 'Math',
		maxSize: 'Max size',
		mention: 'Mention',
		menu_bordered: 'Bordered',
		menu_code: 'Code',
		menu_neon: 'Neon',
		menu_shadow: 'Shadow',
		menu_spaced: 'Spaced',
		menu_translucent: 'Translucent',
		mergeCells: 'Merge cells',
		minSize: 'Min size',
		mirrorHorizontal: 'Mirror, Horizontal',
		mirrorVertical: 'Mirror, Vertical',
		orderList: 'Ordered list',
		outdent: 'Outdent',
		paragraphStyle: 'Paragraph style',
		preview: 'Preview',
		print: 'print',
		proportion: 'Constrain proportions',
		ratio: 'Ratio',
		redo: 'Redo',
		remove: 'Remove',
		removeFormat: 'Remove Format',
		resize100: 'Zoom 100%',
		resize25: 'Zoom 25%',
		resize50: 'Zoom 50%',
		resize75: 'Zoom 75%',
		resize: 'Resize',
		revertButton: 'Revert',
		right: 'Right',
		rotateLeft: 'Rotate left',
		rotateRight: 'Rotate right',
		save: 'Save',
		search: 'Search',
		showBlocks: 'Show blocks',
		size: 'Size',
		splitCells: 'Split Cells',
		strike: 'Strike',
		submitButton: 'Submit',
		subscript: 'Subscript',
		superscript: 'Superscript',
		table: 'Table',
		tableHeader: 'Table header',
		tags: 'Tags',
		tag_blockquote: 'Quote',
		tag_div: 'Normal (DIV)',
		tag_h: 'Header',
		tag_p: 'Paragraph',
		tag_pre: 'Code',
		template: 'Template',
		textStyle: 'Text style',
		title: 'Title',
		underline: 'Underline',
		undo: 'Undo',
		unlink: 'Unlink',
		unorderList: 'Unordered list',
		verticalSplit: 'Vertical split',
		video: 'Video',
		video_modal_file: 'Select from files',
		video_modal_title: 'Insert Video',
		video_modal_url: 'Media embed URL, YouTube/Vimeo',
		width: 'Width',
	};

	if (typeof noGlobal === typeof undefined) {
		if (!window.SUNEDITOR_LANG) {
			Object.defineProperty(window, 'SUNEDITOR_LANG', {
				enumerable: true,
				writable: false,
				configurable: false,
				value: {}
			});
		}

		Object.defineProperty(window.SUNEDITOR_LANG, 'en', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
