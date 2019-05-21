/**
 * ListCard - Custom card for Lovelace UI
 * Prints a list of items from the value of a sensor.
 * 
 * @class
 */
class ListCard extends HTMLElement {
  /**
   * Constructor for this card.
   */
  constructor () {
    super();

    this._card    = null;
    this._content = null;
    this._style   = null;
    this.root     = null;

    this._config = {
      sensor: null,
      fromFormat: 'json',
      maxNumItems: 100,
      height: 'auto',
      title: '',
      showLastUpdated: true
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
    // this._config.height
    const height = this._config.height;

    this._style.textContent = `
      ha-card {
        color: var(--primary-text-color);
        ${ height !== 'auto' ? `height: ${height};` : '' }
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

  /**
   * Updates the content of this card.
   */
  _updateContent () {
    let sensor = this._hass.states[this._config.sensor];
    let value = sensor.state;
    let format = this._config.fromFormat;
    let lastUpdated = '';

    if (format === 'json') {
      value = JSON.parse(value);
    } else if (format) {
      value = value.split(format);
    }

    if (this._config.showLastUpdated) {
      lastUpdated = `<p>${this._formatDateString(sensor.last_updated)}</p>`;
    }

    this._content.innerHTML = `
      <ul>
        ${value.slice(0, this._config.maxNumItems).map(v => `<li>${v}</li>`).join("\n")}
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
    // A sensor is required for this card to work properly.
    if (!config.sensor) {
      throw new Error('Please define a sensor');
    }

    // Merge config
    this._config = Object.assign({}, this._config, config);

    // Set card title
    this._card.header = this._config.title;

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
