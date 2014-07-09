jQuery(function() {
    // find the products and versions
    var productsAndVersions = _.map(books, function(element) {
        return {product: element.product, version: element.version};
    });

    productsAndVersions = _.uniq(productsAndVersions, function(element) {
        return JSON.stringify(element);
    });

    _.each(productsAndVersions, function(element, index, list) {
        var productAndVersionBooks = _.filter(books, function(bookElement) {
            return bookElement.product === element.product &&
                bookElement.version === element.version;
        });

        var productAndVersionHeading = jQuery(
            '<div class="col-md-6 text-center">\
                <h1><strong>' + _.escape(element.product) + ' ' + _.escape(element.version) + '</strong></h1>\
            </div>');

        _.each(productAndVersionBooks, function(bookElement) {
            var bookListing = jQuery(
                '<div class="fadeText">\
                    <h2 class="unFadeText">' + _.escape(bookElement.title) + '</h2>\
                    <small >Edit | Remarks | Log | State | Action</small>\
                </div>');

            productAndVersionHeading.append(bookListing);
        });

        jQuery("#booklist").append(productAndVersionHeading);
    });
});

/*

 <div class="col-md-4 col-md-offset-2">
 <h1>Test 1</h1>
 <h2>title</h2>
 </div>
 <div class="col-md-4">
 <h1>Test 1</h1>
 <div class="fadeText">
 <h2 class="unFadeText">title</h2>
 <small >Edit | Remarks | Log | State | Action</small>
 </div>
 </div>

 */