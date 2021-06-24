# Mega.jS - Turn any existing navigation to mega menu.
- Easy to use.
- Fully Responsive.
- Vertical, Horizontal, Dropdowns.
- Full Width, Fit, Custom width.
- Auto, Left, Center, Right alignment.
- Sticky Support.
- Custom break point.
- Bootstrap Compatible
- SASS files.


## Usage

#### Set up your HTML markup.
```html
<ul id="mega-nav">
	<li data-mega="#mega-item-1">Mega Item 1</li>
	<li data-mega="#mega-item-2">Mega Item 2</li>
</ul>
<div id="mega-item-1" class="mega-wrapper">
	<div class="mega-inner">
		YOUR MEGA CONTENT
	</div>
</div>
```

#### Add mega css in your `<head>`
```html
<link rel="stylesheet" type="text/css" href="dist/mega-full.css"/>
```

#### Add mega.js before your closing `<body>` tag, after jQuery (requires jQuery 1.7 +)
```html
<script type="text/javascript" src="//code.jquery.com/jquery-1.11.0.min.js"></script>
<script type="text/javascript" src="dist/mega.min.js"></script>
```

#### Initialize your mega in your script file or an inline script tag
```js
$(".mega-nav").MegaJs();
```


## Settings

| Option          | Type                 | Default                            | Description                                                                                        |
|-----------------|----------------------|------------------------------------|----------------------------------------------------------------------------------------------------|
| items           | string               | `li`                                 | Mega items, selector.                                                                              |
| spacing         | number               | `10`	                                 | Spacing between Nav li and Mega Navigation Menu, px                                                |
| arrow           | bool                 | `true`                               | Show arrow of mega content.                                                                        |
| vertical        | bool                 | `false`                              | Menu Mod: `true` for Vertical, else Horizontal.                                                    |
| mobileFit       | bool                 | `false`                              | Fit mega with screen when vertical to small.                                                       |
| fitWidth        | number               | `80`                                 | Mobile fit only when max screen <= mobileFit.                                                      |
| toggleButton    | bool, string, jQuery | `false`                              | Toggle button use for vertical when true, Selector or jQuery item.                                 |
| breakPoint      | number               | `991`                                | Mobile Break point                                                                                 |
| wrapper         | bool, string, jQuery | `false`                              | Can be `parent`, or jQuery item, or selector default window.                                       |
| dropdown        | bool                 | `false`                              | Selector or jQuery item. Use for vertical only. Use when you have hidden dropdown nav.             |
| autoHeader      | bool                 | `false`                              | Auto add header to Main navigation, use for mobile mod.                                            |
| navText         | string               | `Menu`                               | The menu navigation header title if autoHeader set `true`.                                         |
| stickyType      | string               | empty                                | Type of element CSS position when sticky, `fixed` or `sticky`.                                     |
| stickyEl        | string               | empty                                | Sticky Element. Can be `parent`, or jQuery item, or selector that will sticky when browser scroll. |
| accessibility   | bool                 | `true`                               | Enables tabbing and enter key navigation.                                                          |
| focusButtonText | string               | `Toggle: {item_name}`                | Toggle to show mega item when you hit TAB key. Use for Accessibility.                              |
| megaSub         | bool                 | `true`                               | Auto convert existing sub menus to mega sub menus.                                                 |
| megaSubItems    | string               | `> ul, .dropdown-menu, .sub-menu`  | Default existing sub menus selector.                                                               |
| closeIcon       | string               |                                    | HTML markup for close icon, can use svg code.                                                      |



## Mega Content Options
Options can be passed via data attributes. For data attributes, append the option name to `data-`, as in `data-align=""`.
```html
<div 
	id="mega-item-1"
	class="mega-wrapper"  
	data-align="left"  
	data-width="700px" 
	data-animation="up"
	data-m-animation="up"
	data-inner-align="auto"
>
	<div class="mega-inner">
		YOUR MEGA CONTENT
	</div>
</div>
```

| Option      | Default | Description                                                              |
|-------------|---------|--------------------------------------------------------------------------|
| align       | center  | Mega content alignment.                                                  |
| width       | fit     | Mega content with can be `fit`, `full`, a css number e.g: 500px, 40em,.. |
| inner-align | auto    | Mega content inner align, accept `auto` only.                            |
| animation   | none    | Animation for desktop mod, can be: up, fade, zoom-in, slide-down.        |
| m-animation | none    | Animation for mobile mod, can be: slide-up, slide-left, slide-right.     |


## Methods

#### Reset mega items positions.
```js
$("#your-nav").MegaJs( 'reset' );
```

## CSS
- Nav li enable class: `mega-enabled`.
- Nav li active class: `mega-active`.
- Nav li focus class: `mega-focus`.
- Mega content active class: `mega-active`.

#### Style for desktop mod
```css
.mega-wrapper.mega-desktop { 
	/* Style mega menu for desktop */
}
```

#### Style for mobile mod
```css
.mega-wrapper.mega-mobile { 
	/* Style mega menu for mobile */
}
```

#### DON'T
```css
	.your-nav-li .mega-wrapper { 
		/* it's not work */
	}
```
  
#### Custom Animation for mega menu.
Add attribute `data-animation="your-animation" data-m-animation="your-mobile-animation"` to to mega `mega-wrapper` element.

```css
/*Animation for desktop*/
.mega-wrapper.mega-desktop[data-animation="your-animation"] {
	/* Your desktop animation when inactive */
}
.mega-wrapper.mega-desktop[data-animation="your-animation"].mega-active {
	 /* Your desktop animation when active */
}

/*Animation for mobile*/
.mega-wrapper.mega-mobile[data-m-animation="your-mobile-animation"] {
	/* Your mobile animation when inactive */
}
.mega-wrapper.mega-mobile[data-m-animation="your-mobile-animation"].mega-active {
  /* Your mobile animation when active */
}
```
	
