jQuery(function() {
    // find the products and versions
    var productsAndVersions = _.map(books, function(element) {
        return {product: element.product, version: element.version};
    });

    productsAndVersions = _.uniq(productsAndVersions, function(element) {
        return JSON.stringify(element);
    });

    productsAndVersions.sort(function(a,b) {
        if (!a.product && b.product) {
            return -1;
        }

        if (a.product && !b.product) {
            return 0;
        }

        if (a.product < b.product) {
            return -1;
        }

        if (a.product > b.product) {
            return 1;
        }

        if (!a.version && b.version) {
            return -1;
        }

        if (a.version && !b.version) {
            return 0;
        }

        if (a.version < b.version) {
            return -1;
        }

        if (a.version > b.version) {
            return 1;
        }

        return 0;
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
                '<div> \
                    <h2 class="bookTitle"> \
                    ' + _.escape(bookElement.title) + ' \
                    ' + (bookElement.buildSuccess?'<span class="pficon pficon-ok bookStatus"></span>':'<span class="pficon-layered bookStatus"><span class="pficon pficon-error-octagon"></span><span class="pficon pficon-error-exclamation"></span></span>') + '\
                    </h2> \
                    <div class="btn-group bookMenu"> \
                        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"> \
                            <span class="fa fa-angle-down"></span> \
                        </button> \
                        <ul class="dropdown-menu" role="menu"> \
                            <li><a href="' + SPEC_EDIT + bookElement.id + '">Edit</a></li> \
                            <li><a href="' + bookElement.id + '/remarks">Remarks</a></li> \
                            <li><a href="' + bookElement.id + '/build.log">Build Log</a></li> \
                            <li><a href="' + bookElement.id + '/publican.log">Publican Log</a></li> \
                        </ul> \
                    </div> \
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