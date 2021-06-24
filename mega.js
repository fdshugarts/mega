"use strict";

window.MegaJSList = window.MegaJSList || {};

$.fn.MegaJs = function (args = {}) {
    var Mega = class {
        constructor($element, options = {}) {
            const self = this;
            this.settings = $.extend(
                {},
                {
                    items: "li", // Mega items, selector.
                    spacing: 10, // Spacing between Nav li and Mega Navigation Menu, px
                    arrow: true, // Show arrow of mega content.
                    vertical: false, // Menu Mod: `true` for Vertical, else Horizontal.    
                    mobileFit: false, // Fit mega with screen when vertical to small.
                    fitWidth: 80, // Mobile fit only when max screen <= mobileFit.
                    toggleButton: false, // Toggle button use for vertical when true, Selector or jQuery item.
                    breakPoint: 991, // Mobile Break point, 991.
                    wrapper: false, // Can be `parent`, or jQuery item, or selector default window.
                    dropdown: false, // Selector or jQuery item. Use for vertical only. Use when you have hidden dropdown nav.
                    autoHeader: true, // Auto add header to Main navigation, use for mobile mod.
                    navText: "Menu", // The menu navigation header title if autoHeader set `true`.
                    stickyType: "", // Type of element CSS position when sticky, `fixed` or `sticky`.
                    stickyEl: "", // Sticky Element. Can be `parent`, or jQuery item, or selector that will sticky when browser scroll.
                    accessibility: true, // Enables tabbing and enter key navigation.
                    focusButtonText: "Toggle: {item_name}", // Toggle to show mega item when you hit TAB key. Use for Accessibility.
                    megaSub: true, // Auto convert existing sub menus to mega sub menus.
                    megaSubItems: "> ul, .dropdown-menu, .sub-menu", // Default existing sub menus selector.
                    closeIcon:
                        '<svg width="20" height="20" viewBox="0 0 20 20"><path fill="#000000" d="M10.707 10.5l5.646-5.646c0.195-0.195 0.195-0.512 0-0.707s-0.512-0.195-0.707 0l-5.646 5.646-5.646-5.646c-0.195-0.195-0.512-0.195-0.707 0s-0.195 0.512 0 0.707l5.646 5.646-5.646 5.646c-0.195 0.195-0.195 0.512 0 0.707 0.098 0.098 0.226 0.146 0.354 0.146s0.256-0.049 0.354-0.146l5.646-5.646 5.646 5.646c0.098 0.098 0.226 0.146 0.354 0.146s0.256-0.049 0.354-0.146c0.195-0.195 0.195-0.512 0-0.707l-5.646-5.646z"></path></svg>',
                },
                options
            );

            this.removeSubClass = self.settings.megaSubItems.replace(
                /[^a-z0-9\-_+]+/gi,
                " "
            );
            //console.log("this.removeSubClass", this.removeSubClass);
            this.activeClass = "mega-active";
            this.$navMenu = $element;
            this.megaItems = [];
            this.isMobile = false;
            this.showing = false;
            this.timeOut = undefined;
            this.animation = ""; //Default animation: up
            this.$wrapper = $.noop;
            this.$dropdown = false;
            this.verAlign = "right"; // mega position from Nav menu;
            this.$stickyEl = $.noop; // mega position from Nav menu;
            this.stickyType = ""; // Can be `fixed` or `sticky`
            this.isInstalled = false;
            this.touchSupport = false;
            this.toggleClick = false; // Check toggle button clicked or hover
            this.focusElSelector =
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

            this.headerHTML =
                '<div class="mega-header"><span class="mega-header-title"></span><div class="mega-close">' +
                this.settings.closeIcon +
                "</div></div>";

            this.arrowHTML =
                '<div class="mega-arr"><div class="mega-arr-inner"></div></div>';

            if ("ontouchstart" in document.documentElement) {
                this.touchSupport = true;
            }

            //console.log("Touch ", this.touchSupport);

            switch (this.settings.wrapper) {
                case "parent":
                    this.$wrapper = this.$navMenu.parent();
                    break;
                default:
                    if (self.settings.wrapper) {
                        this.$wrapper = $(self.settings.wrapper);
                    } else {
                        //this.$wrapper = $("html");
                        this.$wrapper = $("body");
                        // this.$wrapper = this.$navMenu.parent();
                    }
            }

            console.log("this.$wrapper ", this.$wrapper);

            this.$navMenu.addClass("mega-added");
            this.$navMenu.addClass(
                this.settings.vertical
                    ? "mega-mod-vertical"
                    : "mega-mod-horizontal"
            );

            let navID = this.$navMenu.attr("id") || "";
            if (!navID) {
                navID = "mega-" + new Date().getTime();
                self.$navMenu.attr("id", navID);
            }

            this.$drop = $('<div class="mega-drop"/>');
            self.$drop.attr("id", navID + "-drop");

            if (!this.settings.vertical) {
                this.$drop.insertAfter(this.$navMenu);
            } else {
                $("body").append(this.$drop);
                if (this.settings.dropdown) {
                    this.$dropdown = $(this.settings.dropdown);
                } else {
                    this.$dropdown = $.noop;
                }
            }

            if (self.settings.autoHeader) {
                // Insert Mega menu header.
                let navHeaderTag =
                    self.$navMenu.prop("tagName") === "UL" ? "li" : "div";
                let $navHeader = self.$navMenu.children(".mega-nav-header");
                // If nav header do not exist then add new.
                if (!$navHeader.length) {
                    $navHeader = $(
                        "<" +
                            navHeaderTag +
                            ' class="mega-nav-header mega-header-auto mega-header"><span class="mega-header-title"></span><div class="mega-close">' +
                            self.settings.closeIcon +
                            "</div></" +
                            navHeaderTag +
                            ">"
                    );

                    $navHeader
                        .find(".mega-header-title")
                        .text(self.settings.navText);

                    self.$navMenu.prepend($navHeader);
                }

                // When click to main nav header close button on mobile mod then close Nav menu.
                $navHeader.on("click", ".mega-close", function (e) {
                    e.preventDefault();
                    self.$navMenu.removeClass("mega-show");
                    self.closeBG();
                });
            }

            this.$drop.on("click.megajs", function () {
                // Close all mega items.
                $.each(self.megaItems, function (index, item) {
                    self.closeMega(item);
                });
                self.closeBG();
            });

            self.firstInstall();
           

            self.doSetup();

            var stt = null;
            $(window).scroll(
                async function () {
                    if (stt) {
                        clearTimeout(stt);
                    }
                    stt = setTimeout(function () {
                        self.navRect = self.$navMenu
                            .get(0)
                            .getBoundingClientRect();
                    }, 100);
                }.bind(this)
            );

            self.initWindowEvents();

            // Toggle button.
            if (self.settings.vertical && self.settings.toggleButton) {
                if (self.timeOutToggleDr) {
                    clearTimeout(self.timeOutToggleDr);
                }
                $(self.settings.toggleButton).on("click", function (e) {
                    e.preventDefault();
                    self.$navMenu.toggleClass("nav-activated");
                    if (self.$navMenu.hasClass("nav-activated")) {
                        self.toggleClick = true;
                    } else {
                        self.toggleClick = false;
                    }
                    self.doSetup();
                    self.timeOutToggleDr = setTimeout(function () {
                        self.doSetup();
                    }, 320);
                });
            }
        }

        /**
         * Setup Mega Item
         * Can call whenever you want e.g window resize,..
         *
         * @since 1.0.0
         */
        async doSetup() {
            console.log("-----------------DO_SETUP--------------------");
            this.initDevices();
            this.detectNavAlign();
            this.setupMenuItems();
        }

        reset() {
            this.doSetup();
        }

        initWindowEvents() {
            var self = this;
            $.each(self.megaItems, async function (index, item) {
                if (item.isMega) {
                    $(window).on("scroll.megajsScroll", self.eventScroll(item));
                }
            });

            self.resizeTimeout = undefined;

            // ESCAPE key pressed
            $(document).keydown(function (e) {
                if (e.keyCode === 27) {
                    self.closeAllItems(true);
                }
            });

            $(window).resize(function () {
                if (self.resizeTimeout) {
                    clearTimeout(self.resizeTimeout);
                }
                self.resizeTimeout = setTimeout(function () {
                    self.$drop.removeClass("drop-activated");
                    self.showing = false;
                    self.doSetup();
                }, 1000);
            });

            if (this.settings.vertical && this.settings.dropdown) {
                self.$navMenu.mouseenter(function () {
                    // If still hover do nothing, else re-setup again.
                    if (!self.showing) {
                        self.doSetup();
                    }
                });
            }
        }

        sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }

        toInt(n, ndefault = null) {
            if (Number.isInteger(n)) {
                return n;
            }
            n = "" + n;
            if (n.length === 0) {
                return ndefault;
            }
            if (n.substring(n.length - 2) === "px") {
                n = n.substring(0, n.length - 2);
            }
            if (isFinite(n)) {
                return Number(n);
            }
            return ndefault;
        }

        detectNavAlign() {
            this.navAlign = this.$navMenu.attr("data-align") || false;
            if (!this.navAlign) {
                var ta = this.$navMenu.css("text-align");
                var jc = this.$navMenu.css("justify-content");
                var d = this.$navMenu.css("display");
                var ml = this.$navMenu.css("margin-left");
                var mr = this.$navMenu.css("margin-right");
                mr = this.toInt(mr);
                ml = this.toInt(ml);
                if (d === "flex") {
                    if (jc === "center") {
                        this.navAlign = "center";
                    }
                } else {
                    if (ta === "center" && Math.abs(mr - ml) < 20) {
                        this.navAlign = "center";
                    }
                }
            }

            if (!this.navAlign) {
                // check if is flex.
                //let $parent = this.$navMenu.parent();
                let pRect = this.$wrapper.get(0).getBoundingClientRect();

                if (
                    pRect.x + pRect.width / 2 <
                    this.navRect.x + this.navRect.width / 2
                ) {
                    this.navAlign = "right";
                } else {
                    this.navAlign = "left";
                }
            }
        }

        /**
         * Setup navMenu Bounding Client Rect
         */
        setupNavRect() {
            this.navRect = this.$navMenu.get(0).getBoundingClientRect();
            if (this.settings.vertical && this.settings.dropdown) {
                this.navRect = this.$dropdown.get(0).getBoundingClientRect();
            }
        }

        initDevices() {
            this.setupNavRect();

            this.windowWidth = window.innerWidth || $(window).width();
            this.windowHeight = window.innerHeight || $(window).height();

            var rect = this.$wrapper.offset();
            var wh = this.$wrapper.height();
            var ww = this.$wrapper.width();

            this.verAlign = "";
            let pdl = this.toInt(this.$wrapper.css("padding-left"));
            let pdr = this.toInt(this.$wrapper.css("padding-right"));

            this.wrapperRect = {
                width: ww,
                height: wh,
                left: rect.left,
                right: rect.left + ww,
                top: rect.top,
                paddingLeft: pdl,
                paddingRight: pdr,
            };

            if (this.settings.vertical) {
                if (this.navRect.x > this.windowWidth / 2) {
                    this.verAlign = "left";
                }
            }

            this.isMobile = /iPhone|iPad|iPod|Android/i.test(
                navigator.userAgent
            );

            if (this.windowWidth <= this.settings.breakPoint) {
                this.isMobile = true;
            } else {
                this.isMobile = false;
            }
        }

        getBorder($el) {
            return {
                top: this.toInt($el.css("border-top-width")),
                left: this.toInt($el.css("border-left-width")),
                right: this.toInt($el.css("border-right-width")),
                bottom: this.toInt($el.css("border-bottom-width")),
            };
        }

        getItemBase($mega, $navLi, id, megaId) {
            var self = this;

            var $header = $mega.find(".mega-header");
            let $arrow = $.noop;

            if (self.settings.arrow) {
                $arrow = $mega.find(".mega-arr");
                // Add arrow.
                if (!$arrow.length) {
                    $arrow = $(self.arrowHTML);
                    $mega.append($arrow);
                }
            }

            //Add close button.
            if (!$header.length) {
                $header = $(self.headerHTML);
                $mega.prepend($header);
            }

            let text = $navLi.children("a").first().text();
            $header.children(".mega-header-title").text(text);

            var itemData = {
                id: id,
                megaId: megaId,
                $navLi: $navLi,
                $mega: $mega,
                $arrow: $arrow,
                $header: $header,
                animation: $mega.attr("data-animation") || self.animation,
                align: $mega.attr("data-align") || "auto",
                innerAlign: $mega.attr("data-inner-align") || "",
                dataWidth: $mega.attr("data-width") || "",
            };
            // self.calcItemCSS(itemData);
            return itemData;
        }

        calcItemCSS(item) {
            const self = this;

            let megaItemRect = item.$mega.get(0).getBoundingClientRect();
            // _WIDTH
            let megaItemWidth = self.toInt(item.$mega.outerWidth());
            let megaItemHeight = self.toInt(item.$mega.outerHeight());
            let liOffset = item.$navLi.offset();
            let liRect = item.$navLi.get(0).getBoundingClientRect();
            let border = self.getBorder(item.$mega);
            let lih = item.$navLi.height();

            item.center = {
                x: liOffset.left + item.$navLi.width() / 2,
                y: liOffset.top + lih / 2,
            };
            item.border = border;
            item.liRect = liRect;
            item.liOffset = liOffset;
            item.megaItemRect = megaItemRect;
            item.megaItemWidth = megaItemWidth;
            item.megaItemHeight = megaItemHeight + border.top + border.bottom;
            if (self.settings.arrow) {
                let megaBg = item.$mega.css("background-color");
                item.$arrow
                    .find(".mega-arr-inner")
                    .css({ "background-color": megaBg });
                let arrowHeight = self.toInt(item.$arrow.height());
                let arrowWidth = self.toInt(item.$arrow.width());
                item.arrowWidth = arrowWidth;
                item.arrowHeight = arrowHeight;
            } else {
                item.arrowWidth = 0;
                item.arrowHeight = 0;
            }
        }

        async firstInstall() {
            let self = this;
            let parent = this.$navMenu;
            let tagName = "";
            let letDo = true;
            let maxLvUp = 10;
            let i = 0;
            self.stickyType = "";
            self.$stickyEl = $.noop;

            // Check parent position sticky or not.
            do {
                i++;
                tagName = parent.prop("tagName");
                if (parent.css("position") === "fixed") {
                    letDo = false;
                    self.stickyType = "fixed";
                    self.$stickyEl = parent;
                }

                if (parent.css("position") === "sticky") {
                    letDo = false;
                    self.stickyType = "sticky";
                    self.$stickyEl = parent;
                }

                if ("BODY" === tagName) {
                    letDo = false;
                }

                if (i >= maxLvUp) {
                    letDo = false;
                }

                if (letDo) {
                    parent = parent.parent();
                }
            } while (letDo);

            $(self.settings.items, self.$navMenu).each(async function (index) {
                var navLi = $(this);
                var id = navLi.attr("id");
                var megaId = navLi.attr("data-mega") || "#m-" + id;
                var megaItem = $(megaId);

                let isMega = true;
                if (!megaItem.length) {
                    // If support sub mega.
                    if (self.settings.megaSub && self.settings.megaSubItems) {
                        megaItem = navLi.children(self.settings.megaSubItems);

                        var megaId =
                            "mmjs-" + index + "-" + new Date().getTime();
                        if (megaItem.length) {
                            // Add dropdown id and remove bootstrap Toggle event.
                            navLi
                                .attr("data-mega", megaId)
                                .find("a")
                                .removeAttr("data-toggle")
                                .removeAttr("aria-expanded");
                        }

                        megaItem
                            .addClass("mega-nav-sub")
                            .removeClass(self.removeSubClass);
                        megaItem.wrap("<div></div>");
                        megaItem = megaItem.parent();
                        megaItem.wrapInner('<div class="mega-inner"></div>');
                        megaItem.attr("data-mega", megaId);
                    }

                    // Skip item if no mega content.
                    if (!megaItem.length) {
                        isMega = false;
                    }
                }

                var itemData;
                if (isMega) {
                    if (navLi.find(".mega-clip").length === 0) {
                        navLi.append('<span class="mega-clip"></span>');
                        //_TAB
                        if ( self.settings.accessibility ) {
                            let text = navLi.find( 'a' ).text() || '';
                            if ( text ) {
                                text = self.settings.focusButtonText.replace(/\{item_name\}/g, text );
                            }
                            navLi.append(
                                '<button class="mega-t-toggle">'+text+'</button>'
                            );
                        } 
                       
                    }

                    megaItem.addClass("mega-wrapper");

                    // Move mega item to the and of page.
                    $("body").append(megaItem);
                    megaItem.addClass("mi-" + index);
                    megaItem.addClass(
                        "mega-" +
                            (self.settings.vertical ? "vertical" : "horizontal")
                    );
                    navLi.addClass("mega-enabled");
                    itemData = self.getItemBase(megaItem, navLi, id, megaId);
                } else {
                    itemData = {
                        id: id,
                        $navLi: navLi,
                    };
                }

                itemData.isMega = isMega;

                self.megaItems.push(itemData);
                self.initKeyboardEvents(itemData);
            });
            await self.sleep( 30 );
        }

        setMegaWidth(item, itemWidth) {
            console.log( '___W__#'+item.megaId, itemWidth );
            item.$mega.css({ width: itemWidth });
        }

        /**
         * Setup mega items
         *
         * @since 1.0.0
         */
        setupMenuItems() {
            const self = this;

            if (self.isMobile) {
                self.$navMenu
                    .addClass("mega-mobile")
                    .removeClass("mega-desktop");
            } else {
                self.$navMenu
                    .addClass("mega-desktop")
                    .removeClass("mega-mobile");
            }

            //
            let mobileWidth = undefined;
            if (
                self.settings.mobileFit &&
                self.$navMenu.width() <= self.settings.fitWidth
            ) {
                mobileWidth = self.windowWidth - self.$navMenu.width();
            }

            $.each(self.megaItems, async function (index, item) {
                if (!item.isMega) {
                    return;
                }

                item.$mega
                    .removeClass("mega-active mega-mobile mega-desktop")
                    .removeAttr("style");
                if (self.isMobile) {
                    item.$mega.addClass("mega-mobile");
                } else {
                    // Remove mega max width. SET_MEGA_WIDTH
                    item.$mega.addClass("mega-desktop");
                }

                // SET_MEGA_WIDTH
                let mgWidth = "";
                if (!self.showing && !self.isMobile) {
                    // console.log("Call__WIDTH_AGAIN");
                    self.setMegaWidth(item, "");
                    await self.sleep(30);

                    var customMegaWidth = item.dataWidth;
                    if (customMegaWidth === "full") {
                        if (self.settings.vertical) {
                            mgWidth = self.windowWidth;
                        } else {
                            mgWidth = "";
                        }
                    } else if (customMegaWidth === "fit") {
                        if (self.$wrapper.length) {
                            mgWidth = self.$wrapper.innerWidth();
                        } else {
                            mgWidth = self.$navMenu.outerWidth();
                        }
                    } else if (customMegaWidth) {
                        mgWidth = customMegaWidth;
                    } else {
                        //mgWidth = self.$wrapper.innerWidth();
                        mgWidth = '';
                    }

                    if (mgWidth === 0) {
                        mgWidth = "";
                    }
                }

                // SET_MEGA_WIDTH MOBILE
                //item.megaItemWidth = mgWidth;
                self.setMegaWidth(item, mgWidth);
                await self.sleep(50);
                self.calcItemCSS(item);

                if (self.settings.vertical) {
                    // AIM hover clip triangle.
                    item.$navLi.find(".mega-clip").css({
                        width:
                            item.liRect.width / 1.5 +
                            self.settings.spacing +
                            40,
                        height: item.megaItemHeight + 100,
                    });
                    if (self.verAlign === "left") {
                        if (self.settings.arrow) {
                            item.$arrow
                                .removeClass("arr-left")
                                .addClass("arr-right");
                        }

                        item.$navLi.addClass("mega-v-right");
                        item.$mega.addClass("mega-v-right");
                    } else {
                        if (self.settings.arrow) {
                            item.$arrow
                                .addClass("arr-left")
                                .removeClass("arr-right");
                        }
                    }
                } else {
                    // AIM hover clip triangle.
                    item.$navLi.find(".mega-clip").css({
                        width: self.navRect.width,
                        height: 180 + self.settings.spacing,
                    });
                }

                self.setupPositionForMegaMode(item);

                if (self.isMobile) {
                    item.$mega.removeAttr("style");

                    if (mobileWidth) {
                        console.log( 'MOBILE:--------------' );
                        self.setMegaWidth(item, mobileWidth);
                    }
                }

                self.initItemEvents(item);
            });
        }

        maybeSetUpMegaTop(item, top) {
            var self = this;
            if (!self.isMobile) {
                item.$mega.css({
                    top: item.megaPos.top,
                    left: item.megaPos.left,
                });
            } else {
                item.$mega.css({
                    top: "",
                });
            }
        }

        maybeCheckItemStuck(item) {
            const self = this;
            let isStuck = false;
            if (self.stickyType) {
                let stickyTop = self.$stickyEl.css("top");
                if (stickyTop) {
                    stickyTop = self.toInt(stickyTop);
                    let stickyRect = self.$stickyEl
                        .get(0)
                        .getBoundingClientRect();

                    isStuck = stickyTop >= stickyRect.y;

                    $("body").toggleClass("mega-body-fixed", isStuck);
                    item.$mega.removeClass("mega-fixed");
                    item.$arrow.removeClass("mega-fixed");
                }
            }

            return isStuck;
        }

        async setupMegaPosition(item) {
            var self = this;

            self.calcItemCSS(item);
            var menuAlign = item.align;
            var top, left, right, arl, art;
            var st = item.$navLi.offset().top;
            let isStuck = false;

            console.log( 'item.navRect: ', self.navRect );

            // Check if is __sticky
            isStuck = self.maybeCheckItemStuck(item);

            if (isStuck) {
                st = item.$navLi.position().top;
                item.$mega.addClass("mega-fixed");
            }

            top = st + item.$navLi.outerHeight() + self.settings.spacing;
            if ("full" === item.dataWidth) {
                left = 0;
            } else if ("fit" === item.dataWidth) {
                if (self.$wrapper.length) {
                    left = self.$wrapper.get(0).getBoundingClientRect().x;
                } else {
                    left = self.$navMenu.get(0).getBoundingClientRect().x;
                }
            } else {
                switch (menuAlign) {
                    case "left":
                        left = item.liRect.x;
                        // Check if mega pos right outside window.
                        if (
                            left + item.megaItemWidth >
                            self.wrapperRect.right
                        ) {
                            left =
                                (self.wrapperRect.right - item.megaItemWidth) /
                                2;
                        }
                        break;
                    case "right": // Align right.
                        left = item.liRect.x + item.liRect.width;
                        left = left - item.megaItemWidth;
                        // Check if mega pos left outside window.
                        if (left < self.wrapperRect.left) {
                            left = self.wrapperRect.left;
                        }

                        break;
                    default:
                        // Center
                        // Align auto.
                        left =
                            item.liRect.x +
                            item.liRect.width / 2 -
                            item.megaItemWidth / 2;

                        if (left < self.navRect.x) {
                            left = self.navRect.x;
                        }

                        // Check if mega pos right outside window.
                        if (
                            left + item.megaItemWidth >
                            self.wrapperRect.right
                        ) {
                            left = self.wrapperRect.right - item.megaItemWidth;
                        }

                        if (self.navAlign === "center") {
                            right =
                                self.wrapperRect.right -
                                (left + item.megaItemWidth);
                            var d = (left + right) / 2; // make it center.
                            if (
                                d < item.center.x &&
                                // d + (item.center.x - left) < item.center.x &&
                                d + item.megaItemWidth >= item.center.x
                            ) {
                                left = d;
                            }
                        }

                        // Check left with li center
                        if (
                            left + item.megaItemWidth <
                            item.liRect.x + item.liRect.width
                        ) {
                            left +=
                                item.liRect.x +
                                item.liRect.width -
                                (left + item.megaItemWidth);
                        }

                        // Center mega item if it translateX to left.
                        if (
                            item.megaItemWidth >= self.navRect.width &&
                            left + item.megaItemWidth / 2 <
                                self.windowWidth / 2 &&
                            left + item.megaItemWidth > item.center.x &&
                            left < item.liRect.x
                        ) {
                            left = (self.windowWidth - item.megaItemWidth) / 2;
                        }
                }
            } // end if item align.

            // Arrow position.
            arl =
                Math.abs(left - item.liRect.x) +
                item.liRect.width / 2 -
                item.arrowWidth / 2 -
                item.border.top / 2 -
                1;
            art = -(item.arrowHeight - item.border.top * 2);
            if (arl <= 0) {
                arl = 0;
            }

            if (item.border.top === 0) {
                art -= 4;
            }

            // Arrow position
            item.arrowPos = { left: arl, top: art };
            item.megaPos = { left: left, top: top };
            item.relativeX =
                Math.abs(left - item.liRect.x) + item.liRect.width / 2;

            self.maybeSetUpMegaTop(item, top);
            //  await self.sleep( 20 );
        }

        calcVertical(item) {
            const self = this;
            let top, navOffset;
            let isStuck = self.maybeCheckItemStuck(item);
            let liTop = item.$navLi.offset().top;

            if (isStuck) {
                liTop = item.$navLi.position().top - item.border.top;
                top = liTop;
                item.$mega.addClass("mega-fixed");
                item.$arrow.addClass("mega-fixed");
                navOffset = $.extend(
                    {},
                    self.$stickyEl.get(0).getBoundingClientRect()
                );
                if (navOffset.top < 0) {
                    navOffset.top = 0;
                }
            } else {
                navOffset = $.extend({}, self.$navMenu.offset());
                navOffset.width = self.$navMenu.width();
                navOffset.height = self.$navMenu.height();
                top = liTop;
            }


            if (self.settings.vertical && self.settings.dropdown) {
                navOffset = $.extend(
                    {},
                    self.$dropdown.get(0).getBoundingClientRect()
                );
            }

            // Auto Top Position.
            if (
                top +
                    item.megaItemHeight -
                    (navOffset.top + self.navRect.height) >
                0
            ) {
                var tt =
                    top +
                    item.megaItemHeight -
                    (navOffset.top + self.navRect.height);
                top -= tt;
            }

            if (
                top + item.megaItemHeight <
                navOffset.top + self.navRect.height
            ) {
                top -=
                    liTop + self.navRect.height - (top + item.megaItemHeight);
            }

            if (top < navOffset.top) {
                //top = liTop;
                top = navOffset.top;
            }

            // Check Top mega from top.
            if (
                item.megaItemHeight <= self.$navMenu.height() &&
                navOffset.top + item.$navLi.height() >
                    top + item.megaItemHeight - 35
            ) {
                top += item.megaItemHeight / 2;
            }

            // Check bottom when stuck.
            if (isStuck) {
                try {
                    if (top + item.$mega.height() > self.windowHeight) {
                        top = self.windowHeight - item.megaItemHeight;
                        liTop = item.$navLi.get(0).getBoundingClientRect().top;
                    }
                } catch (e) {}
            }

            return {
                top: top,
                liTop: liTop,
                isStuck: isStuck,
                navOffset: navOffset,
            };
        }

        async setupMegaVerticalPosition(item) {
            const self = this;
            self.calcItemCSS(item);

            let verticalCalc = self.calcVertical(item);
            let navOffset, top, left, arl, art, isStuck, liTop;
            top = verticalCalc.top;
            navOffset = verticalCalc.navOffset;
            liTop = verticalCalc.liTop;
            isStuck = verticalCalc.isStuck;

            // Left Position.
            left = navOffset.left + navOffset.width + self.settings.spacing;
            if (
                left + item.megaItemWidth >
                self.wrapperRect.right - self.settings.spacing
            ) {
                item.megaItemWidth =
                    self.wrapperRect.right +
                    self.wrapperRect.paddingRight +
                    item.border.right +
                    item.border.left -
                    left;
            }

            // Arrow position.
            arl =
                Math.abs(left - item.liRect.x) +
                item.liRect.width / 2 -
                item.arrowWidth / 2 -
                item.border.top / 2 -
                1;

            art =
                Math.abs(top - liTop) +
                item.$navLi.height() / 2 -
                item.arrowHeight / 2;
            if (art <= 0) {
                art = 0;
            }

            // Arrow position
            item.arrowPos = { left: arl, top: art };
            item.megaPos = { left: left, top: top };
            item.relativeX =
                Math.abs(left - item.liRect.x) + item.liRect.width / 2;

            // console.log(item.megaPos, navOffset);

            self.maybeSetUpMegaTop(item, top);
        }

        async setupMegaVerticalPositionLeft(item) {
            var self = this;
            self.calcItemCSS(item);
            console.log("Item Vertical LEFT #" + item.id, item);
            //var top, left, right, arl, art;

            let verticalCalc = self.calcVertical(item);
            let navOffset, top, left, arl, art, isStuck, liTop;
            top = verticalCalc.top;
            navOffset = verticalCalc.navOffset;
            liTop = verticalCalc.liTop;
            isStuck = verticalCalc.isStuck;

            self.navRect = self.$navMenu.get(0).getBoundingClientRect();
            let wrapperLeft = self.$wrapper.get(0).getBoundingClientRect().x;

            // Arrow position.
            arl =
                Math.abs(left - item.liRect.x) +
                item.liRect.width / 2 -
                item.arrowWidth / 2 -
                item.border.top / 2 -
                1;
            art =
                Math.abs(top - item.$navLi.offset().top) +
                item.$navLi.height() / 2;
            if (art <= 0) {
                art = 0;
            }

            // Left position.
            left =
                self.navRect.x -
                item.megaItemWidth -
                self.settings.spacing -
                wrapperLeft;
            // + self.wrapperRect.paddingLeft;

            if (left < self.wrapperRect.left) {
                left = wrapperLeft;
            }

            if (
                left + item.megaItemWidth + self.settings.spacing >
                self.navRect.x
            ) {
                item.megaItemWidth =
                    self.navRect.x -
                    left -
                    self.settings.spacing -
                    self.wrapperRect.paddingLeft;
            } else {
                left =
                    self.navRect.x -
                    item.megaItemWidth -
                    self.settings.spacing -
                    self.wrapperRect.paddingLeft;
            }
            left += self.wrapperRect.paddingLeft;

            // Arrow position.
            item.arrowPos = { left: arl, top: art };
            item.megaPos = { left: left, top: top };
            item.relativeX =
                Math.abs(left - item.liRect.x) + item.liRect.width / 2;

            console.log("Item Setup LEFT #" + item.id, top, art);

            self.maybeSetUpMegaTop(item, top);
        }

        setupLayoutItem(item) {
            var self = this;
            item.liRect = item.$navLi.get(0).getBoundingClientRect();

            if (!self.isMobile && !self.showing) {
                if (self.settings.arrow && item.arrowPos) {
                    if (self.settings.vertical) {
                        item.$arrow.css({
                            top: item.arrowPos.top,
                        });
                    } else {
                        item.$arrow.css({
                            //top: item.arrowPos.top,
                            left: item.arrowPos.left,
                        });
                    }
                }

                let width = item.megaItemWidth;

                // SET_MEGA_WIDTH
                if ("full" === item.dataWidth) {
                    if (!self.settings.vertical) {
                        width = "";
                    }
                }
                console.log( 'LAYOUT:----------:-', item.megaItemWidth );
                self.setMegaWidth(item, width);
                item.$mega.css({
                    // height: item.megaItemHeight,
                    top: item.megaPos.top,
                    left: item.megaPos.left,
                });

                // Inner Align
                if (!self.settings.vertical && item.innerAlign === "auto") {
                    var $inner = item.$mega.find("> .mega-inner");

                    var iw = $inner.outerWidth();
                    if (
                        iw <
                        item.megaItemWidth -
                            (item.border.left + item.border.right)
                    ) {
                        var ml =
                            item.relativeX -
                            iw / 2 -
                            item.border.left -
                            item.border.right;
                        if (ml >= 0) {
                            if (ml + iw > item.megaItemWidth) {
                                var d =
                                    ml +
                                    iw +
                                    (item.border.left + item.border.right) -
                                    item.megaItemWidth;
                                ml -= d;
                            }
                            $inner.css({
                                marginLeft: ml,
                            });
                        }
                    }
                }
            }
        }

        closeAllItems(focus, $notli = false) {
            const self = this;
            $.each(self.megaItems, function (index, item) {
                if (item.isMega) {
                    self.closeMega(item);
                }
                if (focus) {
                    if ($notli) {
                        item.$navLi
                            .not($notli)
                            .removeAttr("tabindex")
                            .removeClass("mega-focus");
                    } else {
                        item.$navLi.removeAttr("tabindex");
                    }
                }
            });
        }

        showItem(item, focus = false) {
            const self = this;
            if (!self.isMobile && !self.showing) {
                // A
            } else {
                if (self.showing) {
                    self.showing.$mega.removeClass(self.activeClass);
                }
            }

            if (focus) {
                self.closeAllItems(focus);
            } else {
                item.$navLi.removeAttr("tabindex").removeClass("mega-focus");
            }

            self.showing = item;
            self.setupPositionForMegaMode(item);

            // SET_MEGA_WIDTH
            if (!self.isMobile && !self.showing) {
                if ("full" === item.dataWidth) {
                    item.$mega.css({ right: 0 });
                    if (self.settings.vertical) {
                        self.setMegaWidth(item, item.megaItemWidth);
                    }
                } else {
                    self.setMegaWidth(item, item.megaItemWidth);
                }
            }

            item.$navLi.addClass(self.activeClass);
            item.$mega.addClass(self.activeClass);

            if (self.isMobile) {
                $("body").addClass("mega-mobile-activated");
                self.$drop.addClass("drop-activated");
            } else {
                if (!self.toggleClick) {
                    self.$navMenu.addClass("nav-activated");
                }
                $("body").addClass("mega-desktop-activated");
            }

            if (focus) {
                if (self.focusTimeout) {
                    clearTimeout(self.focusTimeout);
                }
                self.focusTimeout = setTimeout(function () {
                    let la = item.$mega.find(self.focusElSelector);
                    la.attr("tabindex", 2);
                    item.$navLi.next().attr("tabindex", 1);
                    la.first().focus();
                }, 50);
            }
        }

        eventClickNavLiItem(item, focus = false) {
            var self = this;
            return async function (event) {
                event.preventDefault();
                self.showItem(item, focus);
            };
        }

        /**
         * When Mouse or Focus out item.
         *
         * @since 1.0.0
         */
        eventNavLiOut(item, focus = false) {
            var self = this;
            return function (e) {
                var goingto = e.relatedTarget || e.toElement;
                var $goingto = $(goingto);
                if (
                    !$goingto.is(item.$navLi) &&
                    !$goingto.is(item.$navLi) &&
                    !$goingto.is(item.$mega) &&
                    item.$mega.has($goingto).length === 0
                ) {
                    // console.log("Out0: #" + item.id);
                    self.closeMega(item);
                    if (
                        //!$goingto.is(".mega-enabled") &&
                        !$goingto.is(item.$mega) &&
                        item.$mega.has($goingto).length === 0
                    ) {
                        setTimeout(function () {
                            console.log("LeaveBG: #" + item.id);
                            if (
                                self.$navMenu.find("." + self.activeClass)
                                    .length === 0
                            ) {
                                self.closeBG();
                            }
                        }, 30);
                    }
                } else {
                    console.log("Out1: #" + item.id);
                    if (
                        !$goingto.is(item.$mega) &&
                        item.$mega.has($goingto).length === 0
                    ) {
                        console.log("Out2: #" + item.id);
                        self.closeBG();
                    }
                }
            };
        }

        eventMegaOut(item, focus = false) {
            var self = this;

            return function (e) {
                //  Khi chuot ra khỏi mega menu megaItem

                var goingto = e.relatedTarget || e.toElement;
                var $goingto = $(goingto);
                console.log("MEGA OUT: #" + item.id, $goingto);
                if (!$goingto.is(item.$mega) && !$goingto.is(item.$navLi)) {
                    self.closeMega(item);
                }

                if (focus) {
                    let nextLi = item.$navLi.next();
                    console.log("-----NEXT: ", nextLi);
                    if (nextLi.length) {
                        nextLi.find("a").focus();
                    }
                }

                if (!$goingto.is(".mega-enabled")) {
                    self.closeBG();
                }
            };
        }

        async setupPositionForMegaMode(item) {
            var self = this;

            console.log("-------setupPositionForMegaMode------------");
            self.initDevices();
            self.detectNavAlign();

            if (self.settings.vertical) {
                if (self.verAlign === "left") {
                    self.setupMegaVerticalPositionLeft(item);
                } else {
                    self.setupMegaVerticalPosition(item);
                }
            } else {
                await self.setupMegaPosition(item);
            }
        }

        eventScroll(item) {
            var self = this;
            return async function () {
                if (!self.showing) {
                    return;
                }
                if (item._stt) {
                    clearTimeout(item._stt);
                }
                if (item._stt2) {
                    clearTimeout(item._stt2);
                }
                item.$mega.addClass("no-animate");
                item._stt = setTimeout(function () {
                    self.setupLayoutItem(item);
                    console.log("RESET_POST_WHEN_REST #" + item.id);
                    self.setupPositionForMegaMode(item);
                    item._stt2 = setTimeout(function () {
                        item.$mega.removeClass("no-animate");
                    }, 30);
                }, 100);
            };
        }

        /**
         * Accessibility
         * 
         * Enables tabbing and enter key navigation.
         */
        initKeyboardEvents(item) {
            const self = this;
            if ( ! self.settings.accessibility ) {
                return;
            }
            if (!item.isMega) {
                return;
            }
          
            item.$navLi.find("button").off(".megafocus");
            item.$navLi.on("click.megafocus", "button", function (e) {
                e.preventDefault();
                self.showItem(item, true);
            });

            // _TAB
            item.$navLi.on("focusin.megafocus", function () {
                self.closeAllItems(true, item.$navLi);
                item.$navLi.addClass("mega-focus");
            });

            item.$navLi.on("focusout.megafocus", function (e) {
                let goingto = e.relatedTarget || e.toElement;
                if (
                    item.$navLi.has(goingto).length === 0 &&
                    item.$mega.has(goingto).length === 0
                ) {
                    item.$navLi.removeClass("mega-focus");
                    self.closeMega(item, true);
                }
            });

            item.$mega
                .find(self.focusElSelector)
                .last()
                .on("focusout.megafocus", function (e) {
                    let goingto = e.relatedTarget || e.toElement;
                    if (self.showing && self.showing.$navLi.next().length) {
                        self.showing.$navLi.next().find("a").focus();
                    }
                    self.closeMega(item, true);
                    // item.$navLi.removeClass("mega-focus");
                });
        }

        initItemEvents(item) {
            if (!item.isMega) {
                return;
            }
            const self = this;
            if (self.isInstalled) {
                return;
            }

            item.$navLi.off(".megajs");
            item.$mega.off(".megajs");
            item.$header.off(".megajs");
            self.setupLayoutItem(item);

            if (!self.isMobile) {
                item.$navLi.on(
                    "mouseenter.megajs",
                    self.eventClickNavLiItem(item)
                );

                item.$navLi.on("mouseleave.megajs", self.eventNavLiOut(item));
                item.$mega.on("mouseleave.megajs", self.eventMegaOut(item));
            } else {
                // Mobile
                item.$navLi.on(
                    "click.megajs touchstart.megajs",
                    self.eventClickNavLiItem(item)
                );
            } // end check mobile or desktop.

            item.$header.on("click.megajs", function (e) {
                self.closeMega(item);
            });
        }

        closeMega(item, focus = false) {
            const self = this;
            // console.log("CLose OUT: #" + item.id);
            item.$mega.removeClass(self.activeClass);
            item.$navLi
                .removeClass(self.activeClass)
                .removeClass("show")
                .find("a")
                .attr("aria-expanded", "false");

            if (!self.$navMenu.hasClass("mega-show")) {
                self.$drop.removeClass("drop-activated");
            }
            if (self.isMobile) {
                $("body").removeClass(
                    "mega-desktop-activated mega-mobile-activated mega-body-fixed"
                );
            }

            if (focus) {
                item.$navLi.removeClass("mega-focus").removeAttr("tabindex");
                item.$mega.find(self.focusElSelector).removeAttr("tabindex");
            }

            //Trigger Menu Item Event.
            self.$navMenu.trigger("megaMenuItemClosed", [item, self]);
        }

        closeBG() {
            const self = this;
            // self.$bg.removeClass("mega-active mega-init");
            self.showing = false;
            self.$navMenu.removeClass("mega-show");
            if (!self.toggleClick) {
                self.$navMenu.removeClass("nav-activated");
            }
            self.$drop.removeClass("drop-activated");
            $("body").removeClass(
                "mega-desktop-activated mega-mobile-activated mega-body-fixed"
            );
            self.closeAllItems(true);
            //Trigger Menu Event.
            self.$navMenu.trigger("megaMenuClosed", [self]);
        }
    };

    let megaInit = undefined;

    this.each(function () {
        let $el = $(this);
        var id = $el.attr("id") || "";
        if (!id) {
            id = "megajs-" + new Date().getTime();
            $el.attr("id", id);
        }

        if (typeof window.MegaJSList[id] === "undefined") {
            megaInit = new Mega($(this), "string" === typeof args ? {} : args);
            window.MegaJSList[id] = megaInit;
        } else {
            megaInit = window.MegaJSList[id];
        }

        // Call Methods
        if ("string" === typeof args) {
            switch (args) {
                case "reset":
                    megaInit.doSetup();
                    break;
            }
        }
        return megaInit;
    });

    return megaInit;
};

jQuery(document).ready(function ($) {
    $(document).on("click", ".mega-mobile-toggle", function (e) {
        e.preventDefault();
        var tg = $(this).attr("data-target") || false;
        if (tg) {
            let $tg = $(tg);
            if ($tg.hasClass("mega-show")) {
                $tg.removeClass("mega-show");
                $("body").removeClass("mega-mobile-activated");
                $(tg + "-drop").removeClass("drop-activated");
            } else {
                $tg.addClass("mega-show");
                $(tg + "-drop").addClass("drop-activated");
                $("body").addClass("mega-mobile-activated");
            }
        }
    });
});
