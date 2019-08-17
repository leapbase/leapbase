$().ready(function() {
    
    $('.addchildmodule').click(function(event) {
        var elementId = event.target.id;
        var childModuleName = elementId.split('btnAdd')[1];
        var url = '/module/' + childModuleName + '/addaschild/' + moduleName + '/' + doc.id;
        console.log('url: ' + url);
        window.location = url;
    });
    
    $('.viewchildmodule').click(function(event) {
        var elementId = event.target.id;
        var childModuleName = elementId.split('btnView')[1];
        var url = '/module/' + childModuleName + '/byparent/' + moduleName + '/' + doc.id;
        console.log('url: ' + url);
        window.location = url;
    });
    
    $('.viewparent').click(function(event) {
        var elementId = event.target.id;
        var segments = elementId.split('-');
        var parentModuleName = segments[0];
        var parentId = segments[1];
        var url = '/module/' + parentModuleName + '/' + parentId + '/view';
        console.log('url: ' + url);
        window.location = url;
    });
})