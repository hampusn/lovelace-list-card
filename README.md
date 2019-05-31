# Lovelace List Card

Custom card for Home Assistant's Lovelace UI. Lists values from an entity's state or an attribute.


## Options

 Option | Type | Default | Description
 ------ | ---- | ------- | -----------
`entity` | `String` | `null` | The entity to get data from. When passing only an entity name such as `sensor.SENSOR_NAME`, the `state` value will be used. To use an entity's attribute instead, try `sensor.SENSOR_NAME.attributes.ATTRIBUTE_NAME`.
`from_format` | `String` | `'json'` | If the entity's value is a string. `json` will try to parse the string to JSON, any `other` string value will be seen as a separator and will be used to split the entity's value into an array.
`max_num_items` | `Integer` | `100` | The maximum number of items to print.
`item_template` | `String` | `null` | Underscore template used for each item. The data is accessed through variable `item`. Requires Underscore.JS to use. Read more under [item_template](#item_template).
`title` | `String` | `''` | The card's header title.
`show_last_updated` | `Boolean` | `true` | Shows a date when the entity was last updated in the lower part of the card.
`extra_css` | `String` | `''` | Can be used to add extra styling. The styling is scoped to the custom element.

 
### `item_template`

...