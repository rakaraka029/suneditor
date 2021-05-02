function CoreInterface(core) {
	this._w = core._w;
	this._d = core._d;
	this.editor = core;
	this.plugins = core.plugins;
    this.status = core.status;
	this.options = core.options;
	this.context = core.context;
	this.history = core.history;
    this.util = core.util;
}

export default CoreInterface;

