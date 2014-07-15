function sortByProductAndVersion(a,b) {
    if (!a.productRaw && b.productRaw) {
        return -1;
    }

    if (a.productRaw && !b.productRaw) {
        return 1;
    }

    if (a.productRaw < b.productRaw) {
        return -1;
    }

    if (a.productRaw > b.productRaw) {
        return 1;
    }

    if (!a.versionRaw && b.versionRaw) {
        return -1;
    }

    if (a.versionRaw && !b.versionRaw) {
        return 0;
    }

    if (a.versionRaw < b.versionRaw) {
        return -1;
    }

    if (a.versionRaw > b.versionRaw) {
        return 1;
    }

    return 0;
}

function sortByTitle(a,b) {
    if (!a.titleRaw && b.titleRaw) {
        return -1;
    }

    if (a.titleRaw && !b.titleRaw) {
        return 0;
    }

    if (a.titleRaw < b.titleRaw) {
        return -1;
    }

    if (a.titleRaw > b.titleRaw) {
        return 1;
    }

    return 0;
}

jQuery(function() {
    // find the products and versions
    var productsAndVersions = _.map(data, function(element) {
        return {productRaw: element.productRaw, versionRaw: element.versionRaw};
    });

    productsAndVersions = _.uniq(productsAndVersions, function(element) {
        return JSON.stringify(element);
    });

    productsAndVersions.sort(sortByProductAndVersion);

    _.reduce(productsAndVersions, function(memo, element) {
        var productAndVersionBooks = _.filter(data, function(bookElement) {
            return bookElement.productRaw === element.productRaw &&
                bookElement.versionRaw === element.versionRaw;
        });

        productAndVersionBooks.sort(sortByTitle);

        var versionName = !element.versionRaw?"":element.versionRaw.trim();
        var productName = !element.productRaw?"[No Product]":element.productRaw.trim();

        var productAndVersionHeading = jQuery(
            '<div class="text-center">\
                <h1><strong>' + _.escape(productName) + ' ' + _.escape(versionName) + '</strong></h1>\
            </div>');

        _.each(productAndVersionBooks, function(bookElement, index, list) {
            var title = !bookElement.titleRaw?"[No Title]":bookElement.titleRaw.trim();

            var bookListing = jQuery(
                '<div> \
                    <h2 class="bookTitle"> \
                    [' + _.escape(bookElement.idRaw) + '] \
                    ' + _.escape(title) + ' \
                    ' + (bookElement.status.indexOf("tick") !== -1 ?'<span class="pficon pficon-ok bookStatus"></span>':'<span class="pficon-layered bookStatus"><span class="pficon pficon-error-octagon"></span><span class="pficon pficon-error-exclamation"></span></span>') + '\
                    <div class="btn-group bookMenu"> \
                        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"> \
                            <span class="fa fa-angle-down"></span> \
                        </button> \
                        <ul class="dropdown-menu" role="menu"> \
                            <li><a href="' + SPEC_EDIT + bookElement.idRaw + '">Edit</a></li> \
                            <li><a href="' + bookElement.idRaw + '/remarks">Remarks</a></li> \
                            <li><a href="' + bookElement.idRaw + '/build.log">Build Log</a></li> \
                            <li><a href="' + bookElement.idRaw + '/publican.log">Publican Log</a></li> \
                        </ul> \
                    </div> \
                    </h2> \
                </div>');

            productAndVersionHeading.append(bookListing);
        });

        if (memo < data.length / 2 + productsAndVersions.length / 2) {
            jQuery("#booklistleft").append(productAndVersionHeading);
        } else {
            jQuery("#booklistright").append(productAndVersionHeading);
        }

        /*
            Add one to count for the heading
         */
        return memo + productAndVersionBooks.length + 1;
    }, 0);
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