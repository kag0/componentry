const componentry = {
	_extend: function(superclass, construct, methods) {
		return class extends superclass {
			constructor(...args) {
				let _super = (...args2) => {
					super(...args2)
					return this;
				};
				construct(_super, ...args);
				Object.assign(this, methods);
			}
		};
	},

	register: function(
		name, 
		template,
		{
		jsAttributes = [],
		defaults = {},
		transformAttributes = attribs => attribs,
		generateUpdaters = false
		} = {}
	) {
		const component = this._extend(HTMLElement, function(_super){
			const _this = _super();
			_this.componentry = {};
			const shadow = _this.attachShadow({mode: 'open'});

			_this.reload = function() {
				this.componentry.attributeData = defaults;
				
				// override defaults with element attributes
				for(attribName of this.getAttributeNames()) {
					let value = this.getAttribute(attribName);
					// parse attributes os JSON if necessary 
					if(jsAttributes.includes(attribName)) {
						value = JSON.parse(value);
					}

					this.componentry.attributeData[attribName] = value;
				}

				// generate convenience methods to update attributes
				let updaters = {};
				if(generateUpdaters){
					for(attribName of Object.keys(this.componentry.attributeData)) {
						let updateJs = 
							jsAttributes.includes(attribName) ? 
							`JSON.stringify(update(document.getElementById('${this.getAttribute("id")}').componentry.attributeData['${attribName}']))` : 
							`update(document.getElementById('${this.getAttribute("id")}').componentry.attributeData['${attribName}'])`;

						updaters[`update${attribName.charAt(0).toUpperCase() + attribName.slice(1)}`] = 
							`(update => document.getElementById('${this.getAttribute("id")}').setAttribute('${attribName}', ${updateJs}))`
					}
				}

				this.componentry.templateData = {
					...transformAttributes({...this.componentry.attributeData}),
					...updaters
				};

				shadow.innerHTML = template(this.componentry.templateData);
			}

			// reload the template when attributes change
			new MutationObserver(function(_, _) { _this.reload() })
				.observe(_this, {attributes: true});

			_this.reload();
		});

		customElements.define(name, component);
	}
}