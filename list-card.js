/**
 * ListCard - Custom card for Lovelace UI
 * Prints a list of items from the value of an entity.
 * 
 * @class
 */
class ListCard extends HTMLElement {
  /**
   * Constructor for this card.
   */
  constructor () {
    super();

    this._card         = null;
    this._content      = null;
    this._style        = null;
    this.root          = null;
    this._itemTemplate = null;
    this._entityId     = '';
    this._valuePath    = ['state'];

    this._config = {
      entity: null,
      from_format: 'json',
      max_num_items: 100,
      title: '',
      item_template: null,
      show_last_updated: true,
      extra_css: ''
    };
    this._hass = {};

    this._initContent();
  }

  /**
   * Initializes the DOM for this card.
   */
  _initContent () {
    this._card    = document.createElement('ha-card');
    this._content = document.createElement('div');
    this._style   = document.createElement('style');

    this._card.header = '';

    this._card.appendChild(this._content);
    this._card.appendChild(this._style);

    this.root = this.attachShadow({mode: 'open'});
    this.root.appendChild(this._card);
  }

  /**
   * Updates the styling of this card.
   */
  _updateStyle () {
    let extraCss = this._config.extra_css ? this._config.extra_css : '';

    this._style.textContent = `
      ha-card {
        color: var(--primary-text-color);
        position: relative;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      li {
        border-bottom: 1px solid var(--divider-color);
        padding: 1em;
      }
      p {
        color: var(--secondary-text-color);
        margin-top: 1em;
        padding: 0.5em 1em;
        text-align: right;
      }
      ${extraCss}
    `;
  }

  /**
   * Formats a date string.
   * 
   * @param {String} dateString 
   * @todo Improve this. Replace with momentjs?
   */
  _formatDateString (dateString) {
    let date = new Date(dateString);

    // Left pad a number.
    const numPad = (str = '', length = 2) => (str + '').length > length ? str + '' : ('0'.repeat(length) + str).slice(-length);
    
    let y = date.getFullYear();
    let m = numPad(date.getMonth() + 1); // +1 to normalize getMonth which starts at 0 for january.
    let d = numPad(date.getDate());

    let hh = numPad(date.getHours());
    let mm = numPad(date.getMinutes());

    return `${y}-${m}-${d} ${hh}:${mm}`;
  }

  _getEntityValue (entity, valuePath) {
    var value = entity;

    valuePath.forEach(function (p) {
      if (typeof value === 'object' && p in value) {
        value = value[p];
      }
    });
    
    return value;
  }

  /**
   * Updates the content of this card.
   */
  _updateContent () {
    let entity = this._hass.states[this._entityId];
    let value = this._getEntityValue(entity, this._valuePath);
    let format = this._config.from_format;
    let lastUpdated = '';

    if (typeof value === 'string') {
      if (format === 'json') {
        value = JSON.parse(value);
      } else if (format) {
        value = value.split(format);
      }
    }

    if (this._config.show_last_updated) {
      lastUpdated = `<p>${this._formatDateString(entity.last_updated)}</p>`;
    }

    this._content.innerHTML = `
      <ul>
        ${value.slice(0, this._config.max_num_items).map(v => `<li>${this._itemTemplate(v)}</li>`).join("\n")}
      </ul>
      ${lastUpdated}
    `;
  }

  /**
   * Called whenever the configuration changes which is:
   * - always on initialization of the card
   * - when HA trigger a change
   * 
   * @param {Object} config 
   */
  setConfig (config) {
    // An entity is required for this card to work properly.
    if (!config.entity) {
      throw new Error('Please define an entity');
    }

    // Merge config
    this._config = Object.assign({}, this._config, config);

    // 
    let entityParts = this._config.entity.split('.');
    this._entityId  = `${entityParts.shift()}.${entityParts.shift()}`;
    if (entityParts.length > 0) {
      this._valuePath = entityParts;
    }

    // Set card title
    this._card.header = this._config.title;

    // 
    if ('_' in window && this._config.item_template) {
      this._itemTemplate = _.template(this._config.item_template, {variable: 'item'});
    } else {
      this._itemTemplate = function (mixed) {
        if (typeof mixed === 'object') {
          let p = ['content', 'value', 'title', 'name'].find(prop =>  {
            return prop in mixed && mixed[prop];
          });
          
          return mixed[p] || (mixed + '');
        } else {
          return mixed + '';
        }
      };
    }

    // Update styles
    this._updateStyle();    
  }

  /**
   * Called whenever the state is changed which 
   * will happen quite frequently.
   * 
   * @param {Object} hass The Home Assistant state object
   * @param {Object} hass.states Contains the state for each object under the objects name.
   */
  set hass (hass) {
    this._hass = hass;

    // Update content
    this._updateContent();
  }

  /**
   * @returns {int}
   */
  getCardSize () {
    return 1;
  }
}

customElements.define('list-card', ListCard);
