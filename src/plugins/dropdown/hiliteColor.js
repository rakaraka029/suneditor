/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 Yi JiHong.
 * MIT license.
 */
'use strict';

import colorPicker from '../modules/_colorPicker';

export default {
    name: 'hiliteColor',
    type: 'dropdown',
    add: function (core, targetElement) {
        core.addModule([colorPicker]);

        const context = core.context;
        context.hiliteColor = {
            previewEl: null,
            colorInput: null,
            colorList: null
        };

        /** set dropdown */
        let listDiv = this.setDropdown(core);
        context.hiliteColor.colorInput = listDiv.querySelector('._se_color_picker_input');

        /** add event listeners */
        context.hiliteColor.colorInput.addEventListener('keyup', this.onChangeInput.bind(core));
        listDiv.querySelector('._se_color_picker_submit').addEventListener('click', this.submit.bind(core));
        listDiv.querySelector('._se_color_picker_remove').addEventListener('click', this.remove.bind(core));
        listDiv.addEventListener('click', this.pickup.bind(core));

        context.hiliteColor.colorList = listDiv.querySelectorAll('li button');

        /** append target button menu */
        core.menu.initTarget(targetElement, listDiv);

        /** empty memory */
        listDiv = null;
    },

    setDropdown: function (core) {
        const colorArea = core.context.colorPicker.colorListHTML;
        const listDiv = core.util.createElement('DIV');

        listDiv.className = 'se-dropdown se-list-layer';
        listDiv.innerHTML = colorArea;

        return listDiv;
    },

     /**
     * @Override dropdown
     */
    on: function () {
        const contextPicker = this.context.colorPicker;
        const contextHiliteColor = this.context.hiliteColor;

        contextPicker._colorInput = contextHiliteColor.colorInput;
        const color = this.wwComputedStyle.backgroundColor;
        contextPicker._defaultColor = color ? this.plugins.colorPicker.isHexColor(color) ? color : this.plugins.colorPicker.rgb2hex(color) : '#ffffff';
        contextPicker._styleProperty = 'backgroundColor';
        contextPicker._colorList = contextHiliteColor.colorList;
        
        this.plugins.colorPicker.init.call(this, this.selection.getNode(), null);
    },

     /**
     * @Override _colorPicker
     */
    onChangeInput: function (e) {
        this.plugins.colorPicker.setCurrentColor.call(this, e.target.value);
    },

    submit: function () {
        this.plugins.hiliteColor.applyColor.call(this, this.context.colorPicker._currentColor);
    },

    pickup: function (e) {
        e.preventDefault();
        e.stopPropagation();

        this.plugins.hiliteColor.applyColor.call(this, e.target.getAttribute('data-value'));
    },

    remove: function () {
        this.format.applyTextStyle(null, ['background-color'], ['span'], true);
        this.menu.dropdownOff();
    },

    applyColor: function (color) {
        if (!color) return;
        
        const newNode = this.util.createElement('SPAN');
        newNode.style.backgroundColor = color;
        this.format.applyTextStyle(newNode, ['background-color'], null, null);
        
        this.menu.dropdownOff();
    }
};