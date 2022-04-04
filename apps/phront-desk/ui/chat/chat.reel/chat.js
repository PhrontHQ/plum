"use strict";
var Component = require("montage/ui/component").Component;

function lerp(v0, v1, t) {
    return (1 - t) * v0 + t * v1;
}

exports.Chat = Component.specialize({
    constructor: {
        value: function Chat () {
            this.super();
            return this;
        }
    },

    templateDidLoad: {
        value: function () {
            var self = this;

            this._repetition.willDraw = function () {
                var element = self._scrollingElement,
                    distanceToBottom = element.scrollHeight - element.clientHeight - element.scrollTop;

                if (self._scrollAnimation) {
                    self._isPendingScroll = true;
                } else {
                    if (distanceToBottom < 30) {
                        self._needsScroll = true;
                        self.needsDraw = true;
                    }
                }
            };
        }
    },

    smoothScrollTo: {
        value: function (x, y) {
            this._scrollAnimation = {
                startTime: performance.now(),
                originX: this._scrollingElement.scrollLeft,
                originY: this._scrollingElement.scrollTop,
                targetX: x,
                targetY: y
            };
            this.needsDraw = true;
        }
    },

    _smoothScrollDuration: {
        value: 450
    },

    draw: {
        value: function (now) {
            var animation = this._scrollAnimation,
                time,
                x,
                y;

            if (this._needsScroll) {
                this.smoothScrollTo(0, this._scrollingElement.scrollHeight - this._scrollingElement.clientHeight);
                this._needsScroll = false;
            }
            if (animation) {
                time = (now - animation.startTime) / this._smoothScrollDuration;
                time = Math.min(Math.max(time, 0), 1);
                if (time < 1) {
                    time = Math.pow(((Math.cos(Math.PI - Math.pow(time, .2) * Math.PI) + 1) / 2), 9);
                    x = lerp(animation.originX, animation.targetX, time);
                    y = lerp(animation.originY, animation.targetY, time);
                    this._scrollingElement.scrollTo(x, y);
                    this.needsDraw = true;
                } else {
                    this._scrollingElement.scrollTo(animation.targetX, animation.targetY);
                    this._scrollAnimation = null;
                    if (this._isPendingScroll) {
                        this._needsScroll = true;
                        this.needsDraw = true;
                        this._isPendingScroll = false;
                    }
                }
            }

        }
    }

});
