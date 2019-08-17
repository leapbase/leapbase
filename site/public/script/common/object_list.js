var navUrl = {};

function init() {
  if (!page.filter) {
    page.filter = { skip: 0, limit: 10 }
  }
  if (!page.info) {
    page.info = { total: 0 }
  }

  var skip = parseInt(page.filter.skip) || 0;
  var limit = parseInt(page.filter.limit) || 10;
  var total = parseInt(page.info.total) || 0;

  var skipValue = 0;
  var currentPage = Math.ceil(skip/limit) + 1;
  var totalPage = Math.ceil(total/limit);
  var currentStart = skip + 1;
  var currentEnd = skip + limit;

  var actionBase = page.actionBase || '';
  if (page.actionBase && page.actionBase.indexOf('?') >= 0) {
    actionBase = actionBase + '&';
  } else {
    actionBase = actionBase + '?';
  }

  // check callback parameter and add it to nav url
  callbackMethod = page.callback || '';
  var matches = /callback\=([\w]+)/.exec(document.URL);
  if (matches) {
    var callbackMethod = matches[1];
  }
  if (callbackMethod) {
    actionBase = actionBase + 'callback=' + callbackMethod + '&';
  }

  if (page.condition) {
    actionBase += 'condition=' + encodeURI(JSON.stringify(page.condition)) + '&';
  }

  if (currentEnd > total) {
    currentEnd = total;
  }

  $('#btnFirst').attr('disabled', currentStart == 1);
  $('#btnPrev').attr('disabled', currentStart == 1);
  $('#btnLast').attr('disabled', currentEnd == total);
  $('#btnNext').attr('disabled', currentEnd == total);

  var firstSkip = 'skip=0';
  var limitText = '&limit=' + limit;
  navUrl.first = actionBase + firstSkip + limitText;

  var lastSkip = 'skip=' + (Math.floor((total-1)/limit) * limit);
  navUrl.last = actionBase + lastSkip + limitText;

  skipValue = skip + limit;
  var nextSkip = 'skip=' + ((skipValue >= total) ? skip : skipValue);
  navUrl.next = actionBase + nextSkip + limitText;

  skipValue = skip - limit;
  var prevSkip = 'skip=' + ((skipValue >= 0) ? skipValue : skip);
  navUrl.prev = actionBase + prevSkip + limitText;

  $('#itemInfo').text(currentStart + '-' + currentEnd + ' of ' + total);
  $('#pageInfo').text('page ' + currentPage + '/' + totalPage);
}

function nav(direction) {
  console.log('click ' + direction);
  window.location = navUrl[direction];
}

function deleteObject(rowClass, rowId) {
  var deleteUrl = '/data/admin/module/' + rowClass + '/' + rowId + '/delete';
  $.post(deleteUrl, function(data) {
    if (!data.error) {
      location.reload();
    }
  });
}

$().ready(function() {
  console.log('in object_list page');
  init();
  $('#btnFirst').click(function() {
      nav('first');
  });
  $('#btnPrev').click(function() {
      nav('prev');
  });
  $('#btnNext').click(function() {
      nav('next');
  });
  $('#btnLast').click(function() {
      nav('last');
  });

  $('.btn-delete').click(function(event) {
    console.log('delete object:', event);
    var row = $(event.currentTarget).parents('tr');
    var rowClass = $(row).attr('data-class');
    var rowId = $(row).attr('data-id');
    if (rowClass && rowId) {
      var r = confirm("Are you sure to delete " + rowClass + '/' + rowId + '?');
      if (r == true) {
        deleteObject(rowClass, rowId);
      }
    }
    event.preventDefault();
  })
});


