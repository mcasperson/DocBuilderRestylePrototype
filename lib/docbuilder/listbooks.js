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

jQuery(init_filter);
jQuery(function() {filterData(data)});

function filterData(data) {
    jQuery("#noBooks").hide();
    jQuery("#booklistright").empty();
    jQuery("#booklistleft").empty();

    // get the filter details
    var productFilter = localStorage["productFilter"];
    var titleFilter = localStorage["titleFilter"];
    var versionFilter = localStorage["versionFilter"];
    var idFilter = localStorage["idFilter"];
    var topicIDFilter = localStorage["topicIDFilter"];
    var specObsoleteFilter = localStorage["specObsoleteFilter"];
    var specFrozenFilter = localStorage["specFrozenFilter"];

    var topicIds = null;
    if (topicIDFilter != null && topicIDFilter.trim().match(/(\d+,)*\d+/)) {
        topicIds = topicIDFilter.split(",");
    }

    // find the books that match the criteria
    var productAndVersionBooks = _.filter(data, function(bookElement) {

        if (versionFilter && versionFilter.length != 0 && !bookElement.versionRaw.toLowerCase().match(versionFilter.toLowerCase())) {
            return false;
        }

        if (productFilter && productFilter.length != 0 && !bookElement.productRaw.toLowerCase().match(productFilter.toLowerCase())) {
            return false;
        }

        if (titleFilter && titleFilter.length != 0 && !bookElement.titleRaw.toLowerCase().match(titleFilter.toLowerCase())) {
            return false;
        }

        if (versionFilter && versionFilter.length != 0 && !bookElement.versionRaw.toLowerCase().match(versionFilter.toLowerCase())) {
            return false;
        }

        if (idFilter && idFilter.length != 0 && !String(bookElement.idRaw).toLowerCase().match(idFilter.toLowerCase())) {
            return false;
        }

        if (bookElement.tags) {
            if (!specObsoleteFilter || specObsoleteFilter.toString().toLowerCase() == false.toString().toLowerCase()) {
                for (var tagIndex = 0, tagCount = bookElement.tags.length; tagIndex < tagCount; ++tagIndex) {
                    if (bookElement.tags[tagIndex] == OBSOLETE_TAG) {
                        return false;
                    }
                }
            }

            if (!specFrozenFilter || specFrozenFilter.toString().toLowerCase() == false.toString().toLowerCase()) {
                for (var tagIndex = 0, tagCount = bookElement.tags.length; tagIndex < tagCount; ++tagIndex) {
                    if (bookElement.tags[tagIndex] == FROZEN_TAG) {
                        return false;
                    }
                }
            }
        }

        return true;
    });

    if (!topicIds) {
        displayTable(productAndVersionBooks);
    } else {
        var queryStart = REST_SERVER + "/1/topics/get/json/query;topicIds="
        var queryEnd = "?expand=%7B%22branches%22%3A%5B%7B%22trunk%22%3A%7B%22name%22%3A%20%22topics%22%7D%2C%20%22branches%22%3A%5B%7B%22trunk%22%3A%7B%22name%22%3A%20%22contentSpecs_OTM%22%7D%7D%5D%7D%5D%7D";

        $.getJSON(queryStart + topicIds.join(",") + queryEnd, function(data){

            var specIds = [];
            for (var itemIndex = 0, itemCount = data.items.length; itemIndex < itemCount; ++itemIndex) {
                var item = data.items[itemIndex].item;
                var specs = item.contentSpecs_OTM;

                for (var specItemIndex = 0, specItemCount = specs.items.length; specItemIndex < specItemCount; ++specItemIndex) {
                    var spec = specs.items[specItemIndex].item;
                    specIds.push(spec.id.toString());
                }
            }

            productAndVersionBooks = _.filter(productAndVersionBooks, function(element) {
                return specIds.indexOf(element.idRaw.toString()) !== -1;
            });

            displayTable(productAndVersionBooks);
        });
    }

}

function dedupeProdAndVersion(productsAndVersions) {
    productsAndVersions = _.map(productsAndVersions, function(element) {
        return {productRaw: element.productRaw, versionRaw: element.versionRaw};
    });

    productsAndVersions = _.uniq(productsAndVersions, function(element) {
        return JSON.stringify(element);
    });

    return productsAndVersions;
}

function displayTable(productAndVersionBooks) {
    var productsAndVersions = dedupeProdAndVersion(productAndVersionBooks);
    productsAndVersions.sort(sortByProductAndVersion);

    var matchingBookCount = _.reduce(productsAndVersions, function(memo, element) {
        var thisProductAndVersionBooks = _.filter(productAndVersionBooks, function(bookElement) {
            return bookElement.productRaw === element.productRaw &&
                bookElement.versionRaw === element.versionRaw;
        });

        thisProductAndVersionBooks.sort(sortByTitle);

        var versionName = !element.versionRaw?"":element.versionRaw.trim();
        var productName = !element.productRaw?"No Product":element.productRaw.trim();

        var productAndVersionHeading = jQuery(
                '<div class="text-center">\
                    <h1><strong>' + _.escape(productName) + ' ' + _.escape(versionName) + '</strong></h1>\
            </div>');

        _.each(thisProductAndVersionBooks, function(bookElement, index, list) {
            var title = !bookElement.titleRaw?"No Title":bookElement.titleRaw.trim();
            var lastBuildMatch = /<a href="\/books\/\d+%20(\d{4}-\d{2}-\d{2}T)(%20)?(\d{1,2})(%3A\d{1,2}%3A\d{2}\.\d{3}%2B\d{4}).zip"><button>Publican ZIP<\/button><\/a>/.exec(bookElement.publicanbook);
            var lastBuild = "Unknown";
            if (lastBuildMatch) {
                var fixedDate = decodeURIComponent(lastBuildMatch[1] + (lastBuildMatch[3].length === 1 ? "0" : "") + lastBuildMatch[3] + lastBuildMatch[4]);
                var lastBuild = moment(fixedDate).format("dddd, MMMM Do YYYY, h:mm:ss a");
            }

            var bookListing = jQuery(
                    '<div> \
                        <h2 class="bookTitle" title="Last Built: ' + _.escape(lastBuild) + '"> \
                        [<a href="' + SPEC_EDIT + bookElement.idRaw + '">' + _.escape(bookElement.idRaw) + '</a>] \
                    <a href="' + DOCBUILDER + '/' + bookElement.idRaw + '">' + _.escape(title) + '</a> \
                    ' + (bookElement.status.indexOf("tick") !== -1 ?'<span class="pficon pficon-ok bookStatus"></span>':'<span class="pficon-layered bookStatus"><span class="pficon pficon-error-octagon"></span><span class="pficon pficon-error-exclamation"></span></span>') + '\
                    <div class="btn-group bookMenu"> \
                        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"> \
                            <span class="fa fa-angle-down"></span> \
                        </button> \
                        <ul class="dropdown-menu" role="menu"> \
                            <li><a href="' + DOCBUILDER + '/' + bookElement.idRaw + '">View Spec</a></li> \
                            <li><a href="' + SPEC_EDIT + bookElement.idRaw + '">Edit Spec</a></li> \
                            <li><a href="' + DOCBUILDER + '/' + bookElement.idRaw + '/remarks">View With Remarks</a></li> \
                            <li><a href="' + DOCBUILDER + '/' + bookElement.idRaw + '/build.log">View Build Log</a></li> \
                            <li><a href="' + DOCBUILDER + '/' + bookElement.idRaw + '/publican.log">View Publican Log</a></li> \
                            <li><a href="javascript:void(0)" onclick="javascript:freezeSpec(\'' + WEB_UI + '#ContentSpecFilteredResultsAndContentSpecView\', ' + bookElement.idRaw + ')">Freeze Spec</a></li> \
                            <li><a href="javascript:void(0)" onclick="javascript:obsoleteSpec(false, \'' + REST_SERVER + '\', ' + bookElement.idRaw + ')">Obsolete Spec</a></li> \
                            <li>' + bookElement.publicanbook.replace(/<\/?button>/g, "") + '</li> \
                        </ul> \
                    </div> \
                    </h2> \
                </div>');

            productAndVersionHeading.append(bookListing);
        });

        if (thisProductAndVersionBooks.length !== 0) {
            if (memo < productAndVersionBooks.length / 2 + productsAndVersions.length / 2) {
                jQuery("#booklistleft").append(productAndVersionHeading);
            } else {
                jQuery("#booklistright").append(productAndVersionHeading);
            }

            /*
             Add one to count for the heading
             */
            return memo + thisProductAndVersionBooks.length + 1;
        } else {
            return memo;
        }
    }, 0);

    if (matchingBookCount === 0) {
        jQuery("#noBooks").show();
    }
}

function settingIsTrue(setting) {
    return setting && setting.toLowerCase() == true.toString().toLowerCase();
}

function checkBoxWithSavedValue(checkbox, setting) {
    checkbox.prop('checked', settingIsTrue(setting));
}

function isChecked(checkbox) {
    return checkbox.prop('checked');
}

var rebuildTimeout = null;

function init_filter() {
    jQuery("#productFilter").val(localStorage["productFilter"] || "");
    jQuery("#titleFilter").val(localStorage["titleFilter"] || "");
    jQuery("#versionFilter").val(localStorage["versionFilter"] || "");
    jQuery("#idFilter").val(localStorage["idFilter"] || "");
    jQuery("#topicIDFilter").val(localStorage["topicIDFilter"] || "");
    checkBoxWithSavedValue(jQuery("#specObsoleteFilter"), localStorage["specObsoleteFilter"]);
    checkBoxWithSavedValue(jQuery("#specFrozenFilter"), localStorage["specFrozenFilter"]);
}

function save_filter() {
    localStorage["productFilter"] = jQuery("#productFilter").val();
    localStorage["titleFilter"] = jQuery("#titleFilter").val();
    localStorage["versionFilter"] = jQuery("#versionFilter").val();
    localStorage["idFilter"] = jQuery("#idFilter").val();
    localStorage["topicIDFilter"] = jQuery("#topicIDFilter").val();
    localStorage["specObsoleteFilter"] = isChecked(jQuery("#specObsoleteFilter"));
    localStorage["specFrozenFilter"] = isChecked(jQuery("#specFrozenFilter"));
    if (rebuildTimeout) {
        window.clearTimeout(rebuildTimeout);
        rebuildTimeout = null;
    }
    rebuildTimeout = setTimeout(function(){
        filterData(data);
        rebuildTimeout = null;
    },1000);
}
function reset_filter() {
    localStorage["productFilter"] = "";
    localStorage["titleFilter"] = "";
    localStorage["versionFilter"] = "";
    localStorage["idFilter"] = "";
    localStorage["topicIDFilter"] = "";
    localStorage["specObsoleteFilter"] = "";
    localStorage["specFrozenFilter"] = "";
    jQuery("#productFilter").val("");
    jQuery("#titleFilter").val("");
    jQuery("#versionFilter").val("");
    jQuery("#idFilter").val("");
    jQuery("#topicIDFilter").val("");
    checkBoxWithSavedValue(jQuery("#specObsoleteFilter"), false);
    checkBoxWithSavedValue(jQuery("#specFrozenFilter"), false);
    if (rebuildTimeout) {
        window.clearTimeout(rebuildTimeout);
        rebuildTimeout = null;
    }
    filterData(data);
}