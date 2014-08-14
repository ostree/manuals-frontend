(function() {
  "use strict";
  window.GOVUK = window.GOVUK || {};

  function CollapsibleCollection(options){
    this.collapsibles = {};

    this.$container = options.$el;
    this.markupHeaderlessSection();
    this.markupSections();
    this.$sections = this.$container.find('.js-openable');

    if(this.$sections.length > 0) {
      this.$sections.each($.proxy(this.initCollapsible, this));
      this.$openAll = $("<a href='#' aria-hidden=true>Open all</a>"),
      this.$closeAll = $("<a href='#' aria-hidden=true>Close all</a>");
      this.addControls();

      this.closeAll();

      var openSectionID = GOVUK.getCurrentLocation().hash.substr(1);
      if(typeof(this.collapsibles[openSectionID]) != 'undefined') {
        this.collapsibles[openSectionID].open();
      }

      this.$container.on('click', 'a[rel="footnote"]', $.proxy(this.expandFootnotes, this));
    }
  }


  CollapsibleCollection.prototype.initCollapsible = function initCollapsible(sectionIndex){
    var $section = $(this.$sections[sectionIndex]);
    var collapsible = new GOVUK.Collapsible($section);
    var sectionID = $section.find('h2.js-subsection-title').data('section-id');

    if(typeof sectionID == "undefined"){
      sectionID = sectionIndex;
    }

    $section.on('click', $.proxy(this.updateControls, this));
    this.collapsibles[sectionID] = collapsible;
  }

  CollapsibleCollection.prototype.expandFootnotes = function expandFootnotes(){
    this.collapsibles['footnotes'].open();
  }

  CollapsibleCollection.prototype.markupSections = function markupSections(){
    // Pull out h2's and mark them up as js-subsection-title.
    // Mark all following tags up to the next h2 as js-subsection-body.
    // Wrap newly discovered sections in a div with js-openable and manual-subsection classes
    // The DOM now contains poperly marked up sections to which collapsible functions can attach.

    var subsectionHeaders = this.$container.find('h2').not('.linked-title, .js-ignore-h2s h2');
    subsectionHeaders.addClass('js-subsection-title');
    subsectionHeaders.each(function(index){
      var $subsectionHeader = $(this),
          subsectionId = $subsectionHeader.attr('id');

      if (subsectionId) {
        $subsectionHeader.data('section-id', subsectionId);
      }

      var subsectionBody = $subsectionHeader.nextUntil('h2.js-subsection-title, h2.linked-title');
      subsectionBody.andSelf().wrapAll('<div class="manual-subsection js-openable"></div>');
      subsectionBody.wrapAll('<div class="js-subsection-body"></div>');
    });
  }

  CollapsibleCollection.prototype.markupHeaderlessSection = function markupHeaderlessSection(){
    // For a document that starts with content other than a h2
    // starting at the first tag inside .govspeak of .collapsible-subsections
    // find all tags that are children of .collapsible-subsections until the
    // first h2 and wrap them in a js-section-body to make them the correct width

    var firstChild = this.$container.find('.collapsible-subsections > .govspeak').children().first();
    if (!firstChild.is('h2')) {
      var headerlessContent = firstChild.nextUntil('h2').andSelf();
      headerlessContent.wrapAll('<div class="js-section-body"></div>');
    };
  }

  CollapsibleCollection.prototype.closeAll = function closeAll(event){
    for (var section in this.collapsibles) {
      this.collapsibles[section].close();
    }

    this.disableControl(this.$closeAll);
    this.enableControl(this.$openAll);

    if (typeof event != 'undefined'){
      event.preventDefault();
    }
  }

  CollapsibleCollection.prototype.openAll = function openAll(event){
    for (var section in this.collapsibles) {
      this.collapsibles[section].open();
    }

    this.disableControl(this.$openAll);
    this.enableControl(this.$closeAll);

    if (typeof event != 'undefined'){
      event.preventDefault();
    }
  }

  CollapsibleCollection.prototype.addControls = function addControls(){
    var $collectionControls = $('<div class="js-collection-controls" />');
    $collectionControls.append(this.$openAll, this.$closeAll);
    this.$container.find('.title-controls-wrap').append($collectionControls);
    this.$openAll.on('click', $.proxy(this.openAll, this));
    this.$closeAll.on('click', $.proxy(this.closeAll, this));
  }

  CollapsibleCollection.prototype.updateControls = function updateControls(){
    // if all the sections in this collection are open
    var sectionCount = this.$sections.length;
    var closedCount = this.$container.find('.closed').length;

    if (closedCount == 0) {
      // all the sections are open
      this.disableControl(this.$openAll);
      this.enableControl(this.$closeAll);

    } else if (sectionCount == closedCount) {
      // all the sections are closed
      this.disableControl(this.$closeAll);
      this.enableControl(this.$openAll);

    } else {
      this.enableControl(this.$openAll);
      this.enableControl(this.$closeAll);
    }
  }

  CollapsibleCollection.prototype.disableControl = function disableControl(control){
    control.addClass('disabled');
  }

  CollapsibleCollection.prototype.enableControl = function enableControl(control){
    control.removeClass('disabled');
  }

  GOVUK.CollapsibleCollection = CollapsibleCollection;
}());
