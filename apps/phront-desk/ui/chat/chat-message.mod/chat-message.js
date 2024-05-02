//"use strict";
var Component = require("montage/ui/component").Component,
    DataEditor = require("montage/ui/data-editor").DataEditor,
    Promise = require("montage/core/promise").Promise,
    MontageReviver = require("montage/core/serialization/deserializer/montage-reviver").MontageReviver,
    Template = require("montage/core/template").Template;

//Expose moduleid so it's picked up by mop:
require("ui/chat/chat-text-message.mod");

var instanceCount = 0;

exports.ChatMessage = DataEditor.specialize({
    constructor: {
        value: function ChatMessage () {
            this.instanceNumber = ++instanceCount;

            this.super();
            return this;
        }
    },

    // enterDocument: {
    //     value: function (isFirstTime) {
    //         var message = this.data,
    //         messageComponent = message.outputComponent,
    //         isMessageComponentComponent = (messageComponent instanceof Component),
    //         isMessageComponentPromise = Promise.is(messageComponent);

    //         if (isFirstTime && message) {
    //             if(messageComponent) {
    //                 var self = this;

    //                 if(!isMessageComponentComponent && !isMessageComponentPromise) {

    //                     var template = new Template,
    //                         element = document.createElement("div"),
    //                         serialization = {component: JSON.parse(JSON.stringify(messageComponent))},
    //                         html;

    //                     if (!serialization.component.values) {
    //                         serialization.component.values = {};
    //                     }
    //                     serialization.component.values.element = {"#": "component"};
    //                     if (serialization.component.className) {
    //                         element.className = serialization.component.className;
    //                     }
    //                     element.classList.add("ChatMessage-component");
    //                     if (serialization.component.style) {
    //                         element.setAttribute("style", serialization.component.style);
    //                     }
    //                     html = "<head><script type='text/montage-serialization'>" + JSON.stringify(serialization) + "</script>" +
    //                         "<div data-montage-id='component' class='" + element.className + "' style='" + element.style.cssText + "'></div>";
    //                     if (serialization.component.isFirstChild) {
    //                         this._element.insertBefore(element, this._element.firstChild);
    //                     } else {
    //                         this._element.appendChild(element);
    //                     }
    //                     template.initWithHtml(html, this.ownerComponent._template._require).then(function () {
    //                         var serialization = template.getSerialization(),
    //                             serializationObject = serialization.getSerializationObject(),
    //                             instances = {},
    //                             label;

    //                         for (label in self.templateObjects) {
    //                             serializationObject[label] = {};
    //                             instances[label] = self.templateObjects[label];
    //                         }
    //                         template.setObjects(serializationObject);
    //                         template.instantiateWithInstances(instances, self._element.ownerDocument).then(
    //                             function (part) {
    //                                 var component = part.childComponents[0];

    //                                 if(!self.messageComponentSlot) {
    //                                     self.addChildComponent(component);
    //                                     component.needsDraw = true;
    //                                     self._element.replaceChild(part.fragment, element);    
    //                                 } 

    //                                 self.message.outputComponent = component;
    //                             }
    //                         );
    //                     });
    //                 } else if(isMessageComponentPromise) {

    //                     messageComponent.then(function(component) {
    //                         //Override the component on message
    //                         self.data.outputComponent = component;

    //                         //The component needs the message to do it's work:
    //                         component.data = self.data;

    //                     });
    //                 } else if(isMessageComponentComponent) {

    //                 }
    //             } else if(message.data || message.text) {
    //                 var data = message.data || message.text;

    //                 //We don't have a component specified, so we're going to convert data to string if needed, and instantiate a text component.
    //                 if(typeof data !== "string") {
    //                     data = data.toString();
    //                 }

    //                 message.outputComponent = this.textComponent;

    //             }
    //         }

    //     }
    // },

    initializeDataLoadedPromise: {
        value: function () {
            var self = this,
                message = this.data;

            //console.debug("chat-message: initializeDataLoadedPromise");

            if (message) {
                var messageComponent = message.outputComponent,
                    outputComponentModuledId = message.outputComponentModuleId,
                    isMessageComponentComponent = (messageComponent instanceof Component),
                    isMessageComponentPromise = Promise.is(messageComponent);
    
                if(!isMessageComponentComponent && !isMessageComponentPromise) {

                    if(!outputComponentModuledId) {
                        outputComponentModuledId = "ui/chat/chat-text-message.mod";
                    }

                    return require.async(outputComponentModuledId)
                        .then ((exports) => {
                            var locationDesc = MontageReviver.parseObjectLocationId(outputComponentModuledId),
                                outputComponent = exports.montageObject 
                                    ? exports.montageObject 
                                    : new exports[locationDesc.objectName]();

                            self.data.outputComponent = outputComponent;

                            //The component needs the message to do it's work:
                            outputComponent.data = self.data;

                            return outputComponent;
                        });

                } else if(messageComponent) {

                    if(isMessageComponentPromise) {

                        return messageComponent.then(function(component) {
                            //Override the component on message
                            self.data.outputComponent = component;

                            //The component needs the message to do it's work:
                            component.data = self.data;

                            return component;

                        });

                    } else if(isMessageComponentComponent) {

                        return Promise.resolve(messageComponent);

                    }

                } else if(message.data || message.text) {
                    var data = message.data || message.text;

                    //We don't have a component specified, so we're going to convert data to string if needed, and instantiate a text component.
                    // if(typeof data !== "string") {
                    //     data = data.toString();
                    // }

                    //message.outputComponent = this.textComponent;

                }
            } else {
                return null;
            }

        }
    }

});
