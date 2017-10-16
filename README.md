# Lost Config

## About

This is a [postCSS][PostCSS] plugin aims to reduce the over head for
implementing a responsive grid system where there are different gutter
sizes for each break point in your application. It is intended to be used
with css modules of some kind, along with lost-grid and which ever postcss
extension allows you to nest media query.

## Installation

I'm kinda assuming you have the post css extension above installed along
with post css,

```
yarn add @akst.io/lost-config
```

However you're specifying your postcss plugins do it in this order.

```js
const plugins = [
  CSSModules({}),
  LostConfig({}),
  Lost({}),
  NestedMediaQuerys({}),
];
```

## Usage

Say you defined your config in some file.

```css
/* app/styles/grid.css */

/* ignore the terrible breakpoints */
@value config: config(
  superScreen 50px "only screen and (min-width: 1501px)",
  wideScreen 50px "only screen and (min-width: 901px) and (max-width: 1500px)",
  stdScreen 50px "only screen and (min-width: 601px) and (max-width: 900px)",
  tablet 30px "only screen and (min-width: 376px) and (max-width: 600px)",
  phone 15px "only screen and (max-width: 375px)",
);
```

And you want to import, so you do so and use it like this.

```css
@value grid: 'app/styles/grid';
@value config as g from grid;

.tile {
  lost-config: to-lost(g superScreen 1/4 4);
  lost-config: to-lost(g wideScreen 1/3 3);
  lost-config: to-lost(g stdScreen 1/2 2);
  lost-config: to-lost(g tablet 1/1 1);
  lost-config: to-lost(g phone 1/1 1);
}
```

You end up with this (which of course needs to be passed through another css post processor.

```css

.tile {
  @media only screen and (min-width: 1501px) {
    lost-column: 1/4 4 50px;
  }
  @media only screen and (min-width: 901px) and (max-width: 1500px) {
    lost-column: 1/3 3 50px;
  }
  @media only screen and (min-width: 601px) and (max-width: 900px) {
    lost-column: 1/2 2 50px;
  }
  @media only screen and (min-width: 376px) and (max-width: 600px) {
    lost-column: 1/1 1 30px;
  }
  @media only screen and (max-width: 375px) {
    lost-column: 1/1 1 15px;
  }
}
```

The alternative to this is, importing your gutter values with your
media query values indivisually into every place that uses the grid
system. We were doing that at our work place originally and someone
called in a tyre fire.

## Contributing

I'm down with anyone contributing, try creating an issue first if
you have a feature idea or find a bug, just so I can track somewhere.
The only really thing I expect of contributed changes is that they're
run against the type checker, linter, and tests. You can do that by
running

```
make ci
```

If you have [watchman][watchman] installed, just run this for repeated
tests in the background.

```
make watch
```

You'll also want to install [Flow][Flow].


[Flow]: https://flow.org
[watchman]: https://facebook.github.io/watchman/
[PostCSS]: http://postcss.org
