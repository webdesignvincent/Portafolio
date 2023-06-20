import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { Directive, ElementRef, EventEmitter, forwardRef, Input, NgZone, Output } from '@angular/core';
import FroalaEditor from 'froala-editor';
export class FroalaEditorDirective {
    constructor(el, zone) {
        this.zone = zone;
        // editor options
        this._opts = {
            immediateAngularModelUpdate: false,
            angularIgnoreAttrs: null
        };
        this.SPECIAL_TAGS = ['img', 'button', 'input', 'a'];
        this.INNER_HTML_ATTR = 'innerHTML';
        this._hasSpecialTag = false;
        this._editorInitialized = false;
        this._oldModel = null;
        // Begin ControlValueAccesor methods.
        this.onChange = (_) => {
        };
        this.onTouched = () => {
        };
        // froalaModel directive as output: update model if editor contentChanged
        this.froalaModelChange = new EventEmitter();
        // froalaInit directive as output: send manual editor initialization
        this.froalaInit = new EventEmitter();
        let element = el.nativeElement;
        // check if the element is a special tag
        if (this.SPECIAL_TAGS.indexOf(element.tagName.toLowerCase()) != -1) {
            this._hasSpecialTag = true;
        }
        this._element = element;
        this.zone = zone;
    }
    // Form model content changed.
    writeValue(content) {
        this.updateEditor(content);
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    // End ControlValueAccesor methods.
    // froalaEditor directive as input: store the editor options
    set froalaEditor(opts) {
        this._opts = this.clone(opts || this._opts);
        this._opts = Object.assign({}, this._opts);
    }
    // TODO: replace clone method with better possible alternate 
    clone(item) {
        const me = this;
        if (!item) {
            return item;
        } // null, undefined values check
        let types = [Number, String, Boolean], result;
        // normalizing primitives if someone did new String('aaa'), or new Number('444');
        types.forEach(function (type) {
            if (item instanceof type) {
                result = type(item);
            }
        });
        if (typeof result == "undefined") {
            if (Object.prototype.toString.call(item) === "[object Array]") {
                result = [];
                item.forEach(function (child, index, array) {
                    result[index] = me.clone(child);
                });
            }
            else if (typeof item == "object") {
                // testing that this is DOM
                if (item.nodeType && typeof item.cloneNode == "function") {
                    result = item.cloneNode(true);
                }
                else if (!item.prototype) { // check that this is a literal
                    if (item instanceof Date) {
                        result = new Date(item);
                    }
                    else {
                        // it is an object literal
                        result = {};
                        for (var i in item) {
                            result[i] = me.clone(item[i]);
                        }
                    }
                }
                else {
                    if (false && item.constructor) {
                        result = new item.constructor();
                    }
                    else {
                        result = item;
                    }
                }
            }
            else {
                result = item;
            }
        }
        return result;
    }
    // froalaModel directive as input: store initial editor content
    set froalaModel(content) {
        this.updateEditor(content);
    }
    // Update editor with model contents.
    updateEditor(content) {
        if (JSON.stringify(this._oldModel) == JSON.stringify(content)) {
            return;
        }
        if (!this._hasSpecialTag) {
            this._oldModel = content;
        }
        else {
            this._model = content;
        }
        if (this._editorInitialized) {
            if (!this._hasSpecialTag) {
                this._editor.html.set(content);
            }
            else {
                this.setContent();
            }
        }
        else {
            if (!this._hasSpecialTag) {
                this._element.innerHTML = content || '';
            }
            else {
                this.setContent();
            }
        }
    }
    // update model if editor contentChanged
    updateModel() {
        this.zone.run(() => {
            let modelContent = null;
            if (this._hasSpecialTag) {
                let attributeNodes = this._element.attributes;
                let attrs = {};
                for (let i = 0; i < attributeNodes.length; i++) {
                    let attrName = attributeNodes[i].name;
                    if (this._opts.angularIgnoreAttrs && this._opts.angularIgnoreAttrs.indexOf(attrName) != -1) {
                        continue;
                    }
                    attrs[attrName] = attributeNodes[i].value;
                }
                if (this._element.innerHTML) {
                    attrs[this.INNER_HTML_ATTR] = this._element.innerHTML;
                }
                modelContent = attrs;
            }
            else {
                let returnedHtml = this._editor.html.get();
                if (typeof returnedHtml === 'string') {
                    modelContent = returnedHtml;
                }
            }
            if (this._oldModel !== modelContent) {
                this._oldModel = modelContent;
                // Update froalaModel.
                this.froalaModelChange.emit(modelContent);
                // Update form model.
                this.onChange(modelContent);
            }
        });
    }
    registerEvent(eventName, callback) {
        if (!eventName || !callback) {
            return;
        }
        if (!this._opts.events) {
            this._opts.events = {};
        }
        this._opts.events[eventName] = callback;
    }
    initListeners() {
        let self = this;
        // Check if we have events on the editor.
        if (this._editor.events) {
            // bind contentChange and keyup event to froalaModel
            this._editor.events.on('contentChanged', function () {
                self.updateModel();
            });
            this._editor.events.on('mousedown', function () {
                setTimeout(function () {
                    self.onTouched();
                }, 0);
            });
            if (this._opts.immediateAngularModelUpdate) {
                this._editor.events.on('keyup', function () {
                    setTimeout(function () {
                        self.updateModel();
                    }, 0);
                });
            }
        }
        this._editorInitialized = true;
    }
    createEditor() {
        if (this._editorInitialized) {
            return;
        }
        this.setContent(true);
        // init editor
        this.zone.runOutsideAngular(() => {
            // Add listeners on initialized event.
            if (!this._opts.events)
                this._opts.events = {};
            // Register initialized event.
            this.registerEvent('initialized', this._opts.events && this._opts.events.initialized);
            const existingInitCallback = this._opts.events.initialized;
            // Default initialized event.
            if (!this._opts.events.initialized || !this._opts.events.initialized.overridden) {
                this._opts.events.initialized = () => {
                    this.initListeners();
                    existingInitCallback && existingInitCallback.call(this._editor, this);
                };
                this._opts.events.initialized.overridden = true;
            }
            // Initialize the Froala Editor.
            this._editor = new FroalaEditor(this._element, this._opts);
        });
    }
    setHtml() {
        this._editor.html.set(this._model || "");
        // This will reset the undo stack everytime the model changes externally. Can we fix this?
        this._editor.undo.reset();
        this._editor.undo.saveStep();
    }
    setContent(firstTime = false) {
        let self = this;
        // Set initial content
        if (this._model || this._model == '') {
            this._oldModel = this._model;
            if (this._hasSpecialTag) {
                let tags = this._model;
                // add tags on element
                if (tags) {
                    for (let attr in tags) {
                        if (tags.hasOwnProperty(attr) && attr != this.INNER_HTML_ATTR) {
                            this._element.setAttribute(attr, tags[attr]);
                        }
                    }
                    if (tags.hasOwnProperty(this.INNER_HTML_ATTR)) {
                        this._element.innerHTML = tags[this.INNER_HTML_ATTR];
                    }
                }
            }
            else {
                if (firstTime) {
                    this.registerEvent('initialized', function () {
                        self.setHtml();
                    });
                }
                else {
                    self.setHtml();
                }
            }
        }
    }
    destroyEditor() {
        if (this._editorInitialized) {
            this._editor.destroy();
            this._editorInitialized = false;
        }
    }
    getEditor() {
        if (this._element) {
            return this._editor;
        }
        return null;
    }
    // send manual editor initialization
    generateManualController() {
        let controls = {
            initialize: this.createEditor.bind(this),
            destroy: this.destroyEditor.bind(this),
            getEditor: this.getEditor.bind(this),
        };
        this.froalaInit.emit(controls);
    }
    // TODO not sure if ngOnInit is executed after @inputs
    ngAfterViewInit() {
        // check if output froalaInit is present. Maybe observers is private and should not be used?? TODO how to better test that an output directive is present.
        if (!this.froalaInit.observers.length) {
            this.createEditor();
        }
        else {
            this.generateManualController();
        }
    }
    ngOnDestroy() {
        this.destroyEditor();
    }
    setDisabledState(isDisabled) {
    }
}
FroalaEditorDirective.decorators = [
    { type: Directive, args: [{
                selector: '[froalaEditor]',
                exportAs: 'froalaEditor',
                providers: [
                    {
                        provide: NG_VALUE_ACCESSOR,
                        useExisting: forwardRef(() => FroalaEditorDirective),
                        multi: true
                    }
                ]
            },] }
];
/** @nocollapse */
FroalaEditorDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: NgZone }
];
FroalaEditorDirective.propDecorators = {
    froalaEditor: [{ type: Input }],
    froalaModel: [{ type: Input }],
    froalaModelChange: [{ type: Output }],
    froalaInit: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Byb2plY3RzL2xpYnJhcnkvc3JjL2VkaXRvci9lZGl0b3IuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBd0IsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXZHLE9BQU8sWUFBWSxNQUFNLGVBQWUsQ0FBQztBQWF6QyxNQUFNLE9BQU8scUJBQXFCO0lBd0JoQyxZQUFZLEVBQWMsRUFBVSxJQUFZO1FBQVosU0FBSSxHQUFKLElBQUksQ0FBUTtRQXRCaEQsaUJBQWlCO1FBQ1QsVUFBSyxHQUFRO1lBQ25CLDJCQUEyQixFQUFFLEtBQUs7WUFDbEMsa0JBQWtCLEVBQUUsSUFBSTtTQUN6QixDQUFDO1FBSU0saUJBQVksR0FBYSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3pELG9CQUFlLEdBQVcsV0FBVyxDQUFDO1FBQ3RDLG1CQUFjLEdBQVksS0FBSyxDQUFDO1FBUWhDLHVCQUFrQixHQUFZLEtBQUssQ0FBQztRQUVwQyxjQUFTLEdBQVcsSUFBSSxDQUFDO1FBZWpDLHFDQUFxQztRQUNyQyxhQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNqQixDQUFDLENBQUM7UUFDRixjQUFTLEdBQUcsR0FBRyxFQUFFO1FBQ2pCLENBQUMsQ0FBQztRQXVHRix5RUFBeUU7UUFDL0Qsc0JBQWlCLEdBQXNCLElBQUksWUFBWSxFQUFPLENBQUM7UUFFekUsb0VBQW9FO1FBQzFELGVBQVUsR0FBeUIsSUFBSSxZQUFZLEVBQVUsQ0FBQztRQTFIdEUsSUFBSSxPQUFPLEdBQVEsRUFBRSxD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QVEsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxzREFBc0Q7SUFDdEQsZUFBZTtRQUNiLDBKQUEwSjtRQUMxSixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztTQUNyQjthQUFNO1lBQ0wsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7U0FDakM7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsVUFBbUI7SUFDcEMsQ0FBQzs7O1lBeFdGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsZ0JBQWdCO2dCQUMxQixRQUFRLEVBQUUsY0FBYztnQkFDeEIsU0FBUyxFQUFFO29CQUNUO3dCQUNFLE9BQU8sRUFBRSxpQkFBaUI7d0JBQzFCLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMscUJBQXFCLENBQUM7d0JBQ3BELEtBQUssRUFBRSxJQUFJO3FCQUNaO2lCQUNGO2FBQ0Y7Ozs7WUFkbUIsVUFBVTtZQUFtQyxNQUFNOzs7MkJBMEVwRSxLQUFLOzBCQXNETCxLQUFLO2dDQWdDTCxNQUFNO3lCQUdOLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1IgfSBmcm9tIFwiQGFuZ3VsYXIvZm9ybXNcIjtcbmltcG9ydCB7IERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBmb3J3YXJkUmVmLCBJbnB1dCwgTmdab25lLCBPdXRwdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IEZyb2FsYUVkaXRvciBmcm9tICdmcm9hbGEtZWRpdG9yJztcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Zyb2FsYUVkaXRvcl0nLFxuICBleHBvcnRBczogJ2Zyb2FsYUVkaXRvcicsXG4gIHByb3ZpZGVyczogW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gRnJvYWxhRWRpdG9yRGlyZWN0aXZlKSxcbiAgICAgIG11bHRpOiB0cnVlXG4gICAgfVxuICBdXG59KVxuZXhwb3J0IGNsYXNzIEZyb2FsYUVkaXRvckRpcmVjdGl2ZSBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcblxuICAvLyBlZGl0b3Igb3B0aW9uc1xuICBwcml2YXRlIF9vcHRzOiBhbnkgPSB7XG4gICAgaW1tZWRpYXRlQW5ndWxhck1vZGVsVXBkYXRlOiBmYWxzZSxcbiAgICBhbmd1bGFySWdub3JlQXR0cnM6IG51bGxcbiAgfTtcblxuICBwcml2YXRlIF9lbGVtZW50OiBhbnk7XG5cbiAgcHJpdmF0ZSBTUEVDSUFMX1RBR1M6IHN0cmluZ1tdID0gWydpbWcnLCAnYnV0dG9uJywgJ2lucHV0JywgJ2EnXTtcbiAgcHJpdmF0ZSBJTk5FUl9IVE1MX0FUVFI6IHN0cmluZyA9ICdpbm5lckhUTUwnO1xuICBwcml2YXRlIF9oYXNTcGVjaWFsVGFnOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLy8gZWRpdG9yIGVsZW1lbnRcbiAgcHJpdmF0ZSBfZWRpdG9yOiBhbnk7XG5cbiAgLy8gaW5pdGlhbCBlZGl0b3IgY29udGVudFxuICBwcml2YXRlIF9tb2RlbDogc3RyaW5nO1xuXG4gIHByaXZhdGUgX2VkaXRvckluaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBfb2xkTW9kZWw6IHN0cmluZyA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoZWw6IEVsZW1lbnRSZWYsIHByaXZhdGUgem9uZTogTmdab25lKSB7XG5cbiAgICBsZXQgZWxlbWVudDogYW55ID0gZWwubmF0aXZlRWxlbWVudDtcblxuICAgIC8vIGNoZWNrIGlmIHRoZSBlbGVtZW50IGlzIGEgc3BlY2lhbCB0YWdcbiAgICBpZiAodGhpcy5TUEVDSUFMX1RBR1MuaW5kZXhPZihlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSkgIT0gLTEpIHtcbiAgICAgIHRoaXMuX2hhc1NwZWNpYWxUYWcgPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcblxuICAgIHRoaXMuem9uZSA9IHpvbmU7XG4gIH1cblxuICAvLyBCZWdpbiBDb250cm9sVmFsdWVBY2Nlc29yIG1ldGhvZHMuXG4gIG9uQ2hhbmdlID0gKF8pID0+IHtcbiAgfTtcbiAgb25Ub3VjaGVkID0gKCkgPT4ge1xuICB9O1xuXG4gIC8vIEZvcm0gbW9kZWwgY29udGVudCBjaGFuZ2VkLlxuICB3cml0ZVZhbHVlKGNvbnRlbnQ6IGFueSk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlRWRpdG9yKGNvbnRlbnQpO1xuICB9XG5cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKF86IGFueSkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMub25DaGFuZ2UgPSBmbjtcbiAgfVxuXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIC8vIEVuZCBDb250cm9sVmFsdWVBY2Nlc29yIG1ldGhvZHMuXG5cbiAgLy8gZnJvYWxhRWRpdG9yIGRpcmVjdGl2ZSBhcyBpbnB1dDogc3RvcmUgdGhlIGVkaXRvciBvcHRpb25zXG4gIEBJbnB1dCgpIHNldCBmcm9hbGFFZGl0b3Iob3B0czogYW55KSB7XG4gICAgdGhpcy5fb3B0cyA9IHRoaXMuY2xvbmUoICBvcHRzIHx8IHRoaXMuX29wdHMpO1xuICAgIHRoaXMuX29wdHMgPSAgey4uLnRoaXMuX29wdHN9O1xuICB9XG5cbiAgIC8vIFRPRE86IHJlcGxhY2UgY2xvbmUgbWV0aG9kIHdpdGggYmV0dGVyIHBvc3NpYmxlIGFsdGVybmF0ZSBcbiAgcHJpdmF0ZSBjbG9uZShpdGVtKSB7XG4gIFx0Y29uc3QgbWUgPSB0aGlzOyAgXG4gICAgICBpZiAoIWl0ZW0pIHsgcmV0dXJuIGl0ZW07IH0gLy8gbnVsbCwgdW5kZWZpbmVkIHZhbHVlcyBjaGVja1xuXG4gICAgICBsZXQgdHlwZXMgPSBbIE51bWJlciwgU3RyaW5nLCBCb29sZWFuIF0sIFxuICAgICAgICAgIHJlc3VsdDtcblxuICAgICAgLy8gbm9ybWFsaXppbmcgcHJpbWl0aXZlcyBpZiBzb21lb25lIGRpZCBuZXcgU3RyaW5nKCdhYWEnKSwgb3IgbmV3IE51bWJlcignNDQ0Jyk7XG4gICAgICB0eXBlcy5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIHR5cGUpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gdHlwZSggaXRlbSApO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAodHlwZW9mIHJlc3VsdCA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCggaXRlbSApID09PSBcIltvYmplY3QgQXJyYXldXCIpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgICAgICAgIGl0ZW0uZm9yRWFjaChmdW5jdGlvbihjaGlsZCwgaW5kZXgsIGFycmF5KSB7IFxuICAgICAgICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1lLmNsb25lKCBjaGlsZCApO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpdGVtID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgLy8gdGVzdGluZyB0aGF0IHRoaXMgaXMgRE9NXG4gICAgICAgICAgICAgIGlmIChpdGVtLm5vZGVUeXBlICYmIHR5cGVvZiBpdGVtLmNsb25lTm9kZSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGl0ZW0uY2xvbmVOb2RlKCB0cnVlICk7ICAgIFxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpdGVtLnByb3RvdHlwZSkgeyAvLyBjaGVjayB0aGF0IHRoaXMgaXMgYSBsaXRlcmFsXG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgRGF0ZShpdGVtKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gaXQgaXMgYW4gb2JqZWN0IGxpdGVyYWxcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2ldID0gbWUuY2xvbmUoIGl0ZW1baV0gKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoZmFsc2UgJiYgaXRlbS5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBpdGVtLmNvbnN0cnVjdG9yKCk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGl0ZW07XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXN1bHQgPSBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgLy8gZnJvYWxhTW9kZWwgZGlyZWN0aXZlIGFzIGlucHV0OiBzdG9yZSBpbml0aWFsIGVkaXRvciBjb250ZW50XG4gIEBJbnB1dCgpIHNldCBmcm9hbGFNb2RlbChjb250ZW50OiBhbnkpIHtcbiAgICB0aGlzLnVwZGF0ZUVkaXRvcihjb250ZW50KTtcbiAgfVxuXG4gIC8vIFVwZGF0ZSBlZGl0b3Igd2l0aCBtb2RlbCBjb250ZW50cy5cbiAgcHJpdmF0ZSB1cGRhdGVFZGl0b3IoY29udGVudDogYW55KSB7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KHRoaXMuX29sZE1vZGVsKSA9PSBKU09OLnN0cmluZ2lmeShjb250ZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5faGFzU3BlY2lhbFRhZykge1xuICAgICAgdGhpcy5fb2xkTW9kZWwgPSBjb250ZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tb2RlbCA9IGNvbnRlbnQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2VkaXRvckluaXRpYWxpemVkKSB7XG4gICAgICBpZiAoIXRoaXMuX2hhc1NwZWNpYWxUYWcpIHtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmh0bWwuc2V0KGNvbnRlbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRDb250ZW50KCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdGhpcy5faGFzU3BlY2lhbFRhZykge1xuICAgICAgICB0aGlzLl9lbGVtZW50LmlubmVySFRNTCA9IGNvbnRlbnQgfHwgJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldENvbnRlbnQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBmcm9hbGFNb2RlbCBkaXJlY3RpdmUgYXMgb3V0cHV0OiB1cGRhdGUgbW9kZWwgaWYgZWRpdG9yIGNvbnRlbnRDaGFuZ2VkXG4gIEBPdXRwdXQoKSBmcm9hbGFNb2RlbENoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICAvLyBmcm9hbGFJbml0IGRpcmVjdGl2ZSBhcyBvdXRwdXQ6IHNlbmQgbWFudWFsIGVkaXRvciBpbml0aWFsaXphdGlvblxuICBAT3V0cHV0KCkgZnJvYWxhSW5pdDogRXZlbnRFbWl0dGVyPE9iamVjdD4gPSBuZXcgRXZlbnRFbWl0dGVyPE9iamVjdD4oKTtcblxuICAvLyB1cGRhdGUgbW9kZWwgaWYgZWRpdG9yIGNvbnRlbnRDaGFuZ2VkXG4gIHByaXZhdGUgdXBkYXRlTW9kZWwoKSB7XG4gICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG5cbiAgICAgIGxldCBtb2RlbENvbnRlbnQ6IGFueSA9IG51bGw7XG5cbiAgICAgIGlmICh0aGlzLl9oYXNTcGVjaWFsVGFnKSB7XG5cbiAgICAgICAgbGV0IGF0dHJpYnV0ZU5vZGVzID0gdGhpcy5fZWxlbWVudC5hdHRyaWJ1dGVzO1xuICAgICAgICBsZXQgYXR0cnMgPSB7fTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGF0dHJpYnV0ZU5vZGVzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICBsZXQgYXR0ck5hbWUgPSBhdHRyaWJ1dGVOb2Rlc1tpXS5uYW1lO1xuICAgICAgICAgIGlmICh0aGlzLl9vcHRzLmFuZ3VsYXJJZ25vcmVBdHRycyAmJiB0aGlzLl9vcHRzLmFuZ3VsYXJJZ25vcmVBdHRycy5pbmRleE9mKGF0dHJOYW1lKSAhPSAtMSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYXR0cnNbYXR0ck5hbWVdID0gYXR0cmlidXRlTm9kZXNbaV0udmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fZWxlbWVudC5pbm5lckhUTUwpIHtcbiAgICAgICAgICBhdHRyc1t0aGlzLklOTkVSX0hUTUxfQVRUUl0gPSB0aGlzLl9lbGVtZW50LmlubmVySFRNTDtcbiAgICAgICAgfVxuXG4gICAgICAgIG1vZGVsQ29udGVudCA9IGF0dHJzO1xuICAgICAgfSBlbHNlIHtcblxuICAgICAgICBsZXQgcmV0dXJuZWRIdG1sOiBhbnkgPSB0aGlzLl9lZGl0b3IuaHRtbC5nZXQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiByZXR1cm5lZEh0bWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgbW9kZWxDb250ZW50ID0gcmV0dXJuZWRIdG1sO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fb2xkTW9kZWwgIT09IG1vZGVsQ29udGVudCkge1xuICAgICAgICB0aGlzLl9vbGRNb2RlbCA9IG1vZGVsQ29udGVudDtcblxuICAgICAgICAvLyBVcGRhdGUgZnJvYWxhTW9kZWwuXG4gICAgICAgIHRoaXMuZnJvYWxhTW9kZWxDaGFuZ2UuZW1pdChtb2RlbENvbnRlbnQpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBmb3JtIG1vZGVsLlxuICAgICAgICB0aGlzLm9uQ2hhbmdlKG1vZGVsQ29udGVudCk7XG4gICAgICB9XG5cbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3RlckV2ZW50KGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoIWV2ZW50TmFtZSB8fCAhY2FsbGJhY2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX29wdHMuZXZlbnRzKSB7XG4gICAgICB0aGlzLl9vcHRzLmV2ZW50cyA9IHt9O1xuICAgIH1cblxuICAgIHRoaXMuX29wdHMuZXZlbnRzW2V2ZW50TmFtZV0gPSBjYWxsYmFjaztcbiAgfVxuXG4gIHByaXZhdGUgaW5pdExpc3RlbmVycygpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgLy8gQ2hlY2sgaWYgd2UgaGF2ZSBldmVudHMgb24gdGhlIGVkaXRvci5cbiAgICBpZiAodGhpcy5fZWRpdG9yLmV2ZW50cykge1xuICAgICAgLy8gYmluZCBjb250ZW50Q2hhbmdlIGFuZCBrZXl1cCBldmVudCB0byBmcm9hbGFNb2RlbFxuICAgICAgdGhpcy5fZWRpdG9yLmV2ZW50cy5vbignY29udGVudENoYW5nZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYudXBkYXRlTW9kZWwoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fZWRpdG9yLmV2ZW50cy5vbignbW91c2Vkb3duJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzZWxmLm9uVG91Y2hlZCgpO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodGhpcy5fb3B0cy5pbW1lZGlhdGVBbmd1bGFyTW9kZWxVcGRhdGUpIHtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmV2ZW50cy5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLnVwZGF0ZU1vZGVsKCk7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2VkaXRvckluaXRpYWxpemVkID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlRWRpdG9yKCkge1xuICAgIGlmICh0aGlzLl9lZGl0b3JJbml0aWFsaXplZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc2V0Q29udGVudCh0cnVlKTtcblxuICAgIC8vIGluaXQgZWRpdG9yXG4gICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIC8vIEFkZCBsaXN0ZW5lcnMgb24gaW5pdGlhbGl6ZWQgZXZlbnQuXG4gICAgICBpZiAoIXRoaXMuX29wdHMuZXZlbnRzKSB0aGlzLl9vcHRzLmV2ZW50cyA9IHt9O1xuXG4gICAgICAvLyBSZWdpc3RlciBpbml0aWFsaXplZCBldmVudC5cbiAgICAgIHRoaXMucmVnaXN0ZXJFdmVudCgnaW5pdGlhbGl6ZWQnLCB0aGlzLl9vcHRzLmV2ZW50cyAmJiB0aGlzLl9vcHRzLmV2ZW50cy5pbml0aWFsaXplZCk7XG4gICAgICBjb25zdCBleGlzdGluZ0luaXRDYWxsYmFjayA9IHRoaXMuX29wdHMuZXZlbnRzLmluaXRpYWxpemVkO1xuICAgICAgLy8gRGVmYXVsdCBpbml0aWFsaXplZCBldmVudC5cbiAgICAgIGlmICghdGhpcy5fb3B0cy5ldmVudHMuaW5pdGlhbGl6ZWQgfHwgIXRoaXMuX29wdHMuZXZlbnRzLmluaXRpYWxpemVkLm92ZXJyaWRkZW4pIHtcbiAgICAgICAgdGhpcy5fb3B0cy5ldmVudHMuaW5pdGlhbGl6ZWQgPSAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5pbml0TGlzdGVuZXJzKCk7XG4gICAgICAgICAgZXhpc3RpbmdJbml0Q2FsbGJhY2sgJiYgZXhpc3RpbmdJbml0Q2FsbGJhY2suY2FsbCh0aGlzLl9lZGl0b3IsIHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9vcHRzLmV2ZW50cy5pbml0aWFsaXplZC5vdmVycmlkZGVuID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgRnJvYWxhIEVkaXRvci5cbiAgICAgIHRoaXMuX2VkaXRvciA9IG5ldyBGcm9hbGFFZGl0b3IoXG4gICAgICAgIHRoaXMuX2VsZW1lbnQsXG4gICAgICAgIHRoaXMuX29wdHNcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHNldEh0bWwoKSB7XG4gICAgdGhpcy5fZWRpdG9yLmh0bWwuc2V0KHRoaXMuX21vZGVsIHx8IFwiXCIpO1xuXG4gICAgLy8gVGhpcyB3aWxsIHJlc2V0IHRoZSB1bmRvIHN0YWNrIGV2ZXJ5dGltZSB0aGUgbW9kZWwgY2hhbmdlcyBleHRlcm5hbGx5LiBDYW4gd2UgZml4IHRoaXM/XG4gICAgdGhpcy5fZWRpdG9yLnVuZG8ucmVzZXQoKTtcbiAgICB0aGlzLl9lZGl0b3IudW5kby5zYXZlU3RlcCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRDb250ZW50KGZpcnN0VGltZSA9IGZhbHNlKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gU2V0IGluaXRpYWwgY29udGVudFxuICAgIGlmICh0aGlzLl9tb2RlbCB8fCB0aGlzLl9tb2RlbCA9PSAnJykge1xuICAgICAgdGhpcy5fb2xkTW9kZWwgPSB0aGlzLl9tb2RlbDtcbiAgICAgIGlmICh0aGlzLl9oYXNTcGVjaWFsVGFnKSB7XG5cbiAgICAgICAgbGV0IHRhZ3M6IE9iamVjdCA9IHRoaXMuX21vZGVsO1xuXG4gICAgICAgIC8vIGFkZCB0YWdzIG9uIGVsZW1lbnRcbiAgICAgICAgaWYgKHRhZ3MpIHtcblxuICAgICAgICAgIGZvciAobGV0IGF0dHIgaW4gdGFncykge1xuICAgICAgICAgICAgaWYgKHRhZ3MuaGFzT3duUHJvcGVydHkoYXR0cikgJiYgYXR0ciAhPSB0aGlzLklOTkVSX0hUTUxfQVRUUikge1xuICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyLCB0YWdzW2F0dHJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGFncy5oYXNPd25Qcm9wZXJ0eSh0aGlzLklOTkVSX0hUTUxfQVRUUikpIHtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuaW5uZXJIVE1MID0gdGFnc1t0aGlzLklOTkVSX0hUTUxfQVRUUl07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZmlyc3RUaW1lKSB7XG4gICAgICAgICAgdGhpcy5yZWdpc3RlckV2ZW50KCdpbml0aWFsaXplZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuc2V0SHRtbCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuc2V0SHRtbCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBkZXN0cm95RWRpdG9yKCkge1xuICAgIGlmICh0aGlzLl9lZGl0b3JJbml0aWFsaXplZCkge1xuICAgICAgdGhpcy5fZWRpdG9yLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX2VkaXRvckluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRFZGl0b3IoKSB7XG4gICAgaWYgKHRoaXMuX2VsZW1lbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9lZGl0b3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBzZW5kIG1hbnVhbCBlZGl0b3IgaW5pdGlhbGl6YXRpb25cbiAgcHJpdmF0ZSBnZW5lcmF0ZU1hbnVhbENvbnRyb2xsZXIoKSB7XG4gICAgbGV0IGNvbnRyb2xzID0ge1xuICAgICAgaW5pdGlhbGl6ZTogdGhpcy5jcmVhdGVFZGl0b3IuYmluZCh0aGlzKSxcbiAgICAgIGRlc3Ryb3k6IHRoaXMuZGVzdHJveUVkaXRvci5iaW5kKHRoaXMpLFxuICAgICAgZ2V0RWRpdG9yOiB0aGlzLmdldEVkaXRvci5iaW5kKHRoaXMpLFxuICAgIH07XG4gICAgdGhpcy5mcm9hbGFJbml0LmVtaXQoY29udHJvbHMpO1xuICB9XG5cbiAgLy8gVE9ETyBub3Qgc3VyZSBpZiBuZ09uSW5pdCBpcyBleGVjdXRlZCBhZnRlciBAaW5wdXRzXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAvLyBjaGVjayBpZiBvdXRwdXQgZnJvYWxhSW5pdCBpcyBwcmVzZW50LiBNYXliZSBvYnNlcnZlcnMgaXMgcHJpdmF0ZSBhbmQgc2hvdWxkIG5vdCBiZSB1c2VkPz8gVE9ETyBob3cgdG8gYmV0dGVyIHRlc3QgdGhhdCBhbiBvdXRwdXQgZGlyZWN0aXZlIGlzIHByZXNlbnQuXG4gICAgaWYgKCF0aGlzLmZyb2FsYUluaXQub2JzZXJ2ZXJzLmxlbmd0aCkge1xuICAgICAgdGhpcy5jcmVhdGVFZGl0b3IoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5nZW5lcmF0ZU1hbnVhbENvbnRyb2xsZXIoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmRlc3Ryb3lFZGl0b3IoKTtcbiAgfVxuXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICB9XG59XG4iXX0=