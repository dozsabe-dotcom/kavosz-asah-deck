(function(){
  class DeckStage extends HTMLElement {
    connectedCallback(){
      const w = parseInt(this.getAttribute('width')||1920);
      const h = parseInt(this.getAttribute('height')||1080);
      const s = document.createElement('style');
      s.textContent =
        `deck-stage{display:block;width:${w}px;}` +
        `deck-stage section.slide{width:${w}px;height:${h}px;break-after:page;page-break-after:always;}` +
        `deck-stage section.slide:last-child{break-after:auto;page-break-after:auto;}` +
        `@page{size:${w}px ${h}px;margin:0;}` +
        `@media print{html,body{width:${w}px;height:auto;margin:0;padding:0;overflow:visible;background:#fff;}` +
        `deck-stage,deck-stage section.slide{box-shadow:none;}}`;
      document.head.appendChild(s);
    }
  }
  if(!customElements.get('deck-stage'))customElements.define('deck-stage',DeckStage);
})();
